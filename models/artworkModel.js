// models/artworkModel.js - data access for the artworks table
const db = require('../config/db');
const ItemManager = require('./itemManager');

const ArtworkModel = {
    // Posts a new piece of work. The item number is not supplied by the
    // caller - the item manager looks up the most recent number in SQL and
    // assigns the next one. The insert runs inside a transaction so two
    // presenters posting at the same instant can't collide on the same number.
    create({ id, userId, title, creatorName, imageData, imageMimetype }) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN IMMEDIATE TRANSACTION', async (beginErr) => {
                    if (beginErr) return reject(beginErr);

                    let itemNumber;
                    try {
                        itemNumber = await ItemManager.getNextItemNumber();
                    } catch (err) {
                        return db.run('ROLLBACK', () => reject(err));
                    }

                    const sql = `INSERT INTO artworks (id, user_id, item_number, title, creator_name, image_data, image_mimetype)
                                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
                    db.run(sql, [id, userId, itemNumber, title, creatorName, imageData, imageMimetype], function (insertErr) {
                        if (insertErr) {
                            return db.run('ROLLBACK', () => reject(insertErr));
                        }
                        db.run('COMMIT', (commitErr) => {
                            if (commitErr) return reject(commitErr);
                            resolve({ id, userId, itemNumber, title, creatorName, imageData, imageMimetype });
                        });
                    });
                });
            });
        });
    },

    findAll() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM artworks ORDER BY item_number ASC', [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM artworks WHERE id = ?', [id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    },

    findByUserId(userId) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM artworks WHERE user_id = ? ORDER BY item_number ASC', [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    deleteById(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM artworks WHERE id = ?', [id], function (err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
            });
        });
    }
};

module.exports = ArtworkModel;
