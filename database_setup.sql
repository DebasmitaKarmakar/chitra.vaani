-- ChitraVaani Database Setup Script
-- Run this if automatic initialization fails

-- Create database
CREATE DATABASE IF NOT EXISTS chitravaani;
USE chitravaani;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Artworks Table
CREATE TABLE IF NOT EXISTS artworks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT,
  medium VARCHAR(100),
  dimensions VARCHAR(100),
  year VARCHAR(10),
  price VARCHAR(50) NOT NULL,
  photos JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_type ENUM('regular', 'custom', 'bulk') NOT NULL,
  artwork_id INT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  delivery_address TEXT,
  order_details JSON NOT NULL,
  status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE SET NULL
);

-- Admin Table
CREATE TABLE IF NOT EXISTS admin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  feedback_type VARCHAR(50) NOT NULL,
  rating INT NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verify table was created
SHOW TABLES LIKE 'feedback';

-- Check table structure
DESCRIBE feedback;

-- Insert a test record to verify it works
INSERT INTO feedback (customer_name, customer_email, feedback_type, rating, message)
VALUES ('Test User', 'test@example.com', 'website_experience', 5, 'This is a test feedback');

-- Check if data was inserted
SELECT * FROM feedback;

-- If successful, delete the test record
DELETE FROM feedback WHERE customer_email = 'test@example.com';

SELECT 'Feedback table is ready!' as Status;
-- Insert Default Categories
INSERT IGNORE INTO categories (name) VALUES 
  ('Paintings'),
  ('Bookmarks'),
  ('Handbands'),
  ('Badges'),
  ('Clay Work');

-- Insert Default Admin (password: admin123)
-- Note: This hash is for 'admin' - change it after first login!
INSERT INTO admin (username, password_hash)
VALUES (
  'OH.RIM',
  '$2b$12$rX5IAVgl4.5V7DQfBgShGOar3yUYVkYrTmX22h0MjtjTKYkzFAuYK'
);

-- Show tables
SHOW TABLES;

-- Verify setup
SELECT 'Setup Complete!' as Status;
SELECT COUNT(*) as CategoryCount FROM categories;
SELECT COUNT(*) as AdminCount FROM admin;