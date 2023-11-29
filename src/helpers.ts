import mkdirp = require('mkdirp');
import fs = require('fs');
import { dirname } from 'path';

export function writeFile(path, contents) {
    return new Promise((resolve, reject) => {
        mkdirp(dirname(path), function (err) {
            if (err) return reject(err);

            fs.writeFile(path, contents, (err) => {
                if (err) return reject(err);

                resolve();
            });
        });
    });
}

export function removeFile(path) {
    fs.unlinkSync(path);
}
