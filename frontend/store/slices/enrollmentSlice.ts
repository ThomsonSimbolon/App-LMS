import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet, apiPost, handleUnauthorized } from '../api';

interface Course {
  id: number;
  title: string;
  thumbnail?: string;
  instructor?: {
    id: number;
    firstName: string;
    lastName?: string;
  };
  sections?: any[];
}

interface Enrollment {
  id: number;
  courseId: number;
  progress: number;
  lastAccessedAt?: string;
  course: Course;
}

interface EnrollmentState {
  enrollments: Enrollment[];
  loading: boolean;
  error: string | null;
}

const initialState: EnrollmentState = {
  enrollments: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchMyEnrollments = createAsyncThunk(
  'enrollment/fetchMyEnrollments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ enrollments: Enrollment[] }>('enrollments/me');
      return response.enrollments || [];
    } catch (error: any) {
      if (error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.message || 'Failed to fetch enrollments');
    }
  }
);

export const createEnrollment = createAsyncThunk(
  'enrollment/createEnrollment',
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await apiPost<Enrollment>('enrollments', { courseId });
      return response;
    } catch (error: any) {
      if (error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.message || 'Failed to enroll in course');
    }
  }
);

const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch My Enrollments
    builder
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload;
        state.error = null;
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Enrollment
    builder
      .addCase(createEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments.push(action.payload);
        state.error = null;
      })
      .addCase(createEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;

