# Product Management System Updates

## Changes Made

### 1. Database Schema
- Added `price` column (TEXT) to the `products` table
- This allows storing both weight-based products and price-based products

### 2. Admin Form
- Made `weight` field optional
- Added new `price` field (also optional)
- At least one of weight or price must be provided
- Helper text explains the two types of products

### 3. Backend API
- Updated POST `/api/products` endpoint to accept both `weight` and `price`
- Validation ensures at least one is provided
- Both fields are stored in the database as optional (can be null)

### 4. Frontend Display
- Product cards now show either:
  - "Weight: X g" for weight-based items (scale icon)
  - "Price: ₹X" for price-based items (tag icon, highlighted in gold)
- Cart items display the appropriate spec for each product

### 5. CSS Styling
- Added `.product-price` class for price display
  - Gold color with bold font weight to highlight pricing

## Running the Migration

If you haven't already added the price column, run:

```bash
cd backend/migrations
node 001_add_price_to_products.js
```

This will:
- Check if the price column already exists
- Add it if missing
- Display the final table structure
- Report success or failure

## Product Types

### Type 1: Weight-Based Products
- Traditional jewelry sold by weight
- Examples: Gold rings, Silver chains, Bracelets
- Admin Entry: Fill in Weight field (e.g., "45.5")
- Display: "Weight: 45.5 g"

### Type 2: Price-Based Products
- Fixed-price items with specific pricing
- Examples: Gold coins, Silver coins, Pre-packaged items
- Admin Entry: Fill in Item Price field (e.g., "5500")
- Display: "Price: ₹5500"

## Database Query Examples

Check products table structure:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='products' 
ORDER BY ordinal_position;
```

Find weight-based products:
```sql
SELECT id, title, weight FROM products WHERE weight IS NOT NULL;
```

Find price-based products:
```sql
SELECT id, title, price FROM products WHERE price IS NOT NULL;
```

Find products with both:
```sql
SELECT id, title, weight, price FROM products WHERE weight IS NOT NULL AND price IS NOT NULL;
```
