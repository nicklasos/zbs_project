export default {
    changeName(name: string): string {
        name = name.trim();
        if (items.hasOwnProperty(name)) {
            return items[name];
        }

        return name;
    },

    opSort(name: string): string {
        if (itemsSortLowHight.indexOf(name) !== -1) {
            return 'lh';
        }

        return 'f';
    },
};

const items = {
    'matched Grey Shirt': 'Matched Shirt (Gray)',
    'Coat(Gray)': 'Coat (Gray)',
    'Bloody Tank-top (White)': 'Bloody Tank Top (White)',
    'Boots (Punk)': 'Punk Boots',
    'Glasses (Punk)': 'Punk Glasses',
    'Grey Boots': 'Boots (Gray)',
    'Padded Jacket (Camo)': 'Camo Padded Jacket',
    'Padded Jacket (Urban)': 'Urban Padded Jacket',
    'Blue Hi-top Trainers': 'Hi-top Trainers (Blue)',
    'Combat Pants (Grey Camo)': 'Camo Combat Pants (Gray)',
    'Padded Jacket (GREY)': 'Padded Jacket (Gray)',
    'Long-sleeved Leather Shirt': 'Long Sleeved Leather Shirt',
    'Dirty Tank-top (White)': 'Dirty Tank Top (White)',
    'Dirty Tank-top (Grey)': 'Dirty Tank Top (Gray)',
    'checked shirt (white)': 'Checked Shirt (White)',
    'Coat(Camel)': 'Coat (Camel)',
    'Coat(Red)': 'Coat (Red)',
    'Combat Pants (camo)': 'Camo Combat Pants',
    'Woman\'s Tuxedo Jacket (Purple)': 'Female Tuxedo Jacket (Purple)',
    'Training Pants (Light Blue)': 'Tracksuit Pants (Light Blue)',
    'Vintage Baseball Hat (Black)': 'Vintage Baseball Cap (Black)',
    'Brown Hi-top Trainers': 'Hi-top Trainers (Brown)',
    'Striped Tank-top': 'Striped Tank Top',
    'T-shirt (Pink striped)': 'Striped T-shirt (Pink)',
    'Long-sleeved T-shirt (Red)': 'Long Sleeved T-shirt (Red)',
    'Padded Jacket (khaki)': 'Padded Jacket (Khaki)',
    'Sleeveless Turtleneck Top (Gray)': 'Sleeveless Turtleneck (Gray)',
    'Vintage Baseball Hat (White)': 'Vintage Baseball Cap (White)',
    'Grey Shirt': 'Shirt (Gray)',
    'Dirty Long-sleeved T-shirt': 'Dirty Long Sleeved T-shirt',
    'checked shirt (red)': 'Checked Shirt (Red)',
    'Sneakers (WHITE)': 'Sneakers (White)',
    'raglan shirt': 'Raglan Shirt',
    'Gas Mask': 'Gas Mask (Full)',
    "PU's Trenchcoat": "PLAYERUNKNOWN'S Trenchcoat",
};

const itemsSortLowHight = [
    'Camo Combat Pants',
];