process.env.NODE_ENV = 'test';

import db from '../src/db';
const config = require('../config/config');

beforeEach(async () => {
    const tables = await db.raw('SHOW TABLES');

    tables[0].forEach(async (table) => {
        const tableName = table[`Tables_in_${config.db.test.database}`];

        if (tableName !== 'migrations') {
            await db(tableName).truncate();
        }
    });
});
