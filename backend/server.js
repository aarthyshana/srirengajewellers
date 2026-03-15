const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = process.env.port || 3000;

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

    // Connect to SQLite Database (this will create it if it doesn't exist)
    const db = new sqlite3.Database('./database.sqlite', (err) => {
        if (err) {
            console.error('Error opening database', err.message);
        } else {
            console.log('Connected to the SQLite database.');
    
            // Create your initial tables here
            db.run(`CREATE TABLE IF NOT EXISTS enquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT,
                product_ids TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                sub_category TEXT,
                weight TEXT,
                image TEXT
            )`);
            db.run(`CREATE TABLE IF NOT EXISTS market_price (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                gold_rate REAL NOT NULL,
                silver_rate REAL NOT NULL
            )`);
        }
    });

    // Basic Test Route
    app.get('/api', (req, res) => {
        res.json({ message: "Welcome to the SriRenga Jewelers API!" });
    });

    // Enquiry Route
    app.post('/api/enquiry', (req, res) => {
        const { name, phone, email, product_ids } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: "Name and phone are required." });
        }

        const sql = `INSERT INTO enquiries (name, phone, email, product_ids) VALUES (?, ?, ?, ?)`;
        // Store product_ids as a JSON string if provided, else null
        const productIdsStr = product_ids && Array.isArray(product_ids) ? JSON.stringify(product_ids) : null;

        db.run(sql, [name, phone, email || null, productIdsStr], function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: "Failed to submit enquiry." });
            }
            res.json({
                message: "Enquiry submitted successfully",
                enquiryId: this.lastID
            });
        });
    });

    // Get all products
    app.get('/api/products', (req, res) => {
        const sql = `SELECT * FROM products`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: "Failed to retrieve products." });
            }
            res.json(rows);
        });
    });

    // Add a new product
    app.post('/api/products', upload.single('imageFile'), (req, res) => {
        const { title, category, sub_category, weight, image } = req.body;
        
        // Determine the final image path or URL
        let finalImage = null;
        if (req.file) {
            finalImage = `/uploads/${req.file.filename}`;
        } else if (image) {
            finalImage = image;
        }

        if (!title || !category || !finalImage) {
            return res.status(400).json({ error: "Title, category, and image are required." });
        }

        const sql = `INSERT INTO products (title, category, sub_category, weight, image) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [title, category, sub_category || null, weight || null, finalImage], function(err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: "Failed to add product." });
            }
            res.status(201).json({
                message: "Product added successfully",
                productId: this.lastID,
                image: finalImage
            });
        });
    });

    // Add market rates
    app.post('/api/rates', (req, res) => {
        const { date, gold_rate, silver_rate } = req.body;
        if (!date || !gold_rate || !silver_rate) {
            return res.status(400).json({ error: "Date, gold rate, and silver rate are required." });
        }
        const sql = `INSERT INTO market_price (date, gold_rate, silver_rate) VALUES (?, ?, ?)`;
        db.run(sql, [date, gold_rate, silver_rate], function(err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: "Failed to update rates." });
            }
            res.status(201).json({ message: "Rates updated successfully", rateId: this.lastID });
        });
    });

    // Get market rates (latest or by date)
    app.get('/api/rates', (req, res) => {
        const { date } = req.query;
        let sql = `SELECT * FROM market_price ORDER BY date DESC LIMIT 1`;
        let params = [];
        if (date) {
            sql = `SELECT * FROM market_price WHERE date <= ? ORDER BY date DESC LIMIT 1`;
            params = [date];
        }
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: "Failed to fetch rates." });
            }
            if (!row) {
                return res.status(404).json({ message: "No rates found for the given date." });
            }
            res.json(row);
        });
    });

    // Get all enquiries
    app.get('/api/enquiries', (req, res) => {
        const sql = `SELECT * FROM enquiries ORDER BY created_at DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: "Failed to retrieve enquiries." });
            }
            res.json(rows);
        });
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
