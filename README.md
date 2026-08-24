# 🍛 Nusantara Food API

SaaS API yang menyediakan **data kuliner tradisional Indonesia** (57 data, 8 kategori, tersebar di berbagai provinsi) kepada developer lain melalui **API Key**, mirip konsep OpenRouter/WeatherAPI. Dilengkapi sistem autentikasi **JWT** untuk mengelola akun & API key sendiri.

---

## ✨ Fitur

- Registrasi & Login menggunakan **JWT**
- Dashboard API Key: generate, list, revoke API key sendiri
- Endpoint data publik dilindungi **API Key** (`x-api-key`)
- Kuota request per API key (rate limiting per key) + rate limiting global anti-abuse
- Data kuliner Nusantara: nama, kategori, daerah asal, bahan utama, kalori, level pedas, kisaran harga, status halal
- Filter, pencarian, dan pagination pada endpoint data
- Endpoint statistik agregat (`/api/v1/stats`)
- Siap deploy ke **Vercel** (serverless) dengan database **PostgreSQL/Supabase**

## 🧱 Tech Stack

| Layer     | Teknologi                     |
|-----------|--------------------------------|
| Backend   | Express.js (Node.js)          |
| Database  | PostgreSQL (Supabase)         |
| Auth      | JSON Web Token (JWT), bcrypt  |
| Hosting   | Vercel                        |

## 🗄️ Struktur Database (4 Tabel)

1. **users** — akun developer yang login via JWT
2. **api_keys** — API key milik user (relasi ke `users`)
3. **categories** — kategori kuliner (Makanan Berat, Jajanan Pasar, dst)
4. **foods** — data utama kuliner (relasi ke `categories`), **57 baris data**

Lihat `db/schema.sql` untuk DDL lengkap dan `docs/` untuk diagram ERD.

## 📁 Struktur Folder

```
nusantara-food-api/
├── config/
│   └── db.js                # koneksi pool PostgreSQL
├── middleware/
│   ├── auth.js               # verifikasi JWT
│   └── apiKeyAuth.js         # verifikasi API key
├── routes/
│   ├── auth.js                # register & login
│   ├── apiKeys.js             # CRUD API key (JWT protected)
│   └── data.js                 # endpoint data publik (API key protected)
├── db/
│   ├── schema.sql             # DDL 4 tabel
│   └── seed.js                # seed 57 data kuliner
├── server.js                  # entry point Express
├── vercel.json                # konfigurasi deploy Vercel
├── package.json
├── .env.example
└── README.md
```

## 🚀 Menjalankan di Lokal

### 1. Clone & install dependencies
```bash
git clone https://github.com/USERNAME/nusantara-food-api.git
cd nusantara-food-api
npm install
```

### 2. Buat project Supabase
1. Buka https://supabase.com → **New Project**
2. Buka **Project Settings → Database → Connection String (URI)**
3. Salin connection string tersebut

### 3. Konfigurasi environment
```bash
cp .env.example .env
```
Isi `.env`:
```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres
JWT_SECRET=isi_dengan_string_acak_panjang
JWT_EXPIRES_IN=1d
PORT=3000
```

### 4. Buat tabel di database
Buka **Supabase → SQL Editor**, tempel isi `db/schema.sql`, lalu **Run**.
Atau via psql:
```bash
psql "$DATABASE_URL" -f db/schema.sql
```

### 5. Seed 57 data kuliner
```bash
npm run seed
```

### 6. Jalankan server
```bash
npm run dev     # mode development (nodemon)
# atau
npm start        # mode production
```
Server berjalan di `http://localhost:3000`

## 📡 Dokumentasi Endpoint

### Autentikasi (publik)

**POST `/api/auth/register`**
```json
{ "name": "Budi", "email": "budi@mail.com", "password": "rahasia123" }
```

**POST `/api/auth/login`**
```json
{ "email": "budi@mail.com", "password": "rahasia123" }
```
Response berisi `token` (JWT) yang dipakai untuk endpoint API Key.

### Manajemen API Key (butuh JWT — header `Authorization: Bearer <token>`)

