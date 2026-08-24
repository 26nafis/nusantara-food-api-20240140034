/**
 * Seed database dengan data kategori & minimal 50 data kuliner Nusantara.
 * Jalankan dengan: npm run seed
 */
require('dotenv').config();
const pool = require('../config/db');

const categories = [
  { name: 'Makanan Berat', description: 'Hidangan utama / makanan pokok' },
  { name: 'Jajanan Pasar', description: 'Kudapan tradisional khas pasar' },
  { name: 'Kue Tradisional', description: 'Kue basah maupun kering khas daerah' },
  { name: 'Minuman Tradisional', description: 'Minuman khas Nusantara' },
  { name: 'Sup & Soto', description: 'Hidangan berkuah' },
  { name: 'Sambal & Pelengkap', description: 'Sambal dan makanan pendamping' },
  { name: 'Makanan Laut', description: 'Olahan hasil laut khas daerah' },
  { name: 'Camilan', description: 'Camilan/snack ringan tradisional' },
];

// 55 data kuliner Nusantara (nama, kategori, daerah asal, bahan utama, estimasi kalori,
// tingkat pedas 0-5, kisaran harga, halal)
const foods = [
  ['Rendang', 'Makanan Berat', 'Sumatera Barat', ['daging sapi', 'santan', 'cabai', 'bumbu rendang'], 468, 3, 'Rp25.000 - Rp45.000', true],
  ['Sate Padang', 'Makanan Berat', 'Sumatera Barat', ['daging sapi', 'lidah sapi', 'kuah kuning kental'], 350, 3, 'Rp20.000 - Rp30.000', true],
  ['Gulai Ikan', 'Makanan Berat', 'Sumatera Barat', ['ikan', 'santan', 'bumbu gulai'], 300, 2, 'Rp18.000 - Rp30.000', true],
  ['Nasi Goreng', 'Makanan Berat', 'DKI Jakarta', ['nasi', 'kecap manis', 'telur', 'bawang'], 350, 1, 'Rp15.000 - Rp30.000', true],
  ['Kerak Telor', 'Jajanan Pasar', 'DKI Jakarta', ['beras ketan', 'telur bebek', 'ebi', 'kelapa sangrai'], 400, 1, 'Rp15.000 - Rp25.000', true],
  ['Soto Betawi', 'Sup & Soto', 'DKI Jakarta', ['daging sapi', 'jeroan', 'santan', 'susu'], 420, 1, 'Rp20.000 - Rp35.000', true],
  ['Gado-Gado', 'Makanan Berat', 'DKI Jakarta', ['sayuran rebus', 'bumbu kacang', 'lontong'], 280, 1, 'Rp15.000 - Rp25.000', true],
  ['Gudeg', 'Makanan Berat', 'DI Yogyakarta', ['nangka muda', 'santan', 'gula merah'], 320, 0, 'Rp15.000 - Rp30.000', true],
  ['Bakpia', 'Kue Tradisional', 'DI Yogyakarta', ['kacang hijau', 'tepung terigu', 'gula'], 180, 0, 'Rp25.000 - Rp40.000 / kotak', true],
  ['Sate Klathak', 'Makanan Berat', 'DI Yogyakarta', ['daging kambing muda', 'garam', 'merica'], 400, 1, 'Rp25.000 - Rp35.000', true],
  ['Rawon', 'Sup & Soto', 'Jawa Timur', ['daging sapi', 'kluwek', 'kecambah'], 400, 2, 'Rp20.000 - Rp35.000', true],
  ['Rujak Cingur', 'Makanan Berat', 'Jawa Timur', ['cingur sapi', 'sayuran', 'bumbu petis'], 350, 2, 'Rp18.000 - Rp28.000', true],
  ['Lontong Balap', 'Makanan Berat', 'Jawa Timur', ['lontong', 'tauge', 'tahu', 'lentho'], 300, 1, 'Rp12.000 - Rp20.000', true],
  ['Bakso Malang', 'Sup & Soto', 'Jawa Timur', ['daging sapi giling', 'tepung tapioka', 'pangsit'], 350, 1, 'Rp15.000 - Rp25.000', true],
  ['Pempek', 'Makanan Berat', 'Sumatera Selatan', ['ikan tenggiri', 'tepung sagu', 'cuka kuah'], 300, 2, 'Rp15.000 - Rp30.000', true],
  ['Tekwan', 'Sup & Soto', 'Sumatera Selatan', ['ikan tenggiri', 'bihun', 'jamur kuping'], 250, 0, 'Rp15.000 - Rp25.000', true],
  ['Mie Aceh', 'Makanan Berat', 'Aceh', ['mie kuning', 'daging sapi/udang', 'bumbu rempah'], 450, 3, 'Rp18.000 - Rp30.000', true],
  ['Sate Matang', 'Makanan Berat', 'Aceh', ['daging sapi/kambing', 'kuah soto'], 380, 2, 'Rp20.000 - Rp30.000', true],
  ['Bika Ambon', 'Kue Tradisional', 'Sumatera Utara', ['tepung sagu', 'telur', 'santan', 'gula'], 250, 0, 'Rp30.000 - Rp60.000 / loyang', true],
  ['Saksang', 'Makanan Berat', 'Sumatera Utara', ['daging babi/kerbau', 'darah', 'bumbu andaliman'], 420, 2, 'Rp25.000 - Rp40.000', false],
  ['Es Doger', 'Minuman Tradisional', 'Jawa Barat', ['es serut', 'santan', 'ketan hitam', 'tape'], 220, 0, 'Rp8.000 - Rp15.000', true],
  ['Karedok', 'Makanan Berat', 'Jawa Barat', ['sayuran mentah', 'bumbu kacang'], 200, 1, 'Rp12.000 - Rp20.000', true],
  ['Batagor', 'Jajanan Pasar', 'Jawa Barat', ['tahu', 'pangsit goreng', 'bumbu kacang'], 300, 1, 'Rp12.000 - Rp20.000', true],
  ['Peuyeum', 'Camilan', 'Jawa Barat', ['singkong fermentasi'], 150, 0, 'Rp8.000 - Rp15.000', true],
  ['Coto Makassar', 'Sup & Soto', 'Sulawesi Selatan', ['daging & jeroan sapi', 'kacang tanah', 'rempah'], 400, 1, 'Rp20.000 - Rp30.000', true],
  ['Konro', 'Sup & Soto', 'Sulawesi Selatan', ['iga sapi', 'kluwek', 'rempah'], 450, 2, 'Rp25.000 - Rp40.000', true],
  ['Pisang Epe', 'Camilan', 'Sulawesi Selatan', ['pisang kepok', 'gula merah cair'], 200, 0, 'Rp10.000 - Rp18.000', true],
  ['Papeda', 'Makanan Berat', 'Papua', ['sagu', 'ikan kuah kuning'], 250, 1, 'Rp20.000 - Rp35.000', true],
  ['Ikan Bakar Manokwari', 'Makanan Laut', 'Papua Barat', ['ikan laut', 'sambal khas'], 320, 3, 'Rp30.000 - Rp50.000', true],
  ['Ayam Betutu', 'Makanan Berat', 'Bali', ['ayam utuh', 'bumbu genep'], 400, 3, 'Rp35.000 - Rp60.000', true],
  ['Lawar', 'Makanan Berat', 'Bali', ['sayur nangka muda', 'kelapa parut', 'daging cincang'], 300, 2, 'Rp15.000 - Rp25.000', true],
  ['Sate Lilit', 'Makanan Berat', 'Bali', ['ikan cincang', 'kelapa parut', 'serai'], 250, 2, 'Rp20.000 - Rp30.000', true],
  ['Ayam Taliwang', 'Makanan Berat', 'Nusa Tenggara Barat', ['ayam kampung', 'cabai rawit', 'terasi'], 380, 4, 'Rp25.000 - Rp40.000', true],
  ['Sate Rembiga', 'Makanan Berat', 'Nusa Tenggara Barat', ['daging sapi', 'bumbu pedas manis'], 350, 3, 'Rp20.000 - Rp30.000', true],
  ['Se\'i Sapi', 'Makanan Berat', 'Nusa Tenggara Timur', ['daging sapi asap', 'kayu kosambi'], 400, 1, 'Rp30.000 - Rp50.000', true],
  ['Es Pisang Ijo', 'Minuman Tradisional', 'Sulawesi Selatan', ['pisang', 'tepung beras hijau', 'sirup', 'santan'], 280, 0, 'Rp12.000 - Rp20.000', true],
  ['Klepon', 'Kue Tradisional', 'Jawa Tengah', ['tepung ketan', 'gula merah', 'kelapa parut'], 150, 0, 'Rp5.000 - Rp12.000', true],
  ['Lumpia Semarang', 'Jajanan Pasar', 'Jawa Tengah', ['rebung', 'telur', 'udang/daging'], 250, 0, 'Rp10.000 - Rp20.000', true],
  ['Nasi Liwet', 'Makanan Berat', 'Jawa Tengah', ['beras', 'santan', 'ayam suwir', 'labu siam'], 350, 0, 'Rp15.000 - Rp25.000', true],
  ['Wedang Ronde', 'Minuman Tradisional', 'Jawa Tengah', ['tepung ketan', 'jahe', 'kacang tanah'], 200, 0, 'Rp8.000 - Rp15.000', true],
  ['Es Cendol', 'Minuman Tradisional', 'Jawa Barat', ['tepung beras', 'santan', 'gula merah'], 250, 0, 'Rp8.000 - Rp15.000', true],
  ['Serabi', 'Kue Tradisional', 'Jawa Barat', ['tepung beras', 'santan', 'gula merah'], 180, 0, 'Rp5.000 - Rp15.000', true],
  ['Empek-empek Kapal Selam', 'Makanan Berat', 'Sumatera Selatan', ['ikan tenggiri', 'telur', 'sagu'], 350, 2, 'Rp15.000 - Rp25.000', true],
  ['Mie Celor', 'Makanan Berat', 'Sumatera Selatan', ['mie kuning', 'kuah santan udang'], 380, 1, 'Rp18.000 - Rp28.000', true],
  ['Ketoprak', 'Makanan Berat', 'DKI Jakarta', ['ketupat', 'tahu', 'bihun', 'bumbu kacang'], 300, 1, 'Rp12.000 - Rp20.000', true],
  ['Asinan Betawi', 'Camilan', 'DKI Jakarta', ['sayuran', 'kuah asam pedas', 'kerupuk mie'], 150, 2, 'Rp10.000 - Rp18.000', true],
  ['Sambal Bajak', 'Sambal & Pelengkap', 'Jawa Tengah', ['cabai merah', 'terasi', 'tomat'], 60, 4, 'Rp5.000 - Rp10.000', true],
  ['Sambal Matah', 'Sambal & Pelengkap', 'Bali', ['bawang merah', 'serai', 'cabai rawit', 'minyak kelapa'], 50, 3, 'Rp5.000 - Rp10.000', true],
  ['Sambal Dabu-Dabu', 'Sambal & Pelengkap', 'Sulawesi Utara', ['tomat', 'cabai rawit', 'jeruk nipis'], 40, 3, 'Rp5.000 - Rp10.000', true],
  ['Tinutuan (Bubur Manado)', 'Makanan Berat', 'Sulawesi Utara', ['labu kuning', 'jagung', 'sayuran', 'beras'], 200, 0, 'Rp10.000 - Rp18.000', true],
  ['Cakalang Fufu', 'Makanan Laut', 'Sulawesi Utara', ['ikan cakalang asap'], 220, 0, 'Rp25.000 - Rp45.000', true],
  ['Woku Ikan', 'Makanan Laut', 'Sulawesi Utara', ['ikan', 'daun kemangi', 'bumbu woku'], 300, 4, 'Rp25.000 - Rp40.000', true],
  ['Otak-Otak', 'Makanan Laut', 'Kepulauan Riau', ['ikan tenggiri', 'santan', 'daun pisang'], 220, 1, 'Rp15.000 - Rp25.000', true],
  ['Gong Bao (Kwetiau Medan)', 'Makanan Berat', 'Sumatera Utara', ['kwetiau', 'seafood', 'saus tiram'], 380, 1, 'Rp20.000 - Rp30.000', true],
  ['Kue Cucur', 'Kue Tradisional', 'Jawa Barat', ['tepung beras', 'gula merah'], 200, 0, 'Rp3.000 - Rp8.000 / buah', true],
  ['Onde-Onde', 'Kue Tradisional', 'Jawa Timur', ['tepung ketan', 'wijen', 'kacang hijau'], 220, 0, 'Rp3.000 - Rp8.000 / buah', true],
  ['Es Teler', 'Minuman Tradisional', 'DKI Jakarta', ['alpukat', 'kelapa muda', 'nangka', 'susu'], 300, 0, 'Rp12.000 - Rp20.000', true],
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Menghapus data lama...');
    await client.query('TRUNCATE foods RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE categories RESTART IDENTITY CASCADE');

    console.log('Menyisipkan kategori...');
    const categoryIdMap = {};
    for (const cat of categories) {
      const res = await client.query(
        `INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id`,
        [cat.name, cat.description]
      );
      categoryIdMap[cat.name] = res.rows[0].id;
    }

    console.log(`Menyisipkan ${foods.length} data kuliner...`);
    for (const f of foods) {
      const [name, categoryName, region, ingredients, calories, spicy, price, halal] = f;
      const categoryId = categoryIdMap[categoryName];
      if (!categoryId) {
        console.warn(`Kategori tidak ditemukan: ${categoryName} (untuk ${name})`);
        continue;
      }
      await client.query(
        `INSERT INTO foods (name, category_id, region, description, main_ingredients, calories_kcal, spicy_level, price_range, is_halal)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          name,
          categoryId,
          region,
          `${name} adalah hidangan khas ${region}.`,
          ingredients,
          calories,
          spicy,
          price,
          halal,
        ]
      );
    }

    const count = await client.query('SELECT COUNT(*) FROM foods');
    console.log(`Selesai! Total data foods: ${count.rows[0].count}`);
  } catch (err) {
    console.error('Seed gagal:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
