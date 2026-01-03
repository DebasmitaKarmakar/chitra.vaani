// FILE: backend/routes/admin.js
// LOCATION: Save this as backend/routes/admin.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { promisePool } = require('../db'); // ✅ CRITICAL FIX
const { 
  generateArtworkExcel, 
  generateOrderExcel, 
  generateFeedbackExcel, 
  generateArtistsExcel 
} = require('../excelExport');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
require('dotenv').config();

// ==========================================
// RATE LIMITING
// ==========================================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Admin login
router.post('/login', loginLimiter, validate('login'), async (req, res) => {
  try {
    console.log('🔐 Login attempt received');
    const { username, password } = req.body;

    // Get admin from database
    const [admins] = await promisePool.query(
      'SELECT * FROM admin WHERE username = ?',
      [username]
    );

    if (admins.length === 0) {
      console.log('❌ Admin not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = admins[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      console.log('❌ Password incorrect');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', admin.username);

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Verify token endpoint
router.get('/verify', verifyToken, (req, res) => {
  res.json({ 
    valid: true, 
    admin: { 
      id: req.user.id, 
      username: req.user.username,
      role: req.user.role
    } 
  });
});

// Change password endpoint
router.post('/change-password', requireAdmin, validate('changePassword'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current admin
    const [admins] = await promisePool.query(
      'SELECT * FROM admin WHERE id = ?',
      [req.user.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = admins[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await promisePool.query(
      'UPDATE admin SET password_hash = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    console.log('✅ Password changed for:', admin.username);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({ 
      error: 'Failed to change password' 
    });
  }
});

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

router.get('/dashboard/stats', requireAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');

    // ===== ARTWORK STATS =====
    const [artworkStats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_artworks,
        COUNT(DISTINCT category_id) as categories_used
      FROM artworks
    `);

    // ===== ORDER STATS =====
    const [orderStats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(CASE WHEN order_type = 'regular' THEN 1 ELSE 0 END) as regular_orders,
        SUM(CASE WHEN order_type = 'custom' THEN 1 ELSE 0 END) as custom_orders,
        SUM(CASE WHEN order_type = 'bulk' THEN 1 ELSE 0 END) as bulk_orders
      FROM orders
    `);

    // ===== CATEGORY STATS =====
    const [categoryStats] = await promisePool.query(`
      SELECT COUNT(*) as total_categories 
      FROM categories
    `);

    // ===== RECENT ORDERS =====
    const [recentOrders] = await promisePool.query(`
      SELECT 
        o.id, o.order_type, o.customer_name, o.status, o.created_at,
        a.title as artwork_title
      FROM orders o
      LEFT JOIN artworks a ON o.artwork_id = a.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    const stats = {
      artworks: artworkStats[0],
      orders: orderStats[0],
      categories: categoryStats[0],
      recentOrders: recentOrders
    };

    console.log('✅ Dashboard stats fetched');
    res.json(stats);

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      details: error.message
    });
  }
});

// ==========================================
// EXCEL EXPORT ROUTES
// ==========================================

// Export orders
router.get('/export/orders', requireAdmin, async (req, res) => {
  try {
    console.log('📥 Exporting orders...');

    const [orders] = await promisePool.query(`
      SELECT 
        o.*,
        a.title as artwork_title,
        c.name as artwork_category
      FROM orders o
      LEFT JOIN artworks a ON o.artwork_id = a.id
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY o.created_at DESC
    `);

    console.log(`✅ Found ${orders.length} orders to export`);

    const buffer = await generateOrderExcel(orders);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders_${Date.now()}.xlsx`);
    res.send(buffer);

    console.log('✅ Orders exported successfully');

  } catch (error) {
    console.error('❌ Error exporting orders:', error);
    res.status(500).json({ 
      error: 'Failed to export orders',
      details: error.message
    });
  }
});

// Export artworks
router.get('/export/artworks', requireAdmin, async (req, res) => {
  try {
    console.log('📥 Exporting artworks...');

    const [artworks] = await promisePool.query(`
      SELECT 
        a.*,
        c.name as category_name,
        ar.name as artist_name
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN artists ar ON a.artist_id = ar.id
      ORDER BY a.created_at DESC
    `);

    console.log(`✅ Found ${artworks.length} artworks to export`);

    const buffer = await generateArtworkExcel(artworks);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=artworks_${Date.now()}.xlsx`);
    res.send(buffer);

    console.log('✅ Artworks exported successfully');

  } catch (error) {
    console.error('❌ Error exporting artworks:', error);
    res.status(500).json({ 
      error: 'Failed to export artworks',
      details: error.message
    });
  }
});

// Export feedback
router.get('/export/feedback', requireAdmin, async (req, res) => {
  try {
    console.log('📥 Exporting feedback...');

    const [feedback] = await promisePool.query(`
      SELECT * FROM feedback 
      ORDER BY created_at DESC
    `);

    console.log(`✅ Found ${feedback.length} feedback records to export`);

    const buffer = await generateFeedbackExcel(feedback);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=feedback_${Date.now()}.xlsx`);
    res.send(buffer);

    console.log('✅ Feedback exported successfully');

  } catch (error) {
    console.error('❌ Error exporting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to export feedback',
      details: error.message
    });
  }
});

// Export artists
router.get('/export/artists', requireAdmin, async (req, res) => {
  try {
    console.log('📥 Exporting artists...');

    const [artists] = await promisePool.query(`
      SELECT 
        a.*,
        COUNT(aw.id) AS artwork_count
      FROM artists a
      LEFT JOIN artworks aw ON aw.artist_id = a.id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

    console.log(`✅ Found ${artists.length} artists to export`);

    const buffer = await generateArtistsExcel(artists);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=artists_${Date.now()}.xlsx`);
    res.send(buffer);

    console.log('✅ Artists exported successfully');

  } catch (error) {
    console.error('❌ Error exporting artists:', error);
    res.status(500).json({ 
      error: 'Failed to export artists',
      details: error.message
    });
  }
});

module.exports = router;