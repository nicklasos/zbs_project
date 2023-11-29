import db, {default as knex} from '../db';

export default class PurchasesInfo {
    async getAllPurchasesByDate() {
        knex.schema.raw(`SET SESSION sql_mode=''`);
        return await db
            .select(knex.raw('sum(price) as spent, date(created_at) as date'))
            .from(knex.raw('order_items'))
            .where('status', 'sent')
            .where(knex.raw('date(created_at) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)'))
            .groupByRaw('date(created_at)')
            .orderByRaw('date(created_at) desc');
    }

    async getDataForSite(site: string) {
        knex.schema.raw(`SET SESSION sql_mode=''`);
        return await db
            .select(knex.raw('sum(price) as spent, date(orders.created_at) as date'))
            .from('orders')
            .leftJoin('order_items', 'orders.id', 'order_items.order_id')
            .where('orders.client_id', site)
            .where('order_items.status', 'sent')
            .where(knex.raw('date(orders.created_at) >= DATE_SUB(NOW(), INTERVAL 1 MONTH)'))
            .groupByRaw('date(orders.created_at)')
            .orderByRaw('date(orders.created_at) desc');
    }

    async siteBoughtItemsInPeriod(site: string, start: string, end: string, items: boolean) {
        knex.schema.raw(`SET SESSION sql_mode=''`);
        if (items) {
            return await db
                .select(knex.raw('count(orders.id) as items'))
                .from('order_items')
                .leftJoin('orders', 'order_items.order_id', 'orders.id')
                .where('orders.client_id', site)
                .where('order_items.status', 'sent')
                .whereBetween(knex.raw('date(orders.created_at)'), [start, end]);
        }

        return await db
            .select(knex.raw('sum(order_items.price) as spent'))
            .from('order_items')
            .leftJoin('orders', 'order_items.order_id', 'orders.id')
            .where('orders.client_id', site)
            .where('order_items.status', 'sent')
            .whereBetween(knex.raw('date(orders.created_at)'), [start, end]);
    }
}
