import './test';

import { OrderLog } from '../src/order-log';
import db from '../src/db';
import { assert } from 'chai';
import * as sinon from 'sinon';

const sandbox = sinon.sandbox.create();

describe('freshOrder info', () => {
    afterEach(() => sandbox.restore());

    it('should save info', async () => {
        sandbox.stub(console, 'log');

        let logDb = await db('order_logs').where({ status: 'ok', message: 'some thing' }).first();

        assert.isUndefined(logDb);

        const log = new OrderLog({ id: 666 } as any);

        await log.add('ok', 'some thing');

        logDb = await db('order_logs').where({ status: 'ok', message: 'some thing' }).first();

        assert.equal(logDb.order_id, 666);
    });
});
