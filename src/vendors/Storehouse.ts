import storehouse from '../storehouse';

export default class Storehouse {
    async find(hash) {
        const items = await storehouse.find(hash);

        return this.format(items);
    }

    format(items) {
        return items.map(item => ({
            id: item.id,
            hash: item.hash,
            instance_id: item.instanceid,
            class_id: item.classid,
            vendor: 'Storehouse',
        }));
    }

    static make() {
        return new Storehouse();
    }
}
