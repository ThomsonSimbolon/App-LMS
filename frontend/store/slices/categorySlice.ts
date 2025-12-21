import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost, handleUnauthorized, ApiError } from "../api";

export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  createdAt?: string;
}

interface CategoryResponse {
  categories: Category[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (limit: number = 100, { rejectWithValue }) => {
    try {
      const response = await apiGet<CategoryResponse>(
        `categories?limit=${limit}`,
        { includeAuth: false }
      );
      // Backend returns: { categories: Category[], pagination: {...} }
      if (
        response &&
        typeof response === "object" &&
        "categories" in response
      ) {
        return response.categories;
      }
      // Fallback: if response is direct array
      return Array.isArray(response) ? response : [];
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to fetch categories");
    }
  }
);

// Create category (Admin only)
export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (
    categoryData: { name: string; description?: string; icon?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiPost<Category>("categories", categoryData, {
        includeAuth: true,
      });
      // Backend returns: { success: true, message: string, data: Category }
      // apiPost already extracts data from response, so response should be Category directly
      if (response && typeof response === "object" && "id" in response) {
        return response;
      }
      return response as Category;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to create category");
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Category
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        // Add new category to the list
        state.categories.push(action.payload);
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
