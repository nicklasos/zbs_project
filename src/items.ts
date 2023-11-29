import { Bot, ItemStatus, OrderItem, Storehouse, VendorItem } from './types';
import { wheresify } from './db';
import storehouse from './storehouse';
import { CallbackItems } from './callback';
import pubg from './pubg';

const { where, whereIn, batchInsert, insert } = wheresify('order_items');

export default {

    async insert(params): Promise<number> {
        const [id] = await insert(params);

        return id;
    },

    find(id: number): Promise<OrderItem> {
        return where({ id }).first();
    },

    findByOrderId(id: number): Promise<OrderItem[]> {
        return where('order_id', id);
    },

    findNotSentByOrderId(id: number): Promise<OrderItem[]> {
        return this.findByOrderId(id).where('status', '!=', 'sent');
    },

    createItems(orderId: number, items: OrderItem[]): Promise<number> {
        return batchInsert(
            items.map(item => {
                item.order_id = orderId;
                item.hash = pubg.changeName(item.hash);
                return item;
            }),
            30,
        );
    },

    status(item: OrderItem, status: ItemStatus): Promise<number> {
        item.status = status;

        return where({ id: item.id }).update({ status });
    },

    process(item: OrderItem): Promise<number> {
        return this.status(item, 'process');
    },

    async buying(item: OrderItem, bot: Bot): Promise<number> {
        item.bot_id = bot.id;

        await where({ id: item.id }).update({ bot_id: bot.id });

        return this.status(item, 'buying');
    },

    buySuccess(item: OrderItem, vendorItem: VendorItem): Promise<number> {
        return where({ id: item.id }).update({
            status: 'buy-success',
            price: vendorItem.price,
            vendor: vendorItem.vendor,
        });
    },

    buyError(item: OrderItem): Promise<number> {
        return this.status(item, 'buy-error');
    },

    sent(items: OrderItem[]): Promise<number> {
        return whereIn('id', items.map((i) => {
                i.status = 'sent';
                return i.id
            }))
            .update({ status: 'sent' });
    },

    noItems(item: OrderItem): Promise<number> {
        return where({ id: item.id }).update({
            status: 'no-orderItems',
        });
    },

    async reserve(item: OrderItem, storehouseItem: Storehouse): Promise<number> {
        item.status = 'reserved';
        item.storehouse_id = storehouseItem.id;
        if (storehouseItem.price) {
            item.price = storehouseItem.price;
        }
        if (storehouseItem.vendor) {
            item.vendor = storehouseItem.vendor;
        }

        await storehouse.assignItem(storehouseItem, item);

        return where({ id: item.id }).update({
            storehouse_id: storehouseItem.id,
            status: 'reserved',
            price: item.price,
        });
    },

    async release(ids: number[]) {
        return whereIn('id', ids).update({
            storehouse_id: null,
            bot_id: null,
            status: 'new',
        });
    },

    itemsToSend(items: OrderItem[]): OrderItem[] {
        return items.filter(i => i.storehouse_id !== null);
    },

    itemsToBuy(items: OrderItem[]): OrderItem[] {
        return items.filter(i => i.storehouse_id === null);
    },

    isReady(items: OrderItem[]): boolean {
        return items.length === items.filter(i => i.storehouse_id !== null).length;
    },

}
