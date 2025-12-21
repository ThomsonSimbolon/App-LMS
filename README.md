# LMS Platform - Dokumentasi Lengkap

Modern Learning Management System dengan Certification & Assessment

**Version**: 1.0.0  
**Base API URL**: `http://localhost:5040/api`  
**Frontend URL**: `http://localhost:5174`

---

## 📑 Daftar Isi

1. [Overview Proyek](#overview-proyek)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Roles & Permissions](#roles--permissions)
4. [Flow & Alur Kerja](#flow--alur-kerja)
5. [Dokumentasi Backend](#dokumentasi-backend)
6. [Dokumentasi Frontend](#dokumentasi-frontend)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Setup & Konfigurasi](#setup--konfigurasi)
10. [Tech Stack](#tech-stack)

---

## Overview Proyek

### Fitur Utama

- 🎓 **Course Management** - Buat kursus dengan sections dan lessons (7 types: VIDEO, MATERIAL, LIVE_SESSION, ASSIGNMENT, QUIZ, EXAM, DISCUSSION)
- 📊 **Progress Tracking** - Tracking progress pembelajaran real-time dengan resume functionality
- ✅ **Quizzes & Exams** - Assessment otomatis dengan timer dan batas attempts
- 🏆 **Certification** - Generate sertifikat PDF dengan QR verification dan approval workflow
- 👥 **Role-Based Access Control** - 5 roles dengan permission system
- 🔒 **Lesson Locking** - Sequential completion (dapat dikonfigurasi)
- 👨‍🏫 **Assessor Assignment** - Assign assessor ke course untuk certificate approval
- 📝 **Activity Logging** - Log semua aktivitas user untuk audit trail
- 🔔 **Notifications** - Sistem notifikasi real-time untuk user
- 📈 **Dashboard Analytics** - Dashboard statistik untuk admin dan instructor
- ✉️ **Email Verification** - Verifikasi akun via email
- 🌙 **Dark Mode** - Dukungan dark mode
- 📱 **Responsive Design** - Mobile-first responsive design

### Struktur Proyek

```
app-lms/
├── backend/                    # Node.js + Express + Sequelize API
│   ├── src/
│   │   ├── models/           # 17 Sequelize models
│   │   ├── controllers/      # 15 API controllers
│   │   ├── routes/           # 12 route files
│   │   ├── middleware/       # Auth & RBAC middleware
│   │   ├── services/         # Business logic services
│   │   ├── config/           # Database, JWT, Cloudinary config
│   │   └── seeders/          # Database seeders
│   ├── server.js             # Entry point
│   └── package.json
│
└── frontend/                 # Next.js 16 + TypeScript + TailwindCSS
    ├── app/                  # App Router pages
    │   ├── admin/           # Admin pages
    │   ├── instructor/      # Instructor pages
    │   ├── assessor/        # Assessor pages
    │   ├── dashboard/       # Student dashboard
    │   ├── courses/         # Course pages
    │   ├── learn/           # Learning interface
    │   └── ...
    ├── store/               # Redux store & slices
    │   ├── slices/         # Redux slices
    │   └── store.ts        # Store configuration
    ├── components/          # React components
    │   ├── layouts/         # Layout components
    │   ├── course/          # Course components
    │   ├── quiz/            # Quiz components
    │   └── ui/              # UI components
    ├── hooks/               # Custom React hooks
    ├── lib/                 # Utilities & helpers
    └── package.json
```

---

## Arsitektur Sistem

### Backend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Express Server                        │
│                    (server.js)                           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    App Router                           │
│                    (src/app.js)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Auth    │  │  Course  │  │ Enrollment│  │ Dashboard│ │
│  │  Routes  │  │  Routes  │  │  Routes   │  │  Routes  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │Activity  │  │Notification│ │Certificate│ │  Quiz   │ │
│  │  Log     │  │  Routes   │  │  Routes   │  │ Routes  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
└───────┼─────────────┼─────────────┼──────────────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────────────────────────────────────────────────┐
│                  Middleware Layer                      │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │ verifyToken  │  │   hasRole     │                   │
│  └──────────────┘  └──────────────┘                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Controllers Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ authController│  │courseController│enrollmentController│
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                  Services Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │emailService  │  │ pdfService   │  │qrService     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │notification  │  │activityLog    │  │courseVersion │ │
│  │  Service     │  │  Service      │  │  Service     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │lessonCompletion│ │localFile     │                   │
│  │  Service     │  │  Service     │                   │
│  └──────────────┘  └──────────────┘                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Models Layer (Sequelize)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   User   │  │  Course   │  │Enrollment│  │ActivityLog│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │Notification│ │CourseAssessor│ │Certificate│ │  Quiz   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
└───────┼─────────────┼─────────────┼──────────────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────────────────────────────────────────────────┐
│                    MySQL Database                       │
│              (17 Tables dengan Relations)               │
└─────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Next.js App Router                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Public     │  │   Student    │  │  Instructor  │ │
│  │   Pages      │  │   Dashboard  │  │  Dashboard   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    Admin     │  │   Assessor    │  │   Learning   │ │
│  │   Dashboard  │  │   Dashboard  │  │   Interface  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Components Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Layouts   │  │   Course     │  │     Quiz     │ │
│  │  Components  │  │  Components  │  │  Components  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   UI         │  │Notification  │  │  Certificate │ │
│  │  Components  │  │  Components  │  │  Components  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Hooks & Utilities                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   useAuth    │  │   auth.ts    │  │   utils.ts   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │   api.ts     │  │  lessonUtils │                  │
│  └──────────────┘  └──────────────┘                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API                                │
│         (http://localhost:5040/api)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Redux Store (State Management)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   Auth    │  │  Course  │  │Enrollment│  ...        │
│  │   Slice   │  │  Slice   │  │  Slice   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## Roles & Permissions

### 5 Roles dalam Sistem

#### 1. SUPER_ADMIN

**Deskripsi**: Full system access, kontrol penuh atas semua fitur

**Permissions**:

- ✅ Semua permissions (full access)
- ✅ Manage users (create, read, update, delete)
- ✅ Manage courses (create, read, update, delete, publish)
- ✅ Manage categories
- ✅ Approve/reject certificates
- ✅ View all analytics
- ✅ System settings

**Access Level**: Maximum

---

#### 2. ADMIN

**Deskripsi**: Manage users, courses, dan certificates

**Permissions**:

- ✅ Manage users (read, update, delete)
- ✅ Manage courses (create, read, update, delete, publish)
- ✅ Manage categories (create, read, update, delete)
- ✅ Approve/reject certificates
- ✅ View all enrollments
- ✅ View analytics
- ❌ System settings

**Access Level**: High

---

#### 3. INSTRUCTOR

**Deskripsi**: Create dan manage courses, view students

**Permissions**:

- ✅ Create courses (own courses)
- ✅ Update courses (own courses)
- ✅ Delete courses (own courses)
- ✅ Publish/unpublish courses (own courses)
- ✅ Create sections (own courses)
- ✅ Create lessons (own courses)
- ✅ Create quizzes (own courses)
- ✅ View students enrolled in own courses
- ✅ View analytics for own courses
- ❌ Manage users
- ❌ Approve certificates
- ❌ Manage other instructors' courses

**Access Level**: Medium

---

#### 4. ASSESSOR

**Deskripsi**: Approve dan reject certificates

**Permissions**:

- ✅ View pending certificates
- ✅ Approve certificates
- ✅ Reject certificates (with reason)
- ✅ View certificate details
- ❌ Manage courses
- ❌ Manage users
- ❌ Create courses

**Access Level**: Medium

---

#### 5. STUDENT

**Deskripsi**: Enroll, learn, take quizzes, get certificates

**Permissions**:

- ✅ Enroll in courses
- ✅ View enrolled courses
- ✅ Access lesson content
- ✅ Mark lessons as complete
- ✅ Take quizzes
- ✅ View quiz results
- ✅ Request certificates (after completion)
- ✅ View own certificates
- ✅ Download certificates
- ❌ Create courses
- ❌ Manage users
- ❌ Approve certificates

**Access Level**: Basic

---

### Permission Matrix

| Permission            | SUPER_ADMIN | ADMIN | INSTRUCTOR | ASSESSOR | STUDENT  |
| --------------------- | ----------- | ----- | ---------- | -------- | -------- |
| `create_course`       | ✅          | ✅    | ✅ (own)   | ❌       | ❌       |
| `update_course`       | ✅          | ✅    | ✅ (own)   | ❌       | ❌       |
| `delete_course`       | ✅          | ✅    | ✅ (own)   | ❌       | ❌       |
| `read_course`         | ✅          | ✅    | ✅         | ✅       | ✅       |
| `manage_users`        | ✅          | ✅    | ❌         | ❌       | ❌       |
| `enroll_course`       | ✅          | ✅    | ❌         | ❌       | ✅       |
| `create_quiz`         | ✅          | ✅    | ✅ (own)   | ❌       | ❌       |
| `take_quiz`           | ✅          | ✅    | ❌         | ❌       | ✅       |
| `approve_certificate` | ✅          | ✅    | ❌         | ✅       | ❌       |
| `view_certificate`    | ✅          | ✅    | ✅         | ✅       | ✅ (own) |

---

## Flow & Alur Kerja

### 1. Authentication Flow

```
┌─────────────┐
│   Register  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Create Account  │
│ (Email, Password)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐      ┌──────────────┐
│ Send Verification│─────▶│ Email Sent   │
│ Email           │      └──────────────┘
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ User Clicks     │
│ Verification Link│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Account Verified│
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│    Login    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Generate JWT    │
│ (Access + Refresh)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Store in        │
│ localStorage    │
└─────────────────┘
```

### 2. Course Creation Flow (Instructor)

```
┌─────────────────┐
│ Instructor      │
│ Login           │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Create Course   │
│ (Title, Desc,   │
│  Category, etc) │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Upload Thumbnail│
│ (Cloudinary)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Create Sections │
│ (Ordered)       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Create Lessons  │
│ (VIDEO/PDF/TEXT)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Upload Content  │
│ (Video/PDF)     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Publish Course  │
│ (isPublished=true)│
└─────────────────┘
```

### 3. Student Learning Flow

```
┌─────────────────┐
│ Student Login   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Browse Courses  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Enroll Course   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Access Learning │
│ Page            │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐      ┌──────────────┐
│ Check Lesson    │─────▶│ Locked?     │
│ Lock Status     │      │ (Previous   │
│                 │      │  incomplete)│
└──────┬──────────┘      └──────────────┘
       │
       ▼ (Unlocked)
┌─────────────────┐
│ View Lesson     │
│ Content         │
│ (Video/PDF/Text)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Mark Complete   │
│ (Update Progress)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Take Quiz       │
│ (if available)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Complete Course │
│ (Progress = 100%)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Request         │
│ Certificate     │
└─────────────────┘
```

### 4. Assessor Assignment Flow (Admin)

```
┌─────────────────┐
│ Admin Login     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Select Course   │
│ (Admin Dashboard)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ View Course     │
│ Details         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Assign Assessors│
│ (Multi-select   │
│  ASSESSOR role) │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Save Assignment │
│ (Sync operation)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Activity Logged │
│ (ASSESSOR_      │
│  ASSIGNED)      │
└─────────────────┘
```

### 5. Certificate Approval Flow

```
┌─────────────────┐
│ Student         │
│ Completes Course │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Request         │
│ Certificate     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐      ┌──────────────┐
│ Check Course    │─────▶│ Manual       │
│ Settings        │      │ Approval?    │
│                 │      │ Required?    │
└──────┬──────────┘      └──────────────┘
       │
       ├─── YES ────▶ ┌─────────────────┐
       │               │ Status: PENDING │
       │               │ (Wait for       │
       │               │  Approval)     │
       │               └──────┬──────────┘
       │                       │
       │                       ▼
       │               ┌─────────────────┐
       │               │ Check Assessor   │
       │               │ Assignment       │
       │               └──────┬──────────┘
       │                       │
       │                       ├─── ASSESSOR ────▶ ┌─────────────────┐
       │                       │                    │ Filter by       │
       │                       │                    │ Assigned Courses│
       │                       │                    └──────┬──────────┘
       │                       │                             │
       │                       │                             ▼
       │                       │                    ┌─────────────────┐
       │                       │                    │ Assessor        │
       │                       │                    │ Reviews         │
       │                       │                    └──────┬──────────┘
       │                       │                             │
       │                       ├─── ADMIN ────────▶ ┌─────────────────┐
       │                       │                    │ Admin Reviews   │
       │                       │                    │ (All courses)   │
       │                       │                    └──────┬──────────┘
       │                       │                             │
       │                       ▼                             ▼
       │               ┌─────────────────┐         ┌─────────────────┐
       │               │ Approve/Reject  │         │ Approve/Reject  │
       │               │ (with reason)   │         │ (with reason)   │
       │               └──────┬──────────┘         └──────┬──────────┘
       │                       │                           │
       │                       └───────────┬───────────────┘
       │                                     │
       └─── NO ────────▶ ┌─────────────────┐
                         │ Status: APPROVED│
                         │ (Auto-approved) │
                         └──────┬──────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │ Generate PDF    │
                         │ + QR Code       │
                         └──────┬──────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │ Upload to       │
                         │ Cloudinary      │
                         └──────┬──────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │ Activity Logged │
                         │ (CERT_APPROVED)  │
                         └──────┬──────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │ Notification    │
                         │ Sent to Student │
                         └──────┬──────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │ Certificate     │
                         │ Ready           │
                         └─────────────────┘
```

### 6. Quiz Flow

```
┌─────────────────┐
│ Student         │
│ Accesses Quiz   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Check Attempts  │
│ (maxAttempts?)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Start Quiz      │
│ (Generate       │
│  Session ID)     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Load Questions  │
│ (Randomize if   │
│  enabled)       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Timer Starts    │
│ (if timeLimit)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Student Answers │
│ Questions       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Submit Quiz     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Auto-grade      │
│ (Calculate Score)│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Save Result     │
│ (ExamResult)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐      ┌──────────────┐
│ Show Results    │─────▶│ Show Answers │
│                 │      │ (if enabled) │
└─────────────────┘      └──────────────┘
```

---

## Dokumentasi Backend

### Struktur Folder Backend

```
backend/
├── src/
│   ├── models/              # 17 Sequelize Models
│   │   ├── User.js
│   │   ├── Role.js
│   │   ├── Permission.js
│   │   ├── RolePermission.js
│   │   ├── Category.js
│   │   ├── Course.js
│   │   ├── Section.js
│   │   ├── Lesson.js
│   │   ├── Enrollment.js
│   │   ├── LessonProgress.js
│   │   ├── Quiz.js
│   │   ├── Question.js
│   │   ├── ExamResult.js
│   │   ├── Certificate.js
│   │   ├── CourseAssessor.js
│   │   ├── ActivityLog.js
│   │   ├── Notification.js
│   │   └── index.js        # Model associations
│   │
│   ├── controllers/        # 15 Controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── categoryController.js
│   │   ├── courseController.js
│   │   ├── courseAssessorController.js
│   │   ├── sectionController.js
│   │   ├── lessonController.js
│   │   ├── enrollmentController.js
│   │   ├── lessonProgressController.js
│   │   ├── quizController.js
│   │   ├── certificateController.js
│   │   ├── dashboardController.js
│   │   ├── instructorController.js
│   │   ├── activityLogController.js
│   │   └── notificationController.js
│   │
│   ├── routes/            # 12 Route Files
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   ├── lessonRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── certificateRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── instructorRoutes.js
│   │   ├── activityLogRoutes.js
│   │   └── notificationRoutes.js
│   │
│   ├── middleware/        # Middleware
│   │   └── auth.js        # verifyToken, hasRole
│   │
│   ├── services/          # Business Logic Services
│   │   ├── emailService.js
│   │   ├── pdfService.js
│   │   ├── qrService.js
│   │   ├── cloudinaryService.js
│   │   ├── notificationService.js
│   │   ├── activityLogService.js
│   │   ├── courseVersionService.js
│   │   ├── localFileService.js
│   │   └── lessonCompletionService.js
│   │
│   ├── config/            # Configuration
│   │   ├── database.js
│   │   ├── jwt.js
│   │   └── cloudinary.js
│   │
│   ├── seeders/           # Database Seeders
│   │   └── seed.js
│   │
│   └── app.js             # Express App Setup
│
├── server.js               # Server Entry Point
└── package.json
```

### Models (Database Schema)

#### 1. User Model

**File**: `src/models/User.js`

**Fields**:

- `id` (INTEGER, PK, Auto Increment)
- `email` (STRING, Unique, Required)
- `password` (STRING, Hashed with bcrypt)
- `firstName` (STRING, Required)
- `lastName` (STRING, Optional)
- `roleId` (INTEGER, FK to roles)
- `isEmailVerified` (BOOLEAN, Default: false)
- `emailVerificationToken` (STRING, Optional)
- `emailVerificationExpires` (DATE, Optional)
- `passwordResetToken` (STRING, Optional)
- `passwordResetExpires` (DATE, Optional)
- `refreshToken` (TEXT, Optional)
- `lastLoginAt` (DATE, Optional)
- `isActive` (BOOLEAN, Default: true)
- `createdAt`, `updatedAt` (Timestamps)

**Relations**:

- `belongsTo(Role)` - User memiliki satu Role
- `hasMany(Course)` - User (instructor) memiliki banyak Course
- `hasMany(Enrollment)` - User memiliki banyak Enrollment
- `hasMany(Certificate)` - User memiliki banyak Certificate

---

#### 2. Role Model

**File**: `src/models/Role.js`

**Fields**:

- `id` (INTEGER, PK, Auto Increment)
- `name` (ENUM: SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT, ASSESSOR, Unique)
- `description` (STRING, Optional)
- `createdAt`, `updatedAt` (Timestamps)

**Relations**:

- `hasMany(User)` - Role memiliki banyak User
- `belongsToMany(Permission)` - Role memiliki banyak Permission (many-to-many)

---

#### 3. Permission Model

**File**: `src/models/Permission.js`

**Fields**:

- `id` (INTEGER, PK, Auto Increment)
- `name` (STRING, Unique, e.g., "create_course")
- `resource` (STRING, e.g., "course")
- `action` (STRING, e.g., "create")
- `description` (STRING, Optional)
- `createdAt`, `updatedAt` (Timestamps)

**Relations**:

- `belongsToMany(Role)` - Permission dimiliki oleh banyak Role

---

#### 4. Course Model

**File**: `src/models/Course.js`

**Fields**:

- `id` (INTEGER, PK, Auto Increment)
- `title` (STRING, Required)
- `slug` (STRING, Unique, Required)
- `description` (TEXT, Optional)
- `thumbnail` (STRING, Cloudinary URL)
- `categoryId` (INTEGER, FK to categories)
- `instructorId` (INTEGER, FK to users)
- `level` (ENUM: BEGINNER, INTERMEDIATE, ADVANCED, Default: BEGINNER)
- `type` (ENUM: FREE, PAID, PREMIUM, Default: FREE)
- `price` (DECIMAL(10,2), Default: 0.00)
- `requireSequentialCompletion` (BOOLEAN, Default: false)
- `requireManualApproval` (BOOLEAN, Default: false)
- `isPublished` (BOOLEAN, Default: false)
- `publishedAt` (DATE, Optional)
- `createdAt`, `updatedAt` (Timestamps)

**Relations**:

- `belongsTo(Category)` - Course memiliki satu Category
- `belongsTo(User)` - Course memiliki satu Instructor
- `hasMany(Section)` - Course memiliki banyak Section
- `hasMany(Enrollment)` - Course memiliki banyak Enrollment
- `hasMany(Quiz)` - Course memiliki banyak Quiz (final exams)
- `hasMany(Certificate)` - Course memiliki banyak Certificate

---

#### 5. Enrollment Model

**File**: `src/models/Enrollment.js`

**Fields**:

- `id` (INTEGER, PK, Auto Increment)
- `userId` (INTEGER, FK to users)
- `courseId` (INTEGER, FK to courses)
- `progress` (DECIMAL(5,2), Default: 0.00, Range: 0-100)
- `status` (ENUM: ACTIVE, COMPLETED, DROPPED, Default: ACTIVE)
- `enrolledAt` (DATE, Default: NOW)
- `completedAt` (DATE, Optional)
- `lastAccessedLessonId` (INTEGER, FK to lessons, Optional)
- `createdAt`, `updatedAt` (Timestamps)

**Relations**:

- `belongsTo(User)` - Enrollment dimiliki oleh satu User (student)
- `belongsTo(Course)` - Enrollment untuk satu Course
- `belongsTo(Lesson)` - Last accessed lesson
- `hasMany(LessonProgress)` - Enrollment memiliki banyak LessonProgress

**Unique Constraint**: `(userId, courseId)` - Satu user hanya bisa enroll sekali per course

---

#### 6. Lesson Model

**File**: `src/models/Lesson.js`

**Fields**:

- `id` (INTEGER, PK, Auto Increment)
- `sectionId` (INTEGER, FK to sections)
- `title` (STRING, Required)
- `type` (ENUM: VIDEO, MATERIAL, LIVE_SESSION, ASSIGNMENT, QUIZ, EXAM, DISCUSSION, Required)
- `description` (TEXT, Optional)
- `content` (JSON, Flexible schema per type - Video URL, PDF URL, assignment data, etc.)
- `isRequired` (BOOLEAN, Default: true)
- `duration` (INTEGER, Seconds, Optional)
- `order` (INTEGER, Default: 0)
- `isFree` (BOOLEAN, Default: false)
- `createdAt`, `updatedAt` (Timestamps)

**Relations**:

- `belongsTo(Section)` - Lesson berada dalam satu Section
- `hasOne(Quiz)` - Lesson dapat memiliki satu Quiz (optional)
- `hasMany(LessonProgress)` - Lesson memiliki banyak LessonProgress

---

#### 7. Quiz Model

**File**: `src/models/Quiz.js`

**Fields**:

- `id` (INTEGER, PK, Auto Increment)
- `lessonId` (INTEGER, FK to lessons, Optional - untuk lesson quiz)
- `courseId` (INTEGER, FK to courses, Optional - untuk final exam)
- `title` (STRING, Required)
- `description` (TEXT, Optional)
- `type` (ENUM: PRACTICE, EXAM, FINAL_EXAM, Default: PRACTICE)
- `passingScore` (INTEGER, Default: 70, Percentage)
- `timeLimit` (INTEGER, Minutes, Optional - NULL = no limit)
- `maxAttempts` (INTEGER, Optional - NULL = unlimited)
- `randomizeQuestions` (BOOLEAN, Default: false)
- `showAnswersAfterSubmit` (BOOLEAN, Default: true)
- `createdAt`, `updatedAt` (Timestamps)

**Relations**:

- `belongsTo(Lesson)` - Quiz dapat dimiliki oleh satu Lesson
- `belongsTo(Course)` - Quiz dapat dimiliki oleh satu Course (final exam)
- `hasMany(Question)` - Quiz memiliki banyak Question
- `hasMany(ExamResult)` - Quiz memiliki banyak ExamResult

---

#### 8. Certificate Model

**File**: `src/models/Certificate.js`

**Fields**:

- `id` (INTEGER, PK, Auto Increment)
- `userId` (INTEGER, FK to users)
- `courseId` (INTEGER, FK to courses)
- `certificateNumber` (STRING, Unique, Format: LMS-YYYY-CERT-XXXXXX)
- `qrCode` (TEXT, QR Code data URL)
- `pdfUrl` (STRING, PDF certificate URL)
- `status` (ENUM: PENDING, APPROVED, REJECTED, Default: PENDING)
- `issuedAt` (DATE, Optional)
- `approvedBy` (INTEGER, FK to users, Optional)
- `approvedAt` (DATE, Optional)
- `rejectionReason` (TEXT, Optional)
- `createdAt`, `updatedAt` (Timestamps)

**Relations**:

- `belongsTo(User)` - Certificate dimiliki oleh satu User (student)
- `belongsTo(Course)` - Certificate untuk satu Course
- `belongsTo(User)` - Approved by User (assessor/admin)

**Unique Constraint**: `(userId, courseId)` - Satu user hanya bisa dapat satu certificate per course

---

#### 9. CourseAssessor Model

**File**: `src/models/CourseAssessor.js`

**Fields**:

- `id` (INTEGER, PK, Auto Increment)
- `courseId` (INTEGER, FK to courses)
- `assessorId` (INTEGER, FK to users, must be ASSESSOR role)
- `createdAt`, `updatedAt` (Timestamps)

**Relations**:

- `belongsTo(Course)` - CourseAssessor belongs to Course
- `belongsTo(User)` - CourseAssessor belongs to User (Assessor)
- Many-to-many: Course ↔ Assessor (through CourseAssessor)

**Unique Constraint**: `(courseId, assessorId)` - Prevent duplicate assignments

**Business Rules**:

- Satu course dapat memiliki banyak assessor
- Satu assessor dapat handle banyak courses
- Hanya assigned assessor yang bisa approve certificate untuk course tersebut
- ADMIN dapat approve sebagai fallback meskipun tidak ada assessor assigned

---

#### 10. ActivityLog Model

**File**: `src/models/ActivityLog.js`

**Fields**:

- `id` (INTEGER, PK, Auto Increment)
- `userId` (INTEGER, FK to users, Optional - untuk system events)
- `eventType` (ENUM: USER_LOGIN, COURSE_ENROLL, LESSON_COMPLETE, QUIZ_SUBMIT, CERT_REQUESTED, CERT_APPROVED, CERT_REJECTED, ASSESSOR_ASSIGNED_TO_COURSE, ASSESSOR_UNASSIGNED_FROM_COURSE)
- `entityType` (ENUM: USER, COURSE, QUIZ, CERTIFICATE, SYSTEM)
- `entityId` (INTEGER, Optional - ID dari entity terkait)
- `metadata` (JSON, Optional - Additional event data)
- `ipAddress` (STRING(45), Optional - Supports IPv6)
- `userAgent` (TEXT, Optional)
- `createdAt` (Timestamp only - immutable)

**Relations**:

- `belongsTo(User)` - ActivityLog dapat dimiliki oleh User (nullable untuk system events)

**Indexes**: userId, eventType, entityType, entityId, createdAt

---

#### 11. Notification Model

**File**: `src/models/Notification.js`

**Fields**:

- `id` (INTEGER, PK, Auto Increment)
- `userId` (INTEGER, FK to users)
- `title` (STRING, Required)
- `message` (TEXT, Required)
- `type` (ENUM: INFO, SUCCESS, WARNING, ERROR, Default: INFO)
- `isRead` (BOOLEAN, Default: false)
- `entityType` (ENUM: COURSE, QUIZ, CERTIFICATE, ENROLLMENT, SYSTEM, Optional)
- `entityId` (INTEGER, Optional - untuk navigation)
- `createdAt` (Timestamp only - immutable)

**Relations**:

- `belongsTo(User)` - Notification dimiliki oleh User

**Indexes**: userId, isRead, createdAt, (userId, isRead)

---

### Controllers

#### 1. authController.js

**Fungsi**: Handle authentication & authorization

**Methods**:

- `register(req, res)` - Register user baru, kirim verification email
- `login(req, res)` - Login user, generate JWT tokens
- `verifyEmail(req, res)` - Verify email dengan token
- `refreshToken(req, res)` - Refresh access token
- `logout(req, res)` - Logout user, invalidate refresh token
- `forgotPassword(req, res)` - Request password reset
- `resetPassword(req, res)` - Reset password dengan token

**Dependencies**:

- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT generation
- `emailService` - Send verification/reset emails
- `User`, `Role` models

---

#### 2. courseController.js

**Fungsi**: Manage courses, sections, lessons

**Methods**:

- `getAllCourses(req, res)` - List semua courses dengan filters (public)
- `getCourseById(req, res)` - Get course details dengan sections & lessons
- `getMyCourses(req, res)` - Get courses milik instructor (INSTRUCTOR/ADMIN)
- `createCourse(req, res)` - Create course baru (INSTRUCTOR/ADMIN)
- `updateCourse(req, res)` - Update course (INSTRUCTOR/ADMIN, own course)
- `deleteCourse(req, res)` - Delete course (INSTRUCTOR/ADMIN, own course)
- `togglePublish(req, res)` - Publish/unpublish course (INSTRUCTOR/ADMIN)

**Dependencies**:

- `cloudinaryService` - Upload thumbnail
- `Course`, `Category`, `User`, `Section`, `Lesson` models

---

#### 3. enrollmentController.js

**Fungsi**: Handle course enrollment & progress

**Methods**:

- `enrollCourse(req, res)` - Enroll student ke course
- `getMyEnrollments(req, res)` - Get enrollments milik user
- `getLearningData(req, res)` - Get learning page data dengan lesson locking
- `getEnrollmentProgress(req, res)` - Get progress detail
- `unenrollCourse(req, res)` - Unenroll dari course

**Dependencies**:

- `Enrollment`, `Course`, `Lesson`, `Section`, `LessonProgress` models

---

#### 4. lessonProgressController.js

**Fungsi**: Handle lesson progress & completion

**Methods**:

- `getLessonContent(req, res)` - Get lesson content dengan JSON structure (protected)
- `markLessonComplete(req, res)` - Mark lesson as complete dengan type-specific validation via lessonCompletionService
- `updateWatchTime(req, res)` - Update video watch time

**Dependencies**:

- `Lesson`, `LessonProgress`, `Enrollment` models
- `lessonCompletionService` - Centralized completion validation

---

#### 5. quizController.js

**Fungsi**: Handle quiz creation & taking

**Methods**:

- `getQuizDetails(req, res)` - Get quiz details dengan attempts info
- `startQuiz(req, res)` - Start quiz, generate session, return questions
- `submitQuiz(req, res)` - Submit answers, auto-grade, save result
- `getQuizResults(req, res)` - Get quiz results dengan answers (if enabled)
- `createQuiz(req, res)` - Create quiz baru (INSTRUCTOR/ADMIN)
- `addQuestion(req, res)` - Add question ke quiz (INSTRUCTOR/ADMIN)

**Dependencies**:

- `Quiz`, `Question`, `ExamResult`, `Course`, `Lesson` models

---

#### 5. certificateController.js

**Fungsi**: Handle certificate generation & approval

**Methods**:

- `requestCertificate(req, res)` - Request certificate setelah course completion
- `getMyCertificates(req, res)` - Get certificates milik user
- `downloadCertificate(req, res)` - Download certificate PDF
- `getPendingCertificates(req, res)` - Get pending certificates (ASSESSOR/ADMIN, filtered by assigned courses)
- `approveCertificate(req, res)` - Approve/reject certificate (ASSESSOR/ADMIN, dengan authorization check)
- `verifyCertificate(req, res)` - Verify certificate (PUBLIC, no auth)

**Dependencies**:

- `pdfService` - Generate PDF
- `qrService` - Generate QR code
- `cloudinaryService` - Upload PDF
- `Certificate`, `Course`, `User`, `Enrollment`, `CourseAssessor` models

---

#### 7. courseAssessorController.js

**Fungsi**: Handle assessor assignment ke courses

**Methods**:

- `assignAssessors(req, res)` - Assign assessors ke course (ADMIN/SUPER_ADMIN)
- `getAssignedAssessors(req, res)` - Get assigned assessors untuk course (ADMIN/SUPER_ADMIN/INSTRUCTOR)

**Dependencies**:

- `CourseAssessor`, `Course`, `User` models
- `activityLogService` - Log assessor assignment events

---

#### 7. dashboardController.js

**Fungsi**: Handle dashboard statistics

**Methods**:

- `getDashboardStats(req, res)` - Get dashboard statistics (ADMIN/SUPER_ADMIN)

**Dependencies**:

- `User`, `Course`, `Enrollment`, `Certificate`, `ActivityLog` models

---

#### 8. instructorController.js

**Fungsi**: Handle instructor-specific data dan analytics

**Methods**:

- `getDashboardStats(req, res)` - Get instructor dashboard statistics (total courses, students, reviews, rating)
- `getMyStudents(req, res)` - Get students enrolled in instructor's courses dengan pagination dan search
- `getMyAnalytics(req, res)` - Get analytics untuk instructor's courses (completion rates, enrollment trends, etc.)

**Dependencies**:

- `Course`, `Enrollment`, `User`, `LessonProgress` models

---

#### 9. activityLogController.js

**Fungsi**: Handle activity log queries

**Methods**:

- `getActivityLogs(req, res)` - Get activity logs dengan filters (ADMIN/SUPER_ADMIN)
- `getActivityLogStats(req, res)` - Get activity log statistics (ADMIN/SUPER_ADMIN)

**Dependencies**:

- `ActivityLog`, `User` models

---

#### 12. notificationController.js

**Fungsi**: Handle notifications

**Methods**:

- `getNotifications(req, res)` - Get user notifications
- `getUnreadCount(req, res)` - Get unread notification count
- `markAsRead(req, res)` - Mark notification as read
- `markAllAsRead(req, res)` - Mark all notifications as read
- `deleteNotification(req, res)` - Delete notification

**Dependencies**:

- `Notification`, `User` models

---

### Routes

#### 1. authRoutes.js

```javascript
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/verify-email/:token
POST   /api/auth/refresh
POST   /api/auth/logout (protected)
```

#### 2. userRoutes.js

```javascript
GET    /api/users/me (protected)
PUT    /api/users/me (protected)
PUT    /api/users/me/password (protected)
DELETE /api/users/me (protected)
GET    /api/users (ADMIN/SUPER_ADMIN)
GET    /api/users/:id (ADMIN/SUPER_ADMIN)
PUT    /api/users/:id/role (ADMIN/SUPER_ADMIN)
DELETE /api/users/:id (ADMIN/SUPER_ADMIN)
```

#### 3. courseRoutes.js

```javascript
GET    /api/courses (public)
GET    /api/courses/my-courses (INSTRUCTOR/ADMIN)
GET    /api/courses/:id (public)
POST   /api/courses (INSTRUCTOR/ADMIN, multipart/form-data)
PUT    /api/courses/:id (INSTRUCTOR/ADMIN)
DELETE /api/courses/:id (INSTRUCTOR/ADMIN)
PATCH  /api/courses/:id/publish (INSTRUCTOR/ADMIN)
POST   /api/courses/:courseId/sections (INSTRUCTOR/ADMIN)
PUT    /api/courses/sections/:id (INSTRUCTOR/ADMIN)
DELETE /api/courses/sections/:id (INSTRUCTOR/ADMIN)
POST   /api/courses/sections/:sectionId/lessons (INSTRUCTOR/ADMIN)
PUT    /api/courses/lessons/:id (INSTRUCTOR/ADMIN)
DELETE /api/courses/lessons/:id (INSTRUCTOR/ADMIN)
```

#### 4. enrollmentRoutes.js

```javascript
POST   /api/enrollments (protected)
GET    /api/enrollments/me (protected)
GET    /api/enrollments/:enrollmentId/learn (protected)
GET    /api/enrollments/:enrollmentId/progress (protected)
DELETE /api/enrollments/:enrollmentId (protected)
```

#### 5. lessonRoutes.js

```javascript
GET    /api/lessons/:lessonId/content (protected)
POST   /api/lessons/:lessonId/complete (protected)
PATCH  /api/lessons/:lessonId/watch-time (protected)
```

#### 6. quizRoutes.js

```javascript
GET    /api/quizzes/:quizId (protected)
POST   /api/quizzes/:quizId/start (protected)
POST   /api/quizzes/:quizId/submit (protected)
GET    /api/quizzes/:quizId/results (protected)
POST   /api/quizzes (INSTRUCTOR/ADMIN)
POST   /api/quizzes/:quizId/questions (INSTRUCTOR/ADMIN)
```

#### 7. certificateRoutes.js

```javascript
GET    /api/certificates/verify/:certificateNumber (public)
POST   /api/certificates (protected)
GET    /api/certificates/me (protected)
GET    /api/certificates/:id/download (protected)
GET    /api/certificates/pending/list (ASSESSOR/ADMIN)
PATCH  /api/certificates/:id/approve (ASSESSOR/ADMIN)
```

#### 8. courseRoutes.js (Additional Endpoints)

```javascript
GET    /api/courses/admin/all (ADMIN/SUPER_ADMIN)
DELETE /api/courses/my-courses/:id (INSTRUCTOR)
PATCH  /api/courses/:id/assign-instructor (ADMIN/SUPER_ADMIN)
POST   /api/courses/:id/publish-new-version (INSTRUCTOR/ADMIN)
POST   /api/courses/:courseId/assessors (ADMIN/SUPER_ADMIN)
GET    /api/courses/:courseId/assessors (ADMIN/SUPER_ADMIN/INSTRUCTOR)
```

#### 9. dashboardRoutes.js

```javascript
GET / api / admin / dashboard / stats(ADMIN / SUPER_ADMIN);
```

#### 10. activityLogRoutes.js

```javascript
GET / api / activity - logs(ADMIN / SUPER_ADMIN);
GET / api / activity - logs / stats(ADMIN / SUPER_ADMIN);
```

#### 11. instructorRoutes.js

```javascript
GET / api / instructor / dashboard / stats(INSTRUCTOR / ADMIN);
GET / api / instructor / students(INSTRUCTOR / ADMIN);
GET / api / instructor / analytics(INSTRUCTOR / ADMIN);
```

#### 12. notificationRoutes.js

```javascript
GET    /api/notifications (protected)
GET    /api/notifications/unread-count (protected)
PATCH  /api/notifications/:id/read (protected)
PATCH  /api/notifications/mark-all-read (protected)
DELETE /api/notifications/:id (protected)
```

---

### Middleware

#### auth.js

**File**: `src/middleware/auth.js`

**Functions**:

1. **verifyToken(req, res, next)**

   - Verify JWT token dari Authorization header
   - Extract user info dari token
   - Check user masih exists & active
   - Attach user ke `req.user`
   - Error: 401 jika token invalid/expired

2. **hasRole(allowedRoles)**
   - Middleware factory untuk check role
   - Check `req.user.roleName` dalam `allowedRoles`
   - Error: 403 jika role tidak sesuai

**Usage**:

```javascript
router.get("/protected", verifyToken, controller.method);
router.post("/admin-only", verifyToken, hasRole(["ADMIN"]), controller.method);
```

---

### Services

#### 1. emailService.js

**Fungsi**: Send emails (verification, password reset, notifications)

**Methods**:

- `sendVerificationEmail(email, token)` - Send email verification
- `sendPasswordResetEmail(email, token)` - Send password reset link
- `sendCertificateApprovedEmail(email, certificateData)` - Notify certificate approved

**Dependencies**: `nodemailer`

---

#### 2. pdfService.js

**Fungsi**: Generate PDF certificates

**Methods**:

- `generateCertificatePDF(certificateData)` - Generate PDF dengan QR code

**Dependencies**: `pdfkit`, `qrService`

**Output**: PDF file di `uploads/certificates/`

---

#### 3. qrService.js

**Fungsi**: Generate QR codes untuk certificate verification

**Methods**:

- `generateQRCode(verifyUrl)` - Generate QR code data URL

**Dependencies**: `qrcode`

---

#### 4. cloudinaryService.js

**Fungsi**: Upload files ke Cloudinary

**Methods**:

- `uploadImage(file, folder)` - Upload image (thumbnail)
- `uploadVideo(file, folder)` - Upload video
- `uploadPDF(file, folder)` - Upload PDF

**Dependencies**: `cloudinary`

---

#### 5. notificationService.js

**Fungsi**: Create dan manage notifications

**Methods**:

- `createNotification(userId, title, message, type, entityType, entityId)` - Create notification
- `sendNotificationToUser(userId, notificationData)` - Send notification ke user

**Dependencies**: `Notification` model

---

#### 6. activityLogService.js

**Fungsi**: Log user activities

**Methods**:

- `logActivity(userId, eventType, entityType, entityId, metadata, ipAddress, userAgent)` - Log activity

**Dependencies**: `ActivityLog` model

---

#### 7. courseVersionService.js

**Fungsi**: Handle course versioning

**Methods**:

- `publishNewVersion(courseId, instructorId)` - Publish new course version

**Dependencies**: `Course` model

---

#### 8. localFileService.js

**Fungsi**: Handle local file operations

**Methods**:

- File upload utilities untuk local storage

---

#### 9. lessonCompletionService.js

**Fungsi**: Centralized service untuk lesson completion validation dan management

**Methods**:

- `validateCompletion(lesson, userId, payload)` - Validate completion requirements berdasarkan lesson type
- `markComplete(lessonId, userId, payload)` - Mark lesson as complete dengan full validation
- `getCompletionStatus(lessonId, userId)` - Get completion status untuk lesson
- `validateContentSchema(type, content)` - Validate content schema berdasarkan lesson type

**Features**:

- Type-specific completion rules (VIDEO: minWatchPercentage, ASSIGNMENT: submission required, etc.)
- Prevents client-side spoofing
- Enforces sequential completion when required
- Handles QUIZ/EXAM completion via quiz submission

**Dependencies**: `Lesson`, `LessonProgress`, `Enrollment`, `Quiz`, `ExamResult` models

---

#### 9. lessonCompletionService.js

**Fungsi**: Centralized service untuk lesson completion validation dan management

**Methods**:

- `validateCompletion(lesson, userId, payload)` - Validate completion requirements berdasarkan lesson type
- `markComplete(lessonId, userId, payload)` - Mark lesson as complete dengan full validation
- `getCompletionStatus(lessonId, userId)` - Get completion status untuk lesson
- `validateContentSchema(type, content)` - Validate content schema berdasarkan lesson type

**Features**:

- Type-specific completion rules (VIDEO: minWatchPercentage, ASSIGNMENT: submission required, etc.)
- Prevents client-side spoofing
- Enforces sequential completion when required
- Handles QUIZ/EXAM completion via quiz submission

**Dependencies**: `Lesson`, `LessonProgress`, `Enrollment`, `Quiz`, `ExamResult` models

---

## Dokumentasi Frontend

### Struktur Folder Frontend

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── login/                # Authentication
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── verify-email/
│   │   └── [token]/
│   │       └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   ├── reset-password/
│   │   └── [token]/
│   │       └── page.tsx
│   │
│   ├── dashboard/            # Student Dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── courses/
│   │   │   └── page.tsx
│   │   ├── quizzes/
│   │   │   └── page.tsx
│   │   ├── certificates/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   │
│   ├── instructor/           # Instructor Dashboard
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   ├── students/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   │
│   ├── admin/                # Admin Dashboard
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   └── page.tsx
│   │   ├── certificates/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── courses/              # Public Course Pages
│   │   ├── page.tsx          # Course listing
│   │   └── [id]/
│   │       └── page.tsx      # Course details
│   │
│   ├── learn/                # Learning Interface
│   │   └── [courseId]/
│   │       └── page.tsx      # Learning page
│   │
│   ├── verify/                # Certificate Verification
│   │   └── [certificateNumber]/
│   │       └── page.tsx
│   │
│   ├── assessor/              # Assessor Dashboard
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── certificates/
│   │       └── page.tsx
│   │
│   ├── about/                 # Public Pages
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   │
│   └── ... (other pages)
│
├── components/               # React Components
│   ├── layouts/             # Layout Components
│   │   ├── Header.tsx       # Public header
│   │   ├── Footer.tsx       # Footer
│   │   ├── Sidebar.tsx      # Dashboard sidebar
│   │   ├── SidebarContext.tsx
│   │   ├── StudentHeader.tsx
│   │   ├── InstructorHeader.tsx
│   │   ├── AdminHeader.tsx
│   │   └── index.ts
│   │
│   ├── course/              # Course Components
│   │   ├── CourseCard.tsx
│   │   ├── CourseFilters.tsx
│   │   ├── LessonList.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── PDFViewer.tsx
│   │
│   ├── lesson/              # Lesson Type Components
│   │   ├── LessonRenderer.tsx
│   │   ├── VideoLesson.tsx
│   │   ├── MaterialLesson.tsx
│   │   ├── LiveSessionLesson.tsx
│   │   ├── AssignmentLesson.tsx
│   │   ├── QuizLesson.tsx
│   │   ├── ExamLesson.tsx
│   │   └── DiscussionLesson.tsx
│   │
│   ├── quiz/                # Quiz Components
│   │   ├── QuizStart.tsx
│   │   ├── QuestionCard.tsx
│   │   └── QuizResults.tsx
│   │
│   ├── dashboard/           # Dashboard Components
│   │   ├── DashboardCard.tsx
│   │   └── EnrolledCourseCard.tsx
│   │
│   ├── notifications/       # Notification Components
│   │   ├── NotificationBell.tsx
│   │   ├── NotificationDropdown.tsx
│   │   └── NotificationItem.tsx
│   │
│   ├── certificate/         # Certificate Components
│   │   └── (certificate components)
│   │
│   └── ui/                  # UI Components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Avatar.tsx
│       ├── Modal.tsx
│       ├── Skeleton.tsx
│       ├── ThemeToggle.tsx
│       ├── Toast.tsx
│       └── index.ts
│
├── hooks/                    # Custom Hooks
│   └── useAuth.ts           # Authentication hook
│
├── lib/                      # Utilities
│   ├── auth.ts              # Auth utilities
│   ├── api.ts               # API client utilities
│   ├── theme.tsx            # Theme provider
│   ├── utils.ts             # General utilities
│   └── lessonUtils.ts       # Lesson utilities
│
├── store/                    # Redux Store
│   ├── slices/              # Redux Slices
│   │   ├── authSlice.ts
│   │   ├── userSlice.ts
│   │   ├── courseSlice.ts
│   │   ├── enrollmentSlice.ts
│   │   ├── lessonSlice.ts
│   │   ├── certificateSlice.ts
│   │   ├── notificationSlice.ts
│   │   ├── activityLogSlice.ts
│   │   ├── categorySlice.ts
│   │   ├── dashboardSlice.ts
│   │   └── courseAssessorSlice.ts
│   ├── api.ts               # RTK Query API
│   ├── hooks.ts             # Typed hooks
│   ├── store.ts             # Store configuration
│   └── ReduxProvider.tsx    # Redux Provider
│
└── public/                   # Static Assets
```

---

### Pages

#### 1. Public Pages

**Home Page** (`app/page.tsx`)

- Hero section
- Featured courses
- Stats
- CTA buttons

**Course Listing** (`app/courses/page.tsx`)

- List semua published courses
- Filters (category, level, type, search)
- Pagination
- Course cards

**Course Details** (`app/courses/[id]/page.tsx`)

- Course information
- Sections & lessons list
- Instructor info
- Enroll button
- Reviews (future)

**Login** (`app/login/page.tsx`)

- Email & password form
- Redirect setelah login berdasarkan role

**Register** (`app/register/page.tsx`)

- Registration form
- Role selection
- Email verification notice

---

#### 2. Student Dashboard Pages

**Dashboard** (`app/dashboard/page.tsx`)

- Overview stats
- Recent enrollments
- Progress charts
- Quick actions

**My Courses** (`app/dashboard/courses/page.tsx`)

- List enrolled courses
- Progress indicators
- Continue learning buttons
- Filter by status (ACTIVE, COMPLETED, DROPPED)

**Browse Courses** (`app/dashboard/browse-courses/page.tsx`)

- Browse available courses
- Search and filter courses
- Enroll in courses

**Course Detail** (`app/dashboard/courses/[id]/page.tsx`)

- Course detail untuk enrolled course
- Progress tracking
- Access learning page

**Quizzes** (`app/dashboard/quizzes/page.tsx`)

- List available quizzes
- Attempts info
- Start quiz buttons

**Certificates** (`app/dashboard/certificates/page.tsx`)

- List certificates
- Download buttons
- Verification links
- Status badges (PENDING, APPROVED, REJECTED)

**Profile** (`app/dashboard/profile/page.tsx`)

- User information
- Edit profile form
- Change password form

---

#### 3. Instructor Dashboard Pages

**Dashboard** (`app/instructor/dashboard/page.tsx`)

- Course stats
- Student count
- Enrollment charts
- Recent activity

**My Courses** (`app/instructor/courses/page.tsx`)

- List created courses
- Create course button
- Edit/delete actions
- Publish status

**Create Course** (`app/instructor/courses/create/page.tsx`)

- Course form
- Thumbnail upload
- Section & lesson management
- Publish option

**Students** (`app/instructor/students/page.tsx`)

- List students enrolled in instructor's courses (dynamic data)
- Progress tracking per student
- Filter by course
- Search functionality
- Pagination support

**Analytics** (`app/instructor/analytics/page.tsx`)

- Course performance metrics (dynamic data)
- Student engagement statistics
- Completion rates
- Enrollment growth trends
- Charts & graphs dengan real-time data

**Dashboard** (`app/instructor/dashboard/page.tsx`)

- Course statistics (total courses, students, reviews, rating) - dynamic data
- Quick overview metrics
- Recent activity summary

---

#### 4. Admin Dashboard Pages

**Dashboard** (`app/admin/dashboard/page.tsx`)

- System overview
- User stats
- Course stats
- Certificate stats

**Users** (`app/admin/users/page.tsx`)

- List all users
- Role management
- Activate/deactivate
- Search & filter

**Courses** (`app/admin/courses/page.tsx`)

- List all courses
- Approve/reject
- Edit/delete
- Filter by instructor

**Certificates** (`app/admin/certificates/page.tsx`)

- List all certificates
- Pending approvals
- Approve/reject actions
- Filter by status

**Settings** (`app/admin/settings/page.tsx`)

- System settings
- Category management
- Role & permission management

**Activity Logs** (`app/admin/activity-logs/page.tsx`)

- View all activity logs
- Filter by user, event type, date
- Activity statistics

**Categories** (`app/admin/categories/page.tsx`)

- Manage course categories
- Create, update, delete categories

**Course Detail** (`app/admin/courses/[id]/page.tsx`)

- Course detail dengan full management
- Assign assessors
- Assign instructor
- View enrolled students

---

#### 5. Assessor Dashboard Pages

**Dashboard** (`app/assessor/dashboard/page.tsx`)

- Overview pending certificates
- Statistics
- Quick actions

**Certificates** (`app/assessor/certificates/page.tsx`)

- List pending certificates (filtered by assigned courses)
- Approve/reject certificates
- View certificate details

---

#### 5. Learning Interface

**Learning Page** (`app/learn/[courseId]/page.tsx`)

- Sidebar dengan sections & lessons
- Main content area
- Video player / PDF viewer / Text content
- Progress tracking
- Next/Previous navigation
- Lesson locking logic

---

### Components

#### Layout Components

**1. Header.tsx** (Public)

- Logo
- Navigation menu
- Login/Register buttons
- Theme toggle

**2. Footer.tsx**

- Links
- Social media
- Copyright

**3. Sidebar.tsx**

- Role-based menu items
- Collapsible
- Active route highlighting
- User profile section

**4. StudentHeader.tsx**

- User info
- Notifications
- Theme toggle
- Logout

**5. InstructorHeader.tsx**

- User info
- Course quick actions
- Notifications
- Theme toggle

**6. AdminHeader.tsx**

- User info
- Admin quick actions
- Notifications
- Theme toggle

**7. AssessorHeader.tsx**

- User info
- Assessor quick actions
- Notifications
- Theme toggle

---

#### Course Components

**1. CourseCard.tsx**

- Course thumbnail
- Title & description
- Instructor info
- Level & type badges
- Enroll button
- Progress bar (if enrolled)

**2. CourseFilters.tsx**

- Category filter
- Level filter (BEGINNER, INTERMEDIATE, ADVANCED)
- Type filter (FREE, PAID, PREMIUM)
- Search input
- Sort options

**3. LessonList.tsx**

- Sections & lessons tree
- Lock/unlock indicators
- Progress indicators
- Lesson type icons
- Click to navigate

**4. VideoPlayer.tsx**

- Video player dengan controls
- Progress tracking
- Auto-save watch time
- Fullscreen support

**5. PDFViewer.tsx**

- PDF viewer
- Download button
- Zoom controls
- Page navigation

---

#### Lesson Components

**1. LessonRenderer.tsx**

- Central component untuk render lesson berdasarkan type
- Auto-select appropriate lesson component
- Handle completion callbacks
- Progress tracking integration

**2. VideoLesson.tsx**

- Video player dengan controls
- Watch time tracking
- Auto-save progress
- Completion validation (minWatchPercentage)

**3. MaterialLesson.tsx**

- Material viewer (PDF, documents)
- Download functionality
- Content display
- Auto-completion support

**4. LiveSessionLesson.tsx**

- Live session information
- Meeting URL integration
- Scheduled time display
- Attendance tracking

**5. AssignmentLesson.tsx**

- Assignment instructions
- Submission form (file/text/link)
- Deadline display
- Submission status

**6. QuizLesson.tsx & ExamLesson.tsx**

- Quiz/Exam integration
- Link ke quiz interface
- Completion via quiz submission
- Results display

**7. DiscussionLesson.tsx**

- Discussion topic display
- Instructions
- Participation tracking

---

#### Quiz Components

**1. QuizStart.tsx**

- Quiz info (time limit, attempts, passing score)
- Start button
- Previous attempts display

**2. QuestionCard.tsx**

- Question text
- Answer options (multiple choice/true-false)
- Text input (short answer)
- Timer display
- Navigation buttons

**3. QuizResults.tsx**

- Score display
- Pass/fail indicator
- Correct answers (if enabled)
- Attempt number
- Retake button (if allowed)

---

#### UI Components

**1. Button.tsx**

- Variants (primary, secondary, danger)
- Sizes (sm, md, lg)
- Loading state
- Disabled state
- Icon support

**2. Input.tsx**

- Text, email, password types
- Label & placeholder
- Error messages
- Icon support

**3. Card.tsx**

- Container dengan padding
- Header & footer slots
- Hover effects

**4. Badge.tsx**

- Status badges
- Color variants
- Size options

**5. Avatar.tsx**

- User initials
- Image support
- Size variants

**6. Modal.tsx**

- Overlay
- Close button
- Content slot
- Size variants

**7. Skeleton.tsx**

- Loading placeholders
- Various shapes

**8. ThemeToggle.tsx**

- Light/dark mode toggle
- Icon animation

**9. Toast.tsx**

- Toast notification component
- Success, error, warning, info variants
- Auto-dismiss functionality

---

#### Notification Components

**1. NotificationBell.tsx**

- Notification bell icon dengan badge
- Unread count display
- Click to open dropdown

**2. NotificationDropdown.tsx**

- Dropdown menu dengan list notifications
- Mark as read functionality
- Navigation to related entities

**3. NotificationItem.tsx**

- Individual notification item
- Type-based styling
- Read/unread states

---

### Hooks

#### useAuth.ts

**File**: `hooks/useAuth.ts`

**Exports**:

1. **useAuth()**

   - Returns: `{ user, loading, isAuthenticated, hasRole }`
   - Get current user dari localStorage
   - Check authentication status
   - Role checking utility

2. **useRequireAuth()**

   - Redirect ke login jika tidak authenticated
   - Returns: `{ user, loading, isAuthenticated }`

3. **useRequireRole(allowedRoles, redirectTo)**
   - Redirect jika role tidak sesuai
   - Returns: `{ user, loading, isAuthenticated }`

**Usage**:

```typescript
const { user, isAuthenticated, hasRole } = useAuth();
const isAdmin = hasRole(["ADMIN", "SUPER_ADMIN"]);
```

---

### Redux Store

**File**: `store/store.ts`

**Slices**:

1. **authSlice** - Authentication state
2. **userSlice** - User profile management
3. **courseSlice** - Course data management
4. **enrollmentSlice** - Enrollment management
5. **lessonSlice** - Lesson data management (updated dengan 7 lesson types)
6. **certificateSlice** - Certificate management
7. **notificationSlice** - Notification management
8. **activityLogSlice** - Activity log queries
9. **categorySlice** - Category management
10. **dashboardSlice** - Dashboard statistics
11. **courseAssessorSlice** - Assessor assignment management
12. **instructorSlice** - Instructor-specific data (students, analytics, dashboard stats)

**Typed Hooks**:

- `useAppDispatch()` - Typed dispatch hook
- `useAppSelector()` - Typed selector hook

**Usage**:

```typescript
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCourses } from "@/store/slices/courseSlice";

const dispatch = useAppDispatch();
const { courses, loading } = useAppSelector((state) => state.course);
```

---

### Lib Utilities

#### auth.ts

**File**: `lib/auth.ts`

**Functions**:

- `getCurrentUser()` - Get user dari localStorage
- `getAccessToken()` - Get access token
- `hasRole(user, roles)` - Check role
- `isAuthenticated()` - Check auth status
- `isAdmin(user)` - Check if admin
- `isInstructor(user)` - Check if instructor
- `isStudent(user)` - Check if student
- `isAssessor(user)` - Check if assessor
- `getUserRole(user)` - Get role name
- `getUserDisplayName(user)` - Get display name
- `getUserInitials(user)` - Get initials for avatar

---

#### api.ts

**File**: `lib/api.ts`

**Functions**:

- `getApiBaseUrl()` - Get base API URL dari environment
- `getApiUrl(endpoint)` - Build full API URL
- `getFileUrl(filePath)` - Convert relative file path ke full URL
- `apiGet<T>(endpoint, options)` - GET request
- `apiPost<T>(endpoint, data, options)` - POST request
- `apiPut<T>(endpoint, data, options)` - PUT request
- `apiPatch<T>(endpoint, data, options)` - PATCH request
- `apiDelete<T>(endpoint, options)` - DELETE request

---

#### lessonUtils.ts

**File**: `lib/lessonUtils.ts`

**Functions**:

- Lesson utility functions untuk handling lesson types
- Lesson content parsing
- Lesson progress calculations

---

#### utils.ts

**File**: `lib/utils.ts`

**Functions**:

- `cn(...inputs)` - Merge Tailwind classes (clsx + tailwind-merge)
- `formatDate(date)` - Format date to readable string
- `truncate(text, length)` - Truncate text
- `calculateProgress(completed, total)` - Calculate percentage
- `formatDuration(seconds)` - Format duration (e.g., "1h 30m")
- `sleep(ms)` - Delay utility

---

#### theme.tsx

**File**: `lib/theme.tsx`

**Exports**:

1. **ThemeProvider**

   - Provider component untuk theme
   - Initialize dari localStorage atau system preference

2. **useTheme()**
   - Returns: `{ theme, setTheme, toggleTheme }`
   - Get/set theme (light/dark)
   - Persist ke localStorage

**Usage**:

```typescript
const { theme, toggleTheme } = useTheme();
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────┐         ┌──────────┐         ┌──────────────┐
│   User   │────────▶│   Role   │◀───────▶│  Permission  │
└────┬─────┘         └──────────┘         └──────────────┘
     │
     │
     ├─────────────────┐
     │                 │
     ▼                 ▼
┌──────────┐    ┌──────────────┐
│  Course  │    │  Enrollment  │
└────┬─────┘    └──────┬────────┘
     │                 │
     │                 ▼
     │          ┌──────────────┐
     │          │LessonProgress│
     │          └──────────────┘
     │
     ├──────────┐
     │          │
     ▼          ▼
┌──────────┐  ┌──────────┐
│ Section  │  │   Quiz    │
└────┬─────┘  └────┬──────┘
     │             │
     ▼             ▼
┌──────────┐  ┌──────────┐
│  Lesson  │  │ Question │
└──────────┘  └────┬──────┘
                   │
                   ▼
            ┌──────────────┐
            │ ExamResult   │
            └──────────────┘

┌──────────┐         ┌──────────────┐
│   User   │────────▶│ Certificate  │
└────┬─────┘         └──────┬───────┘
     │                      │
     │                      ▼
     │               ┌──────────┐
     │               │  Course   │
     │               └──────┬─────┘
     │                      │
     │                      ▼
     │               ┌──────────────┐
     │               │CourseAssessor │
     │               └──────┬───────┘
     │                      │
     │                      ▼
     │               ┌──────────┐
     │               │   User    │
     │               │(Assessor) │
     │               └──────────┘
     │
     ├─────────────────┐
     │                 │
     ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ ActivityLog  │  │ Notification │
└──────────────┘  └──────────────┘
```

### Table Details

#### Authentication & RBAC Tables

1. **users** - User accounts
2. **roles** - 5 roles (SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT, ASSESSOR)
3. **permissions** - Resource-action permissions
4. **role_permissions** - Many-to-many junction

#### Course Management Tables

5. **categories** - Course categories
6. **courses** - Courses
7. **sections** - Course sections (ordered)
8. **lessons** - Lessons (7 types: VIDEO, MATERIAL, LIVE_SESSION, ASSIGNMENT, QUIZ, EXAM, DISCUSSION)

#### Enrollment & Progress Tables

9. **enrollments** - User-course enrollments
10. **lesson_progress** - Individual lesson completion

#### Assessment Tables

11. **quizzes** - Quizzes (PRACTICE, EXAM, FINAL_EXAM)
12. **questions** - Questions (MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER)
13. **exam_results** - Quiz results dengan scoring

#### Certification Tables

14. **certificates** - Certificates dengan approval workflow
15. **course_assessors** - Many-to-many: Course ↔ Assessor assignments

#### System Tables

16. **activity_logs** - Activity logging untuk audit trail
17. **notifications** - User notifications

---

## API Endpoints

### Base URL

```
http://localhost:5040/api
```

### Authentication Endpoints

| Method | Endpoint                    | Auth | Role | Description               |
| ------ | --------------------------- | ---- | ---- | ------------------------- |
| POST   | `/auth/register`            | ❌   | -    | Register user baru        |
| POST   | `/auth/login`               | ❌   | -    | Login user                |
| GET    | `/auth/verify-email/:token` | ❌   | -    | Verify email              |
| POST   | `/auth/refresh`             | ❌   | -    | Refresh access token      |
| POST   | `/auth/logout`              | ✅   | -    | Logout user               |
| POST   | `/auth/forgot-password`     | ❌   | -    | Request password reset    |
| POST   | `/auth/reset-password`      | ❌   | -    | Reset password with token |

### User Endpoints

| Method | Endpoint             | Auth | Role              | Description              |
| ------ | -------------------- | ---- | ----------------- | ------------------------ |
| GET    | `/users/me`          | ✅   | -                 | Get current user profile |
| PUT    | `/users/me`          | ✅   | -                 | Update profile           |
| PUT    | `/users/me/password` | ✅   | -                 | Change password          |
| DELETE | `/users/me`          | ✅   | -                 | Delete account           |
| GET    | `/users`             | ✅   | ADMIN/SUPER_ADMIN | List all users           |
| GET    | `/users/:id`         | ✅   | ADMIN/SUPER_ADMIN | Get user by ID           |
| PUT    | `/users/:id/role`    | ✅   | ADMIN/SUPER_ADMIN | Update user role         |
| DELETE | `/users/:id`         | ✅   | ADMIN/SUPER_ADMIN | Delete user              |

### Course Endpoints

| Method | Endpoint                               | Auth | Role                         | Description             |
| ------ | -------------------------------------- | ---- | ---------------------------- | ----------------------- |
| GET    | `/courses`                             | ❌   | -                            | List published courses  |
| GET    | `/courses/:id`                         | ❌   | -                            | Get course details      |
| GET    | `/courses/my-courses`                  | ✅   | INSTRUCTOR/ADMIN             | Get my courses          |
| GET    | `/courses/admin/all`                   | ✅   | ADMIN/SUPER_ADMIN            | Get all courses (admin) |
| POST   | `/courses`                             | ✅   | INSTRUCTOR/ADMIN             | Create course           |
| PUT    | `/courses/:id`                         | ✅   | INSTRUCTOR/ADMIN             | Update course           |
| DELETE | `/courses/:id`                         | ✅   | ADMIN/SUPER_ADMIN            | Delete course           |
| DELETE | `/courses/my-courses/:id`              | ✅   | INSTRUCTOR                   | Delete own course       |
| PATCH  | `/courses/:id/publish`                 | ✅   | INSTRUCTOR/ADMIN             | Publish/unpublish       |
| POST   | `/courses/:id/publish-new-version`     | ✅   | INSTRUCTOR/ADMIN             | Publish new version     |
| PATCH  | `/courses/:id/assign-instructor`       | ✅   | ADMIN/SUPER_ADMIN            | Assign instructor       |
| POST   | `/courses/:courseId/sections`          | ✅   | INSTRUCTOR/ADMIN             | Create section          |
| PUT    | `/courses/sections/:id`                | ✅   | INSTRUCTOR/ADMIN             | Update section          |
| DELETE | `/courses/sections/:id`                | ✅   | INSTRUCTOR/ADMIN             | Delete section          |
| POST   | `/courses/sections/:sectionId/lessons` | ✅   | INSTRUCTOR/ADMIN             | Create lesson           |
| PUT    | `/courses/lessons/:id`                 | ✅   | INSTRUCTOR/ADMIN             | Update lesson           |
| DELETE | `/courses/lessons/:id`                 | ✅   | INSTRUCTOR/ADMIN             | Delete lesson           |
| POST   | `/courses/:courseId/assessors`         | ✅   | ADMIN/SUPER_ADMIN            | Assign assessors        |
| GET    | `/courses/:courseId/assessors`         | ✅   | ADMIN/SUPER_ADMIN/INSTRUCTOR | Get assigned assessors  |

### Enrollment Endpoints

| Method | Endpoint                              | Auth | Role | Description        |
| ------ | ------------------------------------- | ---- | ---- | ------------------ |
| POST   | `/enrollments`                        | ✅   | -    | Enroll in course   |
| GET    | `/enrollments/me`                     | ✅   | -    | Get my enrollments |
| GET    | `/enrollments/:enrollmentId/learn`    | ✅   | -    | Get learning data  |
| GET    | `/enrollments/:enrollmentId/progress` | ✅   | -    | Get progress       |
| DELETE | `/enrollments/:enrollmentId`          | ✅   | -    | Unenroll           |

### Lesson Endpoints

| Method | Endpoint                        | Auth | Role | Description          |
| ------ | ------------------------------- | ---- | ---- | -------------------- |
| GET    | `/lessons/:lessonId/content`    | ✅   | -    | Get lesson content   |
| POST   | `/lessons/:lessonId/complete`   | ✅   | -    | Mark lesson complete |
| PATCH  | `/lessons/:lessonId/watch-time` | ✅   | -    | Update watch time    |

### Quiz Endpoints

| Method | Endpoint                     | Auth | Role             | Description      |
| ------ | ---------------------------- | ---- | ---------------- | ---------------- |
| GET    | `/quizzes/:quizId`           | ✅   | -                | Get quiz details |
| POST   | `/quizzes/:quizId/start`     | ✅   | -                | Start quiz       |
| POST   | `/quizzes/:quizId/submit`    | ✅   | -                | Submit quiz      |
| GET    | `/quizzes/:quizId/results`   | ✅   | -                | Get quiz results |
| POST   | `/quizzes`                   | ✅   | INSTRUCTOR/ADMIN | Create quiz      |
| POST   | `/quizzes/:quizId/questions` | ✅   | INSTRUCTOR/ADMIN | Add question     |

### Certificate Endpoints

| Method | Endpoint                                  | Auth | Role           | Description                                                          |
| ------ | ----------------------------------------- | ---- | -------------- | -------------------------------------------------------------------- |
| GET    | `/certificates/verify/:certificateNumber` | ❌   | -              | Verify certificate (public)                                          |
| POST   | `/certificates`                           | ✅   | -              | Request certificate                                                  |
| GET    | `/certificates/me`                        | ✅   | -              | Get my certificates                                                  |
| GET    | `/certificates/:id/download`              | ✅   | -              | Download certificate                                                 |
| GET    | `/certificates/pending/list`              | ✅   | ASSESSOR/ADMIN | Get pending certificates (filtered by assigned courses for ASSESSOR) |
| PATCH  | `/certificates/:id/approve`               | ✅   | ASSESSOR/ADMIN | Approve/reject certificate (ASSESSOR must be assigned to course)     |

### Category Endpoints

| Method | Endpoint      | Auth | Role              | Description     |
| ------ | ------------- | ---- | ----------------- | --------------- |
| GET    | `/categories` | ❌   | -                 | List categories |
| POST   | `/categories` | ✅   | ADMIN/SUPER_ADMIN | Create category |

### Dashboard Endpoints

| Method | Endpoint                 | Auth | Role              | Description              |
| ------ | ------------------------ | ---- | ----------------- | ------------------------ |
| GET    | `/admin/dashboard/stats` | ✅   | ADMIN/SUPER_ADMIN | Get dashboard statistics |

### Instructor Endpoints

| Method | Endpoint                      | Auth | Role                         | Description                      |
| ------ | ----------------------------- | ---- | ---------------------------- | -------------------------------- |
| GET    | `/instructor/dashboard/stats` | ✅   | INSTRUCTOR/ADMIN/SUPER_ADMIN | Get instructor dashboard stats   |
| GET    | `/instructor/students`        | ✅   | INSTRUCTOR/ADMIN/SUPER_ADMIN | Get students enrolled in courses |
| GET    | `/instructor/analytics`       | ✅   | INSTRUCTOR/ADMIN/SUPER_ADMIN | Get instructor analytics         |

### Activity Log Endpoints

| Method | Endpoint               | Auth | Role              | Description                    |
| ------ | ---------------------- | ---- | ----------------- | ------------------------------ |
| GET    | `/activity-logs`       | ✅   | ADMIN/SUPER_ADMIN | Get activity logs with filters |
| GET    | `/activity-logs/stats` | ✅   | ADMIN/SUPER_ADMIN | Get activity log statistics    |

### Notification Endpoints

| Method | Endpoint                       | Auth | Role | Description                    |
| ------ | ------------------------------ | ---- | ---- | ------------------------------ |
| GET    | `/notifications`               | ✅   | -    | Get user notifications         |
| GET    | `/notifications/unread-count`  | ✅   | -    | Get unread notification count  |
| PATCH  | `/notifications/:id/read`      | ✅   | -    | Mark notification as read      |
| PATCH  | `/notifications/mark-all-read` | ✅   | -    | Mark all notifications as read |
| DELETE | `/notifications/:id`           | ✅   | -    | Delete notification            |

---

## Setup & Konfigurasi

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm atau yarn
- Cloudinary account (untuk file uploads)
- Email SMTP (untuk email verification)

### Backend Setup

1. **Install dependencies**:

```bash
cd backend
npm install
```

2. **Setup environment** (`.env`):

```env
# Server
NODE_ENV=development
PORT=5040

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lms_db
DB_DIALECT=mysql
DB_AUTO_SYNC=true

# JWT
JWT_ACCESS_SECRET=your_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
FRONTEND_URL=http://localhost:5174
```

3. **Create database**:

```sql
CREATE DATABASE lms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Run seeders** (optional):

```bash
node src/seeders/seed.js
```

5. **Start server**:

```bash
npm run dev
```

✅ Backend berjalan di **http://localhost:5040**

---

### Frontend Setup

1. **Install dependencies**:

```bash
cd frontend
npm install
```

2. **Setup environment** (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5040/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5040
```

3. **Start server**:

```bash
npm run dev
```

✅ Frontend berjalan di **http://localhost:5174**

---

### Database Auto-Sync

**Environment Variable**: `DB_AUTO_SYNC`

- `DB_AUTO_SYNC=true` - Auto-create/update tables (Development)
- `DB_AUTO_SYNC=false` - No automatic changes (Production)

**Sync Modes**:

- **Development**: `ALTER` mode (safe updates)
- **Production**: `CREATE` mode (create only)

---

## Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **ORM**: Sequelize 6.35
- **Database**: MySQL 8.0
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Password Hashing**: bcryptjs 2.4
- **Email**: Nodemailer 6.9
- **File Storage**: Cloudinary 1.41
- **PDF Generation**: PDFKit 0.14
- **QR Codes**: qrcode 1.5
- **Validation**: express-validator 7.0
- **File Upload**: Multer 1.4

### Frontend

- **Framework**: Next.js 16.0 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3.4
- **UI Icons**: Lucide React 0.562
- **State Management**: Redux Toolkit 2.11, React Redux 9.2
- **HTTP Client**: Fetch API (custom api.ts wrapper)
- **Utils**: clsx 2.1, tailwind-merge 3.4
- **Theme**: Custom dark mode implementation
- **Emoji Picker**: emoji-picker-react 4.16

---

## Development Commands

### Backend

```bash
npm run dev      # Start dengan nodemon (hot reload)
npm start        # Production start
npm test         # Run tests (jika dikonfigurasi)
```

### Frontend

```bash
npm run dev      # Development server (port 5174)
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint check
```

---

## File Uploads

### Allowed Types

- **Thumbnails**: JPG, PNG, WEBP (max 5MB)
- **Videos**: MP4, WEBM (max 500MB)
- **PDFs**: PDF (max 50MB)

### Storage

Semua uploads disimpan di **Cloudinary** dengan folder structure:

- `thumbnails/` - Course thumbnails
- `videos/` - Lesson videos
- `pdfs/` - Lesson PDFs
- `certificates/` - Certificate PDFs

---

## Testing API

### cURL Examples

**Login**:

```bash
curl -X POST http://localhost:5040/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'
```

**Get Courses**:

```bash
curl -X GET http://localhost:5040/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Enroll in Course**:

```bash
curl -X POST http://localhost:5040/api/enrollments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId":1}'
```

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable message",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt dengan salt rounds
3. **Role-Based Access Control** - Permission system
4. **Email Verification** - Account verification
5. **Password Reset** - Secure token-based reset
6. **CORS** - Configured untuk frontend origin
7. **Input Validation** - express-validator
8. **SQL Injection Protection** - Sequelize ORM

---

## Future Enhancements

### Phase 2 Features

- [ ] Payment integration (Stripe/PayPal)
- [ ] Course ratings & reviews
- [ ] Discussion forums
- [ ] Live chat support
- [ ] Video streaming optimization
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Push notifications
- [ ] Multi-language support

---

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## License

MIT License - bebas digunakan untuk pembelajaran dan tujuan komersial.

---

## Support

Untuk issues dan pertanyaan:

- Buat issue di GitHub
- Email: support@lmsplatform.com

---

## Changelog

### Version 1.0.0 (17 Desember 2025)

**Added Features**:

- ✅ **Assessor Assignment System** - Assign assessors ke courses untuk certificate approval
- ✅ **Activity Logging** - Comprehensive activity logging untuk audit trail
- ✅ **Notification System** - Real-time notifications untuk users
- ✅ **Dashboard Analytics** - Dashboard statistics untuk admin
- ✅ **Course Versioning** - Publish new course versions
- ✅ **Enhanced Certificate Approval** - Filtered by assessor assignments dengan authorization checks
- ✅ **Redux State Management** - Centralized state management dengan Redux Toolkit
- ✅ **Assessor Dashboard** - Dedicated dashboard untuk assessors
- ✅ **Browse Courses Page** - Enhanced course browsing untuk students
- ✅ **Password Reset Flow** - Complete forgot password & reset password functionality
- ✅ **Lesson Types System** - Support 7 lesson types (VIDEO, MATERIAL, LIVE_SESSION, ASSIGNMENT, QUIZ, EXAM, DISCUSSION)
- ✅ **Centralized Lesson Completion** - lessonCompletionService untuk type-specific validation
- ✅ **Instructor Dynamic Features** - Dynamic data untuk students, analytics, dan dashboard pages

**Updated**:

- 📝 Complete documentation update dengan semua fitur baru
- 🔄 Improved API endpoints documentation dengan semua routes
- 📊 Enhanced database schema documentation (17 tables)
- 🎨 Updated frontend structure documentation dengan Redux store
- 🔐 Enhanced security documentation
- 📚 Lesson model updated dengan 7 types dan JSON content schema
- 🎯 Frontend lesson components refactored dengan LessonRenderer

**Technical Improvements**:

- 🏗️ Backend: 17 models, 15 controllers, 12 route files, 9 services
- 🎨 Frontend: Redux Toolkit integration, 12 slices
- 📱 Enhanced UI components (Toast, Notifications, Lesson Components)
- 🔍 Activity logging untuk semua critical operations
- ✅ Type-safe lesson completion dengan centralized validation
- 📊 Dynamic instructor dashboard dengan real-time analytics

---

**Last Updated**: 18 Desember 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

---

### Version 1.1.0 (18 Desember 2025)

**Added Features**:

- ✅ **7 Lesson Types Support** - VIDEO, MATERIAL, LIVE_SESSION, ASSIGNMENT, QUIZ, EXAM, DISCUSSION
- ✅ **Lesson Completion Service** - Centralized `lessonCompletionService` untuk type-specific validation
- ✅ **JSON Content Schema** - Flexible content structure per lesson type
- ✅ **Lesson Renderer Components** - Individual components untuk setiap lesson type
- ✅ **Instructor Dynamic Dashboard** - Real-time statistics (courses, students, reviews, rating)
- ✅ **Instructor Students Page** - Dynamic student list dengan pagination dan search
- ✅ **Instructor Analytics Page** - Dynamic analytics dengan charts dan trends

**Updated**:

- 📝 Lesson Model: Updated dengan 7 types, JSON content, description, isRequired fields
- 🔄 lessonProgressController: Integrated dengan lessonCompletionService
- 🎨 Frontend: LessonRenderer component untuk dynamic lesson rendering
- 📊 Frontend: instructorSlice dengan thunks untuk students, analytics, dashboard
- 🔐 Authorization: Enhanced lesson endpoints dengan ASSESSOR blocking

**Technical Improvements**:

- 🏗️ Backend: Added instructorController dengan 3 methods
- 🏗️ Backend: Added instructorRoutes dengan 3 endpoints
- 🏗️ Backend: Added lessonCompletionService dengan type-specific validation
- 🎨 Frontend: Added 7 lesson type components (VideoLesson, MaterialLesson, etc.)
- 🎨 Frontend: Added LessonRenderer untuk centralized lesson rendering
- 📊 Frontend: instructorSlice dengan fetchMyStudents, fetchMyAnalytics, fetchDashboardStats
- ✅ Type-safe lesson completion dengan validation rules per type
