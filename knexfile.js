const db = require('./config/config').db;

module.exports = {
    production: {
        client: 'mysql',
        connection: {
            host: db.production.host,
            user: db.production.user,
            password: db.production.password,
            database: db.production.database,
        },
        migrations: {
            tableName: 'migrations',
        },
    },
    dev: {
        client: 'mysql',
        connection: {
            host: db.dev.host,
            user: db.dev.user,
            password: db.dev.password,
            database: db.dev.database,
        },
        migrations: {
            tableName: 'migrations',
        },
    },
    test: {
        client: 'mysql',
        connection: {
            user: db.test.user,
            password: db.test.password,
            database: db.test.database,
        },
        migrations: {
            tableName: 'migrations',
        },
    },
};
