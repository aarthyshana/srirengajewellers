const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.run("DELETE FROM products WHERE id IS NULL", function(err) {
    if (err) console.error(err);
    else console.log(`Deleted ${this.changes} bad records with null ids.`);
});
