const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');
const { verifyToken } = require('./admin');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await promisePool.query(`
      SELECT 
        c.id,
        c.name,
        c.created_at,
        COUNT(a.id) as artwork_count
      FROM categories c
      LEFT JOIN artworks a ON c.id = a.category_id
      GROUP BY c.id, c.name, c.created_at
      ORDER BY c.name ASC
    `);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const [categories] = await promisePool.query(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(categories[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists
    const [existing] = await promisePool.query(
      'SELECT id FROM categories WHERE name = ?',
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // Insert new category
    const [result] = await promisePool.query(
      'INSERT INTO categories (name) VALUES (?)',
      [name.trim()]
    );

    console.log('Category created successfully:', result.insertId);

    res.status(201).json({
      message: 'Category created successfully',
      id: result.insertId,
      name: name.trim()
    });

  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category: ' + error.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if new name already exists (excluding current category)
    const [existing] = await promisePool.query(
      'SELECT id FROM categories WHERE name = ? AND id != ?',
      [name.trim(), req.params.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    const [result] = await promisePool.query(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name.trim(), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully' });

  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if category has artworks
    const [artworks] = await promisePool.query(
      'SELECT COUNT(*) as count FROM artworks WHERE category_id = ?',
      [req.params.id]
    );

    if (artworks[0].count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. ${artworks[0].count} artwork(s) are using this category.` 
      });
    }

    const [result] = await promisePool.query(
      'DELETE FROM categories WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Get category with artwork count
router.get('/:id/stats', async (req, res) => {
  try {
    const [result] = await promisePool.query(
      `SELECT c.*, COUNT(a.id) as artwork_count
       FROM categories c
       LEFT JOIN artworks a ON c.id = a.category_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [req.params.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ error: 'Failed to fetch category statistics' });
  }
});

module.exports = router;