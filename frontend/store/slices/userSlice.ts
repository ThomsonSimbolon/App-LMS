import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  apiGet,
  apiPut,
  apiDelete,
  handleUnauthorized,
  ApiError,
} from "../api";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  role: {
    id: number;
    name: string;
  };
  createdAt?: string;
}

interface UpdateProfileData {
  firstName: string;
  lastName?: string;
  email: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

// Type guard untuk error
const isApiError = (error: unknown): error is ApiError => {
  return typeof error === "object" && error !== null && "message" in error;
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet<User[]>("users");
      return Array.isArray(response) ? response : [];
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        isApiError(error)
          ? error.message || "Failed to fetch users"
          : "Failed to fetch users"
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await apiGet<User>("users/me");
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        isApiError(error)
          ? error.message || "Failed to fetch user"
          : "Failed to fetch user"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (data: UpdateProfileData, { rejectWithValue }) => {
    try {
      const response = await apiPut<User>("users/me", data);

      // Update localStorage
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const updatedUser = { ...user, ...response };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }

      return response;
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        isApiError(error)
          ? error.message || "Failed to update profile"
          : "Failed to update profile"
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (data: ChangePasswordData, { rejectWithValue }) => {
    try {
      await apiPut("users/me/password", data);
      return { message: "Password changed successfully" };
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        isApiError(error)
          ? error.message || "Failed to change password"
          : "Failed to change password"
      );
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "user/updateUserRole",
  async (
    { userId, roleId }: { userId: number; roleId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiPut<User>(`users/${userId}/role`, { roleId });
      return { userId, user: response };
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        isApiError(error)
          ? error.message || "Failed to update user role"
          : "Failed to update user role"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId: number, { rejectWithValue }) => {
    try {
      await apiDelete(`users/${userId}`);
      return userId;
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        isApiError(error)
          ? error.message || "Failed to delete user"
          : "Failed to delete user"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Change Password
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update User Role
    builder
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((user) =>
          user.id === action.payload.userId ? action.payload.user : user
        );
        state.error = null;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;
