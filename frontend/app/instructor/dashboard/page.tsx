"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardStats } from "@/store/slices/instructorSlice";
import {
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Plus,
  Settings,
} from "lucide-react";

export default function InstructorDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isGreetingReady, setIsGreetingReady] = useState(false);
  const dispatch = useAppDispatch();
  const { dashboardStats, dashboardLoading, dashboardError } = useAppSelector(
    (state) => state.instructor
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Pastikan teks greeting konsisten antara server & client saat hydration.
  // Nama instructor baru ditampilkan setelah client mount untuk menghindari mismatch.
  useEffect(() => {
    setIsGreetingReady(true);
  }, []);

  // Use stats from Redux or default values
  const stats = dashboardStats || {
    totalCourses: 0,
    totalStudents: 0,
    totalReviews: 0,
    averageRating: 0,
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-neutral-600 dark:text-neutral-400">
          Loading dashboard...
        </span>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Error loading dashboard
          </p>
          <p className="text-sm text-neutral-500 mt-2">{dashboardError}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Instructor Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          {isGreetingReady && user?.firstName
            ? `Welcome back, ${user.firstName}! Here\u2019s how your courses are performing.`
            : "Welcome back! Here\u2019s how your courses are performing."}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Total Courses",
            value: stats.totalCourses,
            icon: BookOpen,
            color:
              "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
          },
          {
            label: "Total Students",
            value: stats.totalStudents,
            icon: Users,
            color:
              "bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400",
          },
          {
            label: "Reviews",
            value: stats.totalReviews,
            icon: Star,
            color:
              "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning",
          },
          {
            label: "Avg. Rating",
            value:
              stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A",
            icon: TrendingUp,
            color:
              "bg-success/10 text-success dark:bg-success/20 dark:text-success",
          },
        ].map((stat, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stat.value}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/instructor/courses/create")}
                className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Course
              </button>
              <button
                onClick={() => router.push("/instructor/courses")}
                className="btn bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white px-6 py-3 flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                Manage Courses
              </button>
            </div>
          </div>

          {/* Recent Performance (Mock) */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
              Recent Enrollments
            </h3>
            <div className="text-sm text-neutral-500 italic">
              No recent enrollments to show.
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
              Instructor Tips
            </h3>
            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400 list-disc pl-4">
              <li>Engage with your students in the Q&A section.</li>
              <li>Update your course content regularly.</li>
              <li>Add quizzes to assess student learning.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
