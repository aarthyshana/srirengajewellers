const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.all("SELECT id, typeof(id) as id_type FROM products ORDER BY ROWID DESC LIMIT 3", [], (err, rows) => {
    console.log(rows);
});
