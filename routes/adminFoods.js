const express = require('express');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Semua endpoint admin di bawah ini wajib login (JWT)
router.use(verifyToken);

/**
 * POST /api/admin/foods
 * Menambahkan data kuliner baru
 * Body: {
 *   name, category (nama kategori), region, description,
 *   main_ingredients (array), calories_kcal, spicy_level,
 *   price_range, is_halal
 * }
 */
router.post('/foods', async (req, res) => {
  try {
    const {
      name,
      category,
      region,
      description,
      main_ingredients,
      calories_kcal,
      spicy_level,
      price_range,
      is_halal,
    } = req.body;

    if (!name || !category || !region) {
      return res.status(400).json({
        success: false,
        message: 'Field name, category, dan region wajib diisi',
      });
    }

    // Cari category_id berdasarkan nama kategori
    const catResult = await pool.query('SELECT id FROM categories WHERE name = $1', [category]);
    if (catResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Kategori "${category}" tidak ditemukan. Cek daftar kategori yang tersedia di GET /api/v1/categories`,
      });
    }
    const categoryId = catResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO foods (name, category_id, region, description, main_ingredients, calories_kcal, spicy_level, price_range, is_halal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        categoryId,
        region,
        description || `${name} adalah hidangan khas ${region}.`,
        main_ingredients || [],
        calories_kcal || null,
        spicy_level || 0,
        price_range || null,
        is_halal !== undefined ? is_halal : true,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Data kuliner berhasil ditambahkan',
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * PUT /api/admin/foods/:id
 * Mengubah data kuliner
 */
router.put('/foods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, category, region, description,
      main_ingredients, calories_kcal, spicy_level, price_range, is_halal,
    } = req.body;

    let categoryId;
    if (category) {
      const catResult = await pool.query('SELECT id FROM categories WHERE name = $1', [category]);
      if (catResult.rows.length === 0) {
        return res.status(400).json({ success: false, message: `Kategori "${category}" tidak ditemukan` });
      }
      categoryId = catResult.rows[0].id;
    }

    const existing = await pool.query('SELECT * FROM foods WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data kuliner tidak ditemukan' });
    }
    const current = existing.rows[0];

    const result = await pool.query(
      `UPDATE foods SET
        name = $1, category_id = $2, region = $3, description = $4,
        main_ingredients = $5, calories_kcal = $6, spicy_level = $7,
        price_range = $8, is_halal = $9
       WHERE id = $10 RETURNING *`,
      [
        name ?? current.name,
        categoryId ?? current.category_id,
        region ?? current.region,
        description ?? current.description,
        main_ingredients ?? current.main_ingredients,
        calories_kcal ?? current.calories_kcal,
        spicy_level ?? current.spicy_level,
        price_range ?? current.price_range,
        is_halal !== undefined ? is_halal : current.is_halal,
        id,
      ]
    );

    return res.json({ success: true, message: 'Data kuliner berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * DELETE /api/admin/foods/:id
 * Menghapus data kuliner
 */
router.delete('/foods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM foods WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data kuliner tidak ditemukan' });
    }

    return res.json({ success: true, message: 'Data kuliner berhasil dihapus' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;