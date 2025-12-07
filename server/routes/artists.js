const express = require('express');
const router = express.Router();
const { promisePool } = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../cloudinary');


// PUBLIC: Get all artists (with optional artwork count)
router.get('/', async (req, res) => {
  try {
    const [artists] = await promisePool.query(`
      SELECT 
        a.*,
        COUNT(aw.id) as artwork_count
      FROM artists a
      LEFT JOIN artworks aw ON a.id = aw.artist_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

    res.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});


// PUBLIC: Get single artist with their artworks
router.get('/:id', async (req, res) => {
  try {
    const [artists] = await promisePool.query(
      'SELECT * FROM artists WHERE id = ?',
      [req.params.id]
    );

    if (artists.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Get artworks by this artist
    const [artworks] = await promisePool.query(`
      SELECT a.*, c.name as category_name
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.artist_id = ?
      ORDER BY a.created_at DESC
    `, [req.params.id]);

    // Format artworks with parsed photos
    const formattedArtworks = artworks.map(art => ({
      ...art,
      photos: typeof art.photos === 'string' ? JSON.parse(art.photos) : art.photos,
      category: art.category_name
    }));

    res.json({
      ...artists[0],
      artworks: formattedArtworks
    });
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ error: 'Failed to fetch artist details' });
  }
});

// ADMIN: Create new artist WITH IMAGE UPLOAD
router.post('/admin/create', requireAdmin, upload.single('profileImage'), async (req, res) => {
  try {
    const {
      name,
      location,
      style,
      bio,
      email,
      phone,
      instagram,
      facebook,
      twitter,
      website
    } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Artist name is required (min 2 characters)' });
    }

    if (email && !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check for duplicate name
    const [existing] = await promisePool.query(
      'SELECT id FROM artists WHERE name = ?',
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Artist with this name already exists' });
    }

    // Upload profile image to Cloudinary if provided
    let profile_image_url = null;
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file);
        profile_image_url = uploadResult.url;
        console.log(' Profile image uploaded:', profile_image_url);
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return res.status(500).json({ error: 'Failed to upload profile image' });
      }
    }

    // Insert artist
    const [result] = await promisePool.query(
      `INSERT INTO artists 
       (name, location, style, bio, email, phone, instagram, facebook, twitter, website, profile_image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        location?.trim() || null,
        style?.trim() || null,
        bio?.trim() || null,
        email?.trim().toLowerCase() || null,
        phone?.trim() || null,
        instagram?.trim() || null,
        facebook?.trim() || null,
        twitter?.trim() || null,
        website?.trim() || null,
        profile_image_url
      ]
    );

    res.status(201).json({
      message: 'Artist created successfully',
      id: result.insertId,
      profile_image_url: profile_image_url
    });

  } catch (error) {
    console.error('Error creating artist:', error);
    res.status(500).json({ error: 'Failed to create artist' });
  }
});

