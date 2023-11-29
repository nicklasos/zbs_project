import { assert } from 'chai';
import * as sinon from 'sinon';
import search from '../src/search';
import BitSkins from '../src/vendors/BitSkins';
import OpSkins from '../src/vendors/OpSkins';

const sandbox = sinon.sandbox.create();

describe('search', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('should search orderItems', async () => {
        sandbox.stub(BitSkins.prototype, 'find').returns({
            result: 'success',
            items: [{
                id: '1',
                hash: 'Tec-9 | Army Mesh (Battle-Scarred)',
                price: 0.03,
                suggested: 0.04,
                stickers: null,
                instance_id: '123',
                class_id: '34',
                vendor: 'bitskins',
            }],
        });

        sandbox.stub(OpSkins.prototype, 'find').returns({
            result: 'success',
            items: [{
                id: '2',
                hash: 'Tec-9 | Army Mesh (Field-Tested)',
                price: 0.03,
                suggested: 0.04,
                stickers: null,
                instance_id: '123',
                class_id: '34',
                vendor: 'opskins',
            }],
        });

        const result = await search.csgoSearch('Tec-9 | Army Mesh (Field-Tested)', { maxPrice: 10, quality: 'good' });

        assert.equal('Tec-9 | Army Mesh (Field-Tested)', result[0].hash);
        assert.equal('2', result[0].id);

    });
});
