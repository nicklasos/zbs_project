import { wheresify } from './db';
import { VendorItem } from './types';

const { insert } = wheresify('storehouse_bills');

export default {

    checkout(steamid: string, token: string, buyItem: VendorItem): Promise<number> {
        return insert({
            bot_steamid: steamid,
            token,
            vendor: buyItem.vendor,
            price: buyItem.price,
            hash: buyItem.hash,
        });
    },

}
