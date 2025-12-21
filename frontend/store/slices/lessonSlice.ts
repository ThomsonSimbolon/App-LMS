import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet, apiPost, handleUnauthorized } from '../api';

// Lesson Type Union
export type LessonType = 
  | 'VIDEO' 
  | 'MATERIAL' 
  | 'LIVE_SESSION' 
  | 'ASSIGNMENT' 
  | 'QUIZ' 
  | 'EXAM' 
  | 'DISCUSSION';

// Lesson Content Structure (varies by type)
// Base interface with common fields
interface BaseLessonContentData {
  [key: string]: any;
}

// Type-specific content interfaces
export interface VideoLessonContent extends BaseLessonContentData {
  videoUrl: string;
  duration?: number;
  minWatchPercentage?: number;
}

export interface MaterialLessonContent extends BaseLessonContentData {
  fileUrl?: string;
  fileType?: string;
  content?: string;
}

export interface LiveSessionLessonContent extends BaseLessonContentData {
  meetingUrl?: string;
  scheduledAt?: string;
  duration?: number;
}

export interface AssignmentLessonContent extends BaseLessonContentData {
  instructions: string;
  submissionType?: 'FILE' | 'TEXT' | 'LINK' | 'ANY';
  deadline?: string;
  maxScore?: number;
}

export interface QuizExamLessonContent extends BaseLessonContentData {
  quizId?: number;
  passingScore?: number;
  timeLimit?: number;
}

export interface DiscussionLessonContent extends BaseLessonContentData {
  topic?: string;
  instructions?: string;
}

// Union type for all lesson content
export type LessonContentData = 
  | VideoLessonContent
  | MaterialLessonContent
  | LiveSessionLessonContent
  | AssignmentLessonContent
  | QuizExamLessonContent
  | DiscussionLessonContent;

// Lesson Content from API
export interface LessonContent {
  id: number;
  title: string;
  description?: string;
  type: LessonType;
  content: LessonContentData;
  duration?: number;
  isRequired: boolean;
  isFree: boolean;
  order: number;
}

// Submission data for assignment completion
export interface AssignmentSubmissionData {
  text?: string;
  fileUrl?: string;
  link?: string;
}

// Validation error structure
export interface LessonValidationError {
  field?: string;
  message: string;
  details?: Record<string, any>;
}

// Completion status
export interface LessonCompletionStatus {
  isCompleted: boolean;
  canComplete: boolean;
  reason?: string;
  progress?: {
    watchPercentage?: number;
    requiredPercentage?: number;
  };
}

interface LessonState {
  lessonContent: LessonContent | null;
  loading: boolean;
  error: string | null;
}

const initialState: LessonState = {
  lessonContent: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchLessonContent = createAsyncThunk(
  'lesson/fetchLessonContent',
  async (lessonId: number, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ success: boolean; data: LessonContent }>(`lessons/${lessonId}/content`);
      // Handle both old format (direct data) and new format (wrapped in data)
      return response.data || response;
    } catch (error: any) {
      if (error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.message || 'Failed to fetch lesson content');
    }
  }
);

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
      submissionData?: AssignmentSubmissionData;
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

const lessonSlice = createSlice({
  name: 'lesson',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLessonContent: (state) => {
      state.lessonContent = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Lesson Content
    builder
      .addCase(fetchLessonContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonContent.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both old format (direct) and new format (wrapped in data)
        state.lessonContent = action.payload as LessonContent;
        state.error = null;
      })
      .addCase(fetchLessonContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Complete Lesson
    builder
      .addCase(completeLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeLesson.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(completeLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearLessonContent } = lessonSlice.actions;
export default lessonSlice.reducer;

