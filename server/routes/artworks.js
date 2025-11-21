const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../cloudinary');
const { verifyToken } = require('./admin');

// Get all artworks
router.get('/', async (req, res) => {
  try {
    const [artworks] = await promisePool.query(`
      SELECT a.*, c.name as category_name 
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC
    `);

    const formattedArtworks = artworks.map(art => ({
      ...art,
      photos: typeof art.photos === 'string' ? JSON.parse(art.photos) : art.photos,
      category: art.category_name
    }));

    res.json(formattedArtworks);
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// Get single artwork by ID
router.get('/:id', async (req, res) => {
  try {
    const [artworks] = await promisePool.query(`
      SELECT a.*, c.name as category_name 
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (artworks.length === 0) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    const artwork = {
      ...artworks[0],
      photos: typeof artworks[0].photos === 'string' ? JSON.parse(artworks[0].photos) : artworks[0].photos,
      category: artworks[0].category_name
    };

    res.json(artwork);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({ error: 'Failed to fetch artwork' });
  }
});

// Create new artwork (with image upload)
router.post('/', upload.array('photos', 10), async (req, res) => {
  try {
    const { title, description, category, medium, dimensions, year, price } = req.body;

    if (!title || !category || !price || !req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, category, price, and at least one photo' 
      });
    }

    const [categories] = await promisePool.query(
      'SELECT id FROM categories WHERE name = ?',
      [category]
    );

    if (categories.length === 0) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const category_id = categories[0].id;

    const uploadPromises = req.files.map((file, index) => 
      uploadToCloudinary(file).then(result => ({
        url: result.url,
        public_id: result.public_id,
        label: req.body[`label_${index}`] || `Photo ${index + 1}`
      }))
    );

    const photos = await Promise.all(uploadPromises);

    const [result] = await promisePool.query(
      `INSERT INTO artworks 
       (title, description, category_id, medium, dimensions, year, price, photos) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        category_id,
        medium || null,
        dimensions || null,
        year || null,
        price,
        JSON.stringify(photos)
      ]
    );

    res.status(201).json({
      message: 'Artwork created successfully',
      id: result.insertId,
      photos: photos
    });

  } catch (error) {
    console.error('Error creating artwork:', error);
    res.status(500).json({ error: 'Failed to create artwork' });
  }
});

// Delete artwork - FIXED VERSION
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    console.log('Delete request for artwork ID:', req.params.id);
    console.log('Authenticated user:', req.admin);
    
    // Get artwork to delete images from Cloudinary
    const [artworks] = await promisePool.query(
      'SELECT photos FROM artworks WHERE id = ?',
      [req.params.id]
    );

    if (artworks.length === 0) {
      console.log('Artwork not found');
      return res.status(404).json({ error: 'Artwork not found' });
    }

    console.log('Artwork found, parsing photos...');
    const photos = typeof artworks[0].photos === 'string' 
      ? JSON.parse(artworks[0].photos) 
      : artworks[0].photos;

    console.log('Photos to delete:', photos.length);

    // Try to delete images from Cloudinary
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        try {
          await deleteFromCloudinary(photo.public_id);
          console.log('Deleted image:', photo.public_id);
        } catch (imgError) {
          console.warn('Failed to delete image (continuing):', photo.public_id);
        }
      }
    }

    // Delete from database
    console.log('Deleting from database...');
    const [result] = await promisePool.query('DELETE FROM artworks WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Artwork not found in database' });
    }

    console.log('Artwork deleted successfully');
    res.json({ message: 'Artwork deleted successfully' });

  } catch (error) {
    console.error('Error deleting artwork:', error);
    res.status(500).json({ 
      error: 'Failed to delete artwork',
      details: error.message 
    });
  }
});

module.exports = router;