const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');
const { sendOrderNotificationToAdmin, sendOrderConfirmationToCustomer } = require('../emailService');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let query = `
      SELECT o.*, a.title as artwork_title 
      FROM orders o
      LEFT JOIN artworks a ON o.artwork_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND o.order_type = ?';
      params.push(type);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await promisePool.query(query, params);

    // Parse order_details JSON
    const formattedOrders = orders.map(order => ({
      ...order,
      order_details: typeof order.order_details === 'string'
        ? JSON.parse(order.order_details)
        : order.order_details
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await promisePool.query(
      `SELECT o.*, a.title as artwork_title 
       FROM orders o
       LEFT JOIN artworks a ON o.artwork_id = a.id
       WHERE o.id = ?`,
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = {
      ...orders[0],
      order_details: typeof orders[0].order_details === 'string'
        ? JSON.parse(orders[0].order_details)
        : orders[0].order_details
    };

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const {
      order_type,
      artwork_id,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      order_details
    } = req.body;

    // Validate required fields
    if (!order_type || !customer_name || !customer_email || !order_details) {
      return res.status(400).json({ 
        error: 'Missing required fields: order_type, customer_name, customer_email, order_details' 
      });
    }

    // Validate email is Gmail
    if (!customer_email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ 
        error: 'Only Gmail addresses are accepted for orders' 
      });
    }

    // Insert order
    const [result] = await promisePool.query(
      `INSERT INTO orders 
       (order_type, artwork_id, customer_name, customer_email, customer_phone, 
        delivery_address, order_details, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        order_type,
        artwork_id || null,
        customer_name,
        customer_email,
        customer_phone || null,
        delivery_address || null,
        JSON.stringify(order_details)
      ]
    );

    const orderId = result.insertId;

    // Prepare order data for emails
    const orderData = {
      id: orderId,
      order_type,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      order_details
    };

    // Send emails (in background, don't wait)
    console.log(' Sending email notifications...');
    sendOrderNotificationToAdmin(orderData).catch(err => 
      console.error('Email to admin failed:', err.message)
    );
    sendOrderConfirmationToCustomer(orderData).catch(err => 
      console.error('Email to customer failed:', err.message)
    );

    res.status(201).json({
      message: 'Order created successfully',
      id: orderId
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be: Pending, Completed, or Cancelled' 
      });
    }

    const [result] = await promisePool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query(
      'DELETE FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Get order statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [stats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN order_type = 'regular' THEN 1 ELSE 0 END) as regular_orders,
        SUM(CASE WHEN order_type = 'custom' THEN 1 ELSE 0 END) as custom_orders,
        SUM(CASE WHEN order_type = 'bulk' THEN 1 ELSE 0 END) as bulk_orders,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_orders
      FROM orders
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
});

module.exports = router;