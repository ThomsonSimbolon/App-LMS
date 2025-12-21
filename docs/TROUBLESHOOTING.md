# Troubleshooting Guide - LMS Enhancements

## 🔧 Common Issues & Solutions

### Issue 1: Activity Logs Page Shows Error

**Error**: `Failed to fetch activity logs: {}`

**Possible Causes:**

1. Tabel `activity_logs` belum dibuat
2. Model `ActivityLog` belum terdaftar
3. Authentication/Authorization issue

**Solutions:**

#### A. Pastikan Database Auto-Sync Aktif

1. Buka `backend/.env`
2. Pastikan `DB_AUTO_SYNC=true`
3. Restart backend server:

   ```bash
   cd backend
   npm run dev
   ```

4. Cek console backend, harus muncul:
   ```
   ✅ Database tables synced successfully (ALTER mode - safe updates)
   ```

#### B. Verifikasi Tabel Sudah Dibuat

Jalankan query di MySQL:

```sql
SHOW TABLES LIKE 'activity_logs';
SHOW TABLES LIKE 'notifications';
```

Jika tabel tidak ada, pastikan:

- `DB_AUTO_SYNC=true` di `.env`
- Server sudah di-restart
- Tidak ada error di console backend

#### C. Cek Backend Console untuk Error

Jika ada error seperti:

- `ActivityLog is not defined`
- `Table 'activity_logs' doesn't exist`

**Fix**: Restart backend dengan `DB_AUTO_SYNC=true`

---

### Issue 2: Notification Bell Tidak Muncul

**Possible Causes:**

1. Component belum di-import dengan benar
2. API endpoint tidak accessible
3. Token expired

**Solutions:**

1. **Cek Browser Console** untuk error
2. **Cek Network Tab** - apakah request ke `/api/notifications` berhasil?
3. **Verifikasi Token** - pastikan user sudah login
4. **Cek Environment Variable**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5040/api
   ```

---

### Issue 3: Course Versioning - Publish New Version Error

**Error**: `Failed to publish new version`

**Possible Causes:**

1. Course tidak ditemukan
2. Permission issue (bukan owner course)
3. Database constraint error

**Solutions:**

1. **Cek Backend Console** untuk error detail
2. **Verifikasi Course ID** - pastikan course ada
3. **Cek Permission** - pastikan user adalah instructor course tersebut
4. **Cek Database** - pastikan semua tabel terkait sudah dibuat

---

### Issue 4: Database Migration Issues

**Jika menggunakan Production (DB_AUTO_SYNC=false):**

Anda perlu membuat migration manual:

```sql
-- Add version to courses
ALTER TABLE courses ADD COLUMN version VARCHAR(10) DEFAULT '1.0' NOT NULL;

-- Add courseVersion to enrollments
ALTER TABLE enrollments ADD COLUMN courseVersion VARCHAR(10) NULL;

-- Add courseVersion to certificates
ALTER TABLE certificates ADD COLUMN courseVersion VARCHAR(10) NULL;

-- Create activity_logs table
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NULL,
  eventType ENUM('USER_LOGIN', 'COURSE_ENROLL', 'LESSON_COMPLETE', 'QUIZ_SUBMIT', 'CERT_REQUESTED', 'CERT_APPROVED', 'CERT_REJECTED') NOT NULL,
  entityType ENUM('USER', 'COURSE', 'QUIZ', 'CERTIFICATE', 'SYSTEM') NOT NULL,
  entityId INT NULL,
  metadata JSON NULL,
  ipAddress VARCHAR(45) NULL,
  userAgent TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_eventType (eventType),
  INDEX idx_entityType (entityType),
  INDEX idx_createdAt (createdAt),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create notifications table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') DEFAULT 'INFO',
  isRead BOOLEAN DEFAULT FALSE,
  entityType ENUM('COURSE', 'QUIZ', 'CERTIFICATE', 'ENROLLMENT', 'SYSTEM') NULL,
  entityId INT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead),
  INDEX idx_createdAt (createdAt),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🔍 Debugging Steps

### 1. Cek Backend Logs

```bash
cd backend
npm run dev
```

Cari error di console:

- Model loading errors
- Database connection errors
- Table creation errors

### 2. Cek Frontend Console

Buka Browser DevTools → Console:

- Cek error JavaScript
- Cek Network tab untuk failed requests
- Cek response status codes

### 3. Test API Endpoints

Gunakan Postman atau curl:

```bash
# Test Activity Logs (perlu admin token)
curl -X GET http://localhost:5040/api/activity-logs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Test Notifications (perlu user token)
curl -X GET http://localhost:5040/api/notifications \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### 4. Verifikasi Database

```sql
-- Cek tabel ada
SHOW TABLES;

-- Cek struktur tabel
DESCRIBE activity_logs;
DESCRIBE notifications;

-- Cek kolom baru
SHOW COLUMNS FROM courses LIKE 'version';
SHOW COLUMNS FROM enrollments LIKE 'courseVersion';
SHOW COLUMNS FROM certificates LIKE 'courseVersion';
```

---

## ✅ Quick Fix Checklist

- [ ] `DB_AUTO_SYNC=true` di `backend/.env`
- [ ] Backend server sudah di-restart
- [ ] Tabel `activity_logs` dan `notifications` sudah dibuat
- [ ] Kolom `version`, `courseVersion` sudah ditambahkan
- [ ] `NEXT_PUBLIC_API_URL` sudah di-set di `frontend/.env.local`
- [ ] User sudah login dengan role yang benar (Admin untuk Activity Logs)
- [ ] Token masih valid (belum expired)
- [ ] CORS sudah dikonfigurasi dengan benar

---

## 📞 Still Having Issues?

1. **Cek Backend Console** - pastikan tidak ada error saat startup
2. **Cek Database** - pastikan semua tabel dan kolom sudah ada
3. **Cek Network Tab** - lihat response dari API
4. **Cek Browser Console** - lihat error JavaScript

Jika masih error, kirimkan:

- Error message lengkap dari console
- Response dari Network tab
- Backend console output
