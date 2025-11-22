const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log(' Initializing database connection...');
console.log(' Host:', process.env.DB_HOST);
console.log(' User:', process.env.DB_USER);
console.log(' Database:', process.env.DB_NAME);

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  
  //  CRITICAL FIX FOR VERCEL:
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true
  } : {
    rejectUnauthorized: false
  }
});

// Promise pool
const promisePool = pool.promise();

// Test DB connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error(' Database connection failed:', err.message);
    console.error('  Check your .env DB credentials & SSL settings');
    return;
  }
  console.log(' MySQL Database connected successfully');
  connection.release();
});

// Initialize database tables
async function initDatabase() {
  try {
    console.log(' Initializing database tables...');

    // Categories Table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log(' Categories table ready');

    // Artworks Table
    await promisePool.query(`
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
      )
    `);
    console.log(' Artworks table ready');

    // Orders Table
    await promisePool.query(`
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
      )
    `);
    console.log(' Orders table ready');

    // Admin Table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log(' Admin table ready');

    //  NEW: Feedback Table
    await promisePool.query(`
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
      )
    `);
    console.log(' Feedback table ready');

    // Create default admin
    const [admins] = await promisePool.query('SELECT COUNT(*) as count FROM admin');
    if (admins[0].count === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(password, 10);

      await promisePool.query(
        'INSERT INTO admin (username, password_hash) VALUES (?, ?)',
        [username, hashedPassword]
      );

      console.log(` Default admin created - Username: ${username}`);
    }
    
    console.log(' Database initialization complete!');
  } catch (error) {
    console.error(' Database initialization error:', error);
  }
}

module.exports = { pool, promisePool, initDatabase };