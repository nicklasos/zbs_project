
import bots from './bots';

import OpSkins from './vendors/OpSkins';
const op = OpSkins.make('csgo');

import BitSkins from './vendors/BitSkins';
import { bestPrice, maxPrice } from './decisions';
import search from './search';
const bit = BitSkins.make('pubg');

//
// import * as autobuy from './autobuy';
//
(async () => {
    // const bot = await bots.findById(3);
    //
    // const result = await bit.find('Rugged (Orange) - UMP9', {page: 1});
    //
    // result.items[0].id = '1884067822408036500';
    //
    // console.log(result.items[0]);
    //
    // const buyResult = await bit.buy([result.items[0]], bot);
    //
    // console.log(buyResult);

    const bot = await bots.findById(3);

    const response = await op.find('MAG-7 | Petroglyph (Minimal Wear)', {
        sort: 'lh',
        // page: 4,
        // max_price: 0.15,
    });

    // console.log(response);

    // const result = await op.buy([response.items[0]], bot);
    // console.log(result);

//
//     await autobuy.presents();
//


    // let items = [{m: 'Glasses (Punk) '}, {m: 'bar'}];
    //
    // items.forEach(i => i.m = pubg.changeName(i.m));
    //
    // console.log(items);

    // console.log(pubg.changeName('matched Grey Shirt'));

})();
