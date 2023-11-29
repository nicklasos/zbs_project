import * as Knex from 'knex';

const config = require('../config/config');

const db = config.db[process.env.NODE_ENV || 'production'];

const knex = Knex({
    client: 'mysql',
    connection: {
        supportBigNumbers: true,
        bigNumberStrings: true,
        host: db.host,
        user: db.user,
        password: db.password,
        database: db.database,
        multipleStatements: true,
    },
    pool: {
        min: 0,
        max: 100,
    },
});

export function startTransaction(): Promise<Knex.Transaction> {
    return new Promise((resolve, reject) => {
        knex.transaction(resolve).catch(reject);
    });
}

export function wheresify(name: string) {
    return {
        where: (...params) => knex(name).where(...params),
        whereIn: (field, params) => knex(name).whereIn(field, params),
        insert: params => knex(name).insert(params),
        batchInsert: (params, chunk) => knex.batchInsert(name, params, chunk),
    };
}

export default knex;
