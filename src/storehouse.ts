import bots from './bots';
import db, { startTransaction, wheresify } from './db';
import { Bot, Bots, ItemQuality, OrderItem, Storehouse } from './types';
import quality from './quality';

export const STATUS = {
    available: 'available',
    sent: 'sent',
    process: 'process',
};

interface LockParams {
    hash?: string|string[];
    graffiti?: boolean;
    presents?: boolean;
    quality?: ItemQuality;
    randomOrder?: boolean;
    steamids?: string[];
    order_item_id?: number;
    bots?: Bots;
}

interface Shortage {
    username: string;
    id: number;
}

const { where, whereIn, insert } = wheresify('storehouse');

export default {

    async insert(params): Promise<number> {
        const [id] = await insert(params);

        return id;
    },

    findById(id: number): Promise<Storehouse> {
        return where({ id }).first();
    },

    findAllByIds(ids: number[]): Promise<Storehouse[]> {
        return whereIn('id', ids).whereIn('status', [STATUS.available, STATUS.process]);
    },

    findAllByItems(items: OrderItem[]): Promise<Storehouse[]> {
        return this.findAllByIds(items.map(i => i.storehouse_id));
    },

    find(hash: string): Promise<Storehouse[]> {
        return where({
            hash,
            status: STATUS.available,
        });
    },

    assignItem(storehouseItem: Storehouse, orderItem: OrderItem): Promise<number> {
        storehouseItem.order_item_id = orderItem.id;

        return where({ id: storehouseItem.id }).update({
            order_item_id: orderItem.id,
        });
    },

    release(ids: number[]): Promise<number> {
        return whereIn('id', ids).where('status', STATUS.process).update({
            status: STATUS.available,
            order_item_id: null,
        });
    },

    async reserve(params: LockParams): Promise<Storehouse> {
        const trx = await startTransaction();

        try {
            let query = trx('storehouse').where({ status: STATUS.available });

            if (params.hash) {
                if (params.quality) {
                    query = query.whereIn('hash', quality.call(params.quality, params.hash));
                } else {
                    if (Array.isArray(params.hash)) {
                        query = query.whereIn('hash', params.hash);
                    } else {
                        query = query.where({ hash: params.hash });
                    }
                }
            } else if (params.graffiti) {
                query = query.where('hash', 'like', '%Graffiti%');
            } else if (params.presents) {
                query = query.where('hash', 'like', '%Background%');
            }

            if (params.randomOrder) {
                query = query.orderByRaw('RAND()');
            }

            if (params.bots) {
                params.steamids = await steamIds(params.bots);
            }

            if (params.steamids) {
                query = query.whereIn('bot_steamid', params.steamids);
            }

            const item = await query.first();
            if (!item) {
                trx.commit();
                return null;
            }

            item.status = STATUS.process;

            const update = {
                status: STATUS.process,
                order_item_id: null,
            };

            if (params.order_item_id) {
                item.order_item_id = update.order_item_id = params.order_item_id;
            }

            await trx('storehouse')
                .where('id', item.id)
                .update(update);

            trx.commit();

            return item;

        } catch (e) {
            console.error(e);
            trx.rollback();

            return null;
        }
    },

    async shortageByHash(hash: string, max: number): Promise<Shortage[]> {
        const shortage = await db.select(db.raw('count(*) as items_count, bots.id, bots.username, bots.steamid, bots.steam_token'))
            .from('bots')
            .leftJoin('storehouse', 'bots.steamid', 'storehouse.bot_steamid')
            .where('bots.enabled', 1)
            .where('bots.ready', 1)
            .where('storehouse.status', 'available')
            .where('storehouse.hash', 'like', `%${hash}%`)
            .where('bots.type', 'stickers')
            .groupBy('bots.id');

        const empty = (await bots.findWhereIdNot(shortage.map(s => s.id), 'stickers')).map(bot => ({
            items_count: 0,
            id: bot.id,
            username: bot.username,
            steamid: bot.steamid,
            steam_token: bot.steam_token,
        }));

        return shortage.concat(empty).filter(r => r.items_count < max);
    },

}


async function steamIds(type: Bots): Promise<string[]> {
    return (await bots.factory(type)).map(b => b.steamid);
}
