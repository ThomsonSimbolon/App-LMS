import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost, handleUnauthorized, ApiError } from "../api";

interface Assessor {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
  role: string;
  assignedAt?: string;
}

interface CourseAssessorState {
  assignedAssessors: Assessor[];
  loading: boolean;
  error: string | null;
}

const initialState: CourseAssessorState = {
  assignedAssessors: [],
  loading: false,
  error: null,
};

// Async thunks
export const assignAssessorsToCourse = createAsyncThunk(
  "courseAssessor/assignAssessorsToCourse",
  async (
    { courseId, assessorIds }: { courseId: number; assessorIds: number[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiPost<{ assessors: Assessor[] }>(
        `courses/${courseId}/assessors`,
        { assessorIds }
      );
      // Backend returns { assessors: [...] } in data property
      return (response as { assessors: Assessor[] }).assessors || [];
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        apiError.message || "Failed to assign assessors to course"
      );
    }
  }
);

export const fetchAssignedAssessors = createAsyncThunk(
  "courseAssessor/fetchAssignedAssessors",
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ assessors: Assessor[] }>(
        `courses/${courseId}/assessors`
      );
      // Backend returns { assessors: [...] } in data property
      return (response as { assessors: Assessor[] }).assessors || [];
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        apiError.message || "Failed to fetch assigned assessors"
      );
    }
  }
);

const courseAssessorSlice = createSlice({
  name: "courseAssessor",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAssessors: (state) => {
      state.assignedAssessors = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Assign Assessors
    builder
      .addCase(assignAssessorsToCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignAssessorsToCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedAssessors = action.payload;
        state.error = null;
      })
      .addCase(assignAssessorsToCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Assigned Assessors
    builder
      .addCase(fetchAssignedAssessors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignedAssessors.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedAssessors = action.payload;
        state.error = null;
      })
      .addCase(fetchAssignedAssessors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAssessors } = courseAssessorSlice.actions;
export default courseAssessorSlice.reducer;
