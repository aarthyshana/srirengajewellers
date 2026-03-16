const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS test_null (id TEXT)");
    db.run("INSERT INTO test_null (id) VALUES (?)", ['null']);
    db.all("SELECT id, typeof(id) as id_type FROM test_null", (err, rows) => {
        console.log("TEST NULL:", rows);
    });
});
