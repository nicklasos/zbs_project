import sinon = require('sinon');
const sandbox = sinon.sandbox.create();

import mock = require('mock-require');
import storehouse from '../src/storehouse';

describe('autobuy', () => {
    describe('stickers', () => {
        // afterEach(() => sandbox.restore());
        //
        // it('should buy stickers', async () => {
        //     mock('sleep-promise', () => '');
        //
        //     const storehouse = mock.reRequire('../src/storehouse').default;
        //     const bots = mock.reRequire('../src/bots');
        //
        //     sandbox.stub(storehouse, 'shortageByHash')
        //         .returns([{ items: '10', id: 1 }]);
        //
        //     const BitSkins = mock.reRequire('../src/vendors/BitSkins').default;
        //
        //     sandbox.stub(BitSkins.prototype, 'buy');
        //     sandbox.stub(BitSkins.prototype, 'find')
        //         .returns({
        //             result: 'success',
        //             items: [{ id: 18 }],
        //         });
        //
        //     sandbox.stub(bots, 'findById')
        //         .returns({ id: 12 });
        //
        //     sandbox.restore();
        //
        //     const autobuy = require('../src/autobuy');
        //
        //     await autobuy.stickers();
        //
        //     mock.stopAll();
        // });
    });
});
