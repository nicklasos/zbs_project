exports.up = function (knex) {
  return knex.schema.createTable('bots', (table) => {
    table.increments();
    table.string('steamid');
    table.string('username');
    table.string('password');
    table.string('shared_secret');
    table.string('identity_secret');
    table.string('steam_token');
    table.string('type').default('inventory');
    table.string('url').default('http://localhost:3000');
    table.bool('active').default(false);
    table.bool('enabled').default(false);
    table.timestamp('created_at').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('bots');
};
