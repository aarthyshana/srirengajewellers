const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) return console.error(err.message);
    db.all("SELECT * FROM products ORDER BY id DESC LIMIT 10", [], (err, rows) => {
        console.log("LATEST PRODUCTS:", rows);
    });
});
