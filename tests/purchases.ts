import './test';

import { assert } from 'chai';
import db from '../src/db';
import purchases from '../src/purchases';

describe('purchases', () => {
    describe('add and withdraw', () => {
        beforeEach(async () => {
            await purchases.add({
                bot_id: 0,
                provider: 'bitskins',
                items: 'super_item_test',
                price: 0.01,
            });
        });

        it('should create freshOrder', async () => {
            const p = await db('purchases').where('items', 'super_item_test').first();

            assert.equal(p.provider, 'bitskins');
            assert.equal(p.withdrawn, 0);
        });

        it('should withdraw item', async () => {
            const [purchaseId] = await purchases.add({
                bot_id: 0,
                items: '',
                provider: 'bitskins',
                price: 0.01,
            });

            await purchases.withdraw(purchaseId, 'log');

            const [p] = await db('purchases').where('id', purchaseId);

            assert.equal(p.withdrawn, 1);
            assert.equal(p.withdraw_log, 'log');
        });
    });
});
