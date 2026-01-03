-- ChitraVaani Database Setup Script
-- Run this if automatic initialization fails

-- Create database
CREATE DATABASE IF NOT EXISTS chitravaani;
USE chitravaani;

-- Categories Table
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ARTISTS TABLE (parent)
CREATE TABLE artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) DEFAULT NULL,
  style VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  instagram VARCHAR(255) DEFAULT NULL,
  facebook VARCHAR(255) DEFAULT NULL,
  twitter VARCHAR(255) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  profile_image_url TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. ARTWORKS TABLE (child - references categories and artists)
CREATE TABLE artworks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT,
  artist_id INT DEFAULT NULL,
  medium VARCHAR(100),
  dimensions VARCHAR(100),
  year VARCHAR(10),
  price VARCHAR(50),
  photos JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_artist (artist_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ORDERS TABLE (child - references artworks)
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_type ENUM('regular', 'custom', 'bulk') NOT NULL,
  artwork_id INT DEFAULT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  delivery_address TEXT,
  order_details JSON,
  status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_email (customer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. FEEDBACK TABLE (independent)
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) DEFAULT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  status ENUM('Pending', 'Reviewed', 'Resolved') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 3: Insert sample categories
INSERT INTO categories (name) VALUES 
('Watercolors'),
('Acrylics'),
('Sketches'),
('Digital Art'),
('Oil Paintings'),
('Mixed Media');

ALTER TABLE artworks
ADD COLUMN artist_id INT NULL,
ADD INDEX idx_artist (artist_id),
ADD CONSTRAINT fk_artist
FOREIGN KEY (artist_id)
REFERENCES artists(id)
ON DELETE SET NULL;

-- Done!
SELECT 'Database setup completed successfully!' as Status;
SELECT COUNT(*) as CategoryCount FROM categories;
SELECT COUNT(*) as AdminCount FROM admin;