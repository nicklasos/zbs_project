import './test';

import db from '../src/db';
import items from '../src/items';
import { assert } from 'chai';

describe('freshOrder orderItems', () => {
    describe('buy success', () => {
        it('should change status and st price', async () => {
            const [id] = await db('order_items').insert({
                status: 'new',
            });

            await items.buySuccess(await items.find(id), {
                id: '1',
                hash: 'pistol',
                price: 12.3,
                suggested: 12.5,
                stickers: null,
                instance_id: 'foo',
                class_id: 'bar',
                vendor: 'opskins',
            });

            const itemFromDb = await db('order_items').where({ id }).first();

            assert.equal(itemFromDb.status, 'buy-success');
            assert.equal(itemFromDb.price, 12.3);
        });
    });
});
