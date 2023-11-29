import { Game } from './types';

export default {

    getAppIdByName(name: Game): number {
        switch (name) {
            case 'csgo':
                return 730;
            case 'dota':
                return 570;
            case 'h1z1':
                return 433850;
            case 'pubg':
                return 578080;
            case 'steam':
                return 753;
            default:
                throw new Error(`Undefined game: ${name}`);
        }
    },

    getContextByName(name: Game): number {
        switch (name) {
            case 'csgo':
            case 'dota':
            case 'pubg':
                return 2;
            case 'h1z1':
                return 1;
            case 'steam':
                return 6;
            default:
                throw new Error(`Undefined game: ${name}`);
        }
    },

    h1z1Hashes(hash: string): string[] {
        hash = hash.replace(/^Skin: /, '');

        return [hash, `Skin: ${hash}`];
    },

}
