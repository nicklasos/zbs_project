import './test';

import * as sinon from 'sinon';
import db from '../src/db';
import { FlowBuy } from '../src/flow-buy';
import flowChecks from '../src/flow-checks';
import flowFactory from '../src/flow-factory';
import orders from '../src/orders';
import search from '../src/search';
import request from './fixtures/create_order';
import OpSkins from '../src/vendors/OpSkins';
import orderItems from '../src/items';
import { assert } from 'chai';
import SteamBot from '../src/bot';
import { Callback } from '../src/callback';
import { OrderLog } from '../src/order-log';
import bots from '../src/bots';

const sandbox = sinon.sandbox.create();

const searchResult = [
    {
        id: '2',
        hash: 'Tec-9 | Army Mesh (Battle-Scarred)',
        price: 0.03,
        suggested: 0.04,
        stickers: null,
        instance_id: '123',
        class_id: '34',
        vendor: 'opskins',
    },
    {
        id: '1',
        hash: 'Tec-9 | Army Mesh (Battle-Scarred)',
        price: 0.03,
        suggested: 0.04,
        stickers: null,
        instance_id: '123',
        class_id: '34',
        vendor: 'bitskins',
    },
    {
        id: '1',
        hash: 'Tec-9 | Army Mesh (Battle-Scarred)',
        price: 0.03,
        suggested: 0.04,
        stickers: null,
        instance_id: '123',
        class_id: '34',
        vendor: 'bitskins',
    },
];

