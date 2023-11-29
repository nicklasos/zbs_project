import '../test';

import { assert } from 'chai';

import db from '../../src/db';
import Storehouse from '../../src/vendors/Storehouse';
const storehouse = Storehouse.make();

describe('Storehouse', () => {
    it('should construct new stickers', () => {
        assert.isTrue(storehouse instanceof Storehouse);
    });

    describe('find', () => {
        it('should vendors orderItems in stickers', async () => {

            const hash = 'USP-S | Torque (Well-Worn)';

            await db('storehouse').insert({
                hash,
                status: 'available',
            });

            const [item] = await storehouse.find(hash);

            assert.equal(item.hash, hash);

        });
    });
});
