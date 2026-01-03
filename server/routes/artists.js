// FILE: backend/routes/artists.js
// LOCATION: Save this as backend/routes/artists.js

const express = require('express');
const router = express.Router();
const { promisePool } = require('../db'); // ✅ CRITICAL FIX
const { requireAdmin } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../cloudinary');

// ==========================================
// PUBLIC ROUTES (No authentication needed)
// ==========================================

// PUBLIC: Get all artists
router.get('/', async (req, res) => {
  try {
    console.log('📥 Fetching all artists...');
    const [artists] = await promisePool.query(`
      SELECT 
        a.*,
        COUNT(aw.id) as artwork_count
      FROM artists a
      LEFT JOIN artworks aw ON a.id = aw.artist_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);
    console.log(`✅ Found ${artists.length} artists`);
    res.json(artists);
  } catch (error) {
    console.error('❌ Error fetching artists:', error);
    res.status(500).json({ 
      error: 'Failed to fetch artists', 
      details: error.message 
    });
  }
});

// PUBLIC: Get single artist with their artworks
router.get('/:id', async (req, res) => {
  try {
    const artistId = req.params.id;
    console.log('📥 Fetching artist ID:', artistId);

    // Get artist details
    const [artists] = await promisePool.query(
      'SELECT * FROM artists WHERE id = ?',
      [artistId]
    );

    if (artists.length === 0) {
      console.log('❌ Artist not found');
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Get artist's artworks
    const [artworks] = await promisePool.query(`
      SELECT 
        a.*,
        c.name AS category_name
      FROM artworks a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.artist_id = ?
      ORDER BY a.created_at DESC
    `, [artistId]);

    // Format artworks (parse JSON photos)
    const formattedArtworks = artworks.map(art => ({
      ...art,
      photos: typeof art.photos === 'string' ? JSON.parse(art.photos) : art.photos,
      category: art.category_name
    }));

    console.log(`✅ Found artist with ${formattedArtworks.length} artworks`);
    
    res.json({
      artist: artists[0],
      artworks: formattedArtworks
    });

  } catch (error) {
    console.error('❌ Error fetching artist details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch artist details', 
      details: error.message 
    });
  }
});

// ==========================================
// ADMIN ROUTES (Authentication required)
// ==========================================

// ADMIN: Get all artists (admin view with counts)
router.get('/admin/list', requireAdmin, async (req, res) => {
  try {
    console.log('📥 Admin: Fetching all artists...');
    const [artists] = await promisePool.query(`
      SELECT 
        a.*,
        COUNT(aw.id) as artwork_count
      FROM artists a
      LEFT JOIN artworks aw ON a.id = aw.artist_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);
    console.log(`✅ Admin: Found ${artists.length} artists`);
    res.json(artists);
  } catch (error) {
    console.error('❌ Admin: Error fetching artists:', error);
    res.status(500).json({ 
      error: 'Failed to fetch artists', 
      details: error.message 
    });
  }
});

