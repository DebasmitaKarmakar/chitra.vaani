const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function changePassword() {
  //  UPDATED CREDENTIALS
  const NEW_USERNAME = process.env.ADMIN_USERNAME;
  const NEW_PASSWORD = process.env.ADMIN_PASSWORD;

  try {
    console.log('Connecting to database...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      //  FIXED SSL FOR AIVEN
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Connected! Updating password...');

    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    
    await connection.query(
      'UPDATE admin SET username = ?, password_hash = ? WHERE id = 1',
      [NEW_USERNAME, hashedPassword]
    );

    console.log('\n Password changed successfully!');
    console.log('Username:', NEW_USERNAME);
    console.log('Password:', NEW_PASSWORD);
    console.log('\nYou can now login with these credentials.');
    console.log('You can delete this file now.');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('\n Error:', error.message);
    console.error('\nMake sure:');
    console.error('1. Your .env file has correct database credentials');
    console.error('2. Your Aiven database is running (not paused)');
    process.exit(1);
  }
}

changePassword();