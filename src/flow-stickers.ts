import SteamBot from './bot';
import bots from './bots';
import orders from './orders';
import storehouse from './storehouse';
import { Bots, Flow, Order, OrderItem } from './types';

export class FlowStickers implements Flow {

    constructor(private order: Order,
                private items: OrderItem[]) {
    }

    async run() {
        if (this.items.length !== 1) {
            throw new Error('This method supports only one item');
        }

        const [item] = this.items;

        await orders.process(this.order);

        const storehouseItem = await storehouse.reserve({
            graffiti: true,
            randomOrder: true,
            bots: Bots.stickers,
        });

        if (!storehouseItem) {
            await orders.empty(this.order);
            throw new Error('No available orderItems');
        }

        const bot = await bots.findBySteamid(storehouseItem.bot_steamid);
        const steamBot = new SteamBot(bot);
        const response = await steamBot.sendItems(this.order.trade_url, [storehouseItem], this.order.comment);

        if (response.result === 'ok') {
            await storehouse.assignItem(storehouseItem, item);
            await orders.done(this.order);
        } else {
            console.error({
                orderId: this.order.id,
                response,
                storehouse: storehouseItem,
            });

            if (response.type === 'trade_offers_limit') {
                await bots.setNotReady(bot);
            }

            await orders.status(this.order, response.type);
            await storehouse.release([storehouseItem.id]);
        }
    }
}
