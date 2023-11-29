import {Application, Request, Response} from 'express';
import Handlebars from 'handlebars';
import * as basicAuth from 'express-basic-auth';
import OrdersInfo from './orders';
import * as paginate from 'handlebars-paginate';
import * as dateFormat from 'handlebars-dateformat';
import * as equal from 'handlebars-helper-equal';
import Bot from '../bot';
import bots from '../bots';
import PurchasesInfo from './purchases';

const orders = new OrdersInfo();
const purchases = new PurchasesInfo();
const clients = [
    {
        name: 'killcase',
        api_key: 'foo',
    },
];

const auth = basicAuth({
    users: {'admin': 'admin123@%'},
    challenge: true,
});

Handlebars.registerHelper('paginate', paginate);
Handlebars.registerHelper('dateFormat', dateFormat);
Handlebars.registerHelper('equal', equal);

export default function (app: Application) {

    app.get('/bot/:id/mobileConfirmation', (req, res) => {
        bots.findById(req.params.id).then((bot) => {
            if (bot) {
                const steamBot = new Bot(bot);

                steamBot.mobileConfirmation().then((response) => {

                    response.text().then((body) => {
                        console.log('Body from mobile confirmation', body);
                    });

                    res.send({
                        result: 'ok',
                    });
                }).catch((err) => {
                    console.error(err);

                    res.send({
                        result: 'error',
                        message: err.message,
                    });
                })

            } else {
                res.send({
                    result: 'error',
                    message: 'bot not found',
                })
            }

        }).catch((err) => {
            console.error(err);

            res.send({
                result: 'error',
                message: err.message,
            });
        });
    });

    app.get('/', (req: Request, res: Response) => {
        res.send('ok');
    });

    app.post('/bots/restart', (req: Request, res: Response) => {
        res.json({
            result: 'ok',
        });

        Bot.restart().then(() => {
            console.log('Restart bots');
        }).catch((e) => {
            console.error('Got error on restart bots', e);
        });
    });

    app.get('/admin', auth, (req: Request, res: Response) => {
        res.render('main');
    });

    app.get('/clients', auth, (req: Request, res: Response) => {
        res.render('clients', {
            clients,
        });
    });

    app.get('/clients/:client', auth, async (req: Request, res: Response) => {
        let page;
        if (req.query.page !== undefined) {
            page = req.query.page;
        } else {
            page = 1;
        }

        const orderStatuses = await orders.getStatusList();
        let numberOfPages;
        let allOrders;

        if (req.query.search !== undefined) {
            const searchValue = req.query.search;
            allOrders = await orders.getOrdersWhereStatus(searchValue, page);
            numberOfPages = Math.ceil(allOrders[0][0].a / 200);
        } else {
            allOrders = await orders.getOrdersInfo(page);
            numberOfPages = Math.ceil(allOrders[0][0].a / 200);
        }

        res.render('orders', {
            pagination: {
                page,
                pageCount: numberOfPages,
            },
            orders: allOrders[1],
            client: req.params.client,
            statuses: orderStatuses,
        });
    });

    app.get('/clients/:client/orders/:order_id', auth, async (req: Request, res: Response) => {
        res.render('order_items', {
            orderItems: await orders.getOrderItems(req.params.order_id),
            client: req.params.client,
        });
    });

    app.get('/clients/orders/:order_id/table', async (req: Request, res: Response) => {
        const orderId = req.params.order_id;

        const order = await orders.findOrder(orderId);

        res.render('order_table', {
            orderItems: await orders.getOrderItems(orderId),
            order,
        });
    });

    app.get('/clients/orders/:order_id/logs', async (req: Request, res: Response) => {
        cross(res);

        res.render('order_logs_table', {
            allOrderLogs: await orders.getOrderLogs(req.params.order_id),
        });
    });

    app.get('/orders_info/:order_id', async (req: Request, res: Response) => {
        const orderId = req.params.order_id;
        const orderItems = await orders.getOrderItems(orderId);
        let statuses = [];
        for (let order of orderItems) {
            statuses.push(order.status);
        }

        const finalInfoArray = {
            order_id: orderId,
            count: orderItems.length,
            stat: statuses,
        };

        cross(res);

        res.json(finalInfoArray);
    });

    app.get('/stats/money', auth, async (req: Request, res: Response) => {
        cross(res);
        res.render('stats/full_stats', {
            site: 'total',
            data: await purchases.getAllPurchasesByDate(),
        });
    });

    app.get('/stats/money/:site', auth, async (req: Request, res: Response) => {
        cross(res);
        res.render('stats/site_stats', {
            site: req.params.site,
            data: await purchases.getDataForSite(req.params.site),
        });
    });

    app.post('/analytics/:site', auth, async (req: Request, res: Response) => {
        cross(res);
        let message;
        try {
            message = await purchases.siteBoughtItemsInPeriod(req.params.site,
                req.body.start,
                req.body.end,
                req.body.items);
        } catch (e) {
            console.log('Error', e.message);
            message = {data: 'error'};
        }
        res.json(message);
    });
}

function cross(res: Response) {
    res.header('Access-Control-Allow-Origin', '*');
}
