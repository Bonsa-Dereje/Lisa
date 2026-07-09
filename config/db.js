// config/db.js - SQLite connection
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'lisa.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'schema.sql');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Failed to connect to SQLite:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database at', DB_PATH);
});

// Run the DDL script so the tables exist on first run
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema, (err) => {
    if (err) console.error('Failed to apply schema:', err.message);
});

module.exports = db;
