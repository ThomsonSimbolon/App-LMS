# Database Setup Instructions

## 🗄️ Create MySQL Database

Before running the backend server, you need to create the database:

### Option 1: MySQL Command Line

```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Option 2: MySQL Workbench / phpMyAdmin

1. Open MySQL Workbench or phpMyAdmin
2. Create new database named `lms_db`
3. Set charset to `utf8mb4`

## ⚙️ Configure Backend Environment

1. Open `backend/.env`
2. Update the following values with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=lms_db
DB_DIALECT=mysql
```

3. Update JWT secrets (use random strong strings):
```env
JWT_ACCESS_SECRET=your_very_secure_random_string_here
JWT_REFRESH_SECRET=another_very_secure_random_string_here
```

4. Configure email settings (if using Gmail):
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Update EMAIL_USER and EMAIL_PASSWORD in .env

## 🚀 Start Development Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Backend will run on http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:3000

## ✅ Verify Setup

1. Backend: Open http://localhost:5000/health - should return `{"status":"OK"}`
2. Frontend: Open http://localhost:3000 - should show landing page

## 📝 Notes

- Frontend is already running and ready to use
- Backend requires database to be created first
- All tables will be auto-created by Sequelize when you start adding models
- Make sure MySQL service is running before starting backend
