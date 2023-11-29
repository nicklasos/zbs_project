import db, { wheresify } from './db';
import { Bot, Bots, BotType, Game, Order, OrderItem } from './types';
import quality from './quality';

const { where, whereIn } = wheresify('bots');

export default {

    findById(id: number): Promise<Bot> {
        return where({ id }).first();
    },

    findByIds(ids: number[]): Promise<Bot[]> {
        return whereIn('id', ids);
    },

    findWhereIdNot(ids: number[], type: BotType): Promise<Bot[]> {
        return where({ ready: true, enabled: true, type, }).whereNotIn('id', ids);
    },

    findBySteamid(steamid: string): Promise<Bot> {
        return where({ steamid }).first();
    },

    active(): Promise<Bot> {
        return where({ active: true, enabled: true }).first();
    },

    enabled(): Promise<Bot[]> {
        return where({ enabled: true });
    },

    ready(): Promise<Bot[]> {
        return where({ ready: true, enabled: true });
    },

    gameAndType(game: Game, type: BotType) {
        return this.ready().where({ game, type });
    },

    type(type: BotType): Promise<Bot[]> {
        return this.ready().where({ type });
    },

    factory(type: Bots): Promise<Bot[]> {
        switch (type) {
            case Bots.inventory:
                return this.type('inventory');

            case Bots.stickers:
                return this.type('stickers');

            case Bots.ready:
            default:
                return this.ready();
        }
    },

    async randomBot(type: Bots = null, game: Game = null): Promise<Bot | null> {
        let random;
        if (game) {
            random = await this.factory(type).where('game', game);
        } else {
            random = await this.factory(type);
        }

        if (random.length === 0) {
            return null;
        }

        return random[Math.floor(Math.random() * random.length)];
    },

    notReady(updatedAt): Bot[] {
        return where({ ready: false, enabled: true }).where('last_ready_at', '<', updatedAt);
    },

    setReady(bots: Bot[]): Promise<number> {
        bots.forEach(b => b.ready = true);

        return whereIn('id', bots.map(b => b.id)).update({
            ready: true,
            last_ready_at: db.fn.now(),
        });
    },

    async setNotReady(bot: Bot): Promise<number> {
        bot.ready = false;

        return where({ id: bot.id }).update({
            ready: false,
            last_ready_at: db.fn.now(),
        });
    },

    async suitable(order: Order, items: OrderItem[]) {

        const hashes = items.map(i => quality.call(order.quality, i.hash)).reduce((i, v) => i.concat(v));

        let ready;
        if (order.game === 'multi') {
            ready = await this.type('inventory').map(b => b.steamid);
        } else {
            ready = await this.gameAndType(order.game, 'inventory').map(b => b.steamid);
        }

        const bots = await db.select(db.raw('count(*) as cnt, bot_steamid'))
            .from('storehouse')
            .where('status', 'available')
            .whereIn('hash', hashes)
            .whereIn('bot_steamid', ready)
            .groupBy('bot_steamid')
            .orderBy('cnt', 'desc');

        if (bots.length) {

            try {
                console.log('Find suitable bots', JSON.stringify({
                    hashes,
                    bots,
                }, null, 2));
            } catch (ex) {
                console.error('Error on JSON stringify', ex);
            }

            const bot = bots.shift();

            return this.findBySteamid(bot.bot_steamid);
        }

        console.log('Suitable bots not found.');

        return this.randomBot(Bots.inventory, order.game);
    },

}