// ADMIN: Create new artist
router.post('/admin/create', requireAdmin, upload.single('profileImage'), async (req, res) => {
  console.log('========================================');
  console.log('🎨 CREATE ARTIST REQUEST');
  console.log('========================================');
  
  try {
    const {
      name, location, style, bio, email,
      phone, instagram, facebook, website
    } = req.body;

    console.log('📝 Artist name:', name);
    console.log('📁 File uploaded:', req.file ? 'YES' : 'NO');

    // ===== VALIDATION =====
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Artist name required (min 2 characters)' 
      });
    }

    if (email && !email.includes('@')) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: 'Profile image is required' 
      });
    }

    // ===== CHECK FOR DUPLICATE =====
    const [existing] = await promisePool.query(
      'SELECT id FROM artists WHERE name = ?',
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        error: 'Artist with this name already exists' 
      });
    }

    // ===== UPLOAD IMAGE TO CLOUDINARY =====
    console.log('☁️  Uploading to Cloudinary...');
    const uploadResult = await uploadToCloudinary(req.file);
    const profile_image_url = uploadResult.url;
    console.log('✅ Image uploaded:', profile_image_url);

    // ===== INSERT INTO DATABASE =====
    console.log('💾 Inserting into database...');
    const [result] = await promisePool.query(
      `INSERT INTO artists 
       (name, location, style, bio, email, phone, instagram, facebook, website, profile_image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        location?.trim() || null,
        style?.trim() || null,
        bio?.trim() || null,
        email?.trim().toLowerCase() || null,
        phone?.trim() || null,
        instagram?.trim() || null,
        facebook?.trim() || null,
        website?.trim() || null,
        profile_image_url
      ]
    );

    console.log('✅ Artist created with ID:', result.insertId);
    console.log('========================================');

    res.status(201).json({
      message: 'Artist created successfully',
      id: result.insertId,
      profile_image_url: profile_image_url
    });

  } catch (error) {
    console.error('❌ Error creating artist:', error);
    res.status(500).json({ 
      error: 'Failed to create artist',
      details: error.message
    });
  }
});

// ADMIN: Update existing artist
router.put('/admin/update/:id', requireAdmin, upload.single('profileImage'), async (req, res) => {
  try {
    console.log('🔄 Updating artist ID:', req.params.id);

    const {
      name, location, style, bio, email,
      phone, instagram, facebook, website
    } = req.body;

    // ===== VALIDATION =====
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Artist name is required' 
      });
    }

    if (email && !email.includes('@')) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // ===== CHECK ARTIST EXISTS =====
    const [existing] = await promisePool.query(
      'SELECT id, profile_image_url FROM artists WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        error: 'Artist not found' 
      });
    }

    const currentImageUrl = existing[0].profile_image_url;

    // ===== CHECK FOR DUPLICATE NAME =====
    const [duplicate] = await promisePool.query(
      'SELECT id FROM artists WHERE name = ? AND id != ?',
      [name.trim(), req.params.id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({ 
        error: 'Another artist with this name already exists' 
      });
    }

    // ===== HANDLE IMAGE UPDATE =====
    let profile_image_url = currentImageUrl;
    
    if (req.file) {
      console.log('☁️  Uploading new image...');
      const uploadResult = await uploadToCloudinary(req.file);
      profile_image_url = uploadResult.url;
      console.log('✅ New image uploaded');

      // Delete old image from Cloudinary
      if (currentImageUrl) {
        try {
          const urlParts = currentImageUrl.split('/');
          const fileWithExt = urlParts[urlParts.length - 1];
          const public_id = `chitravaani/artworks/${fileWithExt.split('.')[0]}`;
          await deleteFromCloudinary(public_id);
          console.log('🗑️  Old image deleted');
        } catch (deleteError) {
          console.warn('⚠️  Could not delete old image:', deleteError.message);
        }
      }
    }

    // ===== UPDATE DATABASE =====
    await promisePool.query(
      `UPDATE artists SET 
       name = ?, location = ?, style = ?, bio = ?, email = ?, 
       phone = ?, instagram = ?, facebook = ?, 
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
        website?.trim() || null,
        profile_image_url,
        req.params.id
      ]
    );

    console.log('✅ Artist updated successfully');
    res.json({ 
      message: 'Artist updated successfully',
      profile_image_url: profile_image_url
    });

  } catch (error) {
    console.error('❌ Error updating artist:', error);
    res.status(500).json({ 
      error: 'Failed to update artist', 
      details: error.message 
    });
  }
});

// ADMIN: Delete artist
router.delete('/admin/delete/:id', requireAdmin, async (req, res) => {
  try {
    console.log('🗑️  Deleting artist ID:', req.params.id);

    // ===== GET ARTIST DETAILS =====
    const [artists] = await promisePool.query(
      'SELECT id, name, profile_image_url FROM artists WHERE id = ?',
      [req.params.id]
    );

    if (artists.length === 0) {
      return res.status(404).json({ 
        error: 'Artist not found' 
      });
    }

    const artist = artists[0];
    const imageUrl = artist.profile_image_url;

    // ===== SET ARTIST_ID TO NULL FOR ALL ARTWORKS =====
    // This preserves artworks but removes artist association
    await promisePool.query(
      'UPDATE artworks SET artist_id = NULL WHERE artist_id = ?',
      [req.params.id]
    );

    // ===== DELETE ARTIST =====
    await promisePool.query(
      'DELETE FROM artists WHERE id = ?', 
      [req.params.id]
    );

    // ===== DELETE PROFILE IMAGE FROM CLOUDINARY =====
    if (imageUrl) {
      try {
        const urlParts = imageUrl.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const public_id = `chitravaani/artworks/${fileWithExt.split('.')[0]}`;
        await deleteFromCloudinary(public_id);
        console.log('🗑️  Profile image deleted');
      } catch (deleteError) {
        console.warn('⚠️  Could not delete image:', deleteError.message);
      }
    }

    console.log('✅ Artist deleted successfully');
    res.json({ 
      message: `Artist "${artist.name}" deleted successfully` 
    });

  } catch (error) {
    console.error('❌ Error deleting artist:', error);
    res.status(500).json({ 
      error: 'Failed to delete artist', 
      details: error.message 
    });
  }
});

module.exports = router;