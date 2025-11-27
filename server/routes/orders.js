const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// PUBLIC: Create new order - RELAXED VALIDATION
router.post('/', async (req, res) => {
  try {
    console.log('📥 Order submission received:', req.body);

    const {
      order_type,
      artwork_id,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      order_details
    } = req.body;

    // Basic validation only
    if (!order_type || !['regular', 'custom', 'bulk'].includes(order_type)) {
      return res.status(400).json({ error: 'Invalid order type. Must be: regular, custom, or bulk' });
    }

    if (!customer_name || customer_name.trim().length < 2) {
      return res.status(400).json({ error: 'Customer name must be at least 2 characters' });
    }

    if (!customer_email || !customer_email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!customer_phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Clean phone number
    const cleanPhone = customer_phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Phone must be exactly 10 digits' });
    }

    // Order type specific validation
    if (order_type === 'regular' && !artwork_id) {
      return res.status(400).json({ error: 'Artwork ID is required for regular orders' });
    }

    if (order_type === 'custom' && (!order_details || !order_details.idea)) {
      return res.status(400).json({ error: 'Custom order idea is required' });
    }

    if (order_type === 'bulk' && (!order_details || !order_details.orgName || !order_details.itemType || !order_details.quantity)) {
      return res.status(400).json({ error: 'Bulk orders require: organization name, item type, and quantity' });
    }

    console.log('✅ Validation passed, inserting order...');

    // Insert order
    const [result] = await promisePool.query(
      `INSERT INTO orders 
       (order_type, artwork_id, customer_name, customer_email, customer_phone, 
        delivery_address, order_details, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        order_type,
        artwork_id || null,
        customer_name.trim(),
        customer_email.trim().toLowerCase(),
        cleanPhone,
        delivery_address?.trim() || null,
        JSON.stringify(order_details || {})
      ]
    );

    console.log('✅ Order inserted successfully, ID:', result.insertId);

    res.status(201).json({
      message: 'Order created successfully',
      orderId: result.insertId
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        error: 'Orders table not found. Please run database setup.',
        code: 'TABLE_NOT_FOUND'
      });
    }

    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ 
        error: 'Database schema mismatch. Please check orders table structure.',
        code: 'SCHEMA_ERROR'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ADMIN ONLY: Get all orders
router.get('/', requireAdmin, async (req, res) => {
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

// ADMIN ONLY: Get single order
router.get('/:id', requireAdmin, async (req, res) => {
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

// ADMIN ONLY: Update order status
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be: Pending, Completed, or Cancelled' 
      });
    }

    const [result] = await promisePool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
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

// ADMIN ONLY: Delete order
router.delete('/:id', requireAdmin, async (req, res) => {
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

// ADMIN ONLY: Get order statistics
router.get('/stats/summary', requireAdmin, async (req, res) => {
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