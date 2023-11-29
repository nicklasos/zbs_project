import * as sleep from 'sleep-promise';
import storehouse from './storehouse';
import bots from './bots';
import { Bot } from './types';
import BitSkins from './vendors/BitSkins';
import OpSkins from './vendors/OpSkins';

export async function stickers(): Promise<void> {
    const shortageBots = await storehouse.shortageByHash('Graffiti', 30);

    // const shortageBots = await bots.type('stickers');
    // const shortageBots = await bots.findByIds([3, 4]);

    const bitSkins = BitSkins.make();

    for (const bot of shortageBots) {

        console.log(`Shortage for bot ${bot.username}, id:${bot.id}`);

        for (let i = 1; i <= 5; i++) {
            const graffiti = await bitSkins.find('Graffiti', { page: i, max_price: 0.02 });
            if (graffiti.result === 'success') {
                await bitSkins.buy(graffiti.items.slice(0, 25), bot as Bot);
            } else {
                console.error('Error on finding graffiti', graffiti);
            }

            await sleep(3000);
        }
    }
}

export async function presents(): Promise<void> {
    const shortageBots = await storehouse.shortageByHash('Background', 20);

    const opskins = OpSkins.make('steam');

    for (const bot of shortageBots) {

        console.log(`Shortage presents for bot ${bot.username}, id:${bot.id}`);

        for (let i = 1; i <= 2; i++) {
            const result = await opskins.find('Background', {
                strictMatch: false,
                max_price: 0.04,
            });

            if (result.result === 'success') {
                await opskins.buy(result.items.slice(0, 25), bot as Bot);
            } else {
                console.error('Error on finding presents', result);
            }

            await sleep(3000);
        }
    }
}