// ADMIN: Update artist WITH IMAGE UPLOAD
router.put('/admin/update/:id', requireAdmin, upload.single('profileImage'), async (req, res) => {
  try {
    const {
      name,
      location,
      style,
      bio,
      email,
      phone,
      instagram,
      facebook,
      twitter,
      website
    } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Artist name is required (min 2 characters)' });
    }

    if (email && !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if artist exists and get current image
    const [existing] = await promisePool.query(
      'SELECT id, profile_image_url FROM artists WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const currentImageUrl = existing[0].profile_image_url;

    // Check for duplicate name (excluding current artist)
    const [duplicate] = await promisePool.query(
      'SELECT id FROM artists WHERE name = ? AND id != ?',
      [name.trim(), req.params.id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({ error: 'Another artist with this name already exists' });
    }

    // Upload new profile image if provided
    let profile_image_url = currentImageUrl; // Keep existing by default
    
    if (req.file) {
      try {
        // Upload new image
        const uploadResult = await uploadToCloudinary(req.file);
        profile_image_url = uploadResult.url;
        console.log(' New profile image uploaded:', profile_image_url);

        // Delete old image from Cloudinary if it exists
        if (currentImageUrl) {
          try {
            // Extract public_id from Cloudinary URL
            const urlParts = currentImageUrl.split('/');
            const fileWithExt = urlParts[urlParts.length - 1];
            const public_id = fileWithExt.split('.')[0];
            await deleteFromCloudinary(public_id);
            console.log(' Old profile image deleted');
          } catch (deleteError) {
            console.warn('Could not delete old image:', deleteError.message);
          }
        }
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return res.status(500).json({ error: 'Failed to upload new profile image' });
      }
    }

    // Update artist
    await promisePool.query(
      `UPDATE artists SET 
       name = ?, location = ?, style = ?, bio = ?, email = ?, 
       phone = ?, instagram = ?, facebook = ?, twitter = ?, 
       website = ?, profile_image_url = ?
       WHERE id = ?`,
      [
        name.trim(),
        location?.trim() || null,
        style?.trim() || null,
        bio?.trim() || null,
        email?.trim().toLowerCase() || null,
        phone?.trim() || null,
        instagram?.trim() || null,
        facebook?.trim() || null,
        twitter?.trim() || null,
        website?.trim() || null,
        profile_image_url,
        req.params.id
      ]
    );

    res.json({ 
      message: 'Artist updated successfully',
      profile_image_url: profile_image_url
    });

  } catch (error) {
    console.error('Error updating artist:', error);
    res.status(500).json({ error: 'Failed to update artist' });
  }
});

// ADMIN: Delete artist (UPDATED to also delete image from Cloudinary)
router.delete('/admin/delete/:id', requireAdmin, async (req, res) => {
  try {
    // Check if artist exists and get image URL
    const [artists] = await promisePool.query(
      'SELECT id, profile_image_url FROM artists WHERE id = ?',
      [req.params.id]
    );

    if (artists.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const imageUrl = artists[0].profile_image_url;

    // Set artist_id to NULL in artworks (preserve artworks)
    await promisePool.query(
      'UPDATE artworks SET artist_id = NULL WHERE artist_id = ?',
      [req.params.id]
    );

    // Delete artist from database
    await promisePool.query('DELETE FROM artists WHERE id = ?', [req.params.id]);

    // Delete profile image from Cloudinary if exists
    if (imageUrl) {
      try {
        const urlParts = imageUrl.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const public_id = fileWithExt.split('.')[0];
        await deleteFromCloudinary(public_id);
        console.log('✓ Profile image deleted from Cloudinary');
      } catch (deleteError) {
        console.warn('Could not delete image from Cloudinary:', deleteError.message);
      }
    }

    res.json({ message: 'Artist deleted successfully' });

  } catch (error) {
    console.error('Error deleting artist:', error);
    res.status(500).json({ error: 'Failed to delete artist' });
  }
});

// ADMIN: Get all artists (admin view)
router.get('/admin/list', requireAdmin, async (req, res) => {
  try {
    const [artists] = await promisePool.query(`
      SELECT 
        a.*,
        COUNT(aw.id) as artwork_count
      FROM artists a
      LEFT JOIN artworks aw ON a.id = aw.artist_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

    res.json(artists);
  } catch (error) {
    console.error('Error fetching artists (admin):', error);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// ADMIN: Create new artist
router.post('/admin/create', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      location,
      style,
      bio,
      email,
      phone,
      instagram,
      facebook,
      twitter,
      website,
      profile_image_url
    } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Artist name is required (min 2 characters)' });
    }

    if (email && !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check for duplicate name
    const [existing] = await promisePool.query(
      'SELECT id FROM artists WHERE name = ?',
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Artist with this name already exists' });
    }

    // Insert artist
    const [result] = await promisePool.query(
      `INSERT INTO artists 
       (name, location, style, bio, email, phone, instagram, facebook, twitter, website, profile_image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        location?.trim() || null,
        style?.trim() || null,
        bio?.trim() || null,
        email?.trim().toLowerCase() || null,
        phone?.trim() || null,
        instagram?.trim() || null,
        facebook?.trim() || null,
        twitter?.trim() || null,
        website?.trim() || null,
        profile_image_url?.trim() || null
      ]
    );

    res.status(201).json({
      message: 'Artist created successfully',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error creating artist:', error);
    res.status(500).json({ error: 'Failed to create artist' });
  }
});

// ADMIN: Update artist
router.put('/admin/update/:id', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      location,
      style,
      bio,
      email,
      phone,
      instagram,
      facebook,
      twitter,
      website,
      profile_image_url
    } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Artist name is required (min 2 characters)' });
    }

    if (email && !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if artist exists
    const [existing] = await promisePool.query(
      'SELECT id FROM artists WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Check for duplicate name (excluding current artist)
    const [duplicate] = await promisePool.query(
      'SELECT id FROM artists WHERE name = ? AND id != ?',
      [name.trim(), req.params.id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({ error: 'Another artist with this name already exists' });
    }

    // Update artist
    await promisePool.query(
      `UPDATE artists SET 
       name = ?, location = ?, style = ?, bio = ?, email = ?, 
       phone = ?, instagram = ?, facebook = ?, twitter = ?, 
       website = ?, profile_image_url = ?
       WHERE id = ?`,
      [
        name.trim(),
        location?.trim() || null,
        style?.trim() || null,
        bio?.trim() || null,
        email?.trim().toLowerCase() || null,
        phone?.trim() || null,
        instagram?.trim() || null,
        facebook?.trim() || null,
        twitter?.trim() || null,
        website?.trim() || null,
        profile_image_url?.trim() || null,
        req.params.id
      ]
    );

    res.json({ message: 'Artist updated successfully' });

  } catch (error) {
    console.error('Error updating artist:', error);
    res.status(500).json({ error: 'Failed to update artist' });
  }
});

// ADMIN: Delete artist
router.delete('/admin/delete/:id', requireAdmin, async (req, res) => {
  try {
    // Check if artist exists
    const [artists] = await promisePool.query(
      'SELECT id FROM artists WHERE id = ?',
      [req.params.id]
    );

    if (artists.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Set artist_id to NULL in artworks (preserve artworks)
    await promisePool.query(
      'UPDATE artworks SET artist_id = NULL WHERE artist_id = ?',
      [req.params.id]
    );

    // Delete artist
    await promisePool.query('DELETE FROM artists WHERE id = ?', [req.params.id]);

    res.json({ message: 'Artist deleted successfully' });

  } catch (error) {
    console.error('Error deleting artist:', error);
    res.status(500).json({ error: 'Failed to delete artist' });
  }
});

module.exports = router;