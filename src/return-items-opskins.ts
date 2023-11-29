import OpSkins from './vendors/OpSkins';

const op = OpSkins.make();

(async () => {

    const sales = await op.getSales();

    const mantle = sales.response.filter(i => i.name == 'Mantle of Divine Ascension');

    // console.log(mantle.map(i => ({ id: i.id, name: i.name})));

    const response = await op.returnItems(mantle.map(i => i.id));

    console.log(response);
})();
