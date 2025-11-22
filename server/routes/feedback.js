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
router.get('/stats/summary', secureVerifyToken, async (req, res) => {
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

    // Ensure all values are numbers
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
    // Return empty stats instead of error
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
  }
});

module.exports = router;