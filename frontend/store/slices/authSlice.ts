import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiPost, ApiError } from "../api";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  role: {
    id: number;
    name: string;
  };
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Load user from localStorage on init
if (typeof window !== "undefined") {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("accessToken");
  if (storedUser && storedToken) {
    try {
      initialState.user = JSON.parse(storedUser);
      initialState.tokens = {
        accessToken: storedToken,
        refreshToken: localStorage.getItem("refreshToken") || "",
      };
      initialState.isAuthenticated = true;
    } catch (error) {
      console.error("Error parsing stored user:", error);
    }
  }
}

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiPost<{ user: User; tokens: AuthTokens }>(
        "auth/login",
        credentials,
        { includeAuth: false }
      );

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", response.tokens.accessToken);
        localStorage.setItem("refreshToken", response.tokens.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return response;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await apiPost<{ user: User; tokens: AuthTokens }>(
        "auth/register",
        data,
        { includeAuth: false }
      );

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", response.tokens.accessToken);
        localStorage.setItem("refreshToken", response.tokens.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return response;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "Registration failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      await apiPost("auth/forgot-password", { email }, { includeAuth: false });
      return { message: "Password reset email sent" };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "Failed to send reset email");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data: ResetPasswordData, { rejectWithValue }) => {
    try {
      await apiPost(`auth/reset-password/${data.token}`, { password: data.password }, { includeAuth: false });
      return { message: "Password reset successful" };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "Failed to reset password");
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token: string, { rejectWithValue }) => {
    try {
      await apiPost(`auth/verify-email/${token}`, undefined, {
        includeAuth: false,
      });
      return { message: "Email verified successfully" };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || "Failed to verify email");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify Email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
