const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../db');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth Login Endpoint
router.post('/google-login', async (req, res) => {
  try {
    console.log('Google login attempt received');
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Credential token is required' });
    }

    console.log('Verifying Google token...');
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload['email'];
    const name = payload['name'];
    const picture = payload['picture'];

    console.log('Token verified for:', email);

    const authorizedEmails = process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
    
    if (!authorizedEmails.includes(email.toLowerCase())) {
      console.log('Unauthorized email:', email);
      return res.status(403).json({ 
        error: 'Access denied. Your email is not authorized as an admin.' 
      });
    }

    console.log('Email authorized:', email);

    const token = jwt.sign(
      { 
        id: email, 
        username: name,
        email: email,
        picture: picture 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('JWT token generated');

    res.json({
      message: 'Login successful',
      token,
      admin: {
        email,
        name,
        picture
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    
    if (error.message && error.message.includes('Token')) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }
    
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Traditional login
router.post('/login', async (req, res) => {
  try {
    console.log(' Traditional login attempt received');
    console.log('Request body:', req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      console.log(' Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    console.log(` Looking for admin: ${username}`);

    const [admins] = await promisePool.query(
      'SELECT * FROM admin WHERE username = ?',
      [username]
    );

    console.log(` Found ${admins.length} admin(s)`);

    if (admins.length === 0) {
      console.log(' Admin not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = admins[0];
    console.log(' Admin found:', admin.username);

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    console.log(' Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log(' Password incorrect');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(' Password correct, generating token...');

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(' Token generated successfully');

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });

    console.log(' Login successful for:', admin.username);

  } catch (error) {
    console.error(' Login error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Verify token endpoint
router.get('/verify', verifyToken, (req, res) => {
  res.json({ 
    valid: true, 
    admin: { 
      id: req.admin.id, 
      username: req.admin.username,
      email: req.admin.email 
    } 
  });
});

// Change password endpoint
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    const [admins] = await promisePool.query(
      'SELECT * FROM admin WHERE id = ?',
      [req.admin.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = admins[0];
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await promisePool.query(
      'UPDATE admin SET password_hash = ? WHERE id = ?',
      [hashedPassword, req.admin.id]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Dashboard stats endpoint
router.get('/dashboard/stats', verifyToken, async (req, res) => {
  try {
    const [artworkStats] = await promisePool.query(
      'SELECT COUNT(*) as total_artworks FROM artworks'
    );

    const [orderStats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_orders
      FROM orders
    `);

    const [categoryStats] = await promisePool.query(
      'SELECT COUNT(*) as total FROM categories'
    );

    const [recentOrders] = await promisePool.query(`
      SELECT o.*, a.title as artwork_title 
      FROM orders o
      LEFT JOIN artworks a ON o.artwork_id = a.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    res.json({
      artworks: artworkStats[0],
      orders: orderStats[0],
      categories: categoryStats[0].total,
      recentOrders: recentOrders.map(order => ({
        ...order,
        order_details: typeof order.order_details === 'string'
          ? JSON.parse(order.order_details)
          : order.order_details
      }))
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

//  FIXED: Export Orders to Excel
router.get('/export/orders', verifyToken, async (req, res) => {
  try {
    console.log(' Exporting orders to Excel...');
    
    const [orders] = await promisePool.query(`
      SELECT 
        o.id,
        o.order_type,
        o.status,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.delivery_address,
        o.order_details,
        o.created_at,
        o.updated_at,
        a.title as artwork_title
      FROM orders o
      LEFT JOIN artworks a ON o.artwork_id = a.id
      ORDER BY o.created_at DESC
    `);

    const formattedOrders = orders.map(order => ({
      ...order,
      order_details: typeof order.order_details === 'string' 
        ? JSON.parse(order.order_details) 
        : order.order_details
    }));

    const { generateOrderExcel } = require('../excelExport');
    const buffer = await generateOrderExcel(formattedOrders);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders_${Date.now()}.xlsx`);
    res.send(buffer);

    console.log(' Orders exported successfully');
  } catch (error) {
    console.error(' Error exporting orders:', error);
    res.status(500).json({ error: 'Failed to export orders: ' + error.message });
  }
});

//  FIXED: Export Artworks to Excel
router.get('/export/artworks', verifyToken, async (req, res) => {
  try {
    console.log(' Exporting artworks to Excel...');
    
    const [artworks] = await promisePool.query(`
      SELECT 
        a.*,
        c.name as category_name
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC
    `);

    const formattedArtworks = artworks.map(art => ({
      ...art,
      photos: typeof art.photos === 'string' ? JSON.parse(art.photos) : art.photos,
      category: art.category_name
    }));

    const { generateArtworkExcel } = require('../excelExport');
    const buffer = await generateArtworkExcel(formattedArtworks);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=artworks_${Date.now()}.xlsx`);
    res.send(buffer);

    console.log(' Artworks exported successfully');
  } catch (error) {
    console.error(' Error exporting artworks:', error);
    res.status(500).json({ error: 'Failed to export artworks: ' + error.message });
  }
});

//  Export Feedback to Excel
router.get('/export/feedback', verifyToken, async (req, res) => {
  try {
    console.log(' Exporting feedback to Excel...');
    
    // Get all feedback
    const [feedback] = await promisePool.query(`
      SELECT * FROM feedback
      ORDER BY created_at DESC
    `);

    console.log(` Found ${feedback.length} feedback entries`);

    // If no feedback, return error
    if (feedback.length === 0) {
      return res.status(404).json({ 
        error: 'No feedback found to export' 
      });
    }

    // Generate Excel
    const { generateFeedbackExcel } = require('../excelExport');
    const buffer = await generateFeedbackExcel(feedback);

    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=feedback_${Date.now()}.xlsx`);
    res.send(buffer);

    console.log(' Feedback exported successfully');
  } catch (error) {
    console.error(' Error exporting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to export feedback',
      details: error.message 
    });
  }
});

module.exports = router;
module.exports.verifyToken = verifyToken;