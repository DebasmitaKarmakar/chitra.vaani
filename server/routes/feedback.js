const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');
const { requireAdmin } = require('../middleware/auth');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

// Validation Schema
const feedbackSchema = Joi.object({
  customer_name: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Name is required'
    }),
  customer_email: Joi.string().email().required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  customer_phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Phone must be exactly 10 digits'
    }),
  subject: Joi.string().min(3).max(200).required()
    .messages({
      'string.min': 'Subject must be at least 3 characters',
      'any.required': 'Subject is required'
    }),
  message: Joi.string().min(10).max(2000).required()
    .messages({
      'string.min': 'Message must be at least 10 characters',
      'string.max': 'Message cannot exceed 2000 characters',
      'any.required': 'Message is required'
    }),
  rating: Joi.number().integer().min(1).max(5).allow(null).optional(),
  feedback_type: Joi.string()
    .valid('appreciation', 'suggestion', 'complaint', 'question', 'other')
    .default('other')
});

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

// Get all feedback (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [feedback] = await promisePool.query(`
      SELECT * FROM feedback 
      ORDER BY created_at DESC
    `);
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Create new feedback - NO RATE LIMIT
// FIXED: Create new feedback - Replace lines 26-86 in feedback.js
router.post('/', async (req, res) => {
  try {
    console.log(' Feedback submission received:', req.body);

    // Validate input
    const { error, value } = feedbackSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      console.log('Validation failed:', errors);
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      subject,
      message,
      rating,
      feedback_type
    } = value;

    // Manual validation (more lenient than Joi)
    if (!customer_name || customer_name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    if (!customer_email || !customer_email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!subject || subject.length < 3) {
      return res.status(400).json({ error: 'Subject must be at least 3 characters' });
    }

    if (!message || message.length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters' });
    }

    // Phone is optional, but if provided must be 10 digits
    if (customer_phone && customer_phone.length > 0) {
      if (!/^[0-9]{10}$/.test(customer_phone)) {
        return res.status(400).json({ error: 'Phone must be exactly 10 digits' });
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return res.status(400).json({ 
        error: 'Invalid email address' 
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Insert feedback
    const [result] = await promisePool.query(
      `INSERT INTO feedback 
       (customer_name, customer_email, customer_phone, subject, message, rating, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        customer_name,
        customer_email,
        customer_phone || null,
        subject,
        message,
        rating ? parseInt(rating) : null
      ]
    );

    console.log(' Feedback inserted, ID:', result.insertId);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedbackId: result.insertId
    });
        // Check if table doesn't exist
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ /*...*/ });
    }
    
    res.status(500).json({ /*...*/ });
  } catch (error) {
    console.error(error);
  }
});

// ADMIN ONLY: Get all feedback
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

    res.json(feedback);
 } catch (error) {
    console.error(' Error submitting feedback:', error);
    
    // Check if table doesn't exist
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        error: 'Feedback system not initialized. Please contact administrator.',
        code: 'TABLE_NOT_FOUND'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: error.message 
    });
  }
});

// ADMIN ONLY: Get single feedback
router.get('/:id', requireAdmin, async (req, res) => {
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

// Update feedback status (admin only)
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
    try {
    const { status } = req.body;
    const feedbackId = parseInt(req.params.id);

    if (isNaN(feedbackId) || feedbackId < 1) {
      return res.status(400).json({ error: 'Invalid feedback ID' });
    }

    const validStatuses = ['New', 'In Review', 'Resolved', 'Archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status' 
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

// Delete feedback (admin only)
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

// Get feedback statistics (admin only)
router.get('/stats/summary', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [stats] = await promisePool.query(`
      SELECT 
        CAST(COUNT(*) AS UNSIGNED) as total_feedback,
        CAST(COALESCE(AVG(rating), 0) AS DECIMAL(10,2)) as average_rating,
        CAST(SUM(CASE WHEN feedback_type = 'artwork_quality' THEN 1 ELSE 0 END) AS UNSIGNED) as artwork_feedback,
        CAST(SUM(CASE WHEN feedback_type = 'customer_service' THEN 1 ELSE 0 END) AS UNSIGNED) as service_feedback,
        CAST(SUM(CASE WHEN feedback_type = 'website_experience' THEN 1 ELSE 0 END) AS UNSIGNED) as website_feedback,
        CAST(SUM(CASE WHEN feedback_type = 'appreciation' THEN 1 ELSE 0 END) AS UNSIGNED) as appreciation_feedback,
        CAST(SUM(CASE WHEN feedback_type = 'complaint' THEN 1 ELSE 0 END) AS UNSIGNED) as complaints,
        CAST(SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS UNSIGNED) as five_star,
        CAST(SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS UNSIGNED) as four_star,
        CAST(SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS UNSIGNED) as three_star,
        CAST(SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS UNSIGNED) as two_star,
        CAST(SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS UNSIGNED) as one_star,
        CAST(SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) AS UNSIGNED) as new_feedback,
        CAST(SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS UNSIGNED) as resolved_feedback
      FROM feedback
    `);

    const result = {
      total_feedback: parseInt(stats[0].total_feedback) || 0,
      average_rating: parseFloat(stats[0].average_rating) || 0,
      artwork_feedback: parseInt(stats[0].artwork_feedback) || 0,
      service_feedback: parseInt(stats[0].service_feedback) || 0,
      website_feedback: parseInt(stats[0].website_feedback) || 0,
      appreciation_feedback: parseInt(stats[0].appreciation_feedback) || 0,
      complaints: parseInt(stats[0].complaints) || 0,
      five_star: parseInt(stats[0].five_star) || 0,
      four_star: parseInt(stats[0].four_star) || 0,
      three_star: parseInt(stats[0].three_star) || 0,
      two_star: parseInt(stats[0].two_star) || 0,
      one_star: parseInt(stats[0].one_star) || 0,
      new_feedback: parseInt(stats[0].new_feedback) || 0,
      resolved_feedback: parseInt(stats[0].resolved_feedback) || 0
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.json({
      total_feedback: 0,
      average_rating: 0,
      artwork_feedback: 0,
      service_feedback: 0,
      website_feedback: 0,
      appreciation_feedback: 0,
      complaints: 0,
      five_star: 0,
      four_star: 0,
      three_star: 0,
      two_star: 0,
      one_star: 0,
      new_feedback: 0,
      resolved_feedback: 0
    });
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

module.exports = router;