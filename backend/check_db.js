const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) return console.error(err.message);
    db.all("PRAGMA table_info(products);", [], (err, rows) => {
        console.log("SCHEMA:", rows);
        db.all("SELECT * FROM products ORDER BY id DESC LIMIT 5", [], (err, rows) => {
            console.log("LATEST PRODUCTS:", rows);
        });
    });
});
