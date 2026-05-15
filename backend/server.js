require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = process.env.port || 3000;
const usePostgres = Boolean(process.env.DATABASE_URL);
let pool = null;
let sqliteDb = null;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static(path.join(__dirname, '..')));

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

async function initDb() {
    if (usePostgres) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });

        try {
            await pool.connect();
            console.log('Connected to PostgreSQL database');
        } catch (err) {
            console.error('Error connecting to PostgreSQL', err.stack);
            throw err;
        }
    } else {
        const sqlitePath = path.join(__dirname, '..', 'database.sqlite');
        sqliteDb = await open({
            filename: sqlitePath,
            driver: sqlite3.Database
        });

        await sqliteDb.run(`CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            product_ids TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        await sqliteDb.run(`CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            sub_category TEXT,
            weight TEXT,
            price TEXT,
            image TEXT
        )`);

        await sqliteDb.run(`CREATE TABLE IF NOT EXISTS market_price (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            gold_rate REAL NOT NULL,
            silver_rate REAL NOT NULL
        )`);

        console.log('Connected to SQLite database at', sqlitePath);
    }
}

initDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Database initialization failed:', err);
        process.exit(1);
    });

async function runDb(sql, params = []) {
    if (usePostgres) {
        return await pool.query(sql, params);
    }
    return await sqliteDb.run(sql, params);
}

async function allDb(sql, params = []) {
    if (usePostgres) {
        return await pool.query(sql, params);
    }
    const rows = await sqliteDb.all(sql, params);
    return { rows };
}

async function getDb(sql, params = []) {
    if (usePostgres) {
        const result = await pool.query(sql, params);
        return result.rows[0];
    }
    return await sqliteDb.get(sql, params);
}

// Basic Test Route
app.get('/api', (req, res) => {
    res.json({ message: "Welcome to the SriRenga Jewelers API!" });
});

// Enquiry Route
app.post('/api/enquiry', async (req, res) => {
    const { name, phone, email, product_ids } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone are required." });
    }

    //const sql = `INSERT INTO enquiries (name, phone, email, product_ids) VALUES (?, ?, ?, ?)`;
    // Store product_ids as a JSON string if provided, else null
    const productIdsStr = product_ids && Array.isArray(product_ids) ? JSON.stringify(product_ids) : null;

    /*db.run(sql, [name, phone, email || null, productIdsStr], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Failed to submit enquiry." });
        }
        res.json({
            message: "Enquiry submitted successfully",
            enquiryId: this.lastID
        });
    });*/

    try {
        if (usePostgres) {
            const result = await runDb(
                `INSERT INTO enquiries (name, phone, email, product_ids) VALUES ($1, $2, $3, $4) RETURNING id`,
                [name, phone, email || null, productIdsStr]
            );
            res.json({
                message: "Enquiry submitted successfully",
                enquiryId: result.rows[0].id
            });
        } else {
            const result = await runDb(
                `INSERT INTO enquiries (name, phone, email, product_ids) VALUES (?, ?, ?, ?)`,
                [name, phone, email || null, productIdsStr]
            );
            res.json({
                message: "Enquiry submitted successfully",
                enquiryId: result.lastID
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to submit enquiry." });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const result = await allDb(`SELECT * FROM products`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to retrieve products." });
    }
});

// Delete a specific product by ID
app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
    }

    try {
        if (usePostgres) {
            const result = await runDb(
                `DELETE FROM products WHERE id = $1`,
                [productId]
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Product not found." });
            }
        } else {
            const result = await runDb(
                `DELETE FROM products WHERE id = ?`,
                [productId]
            );
            if (result.changes === 0) {
                return res.status(404).json({ message: "Product not found." });
            }
        }

        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete product." });
    }
});

// Add a new product
app.post('/api/products', upload.single('imageFile'), async (req, res) => {
    const { id, title, category, sub_category, weight, price, image } = req.body;

    // Determine the final image path or URL
    let finalImage = null;
    if (req.file) {
        finalImage = `/uploads/${req.file.filename}`;
    } else if (image) {
        finalImage = image;
    }

    if (!id || !title || !category || !finalImage) {
        return res.status(400).json({ error: "Product ID, title, category, and image are required." });
    }

    // At least one of weight or price must be provided
    if (!weight && !price) {
        return res.status(400).json({ error: "Either weight or price must be provided." });
    }

    try {
        if (usePostgres) {
            await runDb(
                `INSERT INTO products (id, title, category, sub_category, weight, price, image)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [id, title, category, sub_category || null, weight || null, price || null, finalImage]
            );
        } else {
            await runDb(
                `INSERT INTO products (id, title, category, sub_category, weight, price, image)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, title, category, sub_category || null, weight || null, price || null, finalImage]
            );
        }

        res.status(201).json({
            message: "Product added successfully",
            productId: id,
            image: finalImage
        });
    } catch (err) {
        console.error(err.message);

        if (usePostgres && err.code === '23505') {
            return res.status(400).json({ error: "Product ID already exists." });
        }

        if (!usePostgres && err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: "Product ID already exists." });
        }

        res.status(500).json({ error: "Failed to add product." });
    }
});

// Add market rates
app.post('/api/rates', async (req, res) => {
    const { date, gold_rate, silver_rate } = req.body;

    if (!date || !gold_rate || !silver_rate) {
        return res.status(400).json({ error: "Required fields missing" });
    }

    try {
        if (usePostgres) {
            const result = await runDb(
                `INSERT INTO market_price (date, gold_rate, silver_rate)
                 VALUES ($1, $2, $3) RETURNING id`,
                [date, gold_rate, silver_rate]
            );
            res.status(201).json({
                message: "Rates updated successfully",
                rateId: result.rows[0].id
            });
        } else {
            const result = await runDb(
                `INSERT INTO market_price (date, gold_rate, silver_rate)
                 VALUES (?, ?, ?)`,
                [date, gold_rate, silver_rate]
            );
            res.status(201).json({
                message: "Rates updated successfully",
                rateId: result.lastID
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update rates." });
    }
});

// Get market rates (latest or by date)
app.get('/api/rates', async (req, res) => {
    const { date } = req.query;
    try {
        let result;
        if (date) {
            result = await allDb(
                usePostgres
                    ? `SELECT * FROM market_price WHERE date <= $1 ORDER BY date DESC LIMIT 1`
                    : `SELECT * FROM market_price WHERE date <= ? ORDER BY date DESC LIMIT 1`,
                [date]
            );
        } else {
            result = await allDb(
                usePostgres
                    ? `SELECT * FROM market_price ORDER BY date DESC LIMIT 1`
                    : `SELECT * FROM market_price ORDER BY date DESC LIMIT 1`
            );
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No rates found." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch rates." });
    }
});

// Get all enquiries
app.get('/api/enquiries', async (req, res) => {
    try {
        const result = await allDb(
            usePostgres
                ? `SELECT * FROM enquiries ORDER BY created_at DESC`
                : `SELECT * FROM enquiries ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to retrieve enquiries." });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});
