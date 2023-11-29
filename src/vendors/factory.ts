import { Game, VendorApi, Vendors } from '../types';
import BitSkins from './BitSkins';
import OpSkins from './OpSkins';

export function makeVendorByName(name: Vendors, gameName: Game = 'csgo'): VendorApi {
    switch (name) {
        case 'bitskins':
            return BitSkins.make(gameName);

        case 'opskins':
            return OpSkins.make(gameName);

        default:
            throw new Error(`Undefined vendor ${name}`);
    }
}
