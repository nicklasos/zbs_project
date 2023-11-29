import SteamBot from './bot';
import bots from './bots';
import {writeFile, removeFile} from './helpers';
import {Bot} from './types';
import orders from './orders';
import cheerio = require('cheerio');
import webshot = require('webshot');

export default {

    async logBots() {

        const inventory = await bots.type('inventory');

        for (const bot of inventory) {
            await this.log(new SteamBot(bot));
        }
    },

    async log(bot: SteamBot): Promise<void> {
        const page = await bot.getTradeOffersSentPage();
        if (!page) {
            return console.error('Error on get trade offers sent page');
        }

        try {
            const {year, month, date, timestamp} = getDates();

            const filePath = `./../storage/tradeoffers/${bot.getId()}/html/${year}/${month}/${date}/${timestamp}.html`;

            await writeFile(filePath, page);

            await this.screenshots(bot.getBot(), page);

            await removeFile(filePath);

        } catch (e) {
            console.error('Can\'t write file with trade offers history');
        }
    },

    async screenshots(bot: Bot, page: string) {
        const {year, month, date} = getDates();

        const ordersWithoutScreenshots = await orders.withoutScreenshots(bot);

        const $ = cheerio.load(page);
        const template = cheerio.load(page);
        const offersHTML = template('.profile_leftcol');

        for (const order of ordersWithoutScreenshots) {

            if (page.includes(order.tradeofferid)) {

                const offer = $(`#tradeofferid_${order.tradeofferid}`).toString();

                offersHTML.html(offer);

                const height = Math.ceil(offersHTML.find('.trade_item').length / 4) * 100;

                const filename = `storage/tradeoffers/${bot.id}/screenshots/${year}/${month}/${date}/${order.tradeofferid}.png`;

                try {

                    await shot(template.html(), `./../${filename}`, {height: 370 + height + 180});

                    await orders.attachScreenshot(order, filename);

                } catch (e) {
                    console.error('Error on taking screenshot', e);
                }
            }

        }

    },

};

function getDates() {
    const d = new Date();

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const timestamp = Math.floor(Date.now() / 1000);

    return {year, month, date, timestamp};
}

function shot(html: string, file: string, shotSize: { height: number }): Promise<string> {
    return new Promise((resolve, reject) => {
        webshot(html, file, {
            siteType: 'html',
            shotSize,
        }, (err) => {
            if (err) return reject(err);

            resolve('ok');
        });
    });
}
