import { withdrawBitskins } from './supervisor';

withdrawBitskins(true).then(() => {
    console.log('done');
}).catch(err => {
    console.error(err);
});
