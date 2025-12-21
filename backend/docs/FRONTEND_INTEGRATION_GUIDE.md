# 🎨 Frontend Integration Guide - Lesson Types

## ✅ Backend Status: READY

Backend sudah siap untuk integrasi frontend dengan:
- ✅ 7 Lesson Types: `VIDEO`, `MATERIAL`, `LIVE_SESSION`, `ASSIGNMENT`, `QUIZ`, `EXAM`, `DISCUSSION`
- ✅ JSON Content Structure per type
- ✅ Authorization hardening (ASSESSOR blocked)
- ✅ Type-specific completion logic
- ✅ API endpoints ready

---

## 📋 Frontend Work Required

### 1. Update Type Definitions

**File**: `frontend/store/slices/lessonSlice.ts`, `frontend/types/` (if exists)

**Update Lesson interface:**
```typescript
interface Lesson {
  id: number;
  title: string;
  description?: string; // NEW
  type: 'VIDEO' | 'MATERIAL' | 'LIVE_SESSION' | 'ASSIGNMENT' | 'QUIZ' | 'EXAM' | 'DISCUSSION'; // UPDATED
  content?: {
    // VIDEO
    videoUrl?: string;
    duration?: number;
    minWatchPercentage?: number;
    // MATERIAL
    fileUrl?: string;
    fileType?: string;
    content?: string;
    // LIVE_SESSION
    meetingUrl?: string;
    scheduledAt?: string;
    duration?: number;
    // ASSIGNMENT
    submissionType?: 'FILE' | 'TEXT' | 'LINK';
    deadline?: string;
    maxScore?: number;
    instructions?: string;
    // QUIZ/EXAM
    quizId?: number;
    passingScore?: number;
    timeLimit?: number;
    // DISCUSSION
    topic?: string;
    instructions?: string;
  }; // Changed from simple string to JSON object
  duration?: number;
  order: number;
  isRequired?: boolean; // NEW
  isFree?: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
}
```

**Update LessonContent interface:**
```typescript
interface LessonContent {
  id: number;
  title: string;
  description?: string;
  type: string;
  content: {
    // Same structure as Lesson.content above
  };
  duration?: number;
  isRequired: boolean;
  isFree: boolean;
  order: number;
}
```

---

### 2. Update Lesson Type Icons/Mapping

**File**: `frontend/components/course/LessonList.tsx`

**Update `getLessonIcon` function:**
```typescript
const getLessonIcon = (type: string) => {
  switch (type) {
    case 'VIDEO': return '▶️';
    case 'MATERIAL': return '📄';
    case 'LIVE_SESSION': return '🎥';
    case 'ASSIGNMENT': return '📝';
    case 'QUIZ': return '❓';
    case 'EXAM': return '📋';
    case 'DISCUSSION': return '💬';
    default: return '📌';
  }
};
```

**Also update in:**
- `frontend/app/courses/[id]/page.tsx`
- `frontend/app/dashboard/courses/[id]/page.tsx`
- Any other places showing lesson type icons

**Replace old types:**
- `PDF` → `MATERIAL`
- `TEXT` → `MATERIAL`

---

### 3. Update Lesson Content Rendering

**File**: `frontend/app/learn/[courseId]/page.tsx`

**Current structure (needs update):**
```typescript
// OLD: Simple content handling
if (lessonContent?.contentUrl) {
  // Video player
}
if (lessonContent?.textContent) {
  // Text content
}
```

**New structure (JSON content):**
```typescript
const renderLessonContent = () => {
  if (!lessonContent) return null;

  const { type, content } = lessonContent;

  switch (type) {
    case 'VIDEO':
      return (
        <VideoPlayer
          videoUrl={content?.videoUrl}
          duration={content?.duration}
          minWatchPercentage={content?.minWatchPercentage || 80}
          onProgress={(watchTime) => {
            // Update watch time
          }}
          onComplete={() => {
            // Mark as complete if minWatchPercentage met
          }}
        />
      );

    case 'MATERIAL':
      if (content?.fileUrl) {
        return <PDFViewer fileUrl={content.fileUrl} />;
      }
      if (content?.content) {
        return (
          <div className="prose dark:prose-invert">
            {content.content}
          </div>
        );
      }
      return <p>Material content not available</p>;

    case 'LIVE_SESSION':
      return (
        <div>
          <h3>Live Session</h3>
          <p>Meeting URL: {content?.meetingUrl}</p>
          <p>Scheduled: {content?.scheduledAt ? new Date(content.scheduledAt).toLocaleString() : 'TBD'}</p>
          {content?.meetingUrl && (
            <a href={content.meetingUrl} target="_blank" rel="noopener noreferrer">
              Join Meeting
            </a>
          )}
        </div>
      );

    case 'ASSIGNMENT':
      return (
        <div>
          <h3>Assignment</h3>
          <p>{content?.instructions}</p>
          <p>Submission Type: {content?.submissionType}</p>
          <p>Deadline: {content?.deadline ? new Date(content.deadline).toLocaleString() : 'No deadline'}</p>
          <p>Max Score: {content?.maxScore}</p>
          {/* Assignment submission form */}
        </div>
      );

    case 'QUIZ':
    case 'EXAM':
      return (
        <div>
          <h3>{type === 'EXAM' ? 'Exam' : 'Quiz'}</h3>
          <p>Quiz ID: {content?.quizId}</p>
          <p>Passing Score: {content?.passingScore}%</p>
          {content?.timeLimit && (
            <p>Time Limit: {Math.floor(content.timeLimit / 60)} minutes</p>
          )}
          {/* Link to quiz taking page */}
        </div>
      );

    case 'DISCUSSION':
      return (
        <div>
          <h3>Discussion</h3>
          <p>Topic: {content?.topic}</p>
          <p>{content?.instructions}</p>
          {/* Discussion forum component */}
        </div>
      );

    default:
      return <p>Unknown lesson type</p>;
  }
};
```

