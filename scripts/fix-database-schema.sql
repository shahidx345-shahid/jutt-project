-- Ensure all tables exist with proper constraints
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table with proper constraints
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, email)
);

-- Create products table with proper constraints
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, sku)
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax_rate DECIMAL(5,2) DEFAULT 10.00 CHECK (tax_rate >= 0),
  tax_amount DECIMAL(10,2) NOT NULL CHECK (tax_amount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, invoice_number)
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo user if not exists
INSERT INTO users (name, email, password_hash) VALUES 
('Demo User', 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (email) DO NOTHING;

-- Get the demo user ID
DO $$
DECLARE
    demo_user_id INTEGER;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@example.com';
    
    -- Insert demo customers
    INSERT INTO customers (user_id, name, email, phone, address) VALUES 
    (demo_user_id, 'Stellar Labs', 'contact@stellarlabs.com', '123-456-7890', '123 Galaxy Street, Space City, SC 12345'),
    (demo_user_id, 'Cosmic Enterprises', 'info@cosmicent.com', '234-567-8901', '456 Nebula Avenue, Star Town, ST 23456'),
    (demo_user_id, 'Orbital Systems', 'hello@orbitalsys.com', '345-678-9012', '789 Asteroid Boulevard, Moon Base, MB 34567')
    ON CONFLICT (user_id, email) DO NOTHING;

    -- Insert demo products
    INSERT INTO products (user_id, name, sku, description, price, stock, category) VALUES 
    (demo_user_id, 'Mercury Model', 'MERC-001', 'Detailed scale model of Mercury with surface features', 29.99, 15, 'Planet Models'),
    (demo_user_id, 'Venus Globe', 'VEN-002', 'Beautiful Venus globe with atmospheric details', 34.99, 12, 'Planet Models'),
    (demo_user_id, 'Earth and Moon Set', 'EARTH-003', 'Earth model with orbiting Moon companion', 49.99, 20, 'Planet Models'),
    (demo_user_id, 'Mars Rover', 'MARS-004', 'Interactive Mars rover with moveable parts', 39.99, 8, 'Planet Models'),
    (demo_user_id, 'Jupiter Giant', 'JUP-005', 'Large Jupiter model with Great Red Spot', 59.99, 5, 'Planet Models')
    ON CONFLICT (user_id, sku) DO NOTHING;
END $$;
