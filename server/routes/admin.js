const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { promisePool } = require('../db');
const { verifyToken, verifyAdmin, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
require('dotenv').config();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false
});

// Admin login endpoint with rate limiting and validation
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
      // Generic error to prevent username enumeration
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    const admin = admins[0];
    console.log('✅ Admin found:', admin.username);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      console.log('❌ Password incorrect');
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    console.log('✅ Password correct, generating token...');

    // Generate JWT token with role
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username,
        role: 'admin' // Added role for authorization
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
    console.error('💥 Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Verify token endpoint (protected)
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

// Change password endpoint (protected, admin only)
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

    console.log('🔑 Password changed for:', admin.username);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      error: 'Failed to change password' 
    });
  }
});

// Dashboard stats endpoint (protected, admin only)
router.get('/dashboard/stats', requireAdmin, async (req, res) => {
  try {
    // Artwork stats
    const [artworkStats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_artworks,
        COUNT(DISTINCT category_id) as categories_used
      FROM artworks
    `);

    // Order stats
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

    // Category stats
    const [categoryStats] = await promisePool.query(`
      SELECT COUNT(*) as total_categories 
      FROM categories
    `);

    // Recent orders (last 5)
    const [recentOrders] = await promisePool.query(`
      SELECT 
        o.id, o.order_type, o.customer_name, o.status, o.created_at,
        a.title as artwork_title
      FROM orders o
      LEFT JOIN artworks a ON o.artwork_id = a.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    res.json({
      artworks: {
        total_artworks: artworkStats[0].total_artworks,
        categories_used: artworkStats[0].categories_used
      },
      orders: orderStats[0],
      categories: {
        total_categories: categoryStats[0].total_categories
      },
      recentOrders: recentOrders
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics' 
    });
  }
});

// Export orders (protected, admin only)
router.get('/export/orders', requireAdmin, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    
    // Fetch all orders with full details
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

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Add headers
    worksheet.columns = [
      { header: 'Order ID', key: 'id', width: 10 },
      { header: 'Type', key: 'order_type', width: 12 },
      { header: 'Customer Name', key: 'customer_name', width: 20 },
      { header: 'Email', key: 'customer_email', width: 25 },
      { header: 'Phone', key: 'customer_phone', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Artwork', key: 'artwork_title', width: 25 },
      { header: 'Order Date', key: 'created_at', width: 20 }
    ];

    // Add data
    orders.forEach(order => {
      worksheet.addRow(order);
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders_${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).json({ 
      error: 'Failed to export orders' 
    });
  }
});

// Export artworks (protected, admin only)
router.get('/export/artworks', requireAdmin, async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    
    const [artworks] = await promisePool.query(`
      SELECT 
        a.*,
        c.name as category_name
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Artworks');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Category', key: 'category_name', width: 15 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Medium', key: 'medium', width: 20 },
      { header: 'Dimensions', key: 'dimensions', width: 15 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Created', key: 'created_at', width: 20 }
    ];

    artworks.forEach(artwork => {
      worksheet.addRow(artwork);
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=artworks_${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Error exporting artworks:', error);
    res.status(500).json({ 
      error: 'Failed to export artworks' 
    });
  }
});

// Export feedback (protected, admin only)
router.get('/export/feedback', requireAdmin, async (req, res) => {
  try {
    const [feedback] = await promisePool.query(`
      SELECT * FROM feedback 
      ORDER BY created_at DESC
    `);

    // If no feedback exists, return empty file with headers only
    if (feedback.length === 0) {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Customer Feedback');

      worksheet.columns = [
        { header: 'Feedback ID', key: 'id', width: 12 },
        { header: 'Customer Name', key: 'customer_name', width: 25 },
        { header: 'Email', key: 'customer_email', width: 30 },
        { header: 'Phone', key: 'customer_phone', width: 15 },
        { header: 'Subject', key: 'subject', width: 30 },
        { header: 'Message', key: 'message', width: 50 },
        { header: 'Rating', key: 'rating', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Submitted On', key: 'created_at', width: 20 }
      ];

      // Style header
      worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6366F1' }
      };

      // Add note
      worksheet.addRow({});
      worksheet.addRow({ id: 'No feedback data available yet' });

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=feedback_empty_${Date.now()}.xlsx`);
      return res.send(buffer);
    }

    // Generate normal feedback export using excelExport.js
    const { generateFeedbackExcel } = require('../excelExport');
    const buffer = await generateFeedbackExcel(feedback);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=feedback_${Date.now()}.xlsx`);
    res.send(buffer);

  } catch (error) {
    console.error('Error exporting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to export feedback',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;