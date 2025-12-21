import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  apiGet,
  apiPost,
  apiPostFormData,
  apiPut,
  apiPutFormData,
  apiPatch,
  apiDelete,
  handleUnauthorized,
  ApiError,
} from "../api";

interface Category {
  id: number;
  name: string;
}

interface Instructor {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
}

interface Section {
  id: number;
  title: string;
  lessons?: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  description?: string;
  type: string;
  duration?: number;
  order?: number;
  isRequired?: boolean;
  isFree?: boolean;
  isCompleted?: boolean;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  level: string;
  type: string;
  price?: number;
  version?: string;
  isPublished: boolean;
  isEnrolled?: boolean;
  category?: Category;
  instructor?: Instructor;
  sections?: Section[];
  stats?: {
    enrollmentCount: number;
    totalLessons: number;
  };
  createdAt?: string;
}

interface CourseFilters {
  search?: string;
  sort?: string;
  level?: string;
  type?: string;
  page?: number;
  limit?: number;
}

interface CourseListResponse {
  courses: Course[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CreateCourseData {
  title: string;
  description: string;
  categoryId: number;
  level: string;
  type: string;
  price?: number;
  thumbnail?: string;
  requireSequentialCompletion?: boolean;
  requireManualApproval?: boolean;
}

// For FormData upload
interface CreateCourseWithFileData extends Omit<CreateCourseData, "thumbnail"> {
  thumbnailFile?: File;
}

interface CourseState {
  courses: Course[];
  myCourses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: CourseState = {
  courses: [],
  myCourses: [],
  currentCourse: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchCourses = createAsyncThunk(
  "course/fetchCourses",
  async (
    filters: CourseFilters & { admin?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.level) params.append("level", filters.level);
      if (filters.type) params.append("type", filters.type);

      const queryString = params.toString();
      // Use admin endpoint if admin flag is true
      const baseEndpoint = filters.admin ? "courses/admin/all" : "courses";
      const endpoint = `${baseEndpoint}${queryString ? `?${queryString}` : ""}`;

      const response = await apiGet<CourseListResponse>(endpoint, {
        includeAuth: filters.admin || false,
      });
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to fetch courses");
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  "course/fetchCourseById",
  async (courseId: number, { rejectWithValue }) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      return await apiGet<Course>(`courses/${courseId}`, {
        includeAuth: !!token,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to fetch course");
    }
  }
);

export const fetchMyCourses = createAsyncThunk(
  "course/fetchMyCourses",
  async (limit: number = 100, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ courses: Course[] }>(
        `courses/my-courses?limit=${limit}`
      );
      return response.courses || [];
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to fetch my courses");
    }
  }
);

export const createCourse = createAsyncThunk(
  "course/createCourse",
  async (
    data: CreateCourseData | CreateCourseWithFileData | FormData,
    { rejectWithValue }
  ) => {
    try {
      // If it's FormData (has thumbnailFile), use FormData upload
      if (data instanceof FormData) {
        return await apiPostFormData<Course>("courses", data);
      }

      // Otherwise use regular JSON POST
      return await apiPost<Course>("courses", data);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to create course");
    }
  }
);

// Update course (Instructor - own courses, Admin - any)
export const updateCourse = createAsyncThunk(
  "course/updateCourse",
  async (
    {
      courseId,
      data,
    }: { courseId: number; data: FormData | Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      // If it's FormData (has thumbnailFile), use FormData upload
      if (data instanceof FormData) {
        return await apiPutFormData<Course>(`courses/${courseId}`, data);
      }

      // Otherwise use regular JSON PUT
      return await apiPut<Course>(`courses/${courseId}`, data);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to update course");
    }
  }
);

// Delete course (Admin/Super Admin only - can delete any course)
export const deleteCourse = createAsyncThunk(
  "course/deleteCourse",
  async (courseId: number, { rejectWithValue }) => {
    try {
      await apiDelete(`courses/${courseId}`);
      return courseId;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to delete course");
    }
  }
);

// Delete my course (Instructor only - can only delete own courses)
export const deleteMyCourse = createAsyncThunk(
  "course/deleteMyCourse",
  async (courseId: number, { rejectWithValue }) => {
    try {
      await apiDelete(`courses/my-courses/${courseId}`);
      return courseId;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to delete course");
    }
  }
);

// Assign instructor to course (Admin only)
export const assignInstructor = createAsyncThunk(
  "course/assignInstructor",
  async (
    { courseId, instructorId }: { courseId: number; instructorId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiPatch<Course>(
        `courses/${courseId}/assign-instructor`,
        {
          instructorId,
        }
      );
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(apiError.message || "Failed to assign instructor");
    }
  }
);

// Toggle publish status (Instructor - own courses, Admin - any)
export const togglePublish = createAsyncThunk(
  "course/togglePublish",
  async (
    { courseId, isPublished }: { courseId: number; isPublished: boolean },
    { rejectWithValue }
  ) => {
    try {
      // Backend menggunakan PATCH, bukan PUT
      const response = await apiPatch<Course>(`courses/${courseId}/publish`, {
        isPublished,
      });
      return response;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        apiError.message || "Failed to toggle publish status"
      );
    }
  }
);

export const publishNewVersion = createAsyncThunk(
  "course/publishNewVersion",
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await apiPost<{
        course: { version: string };
        newVersion: string;
      }>(`courses/${courseId}/publish-new-version`);
      return {
        courseId,
        newVersion: response.newVersion,
      };
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        handleUnauthorized();
      }
      return rejectWithValue(
        apiError.message || "Failed to publish new version"
      );
    }
  }
);

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Courses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Course By ID
    builder
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
        state.error = null;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch My Courses
    builder
      .addCase(fetchMyCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.myCourses = action.payload;
        state.error = null;
      })
      .addCase(fetchMyCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Course
    builder
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.myCourses.push(action.payload);
        state.error = null;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Course
    builder
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload;
        // Update in courses list (admin view)
        const courseIndex = state.courses.findIndex(
          (c) => c.id === updatedCourse.id
        );
        if (courseIndex !== -1) {
          state.courses[courseIndex] = updatedCourse;
        }
        // Update in myCourses list (instructor view)
        const myCourseIndex = state.myCourses.findIndex(
          (c) => c.id === updatedCourse.id
        );
        if (myCourseIndex !== -1) {
          state.myCourses[myCourseIndex] = updatedCourse;
        }
        // Update currentCourse if it's the same course
        if (state.currentCourse?.id === updatedCourse.id) {
          state.currentCourse = updatedCourse;
        }
        state.error = null;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Course (Admin/Super Admin)
    builder
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from courses list (admin view)
        state.courses = state.courses.filter(
          (course) => course.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete My Course (Instructor)
    builder
      .addCase(deleteMyCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMyCourse.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from myCourses list (instructor view)
        state.myCourses = state.myCourses.filter(
          (course) => course.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteMyCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Assign Instructor
    builder
      .addCase(assignInstructor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignInstructor.fulfilled, (state, action) => {
        state.loading = false;
        const updatedCourse = action.payload;
        // Update in courses list (admin view)
        const courseIndex = state.courses.findIndex(
          (c) => c.id === updatedCourse.id
        );
        if (courseIndex !== -1) {
          state.courses[courseIndex] = updatedCourse;
        }
        // Update in myCourses list (instructor view)
        const myCourseIndex = state.myCourses.findIndex(
          (c) => c.id === updatedCourse.id
        );
        if (myCourseIndex !== -1) {
          state.myCourses[myCourseIndex] = updatedCourse;
        }
        // Update currentCourse if it's the same course
        if (state.currentCourse?.id === updatedCourse.id) {
          state.currentCourse = updatedCourse;
        }
        state.error = null;
      })
      .addCase(assignInstructor.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to assign instructor";
      });

    // Publish New Version (now only updates version, doesn't create new course)
    builder
      .addCase(publishNewVersion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishNewVersion.fulfilled, (state, action) => {
        state.loading = false;
        // Update course in myCourses list with new version
        const courseId = action.payload.courseId;
        const courseIndex = state.myCourses.findIndex((c) => c.id === courseId);
        if (courseIndex !== -1) {
          // Fetch updated course will be handled by component refresh
          state.myCourses[courseIndex] = {
            ...state.myCourses[courseIndex],
            version: action.payload.newVersion,
          };
        }
        // Also update currentCourse if it's the same course
        if (state.currentCourse?.id === courseId) {
          state.currentCourse = {
            ...state.currentCourse,
            version: action.payload.newVersion,
          };
        }
        state.error = null;
      })
      .addCase(publishNewVersion.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to publish new version";
      });
  },
});

export const { clearError, clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
