"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { GitBranch, Copy, Trash2, Plus, BookOpen } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMyCourses,
  deleteMyCourse,
  publishNewVersion,
  clearError,
} from "@/store/slices/courseSlice";
import { getFileUrl } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

// Course interface for type safety
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
  category?: {
    id: number;
    name: string;
  };
  createdAt?: string;
}

export default function InstructorCoursesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const {
    myCourses: courses,
    loading,
    error,
  } = useAppSelector((state) => state.course);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyCourses(100));
  }, [dispatch]);

  const handleEdit = (courseId: number) => {
    router.push(`/instructor/courses/${courseId}`); // Assuming edit page
  };

  const handleDelete = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    const result = await dispatch(deleteMyCourse(courseId));
    if (deleteMyCourse.fulfilled.match(result)) {
      // Refresh courses list to reflect the deletion
      dispatch(fetchMyCourses(100));
      showToast("Course deleted successfully!", "success");
    } else {
      showToast(
        (result.payload as string) || "Failed to delete course",
        "error"
      );
    }
  };

  const handlePublishNewVersion = (course: Course) => {
    setSelectedCourse(course);
    setShowVersionModal(true);
  };

  const confirmPublishNewVersion = async () => {
    if (!selectedCourse) return;

    setPublishing(true);
    dispatch(clearError());

    const result = await dispatch(publishNewVersion(selectedCourse.id));

    if (publishNewVersion.fulfilled.match(result)) {
      // Refresh courses list
      dispatch(fetchMyCourses(100));
      setShowVersionModal(false);
      setSelectedCourse(null);
      showToast(
        `Course version updated to ${result.payload.newVersion} successfully!`,
        "success"
      );
    } else {
      showToast(
        (result.payload as string) || "Failed to publish new version",
        "error"
      );
    }
    setPublishing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            My Courses
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your courses and content
          </p>
        </div>
        <button
          onClick={() => router.push("/instructor/courses/create")}
          className="btn btn-primary px-6 py-3 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Course
        </button>
      </div>

      {error && (
        <div className="bg-error/10 border border-error text-error rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="card p-12 text-center text-neutral-600 dark:text-neutral-400">
          <p className="mb-4">You haven&apos;t created any courses yet.</p>
          <button
            onClick={() => router.push("/instructor/courses/create")}
            className="text-primary-600 font-medium hover:underline"
          >
            Create your first course
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card overflow-hidden group">
              {/* Reuse CourseCard or custom card with edit actions */}
              <div className="relative h-48 bg-neutral-200 dark:bg-neutral-800">
                {course.thumbnail ? (
                  <Image
                    src={getFileUrl(course.thumbnail)}
                    alt={course.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-800">
                    <BookOpen className="w-16 h-16 text-neutral-400 dark:text-neutral-500" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  <Badge variant={course.isPublished ? "success" : "warning"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                  {course.version && (
                    <Badge variant="default" className="text-xs">
                      v{course.version}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">
                  {course.title}
                </h3>
                <div className="flex justify-between items-center text-sm text-neutral-500 mb-4">
                  <span>{course.category?.name}</span>
                  <span>
                    {course.createdAt
                      ? new Date(course.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(course.id)}
                      className="flex-1 btn btn-outline py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="btn bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 p-2"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handlePublishNewVersion(course)}
                    className="w-full btn bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-200 dark:hover:bg-primary-800/30 text-primary-600 dark:text-primary-400 py-2 text-sm flex items-center justify-center gap-2"
                    title="Publish New Version"
                  >
                    <GitBranch className="w-4 h-4" />
                    Publish New Version
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish New Version Modal */}
      <Modal
        isOpen={showVersionModal}
        onClose={() => {
          setShowVersionModal(false);
          setSelectedCourse(null);
        }}
        title="Publish New Course Version"
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Current Version
              </p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {selectedCourse.title}{" "}
                <span className="text-primary-600">
                  v{selectedCourse.version || "1.0"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                Publishing a new version will:
              </p>
              <ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-2">
                <li>Create a new immutable version of this course</li>
                <li>Duplicate all sections, lessons, and quizzes</li>
                <li>
                  Preserve existing student enrollments (they stay on current
                  version)
                </li>
                <li>
                  Allow you to update content without affecting enrolled
                  students
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> The new version will start as{" "}
                <strong>unpublished</strong>. You can edit and publish it when
                ready.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowVersionModal(false);
                  setSelectedCourse(null);
                }}
                className="flex-1"
                disabled={publishing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmPublishNewVersion}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={publishing}
              >
                {publishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Publish New Version
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