---

### 4. Update Lesson Completion Logic

**File**: `frontend/store/slices/lessonSlice.ts`

**Update `completeLesson` thunk to handle type-specific requirements:**
```typescript
export const completeLesson = createAsyncThunk(
  'lesson/completeLesson',
  async (
    { 
      lessonId, 
      watchTime, 
      submissionData 
    }: { 
      lessonId: number; 
      watchTime?: number; 
      submissionData?: {
        text?: string;
        fileUrl?: string;
        link?: string;
      };
    }, 
    { rejectWithValue }
  ) => {
    try {
      await apiPost(`lessons/${lessonId}/complete`, { 
        watchTime,
        submissionData 
      });
      return { message: 'Lesson marked as complete' };
    } catch (error: any) {
      if (error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.message || 'Failed to complete lesson');
    }
  }
);
```

**In component (`frontend/app/learn/[courseId]/page.tsx`):**
```typescript
const handleCompleteLesson = async () => {
  if (!currentLesson || !lessonContent) return;

  let submissionData = undefined;

  // Type-specific submission data
  if (lessonContent.type === 'ASSIGNMENT') {
    // Collect assignment submission
    submissionData = {
      text: assignmentText,
      // or fileUrl, or link
    };
  }

  const result = await dispatch(
    completeLesson({
      lessonId: currentLesson.id,
      watchTime: currentLesson.duration || 0,
      submissionData
    })
  );

  // Handle result...
};
```

---

### 5. Update Course Display Pages

**Files to update:**
- `frontend/app/courses/[id]/page.tsx`
- `frontend/app/dashboard/courses/[id]/page.tsx`

**Replace old type checks:**
```typescript
// OLD
{lesson.type === "VIDEO" ? "▶️" : lesson.type === "PDF" ? "📄" : "📝"}

// NEW - Use helper function
{getLessonIcon(lesson.type)}
```

---

### 6. Create Lesson Type Components (Recommended)

**Create new components for each lesson type:**

1. `frontend/components/lesson/VideoLesson.tsx`
2. `frontend/components/lesson/MaterialLesson.tsx`
3. `frontend/components/lesson/LiveSessionLesson.tsx`
4. `frontend/components/lesson/AssignmentLesson.tsx`
5. `frontend/components/lesson/QuizLesson.tsx`
6. `frontend/components/lesson/ExamLesson.tsx`
7. `frontend/components/lesson/DiscussionLesson.tsx`

**Main lesson renderer:**
`frontend/components/lesson/LessonRenderer.tsx`
```typescript
import { VideoLesson } from './VideoLesson';
import { MaterialLesson } from './MaterialLesson';
// ... other imports

interface LessonRendererProps {
  lesson: LessonContent;
  onComplete?: () => void;
}

export function LessonRenderer({ lesson, onComplete }: LessonRendererProps) {
  switch (lesson.type) {
    case 'VIDEO':
      return <VideoLesson lesson={lesson} onComplete={onComplete} />;
    case 'MATERIAL':
      return <MaterialLesson lesson={lesson} onComplete={onComplete} />;
    // ... other cases
    default:
      return <div>Unknown lesson type</div>;
  }
}
```

---

### 7. Update API Response Handling

**File**: `frontend/store/slices/lessonSlice.ts`

**Current response handling expects simple structure:**
```typescript
interface LessonContent {
  contentUrl?: string;
  textContent?: string;
}
```

**Update to match backend response:**
```typescript
interface LessonContent {
  id: number;
  title: string;
  description?: string;
  type: string;
  content: any; // JSON object (varies by type)
  duration?: number;
  isRequired: boolean;
  isFree: boolean;
  order: number;
}
```

**In `fetchLessonContent.fulfilled`:**
```typescript
.addCase(fetchLessonContent.fulfilled, (state, action) => {
  state.loading = false;
  state.lessonContent = action.payload.data; // Backend returns { success: true, data: {...} }
  state.error = null;
})
```

---

## 🎯 Priority Order

1. **HIGH PRIORITY:**
   - ✅ Update type definitions
   - ✅ Update lesson icons (replace PDF/TEXT with MATERIAL)
   - ✅ Update API response handling in lessonSlice
   - ✅ Update lesson content rendering in learn page

2. **MEDIUM PRIORITY:**
   - ✅ Create lesson type components
   - ✅ Update completion logic for type-specific requirements
   - ✅ Add assignment submission UI

3. **LOW PRIORITY (Future):**
   - ⏸️ Assignment grading UI (for INSTRUCTOR)
   - ⏸️ Live session attendance tracking
   - ⏸️ Discussion forum UI
   - ⏸️ Quiz/Exam taking integration

---

## 📝 Testing Checklist

After frontend updates:

- [ ] All 7 lesson types display correct icons
- [ ] Lesson content renders correctly per type
- [ ] Video lessons track progress and completion
- [ ] Material lessons (PDF/text) display correctly
- [ ] Assignment submission works
- [ ] Quiz/Exam lessons link to quiz taking
- [ ] Live session shows meeting info
- [ ] Discussion shows topic and instructions
- [ ] Lesson completion works for all types
- [ ] Type-specific validation works (e.g., video watch percentage)

---

**Last Updated**: 2025-01-XX  
**Status**: ✅ Backend Ready, Frontend Work Required

