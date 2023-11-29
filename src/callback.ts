import { Order, OrderItem, Vendors } from './types';
import clients from './clients';
import orderItems from './items';
import * as fetch from 'node-fetch';
import { OrderLog } from './order-log';

interface CallbackRequest {
    type: 'complete' | 'partial-complete' | 'error';
    order_id: number;
    message?: string;
    items?: CallbackItems[];
}

export interface CallbackItems {
    payload: string;
    hash: string;
    status: string;
    price: number;
    vendor: null|Vendors;
}

interface CallbackComplete extends CallbackRequest {
    items: CallbackItems[];
}

export class Callback {
    private client;
    private log: OrderLog;

    constructor(private order: Order) {
        this.client = clients.findByName(order.client_id);
        this.log = new OrderLog(order);
    }

    async complete() {
        await this.log.info(`Start 'complete' callback`);

        const items: OrderItem[] = await orderItems.findByOrderId(this.order.id);

        const itemsSent: CallbackItems[] = formatForCallback(items, i => i.status === 'sent');
        const itemsNotSent: CallbackItems[] = formatForCallback(items, i => i.status !== 'sent');

        const params: CallbackComplete = {
            type: itemsNotSent.length ? 'partial-complete' : 'complete',
            order_id: this.order.id,
            items: itemsSent.concat(itemsNotSent),
        };

        await this.request(params);
    }

    async error(message: string) {
        await this.log.error(`Start 'error' callback. Message: ${message}`);

        const items = await orderItems.findByOrderId(this.order.id);

        const params: CallbackRequest = {
            order_id: this.order.id,
            type: 'error',
            message,
            items: formatForCallback(items, i => i.status !== 'sent'),
        };

        await this.request(params);
    }

    async request(params: CallbackRequest) {
        await this.log.info('Callback params: ' + JSON.stringify(params, null, 2));

        try {
            const response = await fetch(this.client.callback_url, {
                method: 'POST',
                body: JSON.stringify(params),
                headers: { 'Content-Type': 'application/json' },
            });

            const body = await response.text();

            await this.log.ok(`Response from callback complete: ${body}`);
        } catch (ex) {
            await this.log.error(`Response error from callback complete: ${ex.message}`);
            console.error(ex);
        }
    }
}

function formatForCallback(items: OrderItem[], filter: (i: OrderItem) => boolean): CallbackItems[] {
    return items.filter(filter).map(i => ({
        status: i.status,
        hash: i.hash,
        payload: i.payload,
        price: i.price,
        vendor: i.vendor,
    }));
}

