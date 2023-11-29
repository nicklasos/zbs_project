import { assert } from 'chai';
import BitSkins from '../../src/vendors/BitSkins';
import { makeVendorByName } from '../../src/vendors/factory';
import OpSkins from '../../src/vendors/OpSkins';

describe('Vendor factory', () => {
    it('should return properly vendor class based on vendor name', () => {
        const bitskins = makeVendorByName('bitskins');

        assert.isTrue(bitskins instanceof BitSkins);

        const opskins = makeVendorByName('opskins');

        assert.isTrue(opskins instanceof OpSkins);
    });
});
