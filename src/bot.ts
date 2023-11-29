import * as fetch from 'node-fetch';
import { Bot, Storehouse } from './types';
import bots from './bots';
import { checkEdit } from 'tslint';

export interface SendItemsResponse {
    result: 'ok' | 'error';
    tradeofferid?: string;
    message?: string;
    type?: any;
}

export default class SteamBot {
    private bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    getBot(): Bot {
        return this.bot;
    }

    getId(): number {
        return this.bot.id;
    }

    async sendItems(tradeUrl: string, items: Storehouse[], text: string): Promise<SendItemsResponse> {
        try {
            const response = await fetch(this.url('sendItems'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tradeUrl,
                    text,
                    storehouseIds: items.map((item) => item.id),
                }),
            });

            return response.json();
        } catch (e) {
            console.error(e);
            // console.error(e, response.text());
            return {
                result: 'error',
            };
        }
    }

    async sendItemsWithCheck(tradeUrl: string, items: Storehouse[], text: string): Promise<SendItemsResponse> {
        try {
            const response = await fetch(this.url('sendItemsWithCheck'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tradeUrl,
                    text,
                    storehouseIds: items.map((item) => item.id),
                }),
            });

            return response.json();
        } catch (e) {
            console.error(e);
            // console.error(e, response.text());
            return {
                result: 'error',
            };
        }
    }

    async acceptOffers() {
        try {
            const response = await fetch(this.url('acceptOffers'), { method: 'POST' });
            return response.json();
        } catch (e) {
            console.error(e);
            // console.error(e, response.text());
            return {
                result: 'error',
            };
        }
    }

    async pendingTradeOffers() {

        try {
            const response = await fetch(this.url('pendingTradeOffers'));
            return response.json();
        } catch (e) {
            console.error(e);
            // console.error(e, response.text());
            return {
                result: 'error',
            };
        }
    }

    async cancelTradeOffer(tradeOfferId: string) {
        try {
            const response = await fetch(this.url('cancelTradeOffer'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tradeOfferId,
                }),
            });

            return response.json();
        } catch (e) {
            console.error(e);
            // console.error(e, response.text());
            return {
                result: 'error',
            };
        }
    }

    async sync() {
        try {
            const response = await fetch(this.url('sync'));
            return response.text();
        } catch (e) {
            console.error(e);
            return {
                result: 'error',
            };
        }
    }

    async checkTradeUrl(url: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.url('checkTradeUrl')}?tradeUrl=${encodeURIComponent(url)}`);
            const result = await response.text();
            return result === 'valid';

        } catch (e) {
            console.error('Error on check trade url', e);
            return false;
        }
    }

    async ping(): Promise<boolean> {
        try {
            const response = await fetch(this.url('ping'));
            const result = await response.text();
            return result === 'pong';

        } catch (e) {
            console.error(e);
            return false;
        }
    }

    mobileConfirmation() {
        try {
            return fetch(this.url('mobileConfirmation'), { method: 'POST' });
        } catch (e) {
            return null;
        }
    }

    async pendingTradeOffersCount(): Promise<number|null> {
        try {
            const response = await fetch(this.url('pendingTradeOffersCount'));
            const result = await response.json();

            if (result.result === 'ok') {
                return result.offers;
            }

        } catch (e) {
            console.error(e);
        }

        return null;
    }

    async getTradeOffersSentPage(): Promise<string|null> {
        try {
            const response = await fetch(this.url('getTradeOffersSentPage'));
            if (!response.ok) {
                return null;
            }

            return response.text();
        } catch (ex) {
            console.error('Error on getting trade offers from bot.', ex);

            return null;
        }
    }

    url(url: string, useBotId: boolean = true): string {
        if (useBotId) {
            return this.bot.url + '/' + this.bot.id + '/' + url;
        }

        return this.bot.url + '/' + url;
    }

    async restart() {
        try {
            const response = await fetch(`${this.url('restart', false)}`, {
                method: 'POST',
                body: '',
                headers: { 'Content-Type': 'application/json' },
            });
            return await response.text();
        } catch (e) {
            console.error('Error on restarting bot', e);
            return JSON.stringify({ result: 'error', message: e.message }, null, 2);
        }
    }

    static async restart() {
        const randomBot = await bots.randomBot();
        if (!randomBot) {
            throw new Error('No available bots');
        }

        const self = new SteamBot(randomBot);

        const response = await self.restart();

        console.log('Restart bot', response);
    }
}
