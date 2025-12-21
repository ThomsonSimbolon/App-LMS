# 🔧 Fix Categories Table - Duplicate Indexes Issue

## 🐛 Problem

Tabel `categories` memiliki **64 duplicate indexes** (mencapai batas MySQL), menyebabkan error:
```
Too many keys specified; max 64 keys allowed
```

**Penyebab:** 
- Unique constraint didefinisikan dua kali (di field definition `unique: true` DAN di indexes array)
- Setiap sync membuat index baru dengan nama `name_2`, `name_3`, `slug_2`, dll

## ✅ Solution

### Step 1: Model sudah diperbaiki

Model `Category.js` sudah di-update untuk:
- Menghapus `unique: true` dari field definition
- Menggunakan indexes array dengan nama eksplisit

### Step 2: Cleanup duplicate indexes di database

**⚠️ WARNING:** Backup database terlebih dahulu!

**Script SQL untuk cleanup:**

```sql
-- 1. Check current indexes (lihat yang duplicate)
SHOW INDEXES FROM categories;

-- 2. Drop duplicate indexes (name_2, name_3, ..., slug_2, slug_3, ...)
-- Hanya pertahankan: PRIMARY, name, slug, categories_slug (atau categories_slug_unique jika ada)

-- Drop duplicate name indexes (name_2, name_3, name_4, ...)
DROP INDEX name_2 ON categories;
DROP INDEX name_3 ON categories;
DROP INDEX name_4 ON categories;
DROP INDEX name_5 ON categories;
-- ... lanjutkan sampai semua name_N dihapus

-- Drop duplicate slug indexes (slug_2, slug_3, slug_4, ...)
DROP INDEX slug_2 ON categories;
DROP INDEX slug_3 ON categories;
DROP INDEX slug_4 ON categories;
DROP INDEX slug_5 ON categories;
-- ... lanjutkan sampai semua slug_N dihapus

-- 3. Pastikan hanya ada indexes yang diperlukan:
-- - PRIMARY (id)
-- - categories_name_unique (name) - akan dibuat oleh Sequelize
-- - categories_slug_unique (slug) - akan dibuat oleh Sequelize
```

### Step 3: Automated cleanup script (safer)

Atau gunakan script Node.js untuk cleanup otomatis:

```javascript
// fix-categories-indexes.js
const mysql = require('mysql2/promise');

async function cleanupIndexes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_db'
  });

  try {
    // Get all indexes
    const [indexes] = await connection.query('SHOW INDEXES FROM categories');
    
    // Find duplicate indexes (name_2, name_3, slug_2, slug_3, etc.)
    const duplicates = indexes.filter(idx => {
      const name = idx.Key_name;
      return (name.match(/^name_\d+$/) || name.match(/^slug_\d+$/)) && name !== 'name' && name !== 'slug';
    });

    console.log(`Found ${duplicates.length} duplicate indexes to remove`);

    // Drop duplicates
    for (const idx of duplicates) {
      try {
        await connection.query(`DROP INDEX \`${idx.Key_name}\` ON categories`);
        console.log(`✅ Dropped index: ${idx.Key_name}`);
      } catch (err) {
        console.log(`❌ Failed to drop ${idx.Key_name}:`, err.message);
      }
    }

    // Verify final indexes
    const [finalIndexes] = await connection.query('SHOW INDEXES FROM categories');
    console.log(`\nFinal indexes (${finalIndexes.length}):`);
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.Key_name} on ${idx.Column_name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

cleanupIndexes();
```

**Jalankan script:**
```bash
cd backend
node fix-categories-indexes.js
```

### Step 4: Restart server

Setelah cleanup:
1. Restart server
2. Sequelize akan membuat indexes yang benar (categories_name_unique, categories_slug_unique)

## 🔍 Verification

Setelah cleanup, pastikan hanya ada indexes ini:
- `PRIMARY` (id)
- `categories_name_unique` (name) - UNIQUE
- `categories_slug_unique` (slug) - UNIQUE

**Check:**
```sql
SHOW INDEXES FROM categories;
```

## 📝 Prevention

Untuk mencegah masalah ini di masa depan:
1. ✅ Jangan gunakan `unique: true` di field definition JIKA sudah ada di indexes array
2. ✅ Gunakan nama eksplisit untuk indexes di indexes array
3. ✅ Review model sebelum sync untuk memastikan tidak ada duplicate constraint

---

**Last Updated**: 2025-01-XX  
**Status**: ✅ Model fixed, cleanup required

