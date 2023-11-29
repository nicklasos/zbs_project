import * as schedule from 'node-schedule';
import * as autobuy from './autobuy';
import * as supervisor from './supervisor';
import tradeOffersHistory from './trade-offers-history';

export default function (): void {
    schedule.scheduleJob(every({ minute: 2 }), supervisor.checkReadyBots);
    schedule.scheduleJob(every({ minute: 30 }), supervisor.cancelPendingOffers);
    // schedule.scheduleJob(every({ hour: 5 }), autobuy.stickers);
    schedule.scheduleJob(every({ hour: 5 }), autobuy.presents);
    schedule.scheduleJob(every({ minute: 40 }), async () => {
        await supervisor.withdrawBitskins(true);
    });

    schedule.scheduleJob(every({ minute: 60 }), async () => {
        await tradeOffersHistory.logBots();
    });

    restart({
        statuses: ['trade_offers_limit', 'bot', 'steam'],
        minute: 2,
        retries: 2,
    });

    restart({
        statuses: ['empty', 'no-bots'],
        minute: 5,
        retries: 2,
    });

    restart({
        statuses: ['steam-401', 'steam-403'],
        minute: 10,
        retries: 2,
    });
}

export function every(params: { second?: number, minute?: number, hour?: number }): string {
    if (params.second) {
        return `*/${params.second} * * * * *`;
    }

    if (params.minute) {
        return `*/${params.minute} * * * *`;
    }

    if (params.hour) {
        return `* */${params.hour} * * *`;
    }

    throw new Error('Params should be provided');
}

function restart(params: { statuses: string[], minute: number, retries: number }): void {
    schedule.scheduleJob(every({ minute: params.minute }), async () => {
        await supervisor.restartFailedOrdersStorehouse(params.statuses, params.retries);
    });
}
