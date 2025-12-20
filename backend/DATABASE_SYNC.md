# Sequelize Auto-Sync Configuration Guide

## 🎯 Overview

Sequelize auto-sync telah **AKTIF** dan dikonfigurasi dengan environment variable `DB_AUTO_SYNC` untuk kontrol otomatis pembuatan dan update tabel database.

---

## ⚙️ Konfigurasi

### Environment Variable

**File**: `backend/.env`

```env
# Database Auto-Sync (create/update tables automatically)
# true = Auto-sync ON - Creates/Updates tables automatically
# false = Auto-sync OFF - No automatic table changes
DB_AUTO_SYNC=true
```

### Cara Kerja

| DB_AUTO_SYNC | Behavior | Use Case |
|--------------|----------|----------|
| `true` | ✅ Tables otomatis dibuat/diupdate saat `npm run dev` | **Development** |
| `false` | ⏸️ Tidak ada perubahan tabel otomatis | **Production** |

---

## 🔄 Mode Sync

### Development Mode (NODE_ENV=development)

**When `DB_AUTO_SYNC=true`**:
```javascript
sequelize.sync({ alter: true })
```

✅ **ALTER Mode** - Safe Updates:
- Membuat tabel baru jika belum ada
- Menambah kolom baru
- Mengubah tipe data kolom
- **TIDAK menghapus** kolom yang hilang (safe)

### Production Mode

**When `DB_AUTO_SYNC=true`** (not recommended):
```javascript
sequelize.sync()
```

✅ **CREATE Mode** - Create Only:
- Hanya membuat tabel yang belum ada
- Tidak mengubah tabel yang sudah ada

**When `DB_AUTO_SYNC=false`** (recommended):
- Tidak melakukan sync sama sekali
- Manual migration required

---

## 📋 Penggunaan

### Scenario 1: Development - Auto Create/Update Tables ✅

**File**: `.env`
```env
NODE_ENV=development
DB_AUTO_SYNC=true
```

**Saat `npm run dev`**:
```bash
✅ Database connection established successfully.
🔄 Auto-sync is ENABLED - Tables will be created/updated automatically
✅ Database tables synced successfully (ALTER mode - safe updates)
🚀 Server running on port 5000
🌍 Environment: development
📍 API available at: http://localhost:5000/api
🔧 Auto-sync: ON ✅
```

**Yang Terjadi**:
1. ✅ Tabel baru dibuat otomatis saat model ditambahkan
2. ✅ Kolom baru ditambahkan ke tabel existing
3. ✅ Tipe data kolom diupdate
4. ✅ AMAN untuk development

---

### Scenario 2: Production - Manual Control ⏸️

**File**: `.env`
```env
NODE_ENV=production
DB_AUTO_SYNC=false
```

**Saat server start**:
```bash
✅ Database connection established successfully.
⏸️  Auto-sync is DISABLED - No automatic table changes
💡 Set DB_AUTO_SYNC=true in .env to enable auto-sync
🚀 Server running on port 5000
🌍 Environment: production
📍 API available at: http://localhost:5000/api
🔧 Auto-sync: OFF ⏸️
```

**Yang Terjadi**:
- ⏸️ Tidak ada perubahan tabel otomatis
- 🔒 Database structure aman dari perubahan tidak sengaja
- 📝 Manual migration required

---

### Scenario 3: Testing - Create Only Mode

**File**: `.env`
```env
NODE_ENV=testing
DB_AUTO_SYNC=true
```

**Saat server start**:
```bash
✅ Database tables synced successfully (CREATE mode)
```

**Yang Terjadi**:
- ✅ Tabel baru dibuat
- ⏸️ Tabel existing tidak diubah

---

## 🛡️ Safety Features

### Sync Modes Comparison

| Mode | Create Tables | Update Columns | Delete Columns | Safety |
|------|---------------|----------------|----------------|--------|
| **alter: true** | ✅ Yes | ✅ Yes | ❌ No | ✅ Safe |
| **force: true** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ DANGEROUS! |
| **default** | ✅ Yes | ❌ No | ❌ No | ✅ Safe |

**CATATAN**: `force: true` **TIDAK DIGUNAKAN** karena akan drop semua tabel!

---

## 📝 Contoh Penggunaan Saat Development

### Step 1: Buat Model Baru

**File**: `backend/src/models/User.js`
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING
  },
  lastName: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
