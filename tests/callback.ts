import './test';

import { Callback } from '../src/callback';
import db from '../src/db';
import { assert } from 'chai';
import * as sinon from 'sinon';

const sandbox = sinon.sandbox.create();

import vendorsConfig from '../config/clients';
vendorsConfig['test_vendor'] = {
    api_key: 'test_api_callback',
    callback_url: 'http://localhost:8000/test',
};

describe('callback', () => {
    afterEach(() => sandbox.restore());

    describe('success', () => {
        it('should callback client for success', async () => {
            sandbox.stub(console, 'log');

            const [order_id] = await db('orders').insert({ client_id: 'test_vendor' });
            const order = await db('orders').where({ id: order_id }).first();

            await db('order_items').insert({
                order_id,
                hash: 'pistol',
                status: 'sent',
                payload: 13,
            });

            await db('order_items').insert({
                order_id,
                hash: 'smg',
                status: 'buy-error',
                payload: 14,
            });

            sandbox.stub(Callback.prototype, 'request');

            const cb = new Callback(order);
            await cb.complete();

            sinon.assert.calledOnce(cb.request as any);

            const [args] = (cb.request as any).getCall(0).args;

            assert.equal(args.type, 'partial-complete');
            assert.equal(args.order_id, order_id);

            assert.equal(args.items[0].payload, 13);

            assert.equal(args.items[1].status, 'buy-error');
        });
    });

    describe('error', () => {
        it('should callback client for error', async () => {
            sandbox.stub(console, 'log');
            const [order_id] = await db('orders').insert({ client_id: 'test_vendor' });
            const order = await db('orders').where({ id: order_id }).first();

            await db('order_items').insert({
                order_id,
                hash: 'smg',
                status: 'buy-error',
                payload: 14,
            });

            sandbox.stub(Callback.prototype, 'request');

            const cb = new Callback(order);
            await cb.error('test error');

            sinon.assert.calledOnce(cb.request as any);

            const [args] = (cb.request as any).getCall(0).args;

            assert.equal(args.order_id, order_id);
            assert.equal(args.type, 'error');
            assert.equal(args.message, 'test error');
            assert.equal(args.items[0].status, 'buy-error');
        });
    });
});
