import { wheresify } from './db';
import { Bot, Order, OrderFlow, OrderItem, OrderStatus } from './types';
import storehouse from './storehouse';
import orderItems from './items';
import clients from './clients';
import tradeOffersHistory from './trade-offers-history';
import SteamBot from './bot';

const { where, whereIn, insert } = wheresify('orders');

export default {

    async createFromRequest(req): Promise<number> {
        const orderId = await this.create({
            client_id: clients.findByApiKey(req.sender.api_key),
            game: req.config.game,
            trade_url: req.recipient.trade_url,
            agent_id: req.sender.agent_id,
            comment: req.config.comment,
            priority: req.config.priority,
            quality: req.config.quality || 'same',
            vendors: JSON.stringify(req.config.vendors),
            flow: req.config.flow || 'buy',
            force_vendors: req.config.force_vendors,
        });

        await orderItems.createItems(orderId, req.items);

        return orderId;
    },

    async insert(params): Promise<number> {
        const [id] = await insert(params);

        return id;
    },

    status(order: Order, status: OrderStatus): Promise<number> {
        order.status = status;

        return where({ id: order.id }).update({ status });
    },

    async release(order: Order) {
        order.bot_id = null;

        await where({ id: order.id }).update({ bot_id: null });

        const items = await orderItems.findByOrderId(order.id);

        const notSent = i => i.status !== 'sent';

        const storehouseIds = items.filter(notSent).map(s => s.storehouse_id);
        const itemIds = items.filter(notSent).map(s => s.id);

        await storehouse.release(storehouseIds);
        await orderItems.release(itemIds);
    },

    empty(order: Order): Promise<number> {
        return this.status(order, 'empty');
    },

    updateTradeUrl(id: number, trade_url: string): Promise<number> {
        return where({ id }).update({ trade_url });
    },

    async process(order: Order, bot?: Bot): Promise<number> {
        if (bot) {
            order.bot_id = bot.id;
            await where({ id: order.id }).update({ bot_id: bot.id });
        }

        return this.status(order, 'process');
    },

    done(order: Order): Promise<number> {
        return this.status(order, 'done');
    },

    setTradeOfferId(order: Order, tradeofferid: string): Promise<number> {
        if (!tradeofferid) {
            return;
        }

        return where({ id: order.id }).update({ tradeofferid });
    },

    async error(order: Order, error?: string): Promise<number> {
        if (error) {
            await this.addError(order, error);
        }

        return this.status(order, 'error');
    },

    async tradeUrlError(order: Order): Promise<number> {
        return this.status(order, 'trade-url-error');
    },

    async pendingTradeOffersError(order: Order): Promise<number> {
        return this.status(order, 'pending-trade-offers-error');
    },

    async botError(order: Order): Promise<number> {
        return this.status(order, 'bot-error');
    },

    async addError(order: Order, log: string): Promise<void> {
        try {
            const error = JSON.parse(order.error_log || '[]');

            error.push(log);

            const errors = JSON.stringify(error, null, 2);

            order.error_log = errors;

            await where({ id: order.id }).update({ error_log: errors});
        } catch (ex) {
            console.error('Error on adError, lol', ex);
        }
    },

    noBots(order: Order): Promise<number> {
        return this.status(order, 'no-bots');
    },

    buyDone(order: Order): Promise<number> {
        return this.status(order, 'buy-done');
    },

    nextTry(order: Order): Promise<number> {
        order.status = 'new';
        order.tries++;

        return where({ id: order.id }).update({
            status: order.status,
            tries: order.tries,
        });
    },

    async find(id: number): Promise<Order> {
        return where({ id }).first();
    },

    async create(fields): Promise<number> {
        const [id] = await insert(fields);

        return id;
    },

    async findOrderWithItems(orderId: number): Promise<{ order: Order, items: OrderItem[] }> {
        const [order, items] = await Promise.all([this.find(orderId), orderItems.findByOrderId(orderId)]);

        return { order, items };
    },

    async findForRestart(orderId: number): Promise<{ order: Order, items: OrderItem[] }> {
        const [order, items] = await Promise.all([this.find(orderId), orderItems.findNotSentByOrderId(orderId)]);

        return { order, items };
    },

    forRestart(params: { statuses: string[], maxTries: number, limit: number, flow: OrderFlow }): Promise<Order[]> {
        return whereIn('status', params.statuses)
            .where('tries', '<=', params.maxTries)
            .where('flow', params.flow)
            .limit(params.limit);
    },

    async isOwner(id: number, client: string): Promise<boolean> {
        const order = await this.find(id);
        if (!order) {
            return false;
        }

        return order.client_id === client;
    },

    setFlow(order: Order, flow: OrderFlow) {
        order.flow = flow;

        return where({ id: order.id }).update({ flow });
    },

    withoutScreenshots(bot: Bot): Promise<Order[]> {
        const date = new Date();
        date.setDate(date.getDate() - 3);

        return where({ bot_id: bot.id, status: 'done' })
            .whereNull('screenshot')
            .whereNotNull('tradeofferid')
            .where('created_at', '>', date);
    },

    attachScreenshot(order: Order, screenshot: string): Promise<number> {
        return where({ id: order.id }).update({
            screenshot,
        });
    },

}
