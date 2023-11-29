import pubg from './pubg';
import BitSkins from './vendors/BitSkins';
import OpSkins from './vendors/OpSkins';
import qualityResolver from './quality';
import { Game, ItemQuality, VendorFindResult, VendorItem } from './types';

interface SearchParams {
    maxPrice: number;
    quality: ItemQuality;
}

export default {

    game(game: Game, hash: string, params: SearchParams): Promise<VendorItem[]> {
        switch (game) {
            case 'csgo':
                return this.csgoSearch(hash, params);
            case 'dota':
                return this.opSkinsAndBitSkins(hash, params, game);
            case 'pubg':
                return this.opSkins(hash, params, game, pubg.opSort(hash));
                // return this.bitSkins(hash, params, game);
            default:
                return this.opSkins(hash, params, game);
        }
    },

    async bitSkins(hash: string, { maxPrice }: SearchParams, game: Game): Promise<VendorItem[]> {
        const bitSkins = BitSkins.make(game);

        const requests = [
            bitSkins.find(hash, { max_price: maxPrice, page: 1 }),
            // bitSkins.find(hash, { max_price: maxPrice, page: 3 }),
            // bitSkins.find(hash, { max_price: maxPrice, page: 4 }),
        ];

        const response = await Promise.all(requests);

        return filterItemsFromResponse(response);
    },

    async opSkinsAndBitSkins(hash: string, { maxPrice }: SearchParams, game: Game): Promise<VendorItem[]> {
        const opSkins = OpSkins.make(game);
        const bitSkins = BitSkins.make(game);

        const requests = [
            opSkins.find(hash, { max_price: maxPrice, page: 1 }),
            opSkins.find(hash, { max_price: maxPrice, page: 2 }),
            opSkins.find(hash, { max_price: maxPrice, page: 3 }),
            bitSkins.find(hash, { max_price: maxPrice }),
        ];

        const response = await Promise.all(requests);

        return filterItemsFromResponse(response);
    },

    async opSkins(hash: string, { maxPrice }: SearchParams, game: Game, sort: string = null): Promise<VendorItem[]> {
        const opSkins = OpSkins.make(game);

        const requests = [
            opSkins.find(hash, { max_price: maxPrice, page: 1, sort }),
            opSkins.find(hash, { max_price: maxPrice, page: 2, sort }),
            opSkins.find(hash, { max_price: maxPrice, page: 3, sort }),
            opSkins.find(hash, { max_price: maxPrice, page: 4, sort }),
            opSkins.find(hash, { max_price: maxPrice, page: 5, sort }),
        ];

        if (hash === 'School Shoes') {
            requests.push(opSkins.find(hash, { max_price: maxPrice, page: 28, sort }));
            requests.push(opSkins.find(hash, { max_price: maxPrice, page: 29, sort }));
            requests.push(opSkins.find(hash, { max_price: maxPrice, page: 30, sort }));
        }

        const response = await Promise.all(requests);

        return filterItemsFromResponse(response);
    },

    async csgoSearch(hash: string, { maxPrice, quality }: SearchParams): Promise<VendorItem[]> {
        const opSkins = OpSkins.make();
        const bitSkins = BitSkins.make();

        const hashes = qualityResolver.call(quality, hash);

        const op = hashes.map(h => opSkins.find(h, { max_price: maxPrice }));
        const bit = hashes.map(h => bitSkins.find(h, { max_price: maxPrice }));

        const response = await Promise.all([...op, ...bit]);

        return filterItemsFromResponse(response);
    },

}

function filterItemsFromResponse(response: VendorFindResult[]): VendorItem[] {
    const items = [];
    response.forEach((res: any) => {
        if (res.result === 'success') {
            items.push(...res.items);
        } else {
            console.error('Bad response on search', res);
        }
    });

    return items;
}
