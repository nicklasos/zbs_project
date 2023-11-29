import { assert } from 'chai';
import { every } from '../src/schedule';

describe('schedule', () => {
    describe('every', () => {
        it('should return cron every seconds', () => {

            const cron: string = every({ second: 4 });
            assert.equal(cron, '*/4 * * * * *');

        });

        it('should return cron every minute', () => {

            const cron: string = every({ minute: 5 });
            assert.equal(cron, '*/5 * * * *');

        });
    });
});
