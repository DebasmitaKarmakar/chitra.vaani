const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const jwt = require('jsonwebtoken');
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

// Create new feedback - NO EMAIL, JUST SAVE
router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      feedback_type,
      rating,
      message
    } = req.body;

    // Validate required fields
    if (!customer_name || !customer_email || !feedback_type || !rating || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Basic email validation (allow any email, not just Gmail)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return res.status(400).json({ 
        error: 'Invalid email address' 
      });
    }

    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Validate message length
    if (message.length > 1000) {
      return res.status(400).json({ 
        error: 'Message must be 1000 characters or less' 
      });
    }

    // Insert feedback - simple save to database
    const [result] = await promisePool.query(
      `INSERT INTO feedback 
       (customer_name, customer_email, feedback_type, rating, message, status) 
       VALUES (?, ?, ?, ?, ?, 'New')`,
      [customer_name, customer_email, feedback_type, rating, message]
    );

    console.log('✅ Feedback saved successfully:', result.insertId);

    res.status(201).json({
      message: 'Feedback submitted successfully! Thank you for your input.',
      id: result.insertId
    });

  } catch (error) {
    console.error('❌ Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback. Please try again.' });
  }
});

// Update feedback status (admin only)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['New', 'In Review', 'Resolved', 'Archived'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be: New, In Review, Resolved, or Archived' 
      });
    }

    const [result] = await promisePool.query(
      'UPDATE feedback SET status = ? WHERE id = ?',
      [status, req.params.id]
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
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await promisePool.query(
      'DELETE FROM feedback WHERE id = ?',
      [req.params.id]
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
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const [stats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(rating) as average_rating,
        SUM(CASE WHEN feedback_type = 'artwork_quality' THEN 1 ELSE 0 END) as artwork_feedback,
        SUM(CASE WHEN feedback_type = 'customer_service' THEN 1 ELSE 0 END) as service_feedback,
        SUM(CASE WHEN feedback_type = 'website_experience' THEN 1 ELSE 0 END) as website_feedback,
        SUM(CASE WHEN feedback_type = 'appreciation' THEN 1 ELSE 0 END) as appreciation_feedback,
        SUM(CASE WHEN feedback_type = 'complaint' THEN 1 ELSE 0 END) as complaints,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star,
        SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) as new_feedback,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_feedback
      FROM feedback
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ error: 'Failed to fetch feedback statistics' });
  }
});

module.exports = router;