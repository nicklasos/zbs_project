import SwaggerExpress = require('swagger-express-mw');
import express = require('express');
import bodyParser = require('body-parser');
import * as handlebar from 'express-handlebars';
import admin from './src/admin/routes';
import schedule from './src/schedule';

console.log('Start application');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.engine('handlebars', handlebar({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

if (process.env.NODE_ENV !== 'dev') {
    schedule();
}

admin(app);

const config = {
    appRoot: __dirname + '/src',
};

SwaggerExpress.create(config, (err, swaggerExpress) => {
    if (err) {
        throw err;
    }

    swaggerExpress.register(app);

    let ip = 'localhost';

    app.listen(3002, ip);
});
