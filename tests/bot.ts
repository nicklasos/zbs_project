import './test';

import { assert } from 'chai';
import * as mock from 'mock-require';
import * as sinon from 'sinon';
import db from '../src/db';
import storehouse from '../src/storehouse';

describe('steam bot api', () => {
    describe('send orderItems', () => {
        it('should send orderItems through bot api', async () => {

            const fetch = sinon.stub().returns({
                json() {
                    return { result: 'ok' };
                },
            });

            mock('node-fetch', fetch);

            const hash = 'USP-S | Torque (Well-Worn)';
            const [id] = await db('storehouse').insert({
                hash,
                status: 'available',
            });

            const Bot = mock.reRequire('../src/bot').default;
            const bot = new Bot({
                url: 'http://localhost:3001',
                id: 12,
            });

            const items = await storehouse.find(hash);

            const response = await bot.sendItems('trade_url', items);

            assert.equal(response.result, 'ok');

            const [url, { method, body }] = fetch.getCall(0).args;

            assert.equal(url, 'http://localhost:3001/12/sendItems');
            assert.equal(method, 'POST');
            assert.equal(body, `{"tradeUrl":"trade_url","storehouseIds":[${id}]}`);

            mock.stopAll();

        });
    });

    describe('pending trade offers', () => {
        it('should make request to bot', async () => {
            const fetch = sinon.stub().returns({
                json: () => ({ result: 'ok_pending' }),
            });

            mock('node-fetch', fetch);

            const Bot = mock.reRequire('../src/bot').default;

            const bot = new Bot({
                url: 'http://localhost:3000',
                id: 3,
            });

            const response = await bot.pendingTradeOffers();

            assert.equal('ok_pending', response.result);
        });
    });
});
