-- =====================================================================
-- SKEMA DATABASE: Nusantara Food API (SaaS)
-- Jalankan file ini di Supabase SQL Editor atau psql
-- =====================================================================

-- Ekstensi untuk generate UUID (Supabase biasanya sudah aktif)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- TABEL 1: users
-- Menyimpan akun developer/pengguna yang login via JWT untuk mengelola API key
-- =====================================================================
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    plan          VARCHAR(20) NOT NULL DEFAULT 'free',   -- free | pro | enterprise
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- TABEL 2: api_keys
-- Menyimpan API key milik user, dipakai untuk mengakses endpoint data publik
-- =====================================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_name       VARCHAR(100) NOT NULL DEFAULT 'Default Key',
    api_key        VARCHAR(64) UNIQUE NOT NULL,
    is_active      BOOLEAN NOT NULL DEFAULT true,
    request_count  INTEGER NOT NULL DEFAULT 0,
    rate_limit     INTEGER NOT NULL DEFAULT 1000,        -- limit request per hari
    last_used_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);

-- =====================================================================
-- TABEL 3: categories
-- Kategori kuliner (Makanan Berat, Jajanan Pasar, Minuman, dst)
-- =====================================================================
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- =====================================================================
-- TABEL 4: foods
-- Data utama yang "dijual" lewat API (>= 50 baris data kuliner Nusantara)
-- =====================================================================
CREATE TABLE IF NOT EXISTS foods (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(120) NOT NULL,
    category_id       INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    region            VARCHAR(80) NOT NULL,          -- asal daerah/provinsi
    description       TEXT,
    main_ingredients  TEXT[],                        -- array bahan utama
    calories_kcal     INTEGER,                       -- estimasi kalori per porsi
    spicy_level       SMALLINT DEFAULT 0 CHECK (spicy_level BETWEEN 0 AND 5),
    price_range       VARCHAR(30),                   -- contoh: "Rp10.000 - Rp25.000"
    is_halal          BOOLEAN DEFAULT true,
    image_url         TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category_id);
CREATE INDEX IF NOT EXISTS idx_foods_region ON foods(region);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);

-- =====================================================================
-- Trigger sederhana untuk auto-update updated_at pada users
-- =====================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