| Method | Endpoint         | Deskripsi                    |
|--------|------------------|-------------------------------|
| POST   | `/api/keys`      | Membuat API key baru          |
| GET    | `/api/keys`      | Melihat semua API key milik user |
| DELETE | `/api/keys/:id`  | Merevoke (menonaktifkan) API key |

Contoh:
```bash
curl -X POST http://localhost:3000/api/keys \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"key_name": "Key Produksi"}'
```

### Data Publik (butuh API Key — header `x-api-key`)

| Method | Endpoint                | Deskripsi                                  |
|--------|--------------------------|----------------------------------------------|
| GET    | `/api/v1/categories`    | Daftar kategori kuliner                      |
| GET    | `/api/v1/regions`       | Daftar daerah/provinsi asal kuliner           |
| GET    | `/api/v1/foods`         | Daftar kuliner (filter, search, pagination)   |
| GET    | `/api/v1/foods/:id`     | Detail satu data kuliner                      |
| GET    | `/api/v1/stats`         | Statistik agregat (total, rata kalori, dll)   |

Query parameter `GET /api/v1/foods`:
- `category` — filter nama kategori, contoh `Makanan Berat`
- `region` — filter daerah (partial match), contoh `Jawa`
- `spicy_level` — filter level pedas (0-5)
- `halal` — `true`/`false`
- `search` — cari berdasarkan nama makanan
- `page`, `limit` — pagination (default page=1, limit=10, max limit=50)

Contoh:
```bash
curl "http://localhost:3000/api/v1/foods?region=Jawa&spicy_level=0&limit=5" \
  -H "x-api-key: nfa_xxxxxxxxxxxxxxxxxxxx"
```

Contoh response:
```json
{
  "success": true,
  "pagination": { "page": 1, "limit": 5, "total": 12, "total_pages": 3 },
  "data": [
    {
      "id": 8,
      "name": "Gudeg",
      "category": "Makanan Berat",
      "region": "DI Yogyakarta",
      "description": "Gudeg adalah hidangan khas DI Yogyakarta.",
      "main_ingredients": ["nangka muda", "santan", "gula merah"],
      "calories_kcal": 320,
      "spicy_level": 0,
      "price_range": "Rp15.000 - Rp30.000",
      "is_halal": true,
      "created_at": "2026-08-24T10:00:00.000Z"
    }
  ]
}
```

## ☁️ Deploy ke Vercel

### Via Dashboard Vercel
1. Push project ke GitHub (lihat langkah di bawah)
2. Buka https://vercel.com → **Add New → Project**
3. Import repository GitHub `nusantara-food-api`
4. Pada bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
5. Klik **Deploy**
6. Setelah selesai, Vercel memberi URL seperti `https://nusantara-food-api.vercel.app`

### Via Vercel CLI (alternatif)
```bash
npm i -g vercel
vercel login
vercel            # deploy preview
vercel --prod     # deploy production
```
Saat proses `vercel`, isi environment variable ketika diminta, atau set lewat:
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add JWT_EXPIRES_IN
```

## 📤 Push ke GitHub

```bash
cd nusantara-food-api
git init
git add .
git commit -m "Initial commit: Nusantara Food API"
git branch -M main
git remote add origin https://github.com/USERNAME/nusantara-food-api.git
git push -u origin main
```

## 🧪 Testing Cepat dengan cURL (End-to-End)

```bash
BASE=https://nusantara-food-api.vercel.app

# 1. Register
curl -X POST $BASE/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Tester","email":"tester@mail.com","password":"password123"}'

# 2. Login -> ambil token
TOKEN=$(curl -s -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"tester@mail.com","password":"password123"}' | jq -r '.data.token')

# 3. Buat API key
APIKEY=$(curl -s -X POST $BASE/api/keys -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"key_name":"Test Key"}' | jq -r '.data.api_key')

# 4. Akses data publik dengan API key
curl -s "$BASE/api/v1/foods?limit=5" -H "x-api-key: $APIKEY"
```

## 📄 Lisensi
MIT
