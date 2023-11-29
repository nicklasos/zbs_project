import { assert } from 'chai';

import * as decisions from '../src/decisions';
import availableItems from './fixtures/available_items';

describe('decision maker', () => {
    it('should works', async () => {

        const items = await decisions.bestPrice(availableItems as any);

        assert.equal(items.length, 4);
        assert.equal(items[0].price, 0.01);

        assert.equal(items[0].vendor, 'bitskins');
        assert.equal(items[3].vendor, 'opskins');
        assert.equal(items[3].price, 0.02);

    });
});
