import db from './db';
import { Order } from './types';

type OrderLogStatus = 'ok' | 'error' | 'notice' | 'info';

export class OrderLog {
    constructor(private order: Order) {
    }

    ok(message: string) {
        return this.add('ok', message);
    }

    info(message: string) {
        return this.add('info', message);
    }

    error(message: string) {
        return this.add('error', message);
    }

    notice(message: string) {
        return this.add('notice', message);
    }

    add(status: OrderLogStatus, message: string) {
        console.log(`Order: ${this.order.id}, ${status}. ${message}`);

        return db('order_logs').insert({
            order_id: this.order.id,
            status,
            message,
        });
    }
}

function log(type: OrderLogStatus, what: string) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = function (...args) {
            this.log[type](what);

            return original.apply(this, args);
        };

        return descriptor;
    };
}

export function info(what: string) {
    return log('info', what);
}

export function ok(what: string) {
    return log('ok', what);
}

export function error(what: string) {
    return log('error', what);
}
