import { wheresify } from './db';
import { Purchase } from './types';

const { where, insert } = wheresify('purchases');

export default {

    async add(purchase: Purchase): Promise<number[]> {
        return insert(purchase);
    },

    async withdraw(purchaseId, log): Promise<number> {
        return where({ id: purchaseId }).update({
            withdrawn: true,
            withdraw_log: log,
        });
    },

}
