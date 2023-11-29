import request from './fixtures/create_order';

import vendorsConfig from '../config/clients';
vendorsConfig['vendor_name'] = {
    api_key: 'test_api_key',
};

import './test';

import { assert } from 'chai';
import db from '../src/db';
import orders from '../src/orders';
import orderItems from '../src/items';
import storehouse from '../src/storehouse';

describe('orders', () => {
    describe('create orders from request', () => {
        it('should crete orders', async () => {

            const orderId = await orders.createFromRequest(request);

            const [result] = await db('orders').where('id', orderId);

            assert.equal(result.trade_url, request.recipient.trade_url);
            assert.equal(result.agent_id, request.sender.agent_id);
            assert.equal(result.comment, request.config.comment);
            assert.equal(result.priority, request.config.priority);
            assert.equal(result.quality, request.config.quality);
            assert.equal(result.force_vendors, request.config.force_vendors);
            assert.equal(result.force_vendors, request.config.force_vendors);
            assert.equal(result.client_id, 'vendor_name');
        });

        it('should create orderItems', async () => {
            const orderId = await orders.createFromRequest(request);

            const [item1, item2] = await db('order_items').where('order_id', orderId);

            assert.equal(item1.hash, 'Tec-9 | Army Mesh (Battle-Scarred)');
            assert.equal(item2.hash, 'USP-S | Torque (Well-Worn)');
        });
    });

    describe('vendors by id', () => {
        it('should fetch vendors by id', async () => {
            const tradeUrl = 'test_' + Math.random();

            const [id] = await db('orders').insert({
                trade_url: tradeUrl,
            });

            const order = await orders.find(id);

            assert.equal(tradeUrl, order.trade_url);
        });

        it('should return null where orders not found', async () => {
            const order = await orders.find(0);

            assert.isUndefined(order);
        });
    });

    describe('create', async () => {
        it('should return last insert id', async () => {

            const id = await orders.create({
                trade_url: 'test_trade_url',
            });

            const [order] = await db('orders').where('id', id);

            assert.equal(order.trade_url, 'test_trade_url');
        });
    });

    describe('vendors orderItems', () => {
        it('should vendors orderItems by order id', async () => {
            await orderItems.createItems(5, [
                {
                    status: 'available',
                    hash: 'AWP | Dragon Lore (Factory New)',
                    count: 1,
                    payload: 'orders item #1',
                    max_price: 10,
                    vendor: 'bitskins',
                },
            ]);

            const [items] = await orderItems.findByOrderId(5);

            assert.equal('orders item #1', items.payload);
        });
    });

    describe('vendors freshOrder with orderItems', () => {
        it('should return orders with orderItems', async () => {
            const orderId = await orders.createFromRequest(request);

            const { order, items } = await orders.findOrderWithItems(orderId);

            assert.equal(orderId, order.id);
            assert.equal(orderId, items[0].order_id);
        });
    });

    describe('statuses', () => {
        it('should process and done freshOrder', async () => {
            const [id] = await db('orders').insert({});
            let order = await db('orders').where({ id }).first();
            assert.equal(order.status, 'new');

            await orders.process(order);
            order = await db('orders').where({ id }).first();
            assert.equal(order.status, 'process');

            await orders.done(order);
            order = await db('orders').where({ id }).first();
            assert.equal(order.status, 'done');

            await orders.error(order);
            order = await db('orders').where({ id }).first();
            assert.equal(order.status, 'error');
        });

        it('should prepare freshOrder for next restart try', async () => {
            const [id] = await db('orders').insert({
                status: 'trade_offers_limit',
                tries: 2,
            });

            const order = await db('orders').where({ id }).first();

            await orders.nextTry(order);

            assert.equal('new', order.status);
            assert.equal(3, order.tries);

            const orderFromDb = await db('orders').where({ id }).first();

            assert.equal('new', orderFromDb.status);
            assert.equal(3, orderFromDb.tries);
        });
    });

    describe('error info', () => {
        it('should add info to array', async () => {

            const [id] = await db('orders').insert({});
            let order = await db('orders').where({ id }).first();

            await orders.addError(order, 'first');
            order = await db('orders').where({ id }).first();
            assert.equal(order.error_log, '[\n  "first"\n]');

            await orders.addError(order, 'second');
            order = await db('orders').where({ id }).first();
            assert.equal(order.error_log, '[\n  "first",\n  "second"\n]');
        });
    });

    describe('release order', () => {
        it('should release orderItems', async () => {
            const botId = 60;

            const orderId = await orders.insert({ bot_id: botId });
            let order = await orders.find(orderId);

            const storehouseId = await storehouse.insert({ status: 'process' });
            const orderItemId = await orderItems.insert({
                storehouse_id: storehouseId,
                bot_id:  botId,
                order_id: orderId,
            });
            await db('storehouse').where({ id: storehouseId }).update({ order_item_id: orderItemId });

            const storehouseIdSent = await storehouse.insert({ status: 'sent' });
            const orderItemIdSent = await orderItems.insert({
                storehouse_id: storehouseIdSent,
                bot_id:  botId,
                order_id: orderId,
                status: 'sent',
            });
            await db('storehouse').where({ id: storehouseIdSent }).update({ order_item_id: orderItemIdSent });

            await orders.release(order);

            const storehouseFromDb = await storehouse.findById(storehouseId);
            const orderItem = await orderItems.find(orderItemId);

            assert.isNull(storehouseFromDb.order_item_id);
            assert.equal(storehouseFromDb.status, 'available');

            assert.isNull(orderItem.storehouse_id);
            assert.isNull(orderItem.bot_id);
            assert.equal(orderItem.status, 'new');

            const storehouseFromDbSent = await storehouse.findById(storehouseIdSent);
            const orderItemSent = await orderItems.find(orderItemIdSent);

            assert.equal(storehouseFromDbSent.status, 'sent');
            assert.equal(orderItemSent.status, 'sent');
            assert.equal(orderItemSent.storehouse_id, storehouseFromDbSent.id);
        });
    });
});
