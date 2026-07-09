// models/userModel.js - data access for the users table
const db = require('../config/db');

const UserModel = {
    create({ id, name, email, passwordHash, role }) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (id, name, email, password_hash, role)
                         VALUES (?, ?, ?, ?, ?)`;
            db.run(sql, [id, name, email, passwordHash, role], function (err) {
                if (err) return reject(err);
                resolve({ id, name, email, role });
            });
        });
    },

    findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    },

    findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }
};

module.exports = UserModel;
