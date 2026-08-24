const express = require('express');
const pool = require('../config/db');
const { verifyApiKey } = require('../middleware/apiKeyAuth');

const router = express.Router();

// Semua route data publik wajib menyertakan API key yang valid
router.use(verifyApiKey);

/**
 * GET /api/v1/categories
 */
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    return res.json({ success: true, total: result.rows.length, data: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * GET /api/v1/regions
 * Daftar daerah/provinsi unik yang tersedia
 */
router.get('/regions', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT region FROM foods ORDER BY region');
    return res.json({ success: true, total: result.rows.length, data: result.rows.map((r) => r.region) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * GET /api/v1/foods
 * Query param opsional: category, region, spicy_level, halal, page, limit, search
 */
router.get('/foods', async (req, res) => {
  try {
    const { category, region, spicy_level, halal, search, page = 1, limit = 10 } = req.query;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (category) {
      conditions.push(`c.name ILIKE $${idx++}`);
      values.push(category);
    }
    if (region) {
      conditions.push(`f.region ILIKE $${idx++}`);
      values.push(`%${region}%`);
    }
    if (spicy_level !== undefined) {
      conditions.push(`f.spicy_level = $${idx++}`);
      values.push(Number(spicy_level));
    }
    if (halal !== undefined) {
      conditions.push(`f.is_halal = $${idx++}`);
      values.push(halal === 'true');
    }
    if (search) {
      conditions.push(`f.name ILIKE $${idx++}`);
      values.push(`%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitNum = Math.min(Number(limit) || 10, 50);
    const offset = (Math.max(Number(page), 1) - 1) * limitNum;

    const countQuery = `SELECT COUNT(*) FROM foods f JOIN categories c ON f.category_id = c.id ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = Number(countResult.rows[0].count);

    const dataQuery = `
      SELECT f.id, f.name, c.name AS category, f.region, f.description,
             f.main_ingredients, f.calories_kcal, f.spicy_level, f.price_range,
             f.is_halal, f.created_at
      FROM foods f
      JOIN categories c ON f.category_id = c.id
      ${whereClause}
      ORDER BY f.id
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    const dataResult = await pool.query(dataQuery, [...values, limitNum, offset]);

    return res.json({
      success: true,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
      data: dataResult.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * GET /api/v1/foods/:id
 */
router.get('/foods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT f.id, f.name, c.name AS category, f.region, f.description,
              f.main_ingredients, f.calories_kcal, f.spicy_level, f.price_range,
              f.is_halal, f.created_at
       FROM foods f JOIN categories c ON f.category_id = c.id
       WHERE f.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data kuliner tidak ditemukan' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * GET /api/v1/stats
 * Statistik agregat sederhana (menunjukkan kompleksitas data)
 */
router.get('/stats', async (req, res) => {
  try {
    const totalFoods = await pool.query('SELECT COUNT(*) FROM foods');
    const byCategory = await pool.query(`
      SELECT c.name AS category, COUNT(f.id) AS total
      FROM categories c LEFT JOIN foods f ON f.category_id = c.id
      GROUP BY c.name ORDER BY total DESC
    `);
    const byRegion = await pool.query(`
      SELECT region, COUNT(*) AS total FROM foods GROUP BY region ORDER BY total DESC LIMIT 10
    `);
    const avgCalories = await pool.query('SELECT ROUND(AVG(calories_kcal)) AS avg_calories FROM foods');

    return res.json({
      success: true,
      data: {
        total_foods: Number(totalFoods.rows[0].count),
        average_calories: Number(avgCalories.rows[0].avg_calories),
        by_category: byCategory.rows,
        top_regions: byRegion.rows,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
