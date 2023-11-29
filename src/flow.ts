import orders from './orders';
import flowFactory from './flow-factory';
import { Flow, Order, OrderItem } from './types';

interface RetryRequest {
    order_id: number;
    recipient?: {
        trade_url: string;
    };
}

export default {

    async update(data: RetryRequest): Promise<void> {
        if (data.recipient && data.recipient.trade_url) {
            await orders.updateTradeUrl(data.order_id, data.recipient.trade_url);
        }
    },

    async retry(id: number): Promise<void> {
        console.log(`Retry order id ${id}`);

        const { order, items } = await orders.findForRestart(id);

        try {

            const flow = await this.factory(order, items);
            await flow.run();

        } catch (e) {
            await orders.error(order);
            throw e;
        }
    },

    async process(id: number): Promise<void> {
        const { order, items } = await orders.findOrderWithItems(id);

        if (order.status !== 'new') {
            throw new Error('Order is not new');
        }

        try {

            const flow = await this.factory(order, items);
            await flow.run();

        } catch (e) {
            await orders.error(order);
            throw e;
        }
    },

    async factory(order: Order, items: OrderItem[]): Promise<Flow> {
        if (order.flow === 'presents') {
            return flowFactory.makePresents(order, items);
        }

        const vendors = JSON.parse(order.vendors);

        if (vendors.length === 1 &&
            vendors[0] === 'Storehouse' &&
            order.force_vendors) {

            return flowFactory.makeStickers(order, items);
        }

        return flowFactory.makeBuy(order, items);
    },

}
