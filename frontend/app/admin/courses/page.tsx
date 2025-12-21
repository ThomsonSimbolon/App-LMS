"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useRequireRole } from "@/hooks/useAuth";
import Image from "next/image";
import { FileImage } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCourses,
  deleteCourse,
  clearError,
} from "@/store/slices/courseSlice";
import { getFileUrl } from "@/lib/api";

export default function AdminCoursesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading: authLoading } = useRequireRole(["ADMIN", "SUPER_ADMIN"]);
  const { courses: allCourses, loading } = useAppSelector(
    (state) => state.course
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading) {
      // Fetch all courses for admin (including unpublished)
      dispatch(fetchCourses({ limit: 100, admin: true }));
    }
  }, [authLoading, dispatch]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDeleteModal]);

  // Filter courses based on search term
  const courses = useMemo(() => {
    if (!searchTerm) return allCourses;
    const term = searchTerm.toLowerCase();
    return allCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term) ||
        course.instructor?.firstName?.toLowerCase().includes(term) ||
        course.instructor?.lastName?.toLowerCase().includes(term)
    );
  }, [allCourses, searchTerm]);

  const handleDeleteCourse = async (courseId: number) => {
    dispatch(clearError());
    const result = await dispatch(deleteCourse(courseId));
    if (deleteCourse.fulfilled.match(result)) {
      // Course already removed from state by reducer
      setShowDeleteModal(null);
    } else {
      alert((result.payload as string) || "Failed to delete course");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Course Management
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Manage all courses on the platform
          </p>
        </div>
        <div className="flex gap-3">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/instructor/courses/create")}
          >
            + New Course
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {authLoading || loading ? (
          <div className="p-8 text-center text-neutral-500">
            Loading courses...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Course
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Instructor
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Level
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                    Created At
                  </th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-neutral-200 dark:bg-neutral-700 overflow-hidden relative flex-shrink-0">
                            {course.thumbnail ? (
                              <Image
                                src={getFileUrl(course.thumbnail)}
                                alt={course.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                                <FileImage className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div
                                className="font-medium text-neutral-900 dark:text-white truncate max-w-[200px]"
                                title={course.title}
                              >
                                {course.title}
                              </div>
                              {course.version && (
                                <Badge variant="default" className="text-xs">
                                  v{course.version}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {course.type === "FREE"
                                ? "Free"
                                : `$${course.price}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                        {course.instructor
                          ? `${course.instructor.firstName} ${course.instructor.lastName}`
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            course.level === "BEGINNER"
                              ? "success"
                              : course.level === "INTERMEDIATE"
                              ? "warning"
                              : "error"
                          }
                        >
                          {course.level}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                        {course.createdAt ? formatDate(course.createdAt) : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/instructor/courses/${course.id}`)
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/courses/${course.id}`)
                            }
                          >
                            Manage
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/courses/${course.id}`)
                            }
                          >
                            View
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setShowDeleteModal(course.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-neutral-500"
                    >
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed z-50 flex items-center justify-center"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: 0,
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute bg-black/50 backdrop-blur-sm"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
            }}
            onClick={() => setShowDeleteModal(null)}
          />
          {/* Modal Content */}
          <Card className="w-full max-w-md relative z-10 m-4 p-6 space-y-4">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              Delete Course?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete this course? This action cannot be
              undone and will remove all enrollments and data associated with
              it.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowDeleteModal(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteCourse(showDeleteModal)}
              >
                Delete Course
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
