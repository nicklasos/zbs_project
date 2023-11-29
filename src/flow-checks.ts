import orders from './orders';
import bots from './bots';
import SteamBot from './bot';
import { Bot, Flow, Order } from './types';
import { OrderLog } from './order-log';
import { Callback } from './callback';

export default {

    async bot(bot: Bot, order: Order, log: OrderLog, cb: Callback): Promise<Flow|false> {
        if (bot) {
            return false;
        }

        return {
            async run() {
                const message = 'No available bots to start. Wait few minutes.';

                await orders.noBots(order);
                await log.error(message);
                await cb.error(message);
            }
        };
    },

    async tradeUrl(order: Order, log: OrderLog, cb: Callback, sb: SteamBot): Promise<Flow|false> {
        const checkTrade = await sb.checkTradeUrl(order.trade_url);
        await log.info(`Check trade url: ${checkTrade}`);

        if (checkTrade) {
            return false;
        }

        return {
            async run() {
                await Promise.all([
                    log.error('Error on check trade url'),
                    orders.tradeUrlError(order),
                    cb.error('Trade url error'),
                ]);
            }
        };
    },

    async pendingTradeOffers(order: Order, log: OrderLog, cb: Callback, sb: SteamBot, bot: Bot): Promise<Flow|false> {
        const pendingOffers = await sb.pendingTradeOffersCount();
        await log.info(`Pending trade offers on bot: ${pendingOffers}`);

        if (pendingOffers === null || pendingOffers >= 30) {
            return {
                async run() {
                    await Promise.all([
                        log.error('Error on check trade url'),
                        orders.pendingTradeOffersError(order),
                        cb.error('To many pending trade offers'),
                    ]);
                }
            };
        }

        if (pendingOffers >= 28) {
            await log.notice(`Disabling bot: ${this.bot.id}, to many trade offers`);
            await bots.setNotReady(bot);
        }

        return false;
    },

    async ping(bot: Bot, order: Order, log: OrderLog, cb: Callback, sb: SteamBot): Promise<Flow|false> {
        const ping = await sb.ping();
        await log.info(`Ping: ${ping}`);

        if (ping) {
            return false;
        }

        return {
            async run() {
                await Promise.all([
                    log.error('Bot is not responding. Wait a minute, I will restart bots.'),
                    orders.botError(order),
                    bots.setNotReady(bot),
                    cb.error('Bot is not responding'),
                ]);

                await log.info(await sb.restart());
            }
        };
    },

}
