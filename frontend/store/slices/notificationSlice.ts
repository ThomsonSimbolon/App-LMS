import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPatch, handleUnauthorized, ApiError } from "../api";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead: boolean;
  entityType?: string;
  entityId?: number;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ notifications: Notification[] }>(
        `notifications?limit=${limit}`
      );
      return response.notifications || [];
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        apiError.message || "Failed to fetch notifications"
      );
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ unreadCount: number }>(
        "notifications/unread-count"
      );
      return response.unreadCount || 0;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        // Don't redirect on unread count failure, just return 0
        return 0;
      }
      return rejectWithValue(
        apiError.message || "Failed to fetch unread count"
      );
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await apiPatch(`notifications/${notificationId}/read`);
      return notificationId;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to mark as read");
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await apiPatch("notifications/mark-all-read");
      return true;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to mark all as read");
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Add notification from socket (prevent duplicates)
    addNotification: (state, action) => {
      const newNotification = action.payload;
      // Check if notification already exists
      const exists = state.notifications.some(
        (notif) => notif.id === newNotification.id
      );
      if (!exists) {
        // Add to beginning of array
        state.notifications = [newNotification, ...state.notifications];
        // Increment unread count if not read
        if (!newNotification.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    // Update unread count (from socket)
    updateUnreadCount: (state, action) => {
      if (typeof action.payload === "number") {
        // Direct count update (absolute value)
        state.unreadCount = Math.max(0, action.payload);
      } else {
        // Increment/decrement (relative change)
        const delta = action.payload;
        state.unreadCount = Math.max(0, state.unreadCount + delta);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Unread Count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        state.unreadCount = 0;
      });

    // Mark As Read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      state.notifications = state.notifications.map((notif) =>
        notif.id === action.payload ? { ...notif, isRead: true } : notif
      );
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    });

    // Mark All As Read
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map((notif) => ({
        ...notif,
        isRead: true,
      }));
      state.unreadCount = 0;
    });
  },
});

export const { clearError, addNotification, updateUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
