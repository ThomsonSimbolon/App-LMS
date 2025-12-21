# 🔐 LMS Role Flow & Assessment Responsibility Documentation

## 📋 Table of Contents
1. [Role Definitions](#role-definitions)
2. [High-Level Role Flow](#high-level-role-flow)
3. [Role Responsibilities Matrix](#role-responsibilities-matrix)
4. [Evaluation Responsibility Matrix](#evaluation-responsibility-matrix)
5. [API Authorization Validation](#api-authorization-validation)
6. [UI Access Control](#ui-access-control)
7. [Implementation Validation](#implementation-validation)

---

## 👥 Role Definitions

The LMS system defines **5 distinct roles** with clear, non-overlapping responsibilities:

| Role | ID | Description | Database Model |
|------|----|-------------|----------------|
| `SUPER_ADMIN` | 1 | Full system access, manages ADMIN accounts | `Role.name = 'SUPER_ADMIN'` |
| `ADMIN` | 2 | Operational control, manages users/instructors, fallback certificate approver | `Role.name = 'ADMIN'` |
| `INSTRUCTOR` | 3 | Creates courses, evaluates academic performance (PRIMARY evaluator) | `Role.name = 'INSTRUCTOR'` |
| `STUDENT` | 4 | Enrolls in courses, completes lessons/quizzes, requests certificates | `Role.name = 'STUDENT'` |
| `ASSESSOR` | 5 | Validates and approves certificate requests | `Role.name = 'ASSESSOR'` |

**Source**: `backend/src/models/Role.js`, `backend/src/seeders/seed.js`

---

## 🔁 High-Level Role Flow

```
SUPER_ADMIN
│
├── Manages → ADMIN
│
ADMIN
│
├── Manages → INSTRUCTOR
│
INSTRUCTOR
│
├── Creates & Evaluates → COURSE
│   ├── Defines → LESSON
│   ├── Creates → QUIZ (with correct answers)
│   └── Sets → Passing Criteria
│
STUDENT
│
├── Enrolls → COURSE
│
├── Completes → LESSON
│
├── Takes → QUIZ
│   └── System Auto-Grades (based on INSTRUCTOR's correct answers)
│
├── Completes → COURSE (when all lessons/quizzes passed)
│
└── Requests → CERTIFICATE
│
▼
ASSESSOR / ADMIN (fallback)
│
├── Reviews → Certificate Eligibility
│
└── Approves/Rejects → CERTIFICATE
```

---

## 🧑‍🏫 Role Responsibilities Matrix

### 1️⃣ SUPER_ADMIN — System Governance

**Responsibilities:**
- ✅ Full system access
- ✅ Manages ADMIN accounts
- ✅ Oversees system configuration
- ✅ Can access all admin features
- ❌ **Does NOT perform student evaluation**
- ❌ **Does NOT grade academic work**
- ❌ **Does NOT approve certificates** (unless acting as ADMIN fallback)

**API Access:**
- All routes accessible via `hasRole(['ADMIN', 'SUPER_ADMIN'])`
- Can manage users, courses, view activity logs
- **Cannot directly evaluate student work**

**Implementation**: `backend/src/middleware/auth.js`, `backend/src/routes/*`

---

### 2️⃣ ADMIN — Operational Control

**Responsibilities:**
- ✅ Manages users and instructors
- ✅ Oversees all courses
- ✅ Monitors enrollments and progress
- ✅ Acts as **fallback certificate approver** (when ASSESSOR unavailable)
- ✅ Can create/edit courses (operational override)
- ❌ **Does NOT perform academic grading**
- ❌ **Does NOT evaluate quiz answers** (system auto-grades)

**API Access:**
- User management: `hasRole(['ADMIN', 'SUPER_ADMIN'])`
- Certificate approval: `hasRole(['ASSESSOR', 'ADMIN', 'SUPER_ADMIN'])`
- Course management: `hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'])`

**Implementation**: 
- `backend/src/routes/userRoutes.js` (lines 18-34)
- `backend/src/routes/certificateRoutes.js` (lines 17, 23)
- `backend/src/routes/courseRoutes.js` (lines 18-94)

---

### 3️⃣ INSTRUCTOR — Academic Evaluator (PRIMARY)

**Responsibilities:**
- ✅ Creates and manages own courses
- ✅ Defines lessons, quizzes, and assessments
- ✅ **Sets correct answers for quizzes** (defines evaluation criteria)
- ✅ **Determines course completion requirements**
- ✅ **Evaluates student academic performance** (indirectly via quiz design)
- ✅ Can view student progress and quiz results
- ❌ **Does NOT approve certificates** (that's ASSESSOR's role)

**API Access:**
- Course creation: `hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'])`
- Quiz creation: `hasRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'])`
- Own course management only (checked via `course.instructorId === req.user.userId`)

**Implementation**:
- `backend/src/routes/courseRoutes.js` (lines 18-94)
- `backend/src/routes/quizRoutes.js` (lines 15, 21)
- `backend/src/controllers/courseController.js` (lines 319, 389, 430, 473) - ownership checks
- `backend/src/controllers/quizController.js` (lines 395, 465) - ownership checks

**Note**: Quiz grading is **automatic** based on instructor-defined correct answers. The system compares student answers to instructor-set correct answers (lines 202-219 in `quizController.js`).

---

### 4️⃣ STUDENT — Learning Participant

**Responsibilities:**
- ✅ Enrolls in courses
- ✅ Consumes learning materials (lessons)
- ✅ Completes lessons
- ✅ Takes quizzes
- ✅ Requests certificates after completion
- ❌ **Does NOT evaluate or approve anything**
- ❌ **Does NOT grade own work**
- ❌ **Does NOT create courses**

**API Access:**
- Enrollment: `verifyToken` (authenticated only)
- Quiz taking: `verifyToken` (authenticated only)
- Certificate request: `verifyToken` (authenticated only)
- **No role-based restrictions** - all students can access student features

**Implementation**:
- `backend/src/routes/enrollmentRoutes.js`
- `backend/src/routes/quizRoutes.js` (lines 7-10)
- `backend/src/routes/certificateRoutes.js` (lines 10-12)

---

### 5️⃣ ASSESSOR — Certification Validator

**Responsibilities:**
- ✅ Reviews completed courses
- ✅ Validates certificate eligibility
- ✅ Approves or rejects certificate requests
- ✅ Provides formal certification approval
- ❌ **Does NOT evaluate academic answers** (that's INSTRUCTOR's role)
- ❌ **Does NOT grade quizzes**
- ❌ **Does NOT create courses**

**API Access:**
- Certificate approval: `hasRole(['ASSESSOR', 'ADMIN', 'SUPER_ADMIN'])`
- View pending certificates: `hasRole(['ASSESSOR', 'ADMIN', 'SUPER_ADMIN'])`

**Implementation**:
- `backend/src/routes/certificateRoutes.js` (lines 15-25)
- `backend/src/controllers/certificateController.js` (lines 237-316)

---

## 🧪 Evaluation Responsibility Matrix

| Role | Evaluates What | Stage | Implementation |
|------|---------------|-------|----------------|
| **INSTRUCTOR** | Quiz answers (via correct answer definition) | Learning phase | `quizController.js:202-219` (auto-grading based on instructor's correct answers) |
| **INSTRUCTOR** | Course completion eligibility | Learning phase | `enrollmentController.js` (progress tracking) |
| **SYSTEM** | Quiz auto-grading | Learning phase | `quizController.js:198-222` (compares student answers to instructor's correct answers) |
| **ASSESSOR** | Certificate eligibility & compliance | Certification phase | `certificateController.js:237-316` |
| **ADMIN** | Certificate approval (fallback only) | Certification phase | `certificateRoutes.js:17,23` |
| **SUPER_ADMIN** | No direct evaluation | Oversight | N/A |
| **STUDENT** | No evaluation | — | N/A |

### Key Points:
1. **Quiz Grading**: Automatic system grading based on instructor-defined correct answers
2. **Academic Evaluation**: Instructor sets evaluation criteria (correct answers, passing scores)
3. **Certificate Approval**: Separate from academic evaluation - ASSESSOR validates compliance
4. **Clear Separation**: Academic grading ≠ Certificate approval

---

## 🔒 API Authorization Validation

### Certificate Approval
**Endpoint**: `PATCH /api/certificates/:id/approve`
**Allowed Roles**: `['ASSESSOR', 'ADMIN', 'SUPER_ADMIN']`
**File**: `backend/src/routes/certificateRoutes.js:21-25`

✅ **Validated**: ASSESSOR is primary approver, ADMIN is fallback

### Quiz Creation
**Endpoint**: `POST /api/quizzes`
**Allowed Roles**: `['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']`
**File**: `backend/src/routes/quizRoutes.js:13-17`

✅ **Validated**: Only INSTRUCTOR (and admins) can create quizzes with evaluation criteria

### Quiz Submission (Auto-Grading)
**Endpoint**: `POST /api/quizzes/:quizId/submit`
**Allowed Roles**: `verifyToken` (any authenticated user, typically STUDENT)
**File**: `backend/src/routes/quizRoutes.js:9`, `backend/src/controllers/quizController.js:161-286`

✅ **Validated**: System auto-grades based on instructor's correct answers (lines 202-219)

### Course Management
**Endpoint**: `POST /api/courses`, `PUT /api/courses/:id`, etc.
**Allowed Roles**: `['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']`
**Ownership Check**: `course.instructorId === req.user.userId` (for INSTRUCTOR)
**File**: `backend/src/controllers/courseController.js:319,389,430,473`

✅ **Validated**: Instructors can only manage their own courses (unless ADMIN)

### User Management
**Endpoint**: `GET /api/users`, `PUT /api/users/:id/role`, etc.
**Allowed Roles**: `['ADMIN', 'SUPER_ADMIN']`
**File**: `backend/src/routes/userRoutes.js:18-34`

✅ **Validated**: Only ADMIN/SUPER_ADMIN can manage users

---

## 🖥️ UI Access Control

### Frontend Role Checks

**Location**: `frontend/hooks/useAuth.ts`, `frontend/components/layouts/Sidebar.tsx`

**Role-Based Navigation**:
- **SUPER_ADMIN / ADMIN**: Dashboard, Users, Courses, Certificates, Activity Logs, Settings
- **INSTRUCTOR**: Dashboard, My Courses, Students, Analytics
- **ASSESSOR**: Dashboard, Certificates (approval only)
- **STUDENT**: Dashboard, My Courses, Certificates (view own)

**Implementation**: `frontend/components/layouts/Sidebar.tsx:102-114`

---

## ✅ Implementation Validation

### ✅ Correctly Implemented

1. **Role Separation**: 
   - ✅ Roles are clearly defined in database (`Role.js`)
   - ✅ Each role has distinct permissions (`seed.js:99-137`)

2. **Academic Evaluation**:
   - ✅ INSTRUCTOR creates quizzes with correct answers
   - ✅ System auto-grades based on instructor's criteria
   - ✅ No manual grading by other roles

3. **Certificate Approval**:
   - ✅ ASSESSOR is primary approver
   - ✅ ADMIN is fallback approver
   - ✅ INSTRUCTOR cannot approve certificates

4. **API Authorization**:
   - ✅ All routes properly protected with `hasRole()` middleware
   - ✅ Ownership checks for instructor resources
   - ✅ Clear role boundaries enforced

5. **Course Completion Flow**:
   - ✅ Student must complete course before requesting certificate
   - ✅ Certificate request requires `enrollment.status = 'COMPLETED'`
   - ✅ `certificateController.js:31-35` validates completion

### ⚠️ Notes

1. **Quiz Grading**: Currently **automatic** (system compares answers). This is correct - instructor sets correct answers, system evaluates. No manual grading needed.

2. **Certificate Auto-Approval**: If `course.requireManualApproval = false`, certificate is auto-approved. This is acceptable - the course instructor has already evaluated the student's work.

3. **ADMIN Override**: ADMIN can approve certificates as fallback. This aligns with operational control responsibility.

---

## 📌 Rules & Constraints (Enforced)

✅ **Academic grading and certificate approval are separate**
- Academic: INSTRUCTOR defines criteria → SYSTEM auto-grades
- Certification: ASSESSOR validates → ADMIN fallback

✅ **STUDENT cannot evaluate outcomes**
- Students can only take quizzes, not grade them
- Students can only request certificates, not approve them

✅ **SUPER_ADMIN does not directly evaluate**
- SUPER_ADMIN has oversight, not direct evaluation

✅ **Instructor grading completes before certificate request**
- Certificate request requires `enrollment.status = 'COMPLETED'`
- Completion requires all lessons/quizzes passed

✅ **Certificate approval happens AFTER academic completion**
- Flow: Complete Course → Request Certificate → ASSESSOR/ADMIN Approves

---

## 🔄 Flow Diagram (Detailed)

```
┌─────────────────┐
│   INSTRUCTOR    │
│  Creates Course │
│  Sets Quiz      │
│  Defines Answers│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    STUDENT      │
│  Enrolls        │
│  Completes      │
│  Takes Quiz     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     SYSTEM      │
│  Auto-Grades    │
│  (compares to   │
│  instructor's   │
│  correct ans)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    STUDENT      │
│  Completes      │
│  Course         │
│  Requests Cert  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ASSESSOR      │
│  Reviews        │
│  Validates      │
│  Approves/Rej   │
└─────────────────┘
         │
         ▼ (if ASSESSOR unavailable)
┌─────────────────┐
│     ADMIN       │
│  Fallback       │
│  Approval       │
└─────────────────┘
```

---

## 📝 Summary

The LMS correctly implements the role-based flow:

1. **INSTRUCTOR** is the PRIMARY academic evaluator (defines evaluation criteria)
2. **SYSTEM** performs automatic grading based on instructor's criteria
3. **ASSESSOR** validates and approves certificates (separate from academic evaluation)
4. **ADMIN** provides operational control and fallback certificate approval
5. **STUDENT** participates in learning but does not evaluate
6. **SUPER_ADMIN** provides system oversight but does not directly evaluate

**All role boundaries are properly enforced in both API and UI layers.**

---

**Last Updated**: 2025-12-21
**Version**: 1.0.0

