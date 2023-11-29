import { assert } from 'chai';
import vendorsConfig from '../config/clients';

vendorsConfig['vendor_name'] = {
    api_key: 'test_api_key',
};

import clients from '../src/clients';

describe('clients', () => {
    describe('find by api key', () => {
        it('should return null if vendor not found', () => {

            const vendorName = clients.findByApiKey('non exists');
            assert.isNull(vendorName);

        });

        it('should return vendor name', () => {

            const vendorName = clients.findByApiKey('test_api_key');
            assert.equal(vendorName, 'vendor_name');

        });
    });

    describe('find by name', () => {
        it('should find client params by name', async () => {
            const vendor = clients.findByName('vendor_name');
            assert.equal(vendor.api_key, 'test_api_key');
        });
    });
});
