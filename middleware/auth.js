const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi JWT pada endpoint yang membutuhkan login
 * (misalnya endpoint pengelolaan API key).
 * Header yang diharapkan: Authorization: Bearer <token>
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan. Sertakan header Authorization: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah kedaluwarsa',
    });
  }
}

module.exports = { verifyToken };
