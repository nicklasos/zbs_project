import { VendorItem } from './types';

export function bestPrice(items: VendorItem[]): VendorItem[] {
    items = items.sort((a, b) => {
        if (a.price < b.price) {
            return -1;
        } else if (a.price > b.price) {
            return 1;
        }

        return 0;
    });

    // Add one more vendor in case if first was failed
    const itemsToReturn = [
        ...items.slice(0, 3),
        ...(items.filter(i => i.vendor === 'opskins') as any).slice(3, 5),
        // ...items.slice(15, 30),
        ...items.slice(40, 44),
        // ...items.slice(60, 70),
        ...items.slice(5, 15),
        ...items.slice(40, 45),
    ];

    const anotherVendor = items.find(i => i.vendor !== items[0].vendor);
    if (anotherVendor) {
        return itemsToReturn.concat(anotherVendor);
    }

    return itemsToReturn;
}

export function maxPrice(price: number): number {
    let maxPrice;
    if (price < 0.3) {
        maxPrice = price * 5;
    } else if (price < 0.5) {
        maxPrice = price * 2;
    } else if (price < 10) {
        maxPrice = price * 1.3;
    } else {
        maxPrice = price * 1.1;
    }

    const result = parseFloat(maxPrice.toFixed(2));

    return result;
}
