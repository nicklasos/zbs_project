const dotenv = require('dotenv');
dotenv.config({path: './.env'});

module.exports = {
    'db': {
        'production': {
            'host': process.env.DB_HOST,
            'user': process.env.DB_USERNAME,
            'password': process.env.DB_PASSWORD,
            'database': process.env.DB_DATABASE,
            'driver': 'mysql',
            'multipleStatements': true
        },
        'dev': {
            'host': process.env.DB_HOST,
            'user': process.env.DB_USERNAME,
            'password': process.env.DB_PASSWORD,
            'database': process.env.DB_DATABASE,
            'driver': 'mysql',
            'multipleStatements': true
        },
        'test': {
            'host': 'localhost',
            'user': 'root',
            'password': '7415963',
            'database': 'zbs_test',
            'driver': 'mysql',
            'multipleStatements': true
        }
    }
}
