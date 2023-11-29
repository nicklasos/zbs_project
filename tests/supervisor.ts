import './test';

import { assert } from 'chai';
import * as sinon from 'sinon';
import Bot from '../src/bot';
import db from '../src/db';
import flow from '../src/flow';
import orders from '../src/orders';
import orderItems from '../src/items';
import * as supervisor from '../src/supervisor';

const sandbox = sinon.sandbox.create();

describe('supervisor', () => {
    afterEach(() => {
        sandbox.restore();
    });

    describe('bots', () => {
        it('should enable (set ready) bots after trade_offers_limit', async () => {
            sandbox.stub(console, 'log');

            const date = new Date();
            date.setHours(date.getHours() - 2);

            const [[firstId], [secondId]] = await Promise.all([
                db('bots').insert({
                    steamid: 'first',
                    ready: false,
                    enabled: true,
                }),
                db('bots').insert({
                    steamid: 'second',
                    ready: false,
                    enabled: true,
                    last_ready_at: date,
                }),
            ]);

            await supervisor.checkReadyBots();

            const first = await db('bots').where({ id: firstId }).first();
            const second = await db('bots').where({ id: secondId }).first();

            assert.equal(0, first.ready);
            assert.equal(1, second.ready);

        });
    });

    describe('orders', () => {
        it('should restart with status trade offers limits', async () => {
            sandbox.stub(flow, 'process');
            sandbox.stub(orderItems, 'findByOrderId').returns(['test_item']);
            sandbox.stub(console, 'log');

            const [[firstId]] = await Promise.all([
                db('orders').insert({
                    status: 'trade_offers_limit',
                    flow: 'stickers',
                }),
                db('orders').insert({
                    status: 'trade_offers_limit',
                    tries: 4,
                    flow: 'stickers',
                }),
            ]);

            await supervisor.restartFailedOrdersStorehouse(['trade_offers_limit'], 2);

            const first = await db('orders').where({ id: firstId }).first();

            assert.equal('new', first.status);
            assert.equal(2, first.tries);

            sinon.assert.calledOnce(flow.process as any);

        });
    });

    describe('pending trade offers', () => {
        it('should cancel old pending trade offers', async () => {

            await Promise.all([
                db('bots').insert({
                    id: 3,
                    steamid: 'first',
                    enabled: true,
                }),
                db('bots').insert({
                    steamid: 'second',
                    enabled: false,
                }),
            ]);

            sandbox.stub(console, 'log');
            sandbox.stub(Bot.prototype, 'pendingTradeOffers').returns(require('./fixtures/bot_pending_trade_offers'));
            sandbox.stub(Bot.prototype, 'cancelTradeOffer').returns({ result: 'ok' });

            await supervisor.cancelPendingOffers();

        });
    });
});
