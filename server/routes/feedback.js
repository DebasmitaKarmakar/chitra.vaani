const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');
const { sendFeedbackNotificationToAdmin } = require('../emailService');

// Get all feedback (admin only)
router.get('/', async (req, res) => {
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

// Create new feedback
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
        error: 'Missing required fields: customer_name, customer_email, feedback_type, rating, message' 
      });
    }

    // Validate email is Gmail
    if (!customer_email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ 
        error: 'Only Gmail addresses are accepted' 
      });
    }

    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Validate message length
    if (message.length > 500) {
      return res.status(400).json({ 
        error: 'Message must be 500 characters or less' 
      });
    }

    // Insert feedback
    const [result] = await promisePool.query(
      `INSERT INTO feedback 
       (customer_name, customer_email, feedback_type, rating, message, status) 
       VALUES (?, ?, ?, ?, ?, 'New')`,
      [customer_name, customer_email, feedback_type, rating, message]
    );

    const feedbackId = result.insertId;

    // Prepare feedback data for email
    const feedbackData = {
      id: feedbackId,
      customer_name,
      customer_email,
      feedback_type,
      rating,
      message
    };

    // Send email notification (in background, don't wait)
    console.log(' Sending feedback notification to admin...');
    sendFeedbackNotificationToAdmin(feedbackData).catch(err => 
      console.error('Email notification failed:', err.message)
    );

    res.status(201).json({
      message: 'Feedback submitted successfully',
      id: feedbackId
    });

  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Update feedback status (admin only)
router.patch('/:id/status', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

// Get feedback statistics
router.get('/stats/summary', async (req, res) => {
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