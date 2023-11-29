import './test';

import { assert } from 'chai';

import bots from '../src/bots';
import db from '../src/db';
import orders from '../src/orders';
import orderItems from '../src/items';
import storehouse from '../src/storehouse';

describe('bots', () => {
    it('should return active bot', async () => {

        await Promise.all([
            db('bots').insert({
                steamid: 'first',
                active: 0,
                enabled: true,
            }),
            db('bots').insert({
                steamid: 'second',
                active: 1,
                enabled: true,
            }),
        ]);

        const bot = await bots.active();

        assert.equal(bot.steamid, 'second');

        const bySteamid = await bots.findBySteamid('second');

        assert.equal(bySteamid.steamid, 'second');

    });

    it('should return enabled bots', async () => {

        await Promise.all([
            db('bots').insert({
                steamid: 'first',
                enabled: true,
            }),
            db('bots').insert({
                steamid: 'second',
                enabled: false,
            }),
        ]);

        const enabled = await bots.enabled();

        assert.equal(enabled.length, 1);
        assert.equal(enabled[0].steamid, 'first');
    });

    it('should return ready bots', async () => {

        await Promise.all([
            db('bots').insert({
                steamid: 'ready_first',
                ready: true,
                enabled: true,
            }),
            db('bots').insert({
                steamid: 'ready_second',
                ready: false,
                enabled: true,
            }),
        ]);

        const enabled = await bots.ready();

        assert.equal(enabled.length, 1);
        assert.equal(enabled[0].steamid, 'ready_first');
    });

    it('should get random ready boy', async () => {
        const [[first], [second]] = await Promise.all([
            db('bots').insert({
                steamid: 'ready_first',
                ready: true,
                enabled: true,
            }),
            db('bots').insert({
                steamid: 'ready_second',
                ready: false,
                enabled: true,
            }),
        ]);

        const random = await bots.randomBot();

        assert.isTrue(random.id === first || random.id === second);
    });

    it('should return bots with more items to send', async () => {
        await db('bots').insert({
            steamid: '1',
            enabled: 1,
            ready: 1,
            game: 'csgo',
            type: 'inventory',
        });

        await db('bots').insert({
            steamid: '2',
            enabled: 1,
            ready: 1,
            game: 'csgo',
            type: 'inventory',
        });

        await db('bots').insert({
            steamid: '3',
            enabled: 1,
            ready: 0,
            game: 'csgo',
            type: 'inventory',
        });

        const orderId = await orders.insert({
            quality: 'normal',
            game: 'csgo',
        });

        await orderItems.insert({
            order_id: orderId,
            hash: 'P250 | Valence (Factory New)',
        });

        await orderItems.insert({
            order_id: orderId,
            hash: 'Tec-9 | Red Quartz (Minimal Wear)'
        });

        await storehouse.insert({
            bot_steamid: '1',
            hash: 'P250 | Valence (Factory New)',
            status: 'available',
        });

        await storehouse.insert({
            bot_steamid: '2',
            hash: 'P250 | Valence (Factory New)',
            status: 'available',
        });

        await storehouse.insert({
            bot_steamid: '2',
            hash: 'Tec-9 | Red Quartz (Minimal Wear)',
            status: 'available',
        });

        await storehouse.insert({
            bot_steamid: '3',
            hash: 'P250 | Valence (Factory New)',
            status: 'available',
        });

        const { order, items } = await orders.findOrderWithItems(orderId);

        const bot = await bots.suitable(order, items);

        assert.equal(bot.id, '2');
    });
});
