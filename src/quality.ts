import { ItemQuality } from './types';

const qualities = [
    'Battle-Scarred',
    'Well-Worn',
    'Field-Tested',
    'Minimal Wear',
    'Factory New',
];

export default {

    call(qualityName: ItemQuality, hash: string|any): string[] {
        return this[qualityName](hash);
    },

    cheap(hash: string): string[] {
        try {
            const { name } = parse(hash);

            return qualities.map(q => `${name} (${q})`);
        } catch (e) {
            return [hash];
        }
    },

    good(hash: string): string[] {
        try {
            const { name, quality } = parse(hash);

            const result = qualities
                .slice(qualities.indexOf(quality))
                .map(q => `${name} (${q})`);

            return result;
        } catch (e) {
            return [hash];
        }
    },

    normal(hash: string): string[] {
        try {
            const { name, quality } = parse(hash);

            const index = qualities.indexOf(quality);

            const result = qualities
                .slice(index > 0 ? index - 1 : index)
                .map(q => `${name} (${q})`);

            return result;
        } catch (e) {
            return [hash];
        }
    },

    same(hash: string): string[] {
        return [hash];
    },

};

function parse(hash: string): { name: string, quality: string } {
    const quality = hash.match(/\(([a-zA-Z- ]*)\)$/)[1];
    const name = hash.match(/(.*) \(/)[1];

    return {
        name,
        quality,
    };
}
