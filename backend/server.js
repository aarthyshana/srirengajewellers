const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.port || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static(path.join(__dirname, '..')));

// Connect to SQLite Database (this will create it if it doesn't exist)
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create your initial tables here
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password TEXT NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS chits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount INTEGER,
            start_date TEXT,
            status TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS enquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            product_ids TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// Example route to get all users (for testing)
app.get('/api/users', (req, res) => {
    db.all("SELECT id, name, email, phone FROM users", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
