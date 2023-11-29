import '../test';

import { assert } from 'chai';
import * as sinon from 'sinon';
import purchases from '../../src/purchases';
import { Bot } from '../../src/types';
import BitSkins, { aggregateByToken } from '../../src/vendors/BitSkins';
import inventoryResponse from './../fixtures/bitskins_inventory';
const sandbox = sinon.sandbox.create();

describe('BitSkins', () => {
    describe('make', () => {
        it('should create bitskins class', () => {
            const bitSkins = BitSkins.make();

            assert.isTrue(bitSkins.hasOwnProperty('apiMethods'));
        });
    });

    describe('buy', () => {
        afterEach(() => sandbox.restore());

        it('should return token', async () => {

        });

        it('should buy item', async () => {
            sandbox.stub(console, 'log');

            sandbox
                .stub(BitSkins.prototype, 'withdraw')
                .returns({
                    result: 'success',
                    tokens: ['5f823154f6a61b35'],
                });

            sandbox
                .stub(BitSkins.prototype, 'request')
                .returns(require('./../fixtures/bitskins_buy_ok'));

            const bot: Bot = {
                steamid: 'test_steamid',
                steam_token: 'test_steam_token',
                id: 1,
                username: '',
                password: '',
                shared_secret: '',
                identity_secret: '',
                type: '',
                url: '',
                active: true,
                ready: true,
                last_ready_at: '',
            };

            const bitSkins = BitSkins.make();

            const buyResult = await bitSkins.buy([{
                id: '3',
                hash: 'Tec-9 | Army Mesh (Field-Tested)',
                price: 0.01,
                suggested: 0.03,
                stickers: 0,
                instance_id: '302028390',
                class_id: '310777118',
                vendor: 'bitskins',
            }], bot);

            assert.sameMembers(buyResult.tokens, ['5f823154f6a61b35']);

            assert.equal(buyResult.result, 'success');

            sinon.assert.calledOnce(bitSkins.withdraw as any);
            sinon.assert.calledOnce(bitSkins.request as any);

            const [apiMethod, item, { method }] = (bitSkins.request as any).getCall(0).args;

            assert.equal(apiMethod, 'buy');
            assert.equal(item.item_ids, '3');
            assert.equal(method, 'POST');

            const [{ steamId, token, itemIds }] = (bitSkins.withdraw as any).getCall(0).args;
            assert.equal(steamId, 'test_steamid');
            assert.equal(token, 'test_steam_token');
            assert.equal(itemIds[0], '3');

        });

        it('should withdraw item', async () => {
            const withdrawResponse = require('./../fixtures/bitskins_withdraw_success');

            sandbox.stub(console, 'log');

            sandbox
                .stub(BitSkins.prototype, 'request')
                .returns(withdrawResponse);

            const [purchaseId] = await purchases.add({
                bot_id: 0,
                provider: 'bitskins',
                price: 0.01,
                items: '',
            });

            const bitSkins = BitSkins.make();

            const result = await bitSkins.withdraw({
                purchaseId,
                steamId: 'steam_id_test',
                token: 'token_test',
                itemIds: ['123123'],
            });

            assert.equal(result.result, 'success');
            assert.sameMembers(result.tokens, ['5f823154f6a61b35']);

            const [apiMethod, { to_id, to_token, item_ids }] = (bitSkins.request as any).getCall(0).args;

            assert.equal(apiMethod, 'withdraw');
            assert.equal(to_id, 'steam_id_test');
            assert.equal(to_token, 'token_test');
            assert.equal(item_ids, '123123');

            // const p = await db('purchases').where('assetid', '123123').first();
            //
            // assert.equal(p.withdrawn, 1);
            //
            // assert.equal(p.withdraw_log, JSON.stringify(withdrawResponse));

        });

        it('should get inventory orderItems', async () => {

            sandbox
                .stub(BitSkins.prototype, 'request')
                .returns({ json: () => inventoryResponse });

            const bitSkins = BitSkins.make();

            await bitSkins.inventory();

            const [apiMethod] = (bitSkins.request as any).getCall(0).args;

            assert.equal(apiMethod, 'inventory');

        });

        it('should aggregate inventory by token', () => {

            const result = aggregateByToken(inventoryResponse.data.pending_withdrawal_from_bitskins.items);

            assert.equal(result.get('400e9cedf7da54a1')[0], '9790214739');
            assert.equal(result.get('fe4c7b7492d75a3a')[1], '8864010562');

        });
    });
});
