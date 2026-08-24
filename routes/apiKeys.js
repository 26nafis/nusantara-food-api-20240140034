const express = require('express');
const crypto = require('crypto');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Semua endpoint di bawah ini wajib login (JWT)
router.use(verifyToken);

function generateApiKey() {
  // Format: nfa_ + 32 karakter hex acak (nfa = Nusantara Food API)
  return 'nfa_' + crypto.randomBytes(24).toString('hex');
}

/**
 * POST /api/keys
 * Body: { key_name? }
 * Membuat API key baru untuk user yang sedang login
 */
router.post('/', async (req, res) => {
  try {
    const { key_name } = req.body;
    const apiKey = generateApiKey();

    const result = await pool.query(
      `INSERT INTO api_keys (user_id, key_name, api_key) VALUES ($1, $2, $3)
       RETURNING id, key_name, api_key, is_active, rate_limit, created_at`,
      [req.user.id, key_name || 'Default Key', apiKey]
    );

    return res.status(201).json({ success: true, message: 'API key berhasil dibuat', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * GET /api/keys
 * Menampilkan seluruh API key milik user yang sedang login
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, key_name, api_key, is_active, request_count, rate_limit, last_used_at, created_at
       FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

/**
 * DELETE /api/keys/:id
 * Merevoke (menonaktifkan) API key milik sendiri
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE api_keys SET is_active = false, revoked_at = now()
       WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'API key tidak ditemukan' });
    }

    return res.json({ success: true, message: 'API key berhasil direvoke' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
