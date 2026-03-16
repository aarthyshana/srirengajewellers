const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function migrate() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = OFF;');
    await db.exec('BEGIN TRANSACTION;');

    await db.exec(`CREATE TABLE IF NOT EXISTS products_new (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                sub_category TEXT,
                weight TEXT,
                image TEXT
            )`);

    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='products'");
    if (tableExists) {
        await db.exec(`INSERT INTO products_new (id, title, category, sub_category, weight, image)
                       SELECT CAST(id AS TEXT), title, category, sub_category, weight, image FROM products`);
        await db.exec('DROP TABLE products');
    }

    await db.exec('ALTER TABLE products_new RENAME TO products');
    await db.exec('COMMIT;');
    await db.exec('PRAGMA foreign_keys = ON;');
    console.log("Migration successful");
}

migrate().catch(console.error);
