const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');
const { requireAdmin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { sendFeedbackConfirmation } = require('../emailService');

// Simple token verification
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// PUBLIC: Submit feedback - NO AUTH REQUIRED
router.post('/', async (req, res) => {
  try {
    console.log('Feedback submission received');
    console.log('Body:', req.body);

    const {
      customer_name,
      customer_email,
      customer_phone,
      subject,
      message,
      rating
    } = req.body;

    // Basic validation
    if (!customer_name || customer_name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    if (!customer_email || !customer_email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!subject || subject.trim().length < 3) {
      return res.status(400).json({ error: 'Subject must be at least 3 characters' });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Clean phone number
    const cleanPhone = customer_phone ? customer_phone.replace(/\D/g, '') : null;
    if (cleanPhone && cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Phone must be exactly 10 digits' });
    }

    console.log('Validation passed, inserting into database...');

    // Insert into database
    const [result] = await promisePool.query(
      `INSERT INTO feedback 
       (customer_name, customer_email, customer_phone, subject, message, rating, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        customer_name.trim(),
        customer_email.trim().toLowerCase(),
        cleanPhone,
        subject.trim(),
        message.trim(),
        parseInt(rating)
      ]
    );

console.log(' Feedback inserted successfully, ID:', result.insertId);
// Send confirmation email
    sendFeedbackConfirmation({
      customerName: customer_name,
      customerEmail: customer_email,
      rating: parseInt(rating),
      subject: subject
    }).catch(err => console.error('Email error:', err));

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedbackId: result.insertId
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        error: 'Feedback table not found. Please run database setup.',
        code: 'TABLE_NOT_FOUND'
      });
    }

    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ 
        error: 'Database schema mismatch. Please check feedback table structure.',
        code: 'SCHEMA_ERROR'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit feedback. Please try again or contact via WhatsApp.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ADMIN: Get all feedback
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT * FROM feedback WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [feedback] = await promisePool.query(query, params);
    
    console.log(`Fetched ${feedback.length} feedback records`);
    
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// ADMIN: Get single feedback
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [feedback] = await promisePool.query(
      'SELECT * FROM feedback WHERE id = ?',
      [req.params.id]
    );

    if (feedback.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedback[0]);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// ADMIN: Update feedback status
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const feedbackId = parseInt(req.params.id);

    if (isNaN(feedbackId) || feedbackId < 1) {
      return res.status(400).json({ error: 'Invalid feedback ID' });
    }

    const validStatuses = ['Pending', 'Reviewed', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be: Pending, Reviewed, or Resolved' 
      });
    }

    const [result] = await promisePool.query(
      'UPDATE feedback SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, feedbackId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ message: 'Feedback status updated successfully' });

  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ error: 'Failed to update feedback status' });
  }
});

// ADMIN: Delete feedback
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);

    if (isNaN(feedbackId) || feedbackId < 1) {
      return res.status(400).json({ error: 'Invalid feedback ID' });
    }

    const [result] = await promisePool.query(
      'DELETE FROM feedback WHERE id = ?',
      [feedbackId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully' });

  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// ADMIN: Get feedback statistics - FIXED
router.get('/stats/summary', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [stats] = await promisePool.query(`
      SELECT 
        CAST(COUNT(*) AS UNSIGNED) as total_feedback,
        CAST(COALESCE(AVG(rating), 0) AS DECIMAL(10,2)) as average_rating,
        CAST(SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS UNSIGNED) as five_star,
        CAST(SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS UNSIGNED) as four_star,
        CAST(SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS UNSIGNED) as three_star,
        CAST(SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS UNSIGNED) as two_star,
        CAST(SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS UNSIGNED) as one_star,
        CAST(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS UNSIGNED) as pending_feedback,
        CAST(SUM(CASE WHEN status = 'Reviewed' THEN 1 ELSE 0 END) AS UNSIGNED) as reviewed_feedback,
        CAST(SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS UNSIGNED) as resolved_feedback
      FROM feedback
    `);

    const result = {
      total_feedback: parseInt(stats[0].total_feedback) || 0,
      average_rating: parseFloat(stats[0].average_rating) || 0,
      five_star: parseInt(stats[0].five_star) || 0,
      four_star: parseInt(stats[0].four_star) || 0,
      three_star: parseInt(stats[0].three_star) || 0,
      two_star: parseInt(stats[0].two_star) || 0,
      one_star: parseInt(stats[0].one_star) || 0,
      pending_feedback: parseInt(stats[0].pending_feedback) || 0,
      reviewed_feedback: parseInt(stats[0].reviewed_feedback) || 0,
      resolved_feedback: parseInt(stats[0].resolved_feedback) || 0,
      appreciation_feedback: parseInt(stats[0].five_star) || 0,
      new_feedback: parseInt(stats[0].pending_feedback) || 0,
      complaints: (parseInt(stats[0].one_star) || 0) + (parseInt(stats[0].two_star) || 0)
    };

    console.log('Feedback stats:', result);
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.json({
      total_feedback: 0,
      average_rating: 0,
      five_star: 0,
      pending_feedback: 0,
      reviewed_feedback: 0,
      resolved_feedback: 0,
      appreciation_feedback: 0,
      new_feedback: 0,
      complaints: 0
    });
  }
});

module.exports = router;