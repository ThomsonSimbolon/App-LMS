import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import courseReducer from "./slices/courseSlice";
import enrollmentReducer from "./slices/enrollmentSlice";
import lessonReducer from "./slices/lessonSlice";
import certificateReducer from "./slices/certificateSlice";
import notificationReducer from "./slices/notificationSlice";
import activityLogReducer from "./slices/activityLogSlice";
import categoryReducer from "./slices/categorySlice";
import dashboardReducer from "./slices/dashboardSlice";
import courseAssessorReducer from "./slices/courseAssessorSlice";
import instructorReducer from "./slices/instructorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    course: courseReducer,
    enrollment: enrollmentReducer,
    lesson: lessonReducer,
    certificate: certificateReducer,
    notification: notificationReducer,
    activityLog: activityLogReducer,
    category: categoryReducer,
    dashboard: dashboardReducer,
    courseAssessor: courseAssessorReducer,
    instructor: instructorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
