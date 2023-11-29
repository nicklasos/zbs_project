import './test';

import { assert } from 'chai';

import db from '../src/db';
import storehouse from '../src/storehouse';
import orderItems from '../src/items';

describe('storehouse', async () => {
    describe('find', () => {
        it('should find all orderItems by ids', async () => {
            const [id1] = await db('storehouse').insert({
                hash: 'Bump',
                status: 'available',
            });

            const [id2] = await db('storehouse').insert({
                hash: 'Another item',
                status: 'not-available',
            });

            const items = await storehouse.findAllByIds([id1, id2]);

            assert.equal(items.length, 1);
            assert.equal(items[0].hash, 'Bump');
        });

        it('should select all stickers orderItems by hash', async () => {

            const hash = 'USP-S | Torque (Well-Worn)';

            const [id] = await db('storehouse').insert({
                hash,
                status: 'available',
            });

            await db('storehouse').insert({
                hash: 'Another item',
                status: 'available',
            });

            const items = await storehouse.find(hash);
            assert.equal(items.length, 1);
            assert.equal(items[0].id, id);

        });
    });

    describe('vendors and lock', () => {
        it('should vendors item and lock it', async () => {

            const hash = 'USP-S | Torque (Well-Worn)';

            const [id] = await db('storehouse').insert({
                hash,
                bot_steamid: 'test_bot_steamid',
                order_item_id: '0',
                status: 'available',
            });

            const item = await storehouse.reserve({
                randomOrder: true,
                steamids: ['test_bot_steamid'],
                order_item_id: 666,
            });

            assert.equal(item.status, 'process');
            assert.equal(item.order_item_id, 666);

            const itemFromDb = await db('storehouse').where({ id }).first();

            assert.equal(itemFromDb.status, 'process');
            assert.equal(itemFromDb.order_item_id, 666);

        });

        it('should find graffiti', async () => {
            await db('storehouse').insert({
                hash: 'foo (Field-Tested)',
                status: 'available',
            });

            const item = await storehouse.reserve({});

            assert.equal(item.hash, 'foo (Field-Tested)');

            const noItem = await storehouse.reserve({});

            assert.isNull(noItem);

            await storehouse.release([item.id]);

            const noGraff = await storehouse.reserve({
                graffiti: true,
            });

            assert.isNull(noGraff);

            await db('storehouse').insert({
                hash: 'Sealed Graffiti | Tombstone (War Pig Pink)',
                status: 'available',
            });

            const graff = await storehouse.reserve({
                graffiti: true,
            });

            assert.equal(graff.hash, 'Sealed Graffiti | Tombstone (War Pig Pink)');
        });

        it('should unlock orderItems', async () => {
            const hash = 'USP-S | Torque (Well-Worn)';

            await db('storehouse').insert({
                hash,
                bot_steamid: 'test_bot_steamid',
                order_item_id: '0',
                status: 'available',
            });

            const item = await storehouse.reserve({
                randomOrder: true,
                steamids: ['test_bot_steamid'],
                order_item_id: 777,
            });

            assert.equal(item.status, 'process');

            await storehouse.release([item.id]);

            const itemFromDb = await db('storehouse').where({ id: item.id }).first();

            assert.equal(itemFromDb.status, 'available');
            assert.isNull(itemFromDb.order_item_id);
        });
    });

    describe('assign item', () => {
        it('should set freshOrder item id in stickers', async () => {
            const [storehouseId] = await db('storehouse').insert({
                hash: 'foo',
            });

            const [itemId] = await db('order_items').insert({});

            await storehouse.assignItem(await storehouse.findById(storehouseId), await orderItems.find(itemId));

            const storehouseItem = await db('storehouse').where('id', storehouseId).first();

            assert.equal(storehouseItem.order_item_id, itemId);
        });
    });

    describe('reserve with quality', () => {
        it('should reserve item with different qualities', async () => {
            await db('storehouse').insert({
                hash: 'foo (Field-Tested)',
                status: 'available',
            });

            const item = await storehouse.reserve({
                hash: 'foo (Minimal Wear)',
                quality: 'normal',
            });

            assert.equal(item.hash, 'foo (Field-Tested)');
        });

        it('should works with real examples', async () => {
            await db('storehouse').insert({
                hash: 'Tec-9 | Red Quartz (Minimal Wear)',
                status: 'available',
            });

            const item = await storehouse.reserve({
                hash: 'Tec-9 | Red Quartz (Well-Worn)',
                quality: 'normal',
            });

            assert.equal(item.hash, 'Tec-9 | Red Quartz (Minimal Wear)');
        });
    });
});
