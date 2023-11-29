import SteamBot from './bot';
import bots from './bots';
import flow from './flow';
import orders from './orders';
import BitSkins, { aggregateByToken } from './vendors/BitSkins';
import OpSkins from './vendors/OpSkins';

export async function checkReadyBots(): Promise<void> {
    const date = new Date();
    date.setHours(date.getHours() - 1);

    const readyToBeReady = await bots.notReady(date);
    if (readyToBeReady.length) {
        console.log('Enabling bots', readyToBeReady.map(b => b.id));

        await bots.setReady(readyToBeReady);
    }
}

export async function restartFailedOrdersStorehouse(statuses: string[], maxTries: number): Promise<void> {
    const restart = await orders.forRestart({ statuses, maxTries, limit: 15, flow: 'stickers' });

    for (const order of restart) {

        console.log('Restart order', order);

        try {
            await orders.nextTry(order);
            await flow.process(order.id);
        } catch (e) {
            console.error('Error on restart order', e);
        }
    }
}

function timestamps(): { stickers: number, inventory: number } {
    const dateToCancelInventory = new Date();
    dateToCancelInventory.setDate(dateToCancelInventory.getDate() - 2);

    const dateToCancelStickers = new Date();
    dateToCancelStickers.setHours(dateToCancelStickers.getHours() - 2);

    const timestamp = {
        stickers: Math.floor(dateToCancelInventory.getTime() / 1000),
        inventory: Math.floor(dateToCancelInventory.getTime() / 1000)
    };

    return timestamp;
}

export async function cancelPendingOffers(): Promise<void> {
    const enabledBots = await bots.enabled();

    const timestamp = timestamps();

    for (const bot of enabledBots) {
        const steamBot = new SteamBot(bot);

        const response = await steamBot.pendingTradeOffers();

        if (response.result === 'ok' && response.hasOwnProperty('offers')) {
            const pendingTrades = response.offers.filter(trade => trade.time_created < timestamp[bot.type]);

            for (const offer of pendingTrades) {
                const cancelResponse = await steamBot.cancelTradeOffer(offer.tradeofferid);

                console.log(`Cancel trade offer, bot id: ${bot.id}`, cancelResponse);
            }

        } else {
            console.error('Bad request to steam bot', response);
        }
    }
}

export async function withdrawBitskins(randomBot: boolean = false): Promise<void> {
    const bit = BitSkins.make();

    const result = await bit.inventory();
    if (result.status !== 'success' || result.data.pending_withdrawal_from_bitskins.status !== 'success') {
        return console.error('Error on get bitskins inventory', result);
    }

    const items = aggregateByToken(result.data.pending_withdrawal_from_bitskins.items);

    if (items.size > 0) {
        console.log(`Auto withdraw ${items.size} trades`);

        for (const [, itemIds] of items) {
            const params: any = { itemIds };

            if (randomBot) {
                const bot = await bots.randomBot();
                params.token = bot.steam_token;
                params.steamId = bot.steamid;
            }

            await bit.withdraw(params);
        }
    }
}

export async function withdrawOpskins() {

    try {
        const op = OpSkins.make();

        const staleItems = await op.staleSales();

        if (staleItems.result.length) {
            console.log('OpSkins stale sales', staleItems.result);

            for (const item of staleItems.result) {
                const result = await op.resendTrade(item.item_id);

                console.log('OpSkins resend trade result', result);
            }
        }
    } catch (e) {
        console.error('Error withdraw opskins', e);
    }
}
