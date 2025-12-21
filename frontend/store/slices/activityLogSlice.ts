import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, handleUnauthorized, ApiError } from "../api";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
}

interface ActivityLog {
  id: number;
  eventType: string;
  entityType: string;
  entityId: number;
  metadata: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  user: User | null;
  createdAt: string;
}

interface ActivityLogStats {
  totalLogs: number;
  uniqueUsers: number;
  byEventType: Array<{ eventType: string; count: number }>;
  byEntityType: Array<{ entityType: string; count: number }>;
}

interface ActivityLogFilters {
  eventType?: string;
  userId?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

interface ActivityLogState {
  logs: ActivityLog[];
  stats: ActivityLogStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: ActivityLogState = {
  logs: [],
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchActivityLogs = createAsyncThunk(
  "activityLog/fetchActivityLogs",
  async (filters: ActivityLogFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.eventType) params.append("eventType", filters.eventType);
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.entityType) params.append("entityType", filters.entityType);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const queryString = params.toString();
      const endpoint = `activity-logs${queryString ? `?${queryString}` : ""}`;

      const response = await apiGet<{
        logs: ActivityLog[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(endpoint);
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        apiError.message || "Failed to fetch activity logs"
      );
    }
  }
);

export const fetchActivityLogStats = createAsyncThunk(
  "activityLog/fetchActivityLogStats",
  async (filters: { dateFrom?: string; dateTo?: string } = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const queryString = params.toString();
      const endpoint = `activity-logs/stats${
        queryString ? `?${queryString}` : ""
      }`;

      return await apiGet<ActivityLogStats>(endpoint);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      // Don't show error for stats, just return null
      return null;
    }
  }
);

const activityLogSlice = createSlice({
  name: "activityLog",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Activity Logs
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.logs || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.error = null;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Activity Log Stats
    builder.addCase(fetchActivityLogStats.fulfilled, (state, action) => {
      if (action.payload) {
        state.stats = action.payload;
      }
    });
  },
});

export const { clearError } = activityLogSlice.actions;
export default activityLogSlice.reducer;
