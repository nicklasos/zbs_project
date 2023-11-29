import './test';

import { assert } from 'chai';
import * as sinon from 'sinon';
import SteamBot from '../src/bot';
import db from '../src/db';
import { FlowStickers } from '../src/flow-stickers';
import orders from '../src/orders';
import request from './fixtures/create_order';
import mock = require('mock-require');

const sandbox = sinon.sandbox.create();

describe('process freshOrder', () => {
    afterEach(() => sandbox.restore());

    describe('storehouse', () => {
        it('should execute stickers method', async () => {

            const storehouseRequest = JSON.parse(JSON.stringify(request));

            storehouseRequest.config.vendors = ['Storehouse'];
            storehouseRequest.config.force_vendors = true;

            const orderId = await orders.createFromRequest(storehouseRequest);

            const FlowStickers = require('../src/flow-stickers').FlowStickers;

            sandbox.stub(FlowStickers.prototype, 'run');

            const flow = mock.reRequire('../src/flow').default;

            await flow.process(orderId);

            sinon.assert.calledOnce(FlowStickers.prototype.run as any);

            mock.stopAll();
        });

        it('should send orderItems from stickers', async () => {
            sandbox.stub(SteamBot.prototype, 'sendItems').returns({
                result: 'ok',
            });

            const hash = 'Sealed Graffiti | Tombstone (War Pig Pink)';

            await db('bots').insert({
                steamid: 'test_bot_1',
                steam_token: 'test_bot_token',
                type: 'stickers',
                ready: true,
                enabled: true,
            });

            const [storehouseId] = await db('storehouse').insert({
                bot_steamid: 'test_bot_1',
                hash,
                status: 'available',
            });

            const storehouseRequest = JSON.parse(JSON.stringify(request));

            storehouseRequest.items = [{ hash }];
            storehouseRequest.config.vendors = ['Storehouse'];
            storehouseRequest.config.force_vendors = true;

            const orderId = await orders.createFromRequest(storehouseRequest);

            const { order, items } = await orders.findOrderWithItems(orderId);

            const stickers = new FlowStickers(order, items);
            await stickers.run();

            sinon.assert.calledOnce(SteamBot.prototype.sendItems as any);

            const [trade_url, [item]] = (SteamBot.prototype.sendItems as any).getCall(0).args;

            assert.equal(item.id, storehouseId);

            const storehouseFromDb = await db('storehouse').where('id', storehouseId).first();

            assert.equal('process', storehouseFromDb.status);

            assert.equal(storehouseFromDb.order_item_id, item.id);

            const resultOrder = await orders.find(orderId);

            assert.equal(resultOrder.status, 'done');
        });

        it('should set error status for trade offers limit', async () => {
            sandbox.stub(SteamBot.prototype, 'sendItems').returns({
                result: 'error',
                type: 'trade_offers_limit',
            });

            sandbox.stub(console, 'error');

            const hash = 'Sealed Graffiti | Tombstone (War Pig Pink)';

            const [botId] = await db('bots').insert({
                steamid: 'test_bot_2',
                type: 'stickers',
                steam_token: 'test_bot_token',
                ready: true,
                enabled: true,
            });

            const [storehouseId] = await db('storehouse').insert({
                bot_steamid: 'test_bot_2',
                hash,
                status: 'available',
            });

            const storehouseRequest = JSON.parse(JSON.stringify(request));

            storehouseRequest.items = [{ hash }];
            storehouseRequest.config.vendors = ['Storehouse'];
            storehouseRequest.config.force_vendors = true;

            const orderId = await orders.createFromRequest(storehouseRequest);

            const { order, items } = await orders.findOrderWithItems(orderId);

            const stickers = new FlowStickers(order, items);
            await stickers.run();

            const orderFromDb = await db('orders').where({ id: order.id }).first();

            assert.equal('trade_offers_limit', orderFromDb.status);

            const storehouseFromDb = await db('storehouse').where({ id: storehouseId }).first();

            assert.equal(storehouseFromDb.status, 'available', 'flow should release orderItems from stickers');

            const botFromDb = await db('bots').where({ id: botId }).first();

            assert.equal(0, botFromDb.ready);
        });
    });
});
