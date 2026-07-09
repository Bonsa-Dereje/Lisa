// models/itemManager.js
// ITEM MANAGER - single job: look at the most recent item_number already
// saved in SQL and hand back the next one in the sequence (1, 2, 3, ...).
const db = require('../config/db');

const ItemManager = {
    getNextItemNumber() {
        return new Promise((resolve, reject) => {
            db.get('SELECT MAX(item_number) as maxNumber FROM artworks', [], (err, row) => {
                if (err) return reject(err);
                const highestSoFar = (row && row.maxNumber) ? row.maxNumber : 0;
                resolve(highestSoFar + 1);
            });
        });
    }
};

module.exports = ItemManager;
