import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, handleUnauthorized } from "../api";

// Student interface
export interface Student {
  id: number;
  name: string;
  email: string;
  course: {
    id: number;
    title: string;
  };
  progress: number;
  joinedAt: string;
  enrollmentId: number;
}

// Analytics interfaces
export interface AnalyticsStats {
  totalStudents: number;
  avgRating: number;
  completionRate: number;
  totalRevenue: number;
}

export interface EnrollmentGrowth {
  month: string;
  count: number;
}

export interface Engagement {
  active: number;
  completed: number;
  dropped: number;
}

export interface TrendChange {
  value: string;
  trend: "up" | "down";
}

export interface AnalyticsData {
  stats: AnalyticsStats;
  trends: {
    enrollmentGrowth: EnrollmentGrowth[];
    engagement: Engagement;
  };
  changes: {
    totalStudents: TrendChange;
    avgRating: TrendChange;
    completionRate: TrendChange;
    totalRevenue: TrendChange;
  };
}

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalReviews: number;
  averageRating: number;
}

interface InstructorState {
  students: Student[];
  analytics: AnalyticsData | null;
  dashboardStats: DashboardStats | null;
  studentsLoading: boolean;
  analyticsLoading: boolean;
  dashboardLoading: boolean;
  studentsError: string | null;
  analyticsError: string | null;
  dashboardError: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: InstructorState = {
  students: [],
  analytics: null,
  dashboardStats: null,
  studentsLoading: false,
  analyticsLoading: false,
  dashboardLoading: false,
  studentsError: null,
  analyticsError: null,
  dashboardError: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchMyStudents = createAsyncThunk(
  "instructor/fetchMyStudents",
  async (
    params: {
      search?: string;
      courseId?: number;
      page?: number;
      limit?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append("search", params.search);
      if (params.courseId)
        queryParams.append("courseId", params.courseId.toString());
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const endpoint = `instructor/students${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiGet<{
        students: Student[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(endpoint);

      // apiGet already extracts data.data, so response should be the data object directly
      if (response && typeof response === "object" && "students" in response) {
        return {
          students: response.students || [],
          pagination: response.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          },
        };
      }

      // Fallback
      return {
        students: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.message || "Failed to fetch students");
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  "instructor/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<DashboardStats>(
        "instructor/dashboard/stats"
      );

      // apiGet already extracts data.data, so response should be the data object directly
      if (
        response &&
        typeof response === "object" &&
        "totalCourses" in response
      ) {
        return response;
      }

      // Fallback
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalReviews: 0,
        averageRating: 0,
      };
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        error.message || "Failed to fetch dashboard stats"
      );
    }
  }
);

export const fetchMyAnalytics = createAsyncThunk(
  "instructor/fetchMyAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<AnalyticsData>("instructor/analytics");

      // apiGet already extracts data.data, so response should be the data object directly
      if (response && typeof response === "object" && "stats" in response) {
        return response;
      }

      // Fallback
      return {
        stats: {
          totalStudents: 0,
          avgRating: 0,
          completionRate: 0,
          totalRevenue: 0,
        },
        trends: {
          enrollmentGrowth: [],
          engagement: { active: 0, completed: 0, dropped: 0 },
        },
        changes: {
          totalStudents: { value: "0%", trend: "up" },
          avgRating: { value: "0", trend: "up" },
          completionRate: { value: "0%", trend: "up" },
          totalRevenue: { value: "$0", trend: "up" },
        },
      };
    } catch (error) {
      if (error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(error.message || "Failed to fetch analytics");
    }
  }
);

const instructorSlice = createSlice({
  name: "instructor",
  initialState,
  reducers: {
    clearStudentsError: (state) => {
      state.studentsError = null;
    },
    clearAnalyticsError: (state) => {
      state.analyticsError = null;
    },
    clearDashboardError: (state) => {
      state.dashboardError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch My Students
    builder
      .addCase(fetchMyStudents.pending, (state) => {
        state.studentsLoading = true;
        state.studentsError = null;
      })
      .addCase(fetchMyStudents.fulfilled, (state, action) => {
        state.studentsLoading = false;
        if (action.payload) {
          state.students = action.payload.students || [];
          state.pagination = action.payload.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          };
        } else {
          state.students = [];
          state.pagination = {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0,
          };
        }
        state.studentsError = null;
      })
      .addCase(fetchMyStudents.rejected, (state, action) => {
        state.studentsLoading = false;
        state.studentsError = action.payload as string;
      });

    // Fetch My Analytics
    builder
      .addCase(fetchMyAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchMyAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
        state.analyticsError = null;
      })
      .addCase(fetchMyAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload as string;
      });

    // Fetch Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        if (action.payload) {
          state.dashboardStats = action.payload;
        } else {
          state.dashboardStats = {
            totalCourses: 0,
            totalStudents: 0,
            totalReviews: 0,
            averageRating: 0,
          };
        }
        state.dashboardError = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload as string;
      });
  },
});

export const { clearStudentsError, clearAnalyticsError, clearDashboardError } =
  instructorSlice.actions;
export default instructorSlice.reducer;
