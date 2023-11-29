import './test';

import tradeOffersHistory from '../src/trade-offers-history';
import * as sinon from 'sinon';
import SteamBot from '../src/bot';
import db from '../src/db';
import { assert } from 'chai';
import orders from '../src/orders';
import { Bot } from '../src/types';
import fs = require('fs');

// const sandbox = sinon.sandbox.create();
//
// describe('trade offers history', () => {
//     afterEach(() => {
//         sandbox.restore();
//     });
//
//     it('screenshots', async () => {
//
//         const lastId = await orders.insert({
//             bot_id: 3,
//             status: 'done',
//             tradeofferid: '2239174468',
//         });
//
//         const bot = {
//             id: 3,
//         } as Bot;
//
//         const date = new Date();
//         date.setDate(date.getDate() - 4);
//
//         await orders.insert({
//             bot_id: 3,
//             status: 'done',
//             tradeofferid: '2242663139',
//             created_at: date,
//         });
//
//         await orders.insert({
//             bot_id: 3,
//             status: 'error',
//             tradeofferid: '2242663139',
//         });
//
//         const page = fs.readFileSync(__dirname + '/fixtures/trade-offer-history.html');
//
//         await tradeOffersHistory.screenshots(bot, page.toString());
//
//     }).timeout(15000);
// });
