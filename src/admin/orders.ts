import db from '../db';

export default class OrdersInfo {
    async getOrdersInfo(page: number) {
        const offsetValue = this.countOffset(page);
        const orderInfo = await db
            .select('id', 'status', 'trade_url', 'vendors', 'created_at')
            .from('orders')
            .limit(200)
            .offset(offsetValue)
            .orderBy('id', 'desc');
        const orderCount = await db('orders').count('id as a');

        return [
            orderCount,
            orderInfo,
        ];
    }

    async getOrdersWhereStatus(whereValue: string, page: number) {
        const offsetValue = this.countOffset(page);
        const orderInfo = await db
            .select('id', 'status', 'trade_url', 'vendors', 'created_at')
            .from('orders')
            .where('status', whereValue)
            .orderBy('id', 'desc')
            .limit(200)
            .offset(offsetValue);
        const orderCount = await db('orders').where('status', whereValue).count('id as a');

        return [
            orderCount,
            orderInfo,
        ];
    }

    async getStatusList() {
        return await db.distinct('status').select().from('orders');
    }

    findOrder(orderId: number) {
        return db('orders').where({ id: orderId }).first();
    }

    getOrderItems(orderId: number) {
        return db
            .select('id', 'status', 'hash', 'count', 'payload', 'max_price', 'created_at')
            .from('order_items')
            .where('order_id', orderId)
            .orderBy('id', 'desc');
    }

    countOffset(pageNumber: number) {
        return pageNumber === 1 ? 0 : (pageNumber - 1) * 200;
    }

    getOrderLogs(orderId: number) {
        return db
            .select('id', 'status', 'message', 'updated_at')
            .from('order_logs')
            .where('order_id', orderId)
            .orderBy('id', 'desc');
    }
}