describe('process freshOrder', () => {
    afterEach(() => sandbox.restore());

    beforeEach(() => {
        sandbox.stub(OrderLog.prototype, 'add');
    });

    describe('bot errors', () => {
        it('should rise error on bad trade url', async () => {

            const orderId = await orders.createFromRequest(request);

            const [botId] = await db('bots').insert({
                enabled: true,
                active: true,
                ready: true,
                steamid: 'buy_steamid',
            });

            sandbox.stub(SteamBot.prototype, 'checkTradeUrl').returns(false);
            sandbox.stub(SteamBot.prototype, 'ping').returns(true);
            sandbox.stub(Callback.prototype, 'error');

            const { order, items } = await orders.findOrderWithItems(orderId);

            const bot = await bots.findById(botId);
            sandbox.stub(bots, 'findById').returns(bot);

            const buy = await flowFactory.makeBuy(order, items);
            await buy.run();

            sinon.assert.calledOnce(Callback.prototype.error as any);
            sinon.assert.calledOnce(SteamBot.prototype.checkTradeUrl as any);

            const [cbArgs] = (Callback.prototype.error as any).getCall(0).args;

            assert.equal(cbArgs, 'Trade url error');
        });

        it('should rise error on bad bot ping', async () => {
            const orderId = await orders.createFromRequest(request);

            const [botId] = await db('bots').insert({
                enabled: true,
                active: true,
                ready: true,
                steamid: 'buy_steamid',
            });

            const bot = await bots.findById(botId);
            sandbox.stub(bots, 'findById').returns(bot);

            sandbox.stub(SteamBot.prototype, 'checkTradeUrl').returns(true);
            sandbox.stub(SteamBot.prototype, 'pendingTradeOffersCount').returns(true);
            sandbox.stub(SteamBot.prototype, 'ping').returns(false);
            sandbox.stub(SteamBot.prototype, 'restart');
            sandbox.stub(Callback.prototype, 'error');

            const { order, items } = await orders.findOrderWithItems(orderId);

            const buy = await flowFactory.makeBuy(order, items);
            await buy.run();

            sinon.assert.calledOnce(Callback.prototype.error as any);
            sinon.assert.calledOnce(SteamBot.prototype.ping as any);

            const orderFromDb = await orders.find(orderId);

            assert.equal(orderFromDb.status, 'bot-error');
        });
    });

    describe('buy', () => {
        it('should works', async () => {

            const orderId = await orders.createFromRequest(request);

            const [botId] = await db('bots').insert({
                enabled: true,
                active: true,
                ready: true,
                steamid: 'buy_steamid',
            });

            const bot = await bots.findById(botId);
            sandbox.stub(bots, 'findById').returns(bot);

            await db('storehouse').insert({
                hash: 'Tec-9 | Army Mesh (Battle-Scarred)',
                status: 'available',
                bot_steamid: 'buy_steamid',
            });

            sandbox.stub(search, 'opSkins').returns(searchResult);

            const order = await orders.find(orderId);

            sandbox.stub(OpSkins.prototype, 'buy').returns({ result: 'success', tokens: [1] });

            sandbox.stub(orderItems, 'process');
            sandbox.stub(orderItems, 'buying');
            sandbox.stub(orderItems, 'buySuccess');
            sandbox.stub(orderItems, 'buyError');

            sandbox.stub(FlowBuy.prototype, 'tryReserveAndComplete');

            sandbox.stub(SteamBot.prototype, 'checkTradeUrl').returns(true);
            sandbox.stub(SteamBot.prototype, 'pendingTradeOffersCount').returns(2);
            sandbox.stub(SteamBot.prototype, 'ping').returns(true);

            const items = await orderItems.findByOrderId(orderId);

            const buy = await flowFactory.makeBuy(order, items);
            await buy.run();

            sinon.assert.calledOnce(orderItems.process as any);
            sinon.assert.calledOnce(orderItems.buying as any);
            sinon.assert.calledOnce(orderItems.buySuccess as any);
            sinon.assert.notCalled(orderItems.buyError as any);

            const orderFromDb = await orders.find(orderId);

            assert.equal(botId, orderFromDb.bot_id);

        });

        it('should reserve orderItems for freshOrder', async () => {

            const order_id = await orders.createFromRequest(request);

            const [bot_id] = await db('bots').insert({
                enabled: true,
                active: true,
                ready: true,
                steamid: 'buy_steamid',
            });

            const bot = await bots.findById(bot_id);
            sandbox.stub(bots, 'findById').returns(bot);

            const [tec9storehouseId] = await db('storehouse').insert({
                hash: 'Tec-9 | Army Mesh (Battle-Scarred)',
                status: 'available',
                bot_steamid: 'buy_steamid',
            });

            await db('order_items').where({ order_id }).update({ bot_id, status: 'buy-success' });
            await db('orders').where({ id: order_id }).update({ bot_id });

            const { order, items } = await orders.findOrderWithItems(order_id);

            // await flowBuy.reserve(freshOrder, orderItems);

            // const tec9orderItem = await db('order_items').where({ id: tec9storehouseId }).first();

            // assert.equal(tec9orderItem.storehouse_id, tec9storehouseId);
        });

        it('should check if freshOrder is ready', async () => {
            sandbox.stub(flowChecks, 'ping').returns(false);
            sandbox.stub(flowChecks, 'tradeUrl').returns(false);
            sandbox.stub(flowChecks, 'pendingTradeOffers').returns(false);

            const order_id = await orders.createFromRequest(request);

            const [bot_id] = await db('bots').insert({
                enabled: true,
                active: true,
                ready: true,
                steamid: 'buy_steamid',
            });

            const bot = await bots.findById(bot_id);
            sandbox.stub(bots, 'findById').returns(bot);

            await db('order_items').where({ order_id }).update({ bot_id, storehouse_id: 1, status: 'buy-success' });
            await db('orders').where({ id: order_id }).update({ bot_id });

            const { order, items } = await orders.findOrderWithItems(order_id);

            const buy = await flowFactory.makeBuy(order, items) as FlowBuy;
            assert.isTrue(orderItems.isReady(items));
        });

        it('should complete freshOrder', async () => {
            sandbox.stub(SteamBot.prototype, 'sendItems').returns({
                result: 'ok',
                tradeofferid: '2324',
            });

            sandbox.stub(SteamBot.prototype, 'ping').returns(true);
            sandbox.stub(SteamBot.prototype, 'checkTradeUrl').returns(true);
            sandbox.stub(SteamBot.prototype, 'pendingTradeOffersCount').returns(true);
            sandbox.stub(Callback.prototype, 'complete');

            const order_id = await orders.createFromRequest(request);

            const [bot_id] = await db('bots').insert({
                enabled: true,
                active: true,
                ready: true,
                steamid: 'buy_steamid',
            });

            const bot = await bots.findById(bot_id);
            sandbox.stub(bots, 'findById').returns(bot);

            const oItems = await orderItems.findByOrderId(order_id);

            const [storehouseId1] = await db('storehouse').insert({
                hash: 'Tec-9 | Army Mesh (Battle-Scarred)',
                status: 'available',
                bot_steamid: 'buy_steamid',
            });

            const [storehouseId2] = await db('storehouse').insert({
                hash: 'Tec-9 | Army Mesh (Battle-Scarred)',
                status: 'available',
                bot_steamid: 'buy_steamid',
            });

            await db('order_items')
                .where({ id: oItems[0].id })
                .update({ bot_id, storehouse_id: storehouseId1, status: 'buy-successful' });

            await db('order_items')
                .where({ id: oItems[1].id })
                .update({ bot_id, storehouse_id: storehouseId2, status: 'buy-successful' });

            await db('orders').where({ id: order_id }).update({ bot_id });

            const { order, items } = await orders.findOrderWithItems(order_id);

            const buy = await flowFactory.makeBuy(order, items) as FlowBuy;

            (FlowBuy.prototype as any).steamBot = new SteamBot({} as any);
            (FlowBuy.prototype as any).cb = new Callback({} as any);

            await buy.complete();

            const itemsFromDb = await db('order_items').whereIn('id', oItems.map(i => i.id));

            assert.equal(itemsFromDb[0].status, 'sent');
            assert.equal(itemsFromDb[1].status, 'sent');
        });
    });
});
