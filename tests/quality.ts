import './test';

import quality from '../src/quality';
import { assert } from'chai';

describe('quality', () => {
    it('should return "cheap" hashes', () => {

        const result = quality.cheap('Foo (Field-Tested)');

        assert.sameMembers(result, [
            'Foo (Battle-Scarred)',
            'Foo (Well-Worn)',
            'Foo (Field-Tested)',
            'Foo (Minimal Wear)',
            'Foo (Factory New)',
        ]);
    });

    it('should return "good" hashes', () => {

        const result = quality.good('Foo (Field-Tested)');

        assert.sameMembers(result, [
            'Foo (Field-Tested)',
            'Foo (Minimal Wear)',
            'Foo (Factory New)',
        ]);


        const oneResult = quality.good('Tec-9 | Red Quartz (Factory New)');

        assert.sameMembers(oneResult, ['Tec-9 | Red Quartz (Factory New)']);

    });

    it('should return "normal" hashes', () => {
        const result = quality.normal('Tec-9 | Red Quartz (Field-Tested)');

        assert.sameMembers(result, [
            'Tec-9 | Red Quartz (Well-Worn)',
            'Tec-9 | Red Quartz (Field-Tested)',
            'Tec-9 | Red Quartz (Minimal Wear)',
            'Tec-9 | Red Quartz (Factory New)',
        ]);


        const lowest = quality.normal('Tec-9 | Red Quartz (Battle-Scarred)');

        assert.sameMembers(lowest, [
            'Tec-9 | Red Quartz (Battle-Scarred)',
            'Tec-9 | Red Quartz (Well-Worn)',
            'Tec-9 | Red Quartz (Field-Tested)',
            'Tec-9 | Red Quartz (Minimal Wear)',
            'Tec-9 | Red Quartz (Factory New)',
        ]);

    });

    it('should works with stickers', () => {
        const normal = quality.normal('Sticker | Team EnVyUs | Cluj-Napoca 2015');

        assert.sameMembers(normal, ['Sticker | Team EnVyUs | Cluj-Napoca 2015']);
    });

    it('should resolve quality method', () => {
        const result = quality.call('good', 'Foo (Field-Tested)');

        assert.sameMembers(result, [
            'Foo (Field-Tested)',
            'Foo (Minimal Wear)',
            'Foo (Factory New)',
        ]);
    });

    it('should works with double braces', () => {
        const result = quality.call('good', 'M4A4 | 龍王 (Dragon King) (Field-Tested)');

        assert.sameMembers(result, [
            'M4A4 | 龍王 (Dragon King) (Field-Tested)',
            'M4A4 | 龍王 (Dragon King) (Minimal Wear)',
            'M4A4 | 龍王 (Dragon King) (Factory New)',
        ]);
    });
});
