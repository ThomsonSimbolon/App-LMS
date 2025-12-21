# 📚 Lesson Types Migration Guide

## 🎯 Overview

Dokumen ini menjelaskan perubahan database dan model untuk implementasi **Lesson Types System** dengan 7 tipe lesson dan struktur content berbasis JSON.

---

## 📋 Perubahan Database

### 1. Update ENUM `type` di tabel `lessons`

**Sebelum:**
```sql
type ENUM('VIDEO', 'PDF', 'TEXT', 'QUIZ')
```

**Sesudah:**
```sql
type ENUM('VIDEO', 'MATERIAL', 'LIVE_SESSION', 'ASSIGNMENT', 'QUIZ', 'EXAM', 'DISCUSSION')
```

**Catatan:**
- `PDF` dan `TEXT` digabung menjadi `MATERIAL`
- Ditambahkan: `LIVE_SESSION`, `ASSIGNMENT`, `EXAM`, `DISCUSSION`

---

### 2. Ubah kolom `content` dari TEXT ke JSON

**Sebelum:**
```sql
content TEXT NULL
```

**Sesudah:**
```sql
content JSON NULL
```

**Migration SQL (Manual):**
```sql
-- Backup existing content first
ALTER TABLE lessons ADD COLUMN content_backup TEXT NULL;
UPDATE lessons SET content_backup = content;

-- Convert TEXT to JSON (MySQL 5.7+)
ALTER TABLE lessons MODIFY COLUMN content JSON NULL;

-- Migrate existing data (convert string URLs to JSON objects)
UPDATE lessons 
SET content = CASE
  WHEN type = 'VIDEO' THEN JSON_OBJECT('videoUrl', content_backup, 'duration', COALESCE(duration, 0), 'minWatchPercentage', 80)
  WHEN type = 'PDF' THEN JSON_OBJECT('fileUrl', content_backup, 'fileType', 'PDF')
  WHEN type = 'TEXT' THEN JSON_OBJECT('content', content_backup)
  WHEN type = 'QUIZ' THEN JSON_OBJECT('content', content_backup)
  ELSE JSON_OBJECT('content', content_backup)
END
WHERE content_backup IS NOT NULL;

-- Update type for PDF and TEXT to MATERIAL
UPDATE lessons SET type = 'MATERIAL' WHERE type IN ('PDF', 'TEXT');

-- Drop backup column after verification
-- ALTER TABLE lessons DROP COLUMN content_backup;
```

**⚠️ IMPORTANT:**
- Lakukan backup database sebelum migration
- Test di development environment terlebih dahulu
- Verifikasi data setelah migration sebelum drop `content_backup`

---

### 3. Tambah kolom `description`

**Migration SQL:**
```sql
ALTER TABLE lessons 
ADD COLUMN description TEXT NULL 
COMMENT 'Lesson description'
AFTER title;
```

---

### 4. Tambah kolom `is_required`

**Migration SQL:**
```sql
ALTER TABLE lessons 
ADD COLUMN is_required BOOLEAN DEFAULT TRUE NOT NULL 
COMMENT 'Is lesson required for course completion'
AFTER order;
```

**Catatan:**
- Default: `TRUE` (semua lesson required by default)
- Bisa diubah ke `FALSE` untuk optional lessons

---

## 🔄 Auto-Sync Mode (Development)

Jika menggunakan **Sequelize Auto-Sync** dengan `DB_AUTO_SYNC=true`:

✅ **Model akan otomatis di-update** saat server start

⚠️ **Namun**, data migration (PDF/TEXT → MATERIAL, content TEXT → JSON) **TIDAK otomatis**

**Solusi:**
1. Jalankan SQL migration manual untuk data (lihat di atas)
2. Atau buat migration script Node.js untuk data conversion

---

## 📊 Content Schema per Lesson Type

### VIDEO
```json
{
  "videoUrl": "https://res.cloudinary.com/.../video/upload/v123/video.mp4",
  "duration": 900,
  "minWatchPercentage": 80
}
```

### MATERIAL
```json
{
  "fileUrl": "https://res.cloudinary.com/.../pdf/upload/v123/material.pdf",
  "fileType": "PDF"
}
```
atau
```json
{
  "content": "Text content here..."
}
```

### LIVE_SESSION
```json
{
  "meetingUrl": "https://zoom.us/j/123456789",
  "scheduledAt": "2025-01-15T10:00:00Z",
  "duration": 3600
}
```

### ASSIGNMENT
```json
{
  "submissionType": "FILE",
  "deadline": "2025-01-20T23:59:59Z",
  "maxScore": 100,
  "instructions": "Complete the assignment..."
}
```
`submissionType`: `FILE` | `TEXT` | `LINK`

### QUIZ / EXAM
```json
{
  "quizId": 123,
  "passingScore": 70,
  "timeLimit": 1800
}
```

### DISCUSSION
```json
{
  "topic": "Discussion topic here...",
  "instructions": "Participate in discussion..."
}
```

---

## ✅ Verification Checklist

Setelah migration, verifikasi:

- [ ] ENUM type sudah berubah (7 values)
- [ ] Kolom `content` bertipe JSON
- [ ] Kolom `description` ada dan nullable
- [ ] Kolom `is_required` ada dengan default TRUE
- [ ] Data existing (PDF/TEXT) sudah diubah ke MATERIAL
- [ ] Content existing sudah dalam format JSON
- [ ] Tidak ada data yang hilang

---

## 🔧 Rollback Plan

Jika perlu rollback:

```sql
-- 1. Restore content from backup
UPDATE lessons SET content = content_backup;

-- 2. Revert content column to TEXT
ALTER TABLE lessons MODIFY COLUMN content TEXT NULL;

-- 3. Revert type ENUM
ALTER TABLE lessons MODIFY COLUMN type ENUM('VIDEO', 'PDF', 'TEXT', 'QUIZ') NOT NULL;
UPDATE lessons SET type = 'PDF' WHERE content_backup LIKE '%.pdf%';
UPDATE lessons SET type = 'TEXT' WHERE content_backup NOT LIKE '%.pdf%' AND content_backup NOT LIKE '%.mp4%';

-- 4. Drop new columns
ALTER TABLE lessons DROP COLUMN description;
ALTER TABLE lessons DROP COLUMN is_required;
```

---

## 📝 Notes

1. **Backward Compatibility**: Model Lesson sekarang mendukung backward compatibility untuk content yang masih string (akan di-convert otomatis di controller)

2. **Validation**: Content validation dilakukan di controller level, bukan di database level

3. **Migration Safety**: Selalu backup database sebelum migration production

4. **Testing**: Test semua lesson types setelah migration:
   - Create lesson dengan setiap type
   - Update lesson content
   - Get lesson content
   - Mark lesson complete

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0

