require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const apiKeyRoutes = require('./routes/apiKeys');
const dataRoutes = require('./routes/data');

const app = express();

// ------------------- Global middleware -------------------
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiter global dasar (anti brute force / abuse), terpisah dari kuota per API key
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak request, coba lagi nanti' },
});
app.use(globalLimiter);

// ------------------- Routes -------------------
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Selamat datang di Nusantara Food API',
    docs: 'Lihat README.md untuk dokumentasi lengkap endpoint',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login'],
      api_keys: ['POST /api/keys (JWT)', 'GET /api/keys (JWT)', 'DELETE /api/keys/:id (JWT)'],
      public_data: [
        'GET /api/v1/categories (x-api-key)',
        'GET /api/v1/regions (x-api-key)',
        'GET /api/v1/foods (x-api-key)',
        'GET /api/v1/foods/:id (x-api-key)',
        'GET /api/v1/stats (x-api-key)',
      ],
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/v1', dataRoutes);

// ------------------- 404 handler -------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// ------------------- Error handler -------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
});

const PORT = process.env.PORT || 3000;

// Vercel menjalankan app sebagai serverless function (lihat vercel.json),
// jadi app.listen hanya dijalankan saat run lokal (bukan di lingkungan Vercel).
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
