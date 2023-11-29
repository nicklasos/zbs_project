import '../test';

import { assert } from 'chai';
import * as sinon from 'sinon';
const sandbox = sinon.sandbox.create();

import bots from '../../src/bots';
import OpSkins from '../../src/vendors/OpSkins';
import { Bot } from '../../src/types';

describe('OpSkins', () => {
    afterEach(() => {
        sandbox.restore();
    });

    describe('make', () => {
        it('should create opskins class', () => {
            const bitSkins = OpSkins.make();

            assert.isTrue(bitSkins.hasOwnProperty('apiMethods'));
        });
    });

    describe('find', () => {
        it('should vendors and format orderItems', async () => {
            sandbox
                .stub(OpSkins.prototype, 'request')
                .returns(require('./../fixtures/opskins_search_request'));

            const opSkins = OpSkins.make();

            const { items } = await opSkins.find('Tec-9 | Army Mesh (Minimal Wear)');

            const souvenir = items.filter(i => i.hash.startsWith('Souvenir'));
            const stat = items.filter(i => i.hash.startsWith('StatTrak'));

            assert.equal(stat.length, 0);
            assert.equal(souvenir.length, 0);

            const [item] = items;

            assert.equal(item.vendor, 'opskins');
        });
    });

    describe('buy', () => {
        it('should buy item', async () => {
            sandbox.stub(console, 'log');

            sandbox
                .stub(OpSkins.prototype, 'request')
                .returns(require('./../fixtures/opskins_buy_ok'));

            sandbox
                .stub(bots, 'active')
                .returns({
                    steamid: 'test_steamid',
                    steam_token: 'test_steam_token',
                });

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

            const opSkins = OpSkins.make();

            const buyResult = await opSkins.buy([{
                id: '3',
                hash: 'Tec-9 | Army Mesh (Field-Tested)',
                price: 0.01,
                suggested: 0.03,
                stickers: 0,
                instance_id: '302028390',
                class_id: '310777118',
                vendor: 'opskins',
            }], bot);

            assert.equal(buyResult.result, 'success');
            assert.sameMembers(buyResult.tokens, [1, 2, 3, 4]);
        });
    });
});
