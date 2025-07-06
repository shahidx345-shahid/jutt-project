-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 10.00,
  tax_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo user
INSERT INTO users (name, email, password_hash) VALUES 
('Demo User', 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (email) DO NOTHING;

-- Insert demo customers
INSERT INTO customers (user_id, name, email, phone, address) VALUES 
(1, 'Stellar Labs', 'contact@stellarlabs.com', '123-456-7890', '123 Galaxy Street, Space City, SC 12345'),
(1, 'Cosmic Enterprises', 'info@cosmicent.com', '234-567-8901', '456 Nebula Avenue, Star Town, ST 23456'),
(1, 'Orbital Systems', 'hello@orbitalsys.com', '345-678-9012', '789 Asteroid Boulevard, Moon Base, MB 34567')
ON CONFLICT DO NOTHING;

-- Insert demo products
INSERT INTO products (user_id, name, sku, description, price, stock, category) VALUES 
(1, 'Mercury Model', 'MERC-001', 'Detailed scale model of Mercury with surface features', 29.99, 15, 'Planet Models'),
(1, 'Venus Globe', 'VEN-002', 'Beautiful Venus globe with atmospheric details', 34.99, 12, 'Planet Models'),
(1, 'Earth and Moon Set', 'EARTH-003', 'Earth model with orbiting Moon companion', 49.99, 20, 'Planet Models'),
(1, 'Mars Rover', 'MARS-004', 'Interactive Mars rover with moveable parts', 39.99, 8, 'Planet Models'),
(1, 'Jupiter Giant', 'JUP-005', 'Large Jupiter model with Great Red Spot', 59.99, 5, 'Planet Models')
ON CONFLICT (sku) DO NOTHING;
