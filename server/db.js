const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log(' Initializing database connection...');
console.log(' Host:', process.env.DB_HOST);
console.log(' User:', process.env.DB_USER);
console.log('  Database:', process.env.DB_NAME);
console.log(' Port:', process.env.DB_PORT);

// Validate environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error(' Missing required database environment variables!');
  console.error('Please check your .env file has: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
  process.exit(1);
}

// Create connection pool with SSL for Aiven
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
  charset: 'utf8mb4',
  timezone: '+00:00',
  // SSL configuration for Aiven cloud database
  ssl: {
    rejectUnauthorized: false // Aiven uses SSL by default
  }
});

// Get promise-based pool
const promisePool = pool.promise();

// Test connection with retry logic
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await promisePool.getConnection();
      console.log(' MySQL Database connected successfully (SSL enabled)');
      connection.release();
      return true;
    } catch (err) {
      console.error(` Database connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        console.log(' Retrying in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  console.error('Failed to connect to database after', retries, 'attempts');
  console.error(' Please verify your Aiven database credentials and network access');
  return false;
}

// Initialize database tables
async function initDatabase() {
  try {
    console.log('Initializing database tables...');

    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Cannot connect to database');
    }

    // Create categories table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log(' Categories table ready');

    // Create artworks table
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
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_category (category_id),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log(' Artworks table ready');

    // Create orders table
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
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_type (order_type),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log(' Orders table ready');

    // Create admin table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log(' Admin table ready');

    // Create feedback table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        status ENUM('Pending', 'Reviewed', 'Resolved') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log(' Feedback table ready');

    // Check and insert default categories
    const [categoryCount] = await promisePool.query('SELECT COUNT(*) as count FROM categories');
    
    if (categoryCount[0].count === 0) {
      const defaultCategories = ['Paintings', 'Bookmarks', 'Handbands', 'Badges', 'Clay Work'];
      
      for (const cat of defaultCategories) {
        try {
          await promisePool.query('INSERT INTO categories (name) VALUES (?)', [cat]);
        } catch (err) {
          if (err.code !== 'ER_DUP_ENTRY') {
            console.error(`Failed to insert category ${cat}:`, err.message);
          }
        }
      }
      console.log(' Default categories inserted');
    } else {
      console.log('  Categories already exist:', categoryCount[0].count);
    }

    // Check if admin user exists (read from environment variables)
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.warn('️  WARNING: ADMIN_USERNAME and ADMIN_PASSWORD not set in .env file');
      console.warn('   Admin user will not be created automatically');
      console.warn('   Please set these environment variables and restart');
    } else {
      const [existingAdmin] = await promisePool.query(
        'SELECT username FROM admin WHERE username = ?',
        [adminUsername]
      );

      if (existingAdmin.length === 0) {
        // Create new admin user from environment variables
        console.log(' Creating admin user from environment variables...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        await promisePool.query(
          'INSERT INTO admin (username, password_hash) VALUES (?, ?)',
          [adminUsername, hashedPassword]
        );
        
        console.log(' Admin user created successfully');
        console.log(' Username:', adminUsername);
        console.log(' Password: ******** (hidden for security)');
        console.log('  IMPORTANT: Keep .env file secure and never commit to git!');
      } else {
        console.log('  Admin user already exists:', adminUsername);
      }
    }

    // Show all admin usernames (without showing passwords)
    const [adminList] = await promisePool.query('SELECT username, created_at FROM admin');
    if (adminList.length > 0) {
      console.log(' Admin users in database:');
      adminList.forEach(admin => {
        console.log(`   - ${admin.username} (created: ${new Date(admin.created_at).toLocaleDateString()})`);
      });
    } else {
      console.log('  No admin users found in database');
    }

    // Show table summary
    const [tables] = await promisePool.query('SHOW TABLES');
    console.log(' Database tables:', tables.map(t => Object.values(t)[0]).join(', '));

    // Show record counts
    const [catCount] = await promisePool.query('SELECT COUNT(*) as count FROM categories');
    const [artCount] = await promisePool.query('SELECT COUNT(*) as count FROM artworks');
    const [ordCount] = await promisePool.query('SELECT COUNT(*) as count FROM orders');
    
    console.log(' Database stats:');
    console.log('   - Categories:', catCount[0].count);
    console.log('   - Artworks:', artCount[0].count);
    console.log('   - Orders:', ordCount[0].count);

    console.log(' Database initialization complete!');
    return true;

  } catch (error) {
    console.error(' Database initialization error:', error);
    console.error(' Error details:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(' Access denied. Check your DB_USER and DB_PASSWORD in .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error(' Connection refused. Check if DB_HOST and DB_PORT are correct');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('  Database does not exist. Check DB_NAME in .env (should be "defaultdb" for Aiven)');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      console.error(' Network timeout. Check your internet connection and firewall');
      console.error('   Make sure your IP is whitelisted in Aiven console');
    }
    
    throw error;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log(' SIGTERM received, closing database connection...');
  try {
    await pool.end();
    console.log(' Database connection closed');
  } catch (err) {
    console.error('Error closing pool:', err);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n SIGINT received, closing database connection...');
  try {
    await pool.end();
    console.log(' Database connection closed');
  } catch (err) {
    console.error('Error closing pool:', err);
  }
  process.exit(0);
});

module.exports = { 
  pool, 
  promisePool, 
  initDatabase,
  testConnection 
};