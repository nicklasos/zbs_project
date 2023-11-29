import orders from './orders';
import orderItems from './items';
import bots from './bots';
import storehouse from './storehouse';
import storehouseBills from './storehouse-bills';
import SteamBot, { SendItemsResponse } from './bot';
import search from './search';
import { bestPrice, maxPrice } from './decisions';
import { Bot, Flow, Order, OrderItem, OrderStatus } from './types';
import { makeVendorByName } from './vendors/factory';
import { OrderLog } from './order-log';
import { Callback } from './callback';
import { withdrawOpskins } from './supervisor';
import { info, ok, error } from './order-log';
import sleep = require('sleep-promise');
import game from './game';

export class FlowBuy implements Flow {

    constructor(private order: Order,
                private items: OrderItem[],
                private log: OrderLog,
                private cb: Callback,
                private bot: Bot,
                private steamBot: SteamBot) {
    }

    @info('Start buy flow')
    async run() {
        await this.log.info(`Using bot: ${this.bot.id}`);

        await orders.process(this.order, this.bot);
        await this.reserve();

        const itemsToBuy = orderItems.itemsToBuy(this.items);
        if (itemsToBuy.length !== 0) {
            await this.log.info(`Buying ${itemsToBuy.length} items to bot id: ${this.bot.id}`);
        }

        try {

            for (const item of itemsToBuy) {
                await orderItems.process(item);

                const bestItems = bestPrice(await search.game(item.game || this.order.game, item.hash, {
                    maxPrice: maxPrice(item.max_price),
                    quality: this.order.quality,
                }));

                if (!bestItems.length) {
                    await this.log.error(`Can't find ${item.hash} for max price ${maxPrice(item.max_price)}`);
                    await orderItems.noItems(item);

                    continue;
                }

                for (const bestItem of bestItems) {
                    const vendor = makeVendorByName(bestItem.vendor, this.order.game);
                    await orderItems.buying(item, this.bot);

                    await this.log.info(`Buy item '${bestItem.hash}' from ${vendor.name}`);

                    const result = await vendor.buy([bestItem], this.bot);

                    if (result.result === 'success') {
                        await this.log.ok(`Successful buy item id: ${item.id}`);
                        await orderItems.buySuccess(item, bestItem);
                        await storehouseBills.checkout(this.bot.steamid, result.tokens.shift(), bestItem);
                        break;
                    } else if (result.result === 'error-withdraw') {
                        await this.log.error(`Provider error: ${result.message}`);
                        await this.log.error(`Error withdraw item id: ${item.id}`);
                        await orderItems.buyError(item);
                        break;
                    } else {
                        await this.log.error(`Provider error: ${result.message}`);
                        await this.log.error(`Error buy item id: ${item.id}`);
                        await orderItems.buyError(item);
                    }
                }
            }

            await orders.buyDone(this.order);

            if (process.env.NODE_ENV !== 'test') {
                await this.tryReserveAndComplete();
            }

        } catch (ex) {
            console.error(ex);
            await this.error('error', ex.message);
        }
    }

    @info('Try to reserve items before complete the order')
    async tryReserveAndComplete() {

        for (let i = 0; i < 15; i++) {
            if (orderItems.isReady(this.items)) {
                break;
            }

            if (i === 7) {
                await this.steamBot.sync();
                // await withdrawOpskins();
            }

            if (i % 2 === 0) {
                await this.steamBot.acceptOffers();
            }

            await sleep(10000);

            await this.reserve();
        }

        await this.complete();
    }

    @info('Reserve items')
    async reserve() {
        const bought = orderItems.itemsToBuy(this.items);
        if (bought.length === 0) {
            await this.log.notice('No items to reserve');
        }

        for (const item of bought) {
            const storehouseItem = await storehouse.reserve({
                hash: item.hash,
                order_item_id: item.id,
                quality: this.order.game === 'csgo' ? this.order.quality : null,
                randomOrder: true,
                steamids: [this.bot.steamid],
            });

            if (storehouseItem !== null) {
                await this.log.ok(`Reserve order item id ${item.id} ${item.hash} and storehouse id: ${storehouseItem.id} ${storehouseItem.hash}`);
                await orderItems.reserve(item, storehouseItem);
            }
        }
    }

    @info('Complete order')
    async complete() {
        const itemsToSend = orderItems.itemsToSend(this.items);
        const storehouseItems = await storehouse.findAllByItems(itemsToSend);

        // if (itemsToSend.length !== storehouseItems.length) {
        //     return await this.error('empty', 'Internal error. Mismatch items to send and storehouse items. Retry later.');
        // }

        if (storehouseItems.length === 0) {
            return await this.error('empty', 'No items to complete this order.');
        }

        await this.log.info('Send storehouse items to bot: ' + storehouseItems.map(s => s.id).join(', '));

        const response = await this.steamBot.sendItems(
            this.order.trade_url,
            storehouseItems,
            this.order.comment
        );

        if (response.result === 'ok') {
            await this.ok(itemsToSend.filter((item) => {
                return storehouseItems.find(s => s.id === item.storehouse_id);
            }), response);

            this.mobileConfirmation();

        } else {
            try {
                await this.log.error(JSON.stringify({ response }, null, 2));
            } catch (ex) {
                console.error('Cannot convert response to JSON', response);
            }

            if (response.type === 'trade_offers_limit') {
                await bots.setNotReady(this.bot);
            }

            await this.error(response.type, 'Internal error with bots');
        }
    }

    mobileConfirmation() {
        setTimeout(() => {
            try {
              this.steamBot.mobileConfirmation()
                .then(() => console.log('Additional mobile confirmation done'))
                .catch((e) => console.error('Additional mobile confirmation failed.', e));
            } catch (ex) {
                console.error('Error on mobile confirmation');
            }
        }, 10000);
    }

    @ok('Response from bot is ok')
    async ok(items: OrderItem[], response: SendItemsResponse) {
        await orders.done(this.order);
        await orders.setTradeOfferId(this.order, response.tradeofferid);
        await orderItems.sent(items);
        await this.cb.complete();
    }

    @error('Error')
    async error(status: OrderStatus, message: string) {
        console.error('Error', message);
        await orders.status(this.order, status);
        await orders.release(this.order);
        await this.log.error(message);
        await this.cb.error(message);
    }
}
