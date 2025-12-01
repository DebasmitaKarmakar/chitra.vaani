const bcrypt = require('bcryptjs');
const { promisePool } = require('./db');
require('dotenv').config();

async function setupAdmin() {
  try {
    console.log(' Setting up admin user...');
    
    const username = process.env.ADMIN_USERNAME || 'rimi';
    const password = process.env.ADMIN_PASSWORD || '25Feb@25';

    // Check if admin exists
    const [existing] = await promisePool.query(
      'SELECT id, username FROM admin WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      console.log(`  Admin user "${username}" already exists`);
      console.log(' Updating password...');
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 10);
      await promisePool.query(
        'UPDATE admin SET password_hash = ? WHERE username = ?',
        [hashedPassword, username]
      );
      
      console.log(' Password updated successfully!');
    } else {
      console.log(` Creating new admin user "${username}"...`);
      
      // Create new admin
      const hashedPassword = await bcrypt.hash(password, 10);
      await promisePool.query(
        'INSERT INTO admin (username, password_hash) VALUES (?, ?)',
        [username, hashedPassword]
      );
      
      console.log(' Admin user created successfully!');
    }

    console.log('\n Admin Credentials:');
    console.log('   Username:', username);
    console.log('   Password:', password);
    console.log('\n  IMPORTANT: Keep these credentials secure!\n');

    // Show all admin users
    const [allAdmins] = await promisePool.query('SELECT username, created_at FROM admin');
    console.log(' All admin users:');
    allAdmins.forEach(admin => {
      console.log(`   - ${admin.username} (created: ${admin.created_at})`);
    });

    process.exit(0);
  } catch (error) {
    console.error(' Error setting up admin:', error.message);
    process.exit(1);
  }
}

// Run setup
setupAdmin();