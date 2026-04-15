// Migration: Add price column to products table
// Run this file once to update the database schema

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration: Adding price column to products table...');

        // Check if price column already exists
        const checkColumnResult = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='products' AND column_name='price'
        `);

        if (checkColumnResult.rows.length > 0) {
            console.log('✓ Price column already exists in products table');
            return;
        }

        // Add price column
        await client.query(`
            ALTER TABLE products 
            ADD COLUMN price TEXT
        `);

        console.log('✓ Successfully added price column to products table');

        // Verify the column was added
        const verifyResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name='products' 
            ORDER BY ordinal_position
        `);

        console.log('\nCurrent products table structure:');
        verifyResult.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });

        console.log('\n✓ Migration completed successfully!');
    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

// Run migration
migrate().then(() => {
    console.log('Migration script finished');
    process.exit(0);
}).catch(error => {
    console.error('Migration error:', error);
    process.exit(1);
});
