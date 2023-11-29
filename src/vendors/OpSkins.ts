import fetch from 'node-fetch';
import * as querystring from 'querystring';
import purchases from '../purchases';
import { Bot, Game, VendorApi, VendorBuyResult, VendorFindResult, VendorItem, VendorSearch } from '../types';
import game from '../game';
import config = require('../../config/vendors');
import pubg from '../pubg';

const FormData = require('form-data');

interface OpSkinsItem {
    id: string;
    amount: number;
    color: string;
    classid: string;
    instanceid: string;
    market_name: string;
    sale_status: string;
    type: string;
    item_id: string;
    stickers: null | string;
    is_your_item: boolean;
    flags: {
        trade_locked: boolean;
    };
}

interface FindResult {
    status: number;
    response: {
        sales: OpSkinsItem[],
    };
}

interface BuyParams {
    saleids: string;
    total: number;
    delivery_id64: string;
    delivery_token: string;
    delivery_message: string;
}

interface BuyResult {
    status: number;
    message: string;
    balance: number;
    response: {
        items: any;
    };
}

interface FindParams {
    page?: number;
    search_item?: string;
    sort?: string;
    max?: number;
    min?: number;
}

interface StaleItem {
    item_id: string;
    amount: number;
    market_name: string;
    timestamp: number;
    reason: string;
}

interface ResendParams {
    item_id: string;
}

export default class OpSkins implements VendorApi {
    readonly name = 'opskins';

    private url = 'https://api.opskins.com';

    private apiMethods = {
        search: 'ISales/Search/v2',
        buy: 'BuyItem',
        staleSales: 'GetStaleSales',
        resendTrade: 'ResendTrade',
        getSales: 'GetSales',
    };

    private readonly appId: number;
    private readonly context: number;

    constructor(private apiKey: string, gameName: Game = 'csgo') {
        this.appId = game.getAppIdByName(gameName);
        this.context = game.getContextByName(gameName);
    }

    async find(hash: string, requestParams: VendorSearch = {}): Promise<VendorFindResult> {
        const params: FindParams = {
            search_item: hash,
            sort: requestParams.sort || 'lh',
            page: requestParams.page || 1,
        };

        if (requestParams.max_price) {
            params.max = requestParams.max_price;
        }

        const response: FindResult = await this.request('search', params);

        if (!response.hasOwnProperty('status') || response.status !== 1) {
            return {
                result: 'error',
                items: [],
                params: {
                    response,
                },
            };
        }

        if (typeof response.response.sales.filter !== 'function') {
            console.error('OpSkins filter is not a function', response);

            return {
                result: 'error',
                items: [],
                params: {
                    response,
                },
            }
        }

        const strictMatch = requestParams.hasOwnProperty('strictMatch') ? requestParams.strictMatch : true;

        let filtered = response.response.sales;
        filtered.forEach(i => i.market_name = pubg.changeName(i.market_name));

        if (strictMatch) {
            filtered = filtered.filter(item => item.market_name.trim() === hash);
        }

        if (this.appId === game.getAppIdByName('csgo')) {
            filtered = filtered.filter(item => item.flags.trade_locked === false);
        }

        return {
            result: 'success',
            items: this.format(filtered),
        };
    }

    async buy(items: VendorItem[], bot: Bot): Promise<VendorBuyResult> {
        const price = items.reduce((sum, item) => sum + item.price, 0);

        const form = new FormData();

        form.append('key', this.apiKey);
        form.append('items', items.join(','));
        form.append('saleids', items.map(item => item.id).join(','));
        form.append('total', Math.round(price * 100));
        form.append('delivery_id64', bot.steamid);
        form.append('delivery_token', bot.steam_token);
        form.append('delivery_message', '10');

        const url = this.url  + '/ISales/BuyItems/v1/';

        const result = await fetch(url, { method: 'POST', body: form });
        const response: BuyResult = await result.json();

        if (!response.hasOwnProperty('status') || response.status !== 1) {
            return {
                result: 'error',
                tokens: [],
                message: response.hasOwnProperty('message') ? response.message : JSON.stringify(response),
            };
        }

        try {
            console.log(`Buy result opskins, bot id ${bot.id}`, require('util').inspect(response, false, 10));

            await purchases.add({
                bot_id: bot.id,
                provider: 'opskins',
                items: JSON.stringify(items),
                price,
                buy_log: JSON.stringify(response),
                withdrawn: true,
            });
        } catch (ex) {
            console.error('Error on adding purchases to DB');
        }

        const formWithdraw = new FormData();

        const tokens = response.response.items.map(i => i.new_itemid);

        formWithdraw.append('key', this.apiKey);
        formWithdraw.append('items', tokens.join(','));
        formWithdraw.append('delivery_id64', bot.steamid);
        formWithdraw.append('delivery_token', bot.steam_token);
        formWithdraw.append('delivery_message', '10');

        const urlWithdraw = this.url  + '/IInventory/Withdraw/v1/';

        try {
            const resultWithdraw = await fetch(urlWithdraw, { method: 'POST', body: formWithdraw });

            // const text = await resultWithdraw.text();
            // console.log(text);

            const responseWithdraw = await resultWithdraw.json();

            if (!responseWithdraw.hasOwnProperty('status') || responseWithdraw.status !== 1) {
                return {
                    result: 'error-withdraw',
                    tokens: [],
                    message: responseWithdraw.hasOwnProperty('message') ? responseWithdraw.message : JSON.stringify(responseWithdraw),
                };
            }
        } catch (e) {
            console.error(e);
            return {
                result: 'error-withdraw',
                tokens: [],
                message: e.message,
            };
        }

        return {
            result: 'success',
            tokens,
        };
    }

    async getSales(): Promise<any> {
        const query = {
            key: this.apiKey,
            type: 2,
            appid: 570,
            per_page: 20000,
        };

        const url = this.url  + '/ISales/GetSales/v1/?' + querystring.stringify(query);

        try {
            const response = await fetch(url);
            return await response.json();
        } catch (ex) {
            return null;
        }
    }

    async returnItems(items: number[]): Promise<any> {
        const form = new FormData();

        form.append('key', this.apiKey);
        form.append('items', items.join(','));

        const url = this.url  + '/ISales/ReturnItems/v1/';

        try {
            const response = await fetch(url, { method: 'POST', body: form });
            return await response.json();
        } catch (ex) {
            return null;
        }

    }

    async staleSales(): Promise<{ result: StaleItem[] }> {
        return this.request('staleSales', {});
    }

    async resendTrade(itemId: string): Promise<string> {
        return this.request('resendTrade', {
            item_id: itemId,
        });
    }

    async request(apiMethod: string, requestParams: FindParams | BuyParams | ResendParams): Promise<any> {
        const params = Object.assign(requestParams, {
            key: this.apiKey,
            app: `${this.appId}_${this.context}`,
        });

        const url = this.url  + '/' + this.apiMethods[apiMethod] + '?' + querystring.stringify(params);

        try {
            const response = await fetch(url);
            return response.json();
        } catch (ex) {
            return {
                error: true,
                result: {
                    error: 'Error on converting to json',
                },
            };
        }
    }

    format(items: OpSkinsItem[]): VendorItem[] {
        return items.map((item): VendorItem => ({
            id: item.id,
            hash: item.market_name,
            price: item.amount / 100,
            suggested: 0,
            stickers: item.stickers.length ? item.stickers.length : 0,
            instance_id: item.instanceid,
            class_id: item.classid,
            vendor: 'opskins',
        }));
    }

    static make(gameName: Game = 'csgo'): OpSkins {
        return new OpSkins(config.opskins.api_key, gameName);
    }
}
