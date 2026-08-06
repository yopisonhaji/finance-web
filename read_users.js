const Database = require('better-sqlite3');
const db = new Database('sqlite.db');
const users = db.prepare('SELECT * FROM users').all();
console.log(users);
