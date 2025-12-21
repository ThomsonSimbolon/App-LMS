# 📊 LMS Role Flow Visual Diagrams

## 🔄 Complete Role Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPER_ADMIN                              │
│                    (System Governance)                          │
│  • Full system access                                           │
│  • Manages ADMIN accounts                                       │
│  • Oversees system configuration                               │
│  ❌ Does NOT evaluate students                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Manages
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                          ADMIN                                  │
│                    (Operational Control)                         │
│  • Manages users & instructors                                  │
│  • Oversees all courses                                        │
│  • Monitors enrollments                                        │
│  • Fallback certificate approver                               │
│  ❌ Does NOT perform academic grading                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Manages
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        INSTRUCTOR                               │
│              (Academic Evaluator - PRIMARY)                     │
│  • Creates & manages courses                                   │
│  • Defines lessons & quizzes                                   │
│  • Sets correct answers (evaluation criteria)                  │
│  • Determines course completion requirements                   │
│  ✅ PRIMARY evaluator of learning outcomes                     │
│  ❌ Does NOT approve certificates                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Creates
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         COURSE                                  │
│  • Contains lessons                                             │
│  • Contains quizzes (with instructor-defined correct answers)  │
│  • Has completion requirements                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Student enrolls
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         STUDENT                                 │
│                    (Learning Participant)                       │
│  • Enrolls in courses                                           │
│  • Completes lessons                                            │
│  • Takes quizzes                                               │
│  • Requests certificates                                        │
│  ❌ Does NOT evaluate anything                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Submits quiz
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SYSTEM                                  │
│                    (Auto-Grading Engine)                         │
│  • Compares student answers                                     │
│  • To instructor's correct answers                             │
│  • Calculates score & pass/fail                                │
│  • Updates enrollment progress                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Course completed
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CERTIFICATE REQUEST                        │
│  • Student requests certificate                                 │
│  • Status: PENDING (if requireManualApproval = true)           │
│  • Status: APPROVED (if requireManualApproval = false)          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Requires approval
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ASSESSOR                                 │
│                  (Certification Validator)                       │
│  • Reviews certificate eligibility                              │
│  • Validates compliance                                         │
│  • Approves or rejects                                         │
│  ✅ PRIMARY certificate approver                                │
│  ❌ Does NOT evaluate academic answers                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ (If ASSESSOR unavailable)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                          ADMIN                                  │
│                    (Fallback Approver)                          │
│  • Can approve certificates as fallback                        │
│  • Operational backup                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎓 Academic Evaluation Flow

```
┌──────────────┐
│ INSTRUCTOR   │
│              │
│ Creates Quiz │
│ Sets Correct │
│   Answers    │
└──────┬───────┘
       │
       │ Defines evaluation criteria
       ▼
┌──────────────┐
│    QUIZ      │
│              │
│ • Questions  │
│ • Correct    │
│   Answers    │
│ • Passing    │
│   Score      │
└──────┬───────┘
       │
       │ Student takes quiz
       ▼
┌──────────────┐
│   STUDENT    │
│              │
│ Submits      │
│ Answers      │
└──────┬───────┘
       │
       │ System evaluates
       ▼
┌──────────────┐
│   SYSTEM     │
│              │
│ Auto-Grades: │
│ • Compares   │
│   answers    │
│ • Calculates │
│   score      │
│ • Pass/Fail  │
└──────┬───────┘
       │
       │ Result
       ▼
┌──────────────┐
│ QUIZ RESULT  │
│              │
│ • Score      │
│ • Pass/Fail  │
│ • Feedback   │
└──────────────┘
```

**Key Point**: INSTRUCTOR defines evaluation criteria → SYSTEM executes evaluation

---

## 🏆 Certificate Approval Flow

```
┌──────────────┐
│   STUDENT    │
│              │
│ Completes    │
│ Course       │
└──────┬───────┘
       │
       │ Requests certificate
       ▼
┌──────────────┐
│ CERTIFICATE  │
│   REQUEST    │
│              │
│ Status:      │
│ PENDING      │
└──────┬───────┘
       │
       │ Requires approval
       ▼
┌──────────────┐
│  ASSESSOR    │
│  (Primary)   │
│              │
│ Reviews:     │
│ • Eligibility│
│ • Compliance │
│ • Validity   │
└──────┬───────┘
       │
       │ Approves/Rejects
       ▼
┌──────────────┐
│ CERTIFICATE  │
│              │
│ Status:      │
│ APPROVED /   │
│ REJECTED     │
└──────────────┘
       │
       │ (If ASSESSOR unavailable)
       ▼
┌──────────────┐
│    ADMIN     │
│  (Fallback)  │
│              │
│ Can approve  │
│ as backup    │
└──────────────┘
```

**Key Point**: ASSESSOR validates certification → ADMIN provides fallback

---

## 🚫 Role Boundaries (What Each Role CANNOT Do)

```
SUPER_ADMIN
├── ❌ Cannot evaluate student work directly
├── ❌ Cannot grade quizzes manually
└── ❌ Cannot approve certificates (unless acting as ADMIN)

ADMIN
├── ❌ Cannot perform academic grading
├── ❌ Cannot evaluate quiz answers
└── ✅ Can approve certificates (fallback only)

INSTRUCTOR
├── ❌ Cannot approve certificates
├── ❌ Cannot manage users
└── ✅ Can only manage own courses

ASSESSOR
├── ❌ Cannot evaluate academic answers
├── ❌ Cannot grade quizzes
├── ❌ Cannot create courses
└── ✅ Can only approve/reject certificates

STUDENT
├── ❌ Cannot evaluate anything
├── ❌ Cannot grade own work
├── ❌ Cannot create courses
└── ❌ Cannot approve certificates
```

---

## ✅ Separation of Concerns

```
┌─────────────────────────────────────────┐
│      ACADEMIC EVALUATION PHASE          │
│                                         │
│  INSTRUCTOR → Defines Criteria         │
│       ↓                                 │
│  SYSTEM → Auto-Grades                   │
│       ↓                                 │
│  STUDENT → Receives Results             │
└─────────────────────────────────────────┘
              │
              │ Course Completed
              ▼
┌─────────────────────────────────────────┐
│    CERTIFICATION APPROVAL PHASE         │
│                                         │
│  STUDENT → Requests Certificate         │
│       ↓                                 │
│  ASSESSOR → Validates & Approves        │
│       ↓                                 │
│  ADMIN → Fallback Approval              │
└─────────────────────────────────────────┘
```

**Critical**: These two phases are **separate and distinct**:
- Academic evaluation happens during learning
- Certificate approval happens after completion
- Different roles responsible for each phase

---

**Last Updated**: 2025-12-21

