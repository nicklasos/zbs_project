# zbs
Zearch, Buy, Send

## TODO
* Max price (buy)

### Install development server
```
npm install -g nodeman
npm install -g knex
npm install -g gulp
```

Create storage folder and symlink
ln -s /var/www/zbs/storage /var/www/zbs/current/public/storage

### Run development
Run api and admin server:
```
npm start
```
Run typescript compiler:
```
gulp
```

Run typescript and api and admin:
```
gulp start
```

### How to use migrations and database
[Read this guide about knex](http://knexjs.org/#Builder)

Create migration
```
knex migrate:make {migration_name} --env dev
```

Run migration
```
knex migrate:latest --env dev
```

Rollback
```
knex migrate:rollback --env dev
```

# Code documentation

#### BitSkins
```javascript
const vendors = require('./config/vendors');
const BitSkins = require('./app/vendors/BitSkins');
const OpSkins = require('./app/vendors/OpSkins');

const opSkins = new OpSkins(vendors.opskins.api_key);

opSkins.find('AWP | Dragon Lore');

const bitSkins = new BitSkins(vendors.bitskins);

(async() => {

  await Promise.all([
    bitSkins.find('AWP | Dragon Lore', { page: 1 }),
    bitSkins.find('AWP | Dragon Lore', { page: 2 }),
  ]);

})();

```

# Deploy
```
pm2 deploy production setup
pm2 deploy production
```

# Deploy dependencies
```
npm i -g knex
npm i -g pm2
npm i -g gulp

ln -s /root/.nvm/versions/node/v8.2.1/bin/pm2 /usr/bin/pm2
ln -s /root/.nvm/versions/node/v8.2.1/bin/gulp /usr/bin/gulp
ln -s /root/.nvm/versions/node/v8.2.1/bin/knex /usr/bin/knex
ln -s /root/.nvm/versions/node/v8.2.1/bin/node /usr/bin/node
ln -s /root/.nvm/versions/node/v8.2.1/bin/npm /usr/bin/npm
```
