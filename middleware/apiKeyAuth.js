const pool = require('../config/db');

/**
 * Middleware untuk memverifikasi API Key pada endpoint data publik (/api/v1/...).
 * API key dikirim lewat header: x-api-key: <api_key>
 * Setiap request yang berhasil akan menaikkan request_count & last_used_at (analytics sederhana).
 */
async function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key tidak ditemukan. Sertakan header x-api-key',
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, user_id, is_active, rate_limit, request_count
       FROM api_keys WHERE api_key = $1`,
      [apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'API key tidak valid' });
    }

    const keyData = result.rows[0];

    if (!keyData.is_active) {
      return res.status(403).json({ success: false, message: 'API key sudah dinonaktifkan/direvoke' });
    }

    if (keyData.request_count >= keyData.rate_limit) {
      return res.status(429).json({
        success: false,
        message: `Batas kuota harian (${keyData.rate_limit} request) telah tercapai`,
      });
    }

    // Update statistik pemakaian (fire-and-forget, tidak menghambat response)
    pool
      .query(
        `UPDATE api_keys SET request_count = request_count + 1, last_used_at = now() WHERE id = $1`,
        [keyData.id]
      )
      .catch((e) => console.error('Gagal update statistik api_key:', e.message));

    req.apiKeyId = keyData.id;
    req.userId = keyData.user_id;
    next();
  } catch (err) {
    console.error('Error verifikasi API key:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

module.exports = { verifyApiKey };