```

### Step 2: Import Model di server.js

**File**: `backend/server.js`
```javascript
// Import models (setelah testConnection, sebelum sync)
require('./src/models/User');
```

### Step 3: Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

**Output**:
```bash
✅ Database connection established successfully.
🔄 Auto-sync is ENABLED - Tables will be created/updated automatically
Executing (default): CREATE TABLE IF NOT EXISTS `users` (...)
✅ Database tables synced successfully (ALTER mode - safe updates)
```

**Result**: Tabel `users` otomatis dibuat! ✅

---

### Step 4: Update Model (Tambah Kolom)

**File**: `backend/src/models/User.js`
```javascript
// Tambahkan kolom phone
phone: {
  type: DataTypes.STRING,
  allowNull: true
}
```

### Step 5: Restart Server

```bash
npm run dev
```

**Output**:
```bash
Executing (default): ALTER TABLE `users` ADD `phone` VARCHAR(255);
✅ Database tables synced successfully (ALTER mode - safe updates)
```

**Result**: Kolom `phone` otomatis ditambahkan! ✅

---

## 🚨 Important Notes

### ✅ DO (Recommendations)

1. **Development**: `DB_AUTO_SYNC=true` untuk kemudahan development
2. **Production**: `DB_AUTO_SYNC=false` untuk keamanan
3. **Testing**: Gunakan separate database untuk testing
4. **Backup**: Selalu backup database sebelum sync di production

### ❌ DON'T (Avoid)

1. **JANGAN** gunakan `force: true` (akan drop semua data!)
2. **JANGAN** set `DB_AUTO_SYNC=true` di production tanpa testing
3. **JANGAN** lupa commit migration scripts
4. **JANGAN** hapus kolom di model tanpa migration plan

---

## 🔧 Troubleshooting

### Issue 1: Tables tidak dibuat

**Problem**: Server running tapi tabel tidak dibuat

**Check**:
```bash
# Pastikan DB_AUTO_SYNC=true
echo $DB_AUTO_SYNC  # Linux/Mac
echo %DB_AUTO_SYNC%  # Windows
```

**Solution**:
```env
# File: .env
DB_AUTO_SYNC=true  # Set to true
```

---

### Issue 2: Error "Cannot alter table"

**Problem**: Error saat update kolom

**Reason**: Kolom sudah ada dengan constraint berbeda

**Solution**:
```bash
# Option 1: Manual ALTER TABLE
mysql> ALTER TABLE users MODIFY COLUMN email VARCHAR(255);

# Option 2: Drop & Recreate (DANGER - loses data!)
# Only in development!
mysql> DROP TABLE users;
# Then restart server with DB_AUTO_SYNC=true
```

---

### Issue 3: Sync terlalu lambat

**Problem**: Server start lama karena banyak tabel

**Solution**:
```env
# Disable auto-sync dan gunakan migrations
DB_AUTO_SYNC=false
```

Kemudian gunakan Sequelize CLI untuk migrations:
```bash
npx sequelize-cli migration:generate --name create-users
npx sequelize-cli db:migrate
```

---

## 🎯 Current Implementation

### File: `backend/server.js` (Lines 11-31)

```javascript
// Sync database models based on DB_AUTO_SYNC environment variable
const autoSync = process.env.DB_AUTO_SYNC === 'true';

if (autoSync) {
  console.log('🔄 Auto-sync is ENABLED - Tables will be created/updated automatically');
  
  // Use 'alter' in development to update existing tables
  const syncMode = process.env.NODE_ENV === 'development' ? 'alter' : false;
  
  if (syncMode === 'alter') {
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced successfully (ALTER mode - safe updates)');
  } else {
    await sequelize.sync();
    console.log('✅ Database tables synced successfully (CREATE mode)');
  }
} else {
  console.log('⏸️  Auto-sync is DISABLED - No automatic table changes');
  console.log('💡 Set DB_AUTO_SYNC=true in .env to enable auto-sync');
}
```

---

## ✅ Status

**Implementation**: ✅ **COMPLETE**

**Features**:
- ✅ Environment variable control (`DB_AUTO_SYNC`)
- ✅ Safe ALTER mode in development
- ✅ Production-safe (can be disabled)
- ✅ Detailed logging
- ✅ Error handling

**Next Steps**:
1. Create database: `CREATE DATABASE lms_db;`
2. Set `DB_AUTO_SYNC=true` in `.env`
3. Create your first model
4. Run `npm run dev`
5. Watch tables auto-create! 🎉

---

**Last Updated**: 17 Desember 2025  
**Status**: ✅ **SEQUELIZE AUTO-SYNC AKTIF DAN SIAP DIGUNAKAN**
