import SteamBot from './bot';
import bots from './bots';
import checks from './flow-checks';
import orders from './orders';
import { Bot, Bots, Flow, Order, OrderItem } from './types';
import { FlowBuy } from './flow-buy';
import { FlowStickers } from './flow-stickers';
import { FlowPresents } from './flow-presents';
import { OrderLog } from './order-log';
import { Callback } from './callback';

export default {

    async makeStickers(order: Order, items: OrderItem[]): Promise<Flow> {
        await orders.setFlow(order, 'stickers');

        return new FlowStickers(order, items);
    },

    async makePresents(order: Order, items: OrderItem[]): Promise<Flow> {
        await orders.setFlow(order, 'presents');

        return new FlowPresents(order, items);
    },

    async makeBuy(order: Order, items: OrderItem[]): Promise<Flow> {
        await orders.setFlow(order, 'buy');

        const log = new OrderLog(order);
        const cb = new Callback(order);

        const bot = await bots.suitable(order, items);

        const checkBot = await checks.bot(bot, order, log, cb);
        if (checkBot) {
            return checkBot;
        }

        const sb = new SteamBot(bot);
        const ping = await checks.ping(bot, order, log, cb, sb);
        if (ping) {
            return ping;
        }

        const checkTradeUrl = await checks.tradeUrl(order, log, cb, sb);
        if (checkTradeUrl) {
            return checkTradeUrl;
        }

        const checkPendingTradeOffers = await checks.pendingTradeOffers(order, log, cb, sb, bot);
        if (checkPendingTradeOffers) {
            return checkPendingTradeOffers;
        }

        return new FlowBuy(order, items, log, cb, bot, sb);
    }

}
