import * as fetch from 'node-fetch';
import { totp } from 'notp';
import * as querystring from 'querystring';
import * as base32 from 'thirty-two';
import purchases from '../purchases';
import { Bot, Game, VendorApi, VendorBuyResult, VendorFindResult, VendorItem, VendorSearch } from '../types';
import config = require('../../config/vendors');
import game from '../game';

interface WithdrawParams {
    purchaseId?: number;
    steamId?: string;
    token?: string;
    itemIds: Array<number | string>;
    botId?: number;
}

interface BitSkinsParams {
    api_key: string;
    secret: string;
}

interface BitSkinsItem {
    item_id: string;
    class_id: string;
    instance_id: string;
    market_hash_name: string;
    item_type: string;
    image: string;
    inspectable: boolean;
    inspect_link: string;
    price: string;
    suggested_price: string;
    is_featured: boolean;
    stickers: null | any[];
}

interface FindParams {
    market_hash_name?: string;
    sort_by?: 'price';
    order?: 'asc';
    page?: number;
    max_price?: number;
}

export default class BitSkins implements VendorApi {
    readonly name = 'bitskins';

    private url = 'https://bitskins.com/api/v1';

    private apiMethods = {
        search: 'get_inventory_on_sale',
        buy: 'buy_item',
        balance: 'get_account_balance',
        allItems: 'get_all_item_prices',
        history: 'get_buy_history',
        sales: 'get_price_data_for_items_on_sale',
        withdraw: 'withdraw_item',
        inventory: 'get_my_inventory',
    };

    private readonly appId: number;
    private readonly context: number;

    constructor(private params: BitSkinsParams, gameName: Game = 'csgo') {
        this.appId = game.getAppIdByName(gameName);
        this.context = game.getContextByName(gameName);
    }

    async find(hash: string, requestParams: VendorSearch): Promise<VendorFindResult> {
        const params: FindParams = Object.assign(requestParams, {
            market_hash_name: hash,
            sort_by: 'price',
            order: 'asc',
            page: requestParams.page || 1,
        });

        const response = await this.request('search', params);

        if (!response.hasOwnProperty('data') || !response.data.hasOwnProperty('items')) {
            return {
                result: 'error',
                items: [],
            };
        }

        return {
            result: 'success',
            items: this.format(response.data.items),
        };
    }

    async buy(items: VendorItem[], bot: Bot): Promise<VendorBuyResult> {
        const ids = items.map(i => i.id);

        const response = await this.request('buy', {
            item_ids: ids.join(','),
            prices: items.map(i => i.price).join(','),
            auto_trade: false,
        }, { method: 'POST' });

        console.log(`Buy result bitskins, bot id ${bot.id}`, require('util').inspect(response, false, 10));

        const [purchaseId] = await purchases.add({
            bot_id: bot.id,
            provider: 'bitskins',
            items: JSON.stringify(items),
            price: items.reduce((sum, item) => sum + item.price, 0),
            buy_log: JSON.stringify(response),
        });

        if (response.status === 'fail') {
            return {
                result: 'error',
                tokens: [],
                message: response.data.error_message,
            };
        }

        const withdraw = await this.withdraw({
            purchaseId,
            steamId: bot.steamid,
            token: bot.steam_token,
            itemIds: ids,
            botId: bot.id,
        });

        const result: VendorBuyResult = {
            result: withdraw.result,
            tokens: withdraw.tokens,
        };

        if (withdraw.message) {
            result.message = withdraw.message;
        }

        return result;
    }

    async withdraw(params: WithdrawParams): Promise<VendorBuyResult> {
        const request = {
            item_ids: params.itemIds.join(','),
        };

        if (params.steamId) {
            console.log('BitSkins bot steamid withdraw:', params.steamId);
            request['to_id'] = params.steamId;
        }

        if (params.token) {
            request['to_token'] = params.token;
        }

        const response = await this.request('withdraw', request);

        if (params.purchaseId) {
            await purchases.withdraw(params.purchaseId, JSON.stringify(response));
        }

        let log = 'Withdraw result';
        if (params.botId) {
            log += ` to bot id ${params.botId}`;
        }

        console.log(log, response.status, response);

        if (response.status === 'success') {
            return {
                result: 'success',
                tokens: response.data.trade_tokens,
            };
        }

        return {
            result: 'error',
            tokens: [],
            message: response.data.error_message,
        };
    }

    async request(apiMethod: string, params, { method = 'GET', body = '' } = {}) {
        params.api_key = this.params.api_key;
        params.code = this.code();
        params.app_id = this.appId;
        params.context_id = this.context;

        const url = this.url + '/' + this.apiMethods[apiMethod] + '/?' + querystring.stringify(params);

        try {
            const response = await fetch(url, { method });
            return await response.json();
        } catch (ex) {
            return {
                status: 'fail',
                data: {
                    error_message: 'error on request',
                },
            };
        }
    }

    format(items: BitSkinsItem[]): VendorItem[] {
        return items.map((item): VendorItem => ({
            id: item.item_id,
            hash: item.market_hash_name,
            price: parseFloat(item.price),
            suggested: parseFloat(item.suggested_price),
            stickers: item.stickers ? item.stickers.length : 0,
            instance_id: item.instance_id,
            class_id: item.class_id,
            vendor: 'bitskins',
        }));
    }

    async inventory() {
        return this.request('inventory', {});
    }

    code(): string {
        return totp.gen(base32.decode(this.params.secret));
    }

    static make(gameName: Game = 'csgo'): BitSkins {
        return new BitSkins(config.bitskins, gameName);
    }
}

type AggregatedItems = Map<string, string[]>;

interface Item {
    trade_token: string;
    item_id: string;
}

export function aggregateByToken(items: Item[]): AggregatedItems {
    const result: AggregatedItems = new Map();

    items.forEach(item => {
        if (!result.has(item.trade_token)) {
            result.set(item.trade_token, []);
        }

        const itemIds = result.get(item.trade_token);
        itemIds.push(item.item_id);
        result.set(item.trade_token, itemIds);
    });

    return result;
}
