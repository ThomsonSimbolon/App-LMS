"use client";

import { useState, useEffect, useMemo, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { LessonList } from "@/components/course/LessonList";
import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyEnrollments } from "@/store/slices/enrollmentSlice";
import {
  fetchLessonContent,
  completeLesson,
  clearLessonContent,
  type AssignmentSubmissionData,
} from "@/store/slices/lessonSlice";

interface Lesson {
  id: number;
  title: string;
  type: string;
  duration?: number;
  isCompleted?: boolean;
}

interface Section {
  id: number;
  title: string;
  lessons?: Lesson[];
}

export default function LearnPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { enrollments, loading: enrollmentsLoading } = useAppSelector(
    (state) => state.enrollment
  );
  const { lessonContent } = useAppSelector((state) => state.lesson);
  const { user } = useAppSelector((state) => state.auth);

  // Unwrap params Promise
  const { courseId } = use(params);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    dispatch(fetchMyEnrollments());
  }, [dispatch, user, router]);

  // Find enrollment for this course
  const enrollment = enrollments.find(
    (e) => e.course.id === parseInt(courseId)
  );

  // Get first lesson from enrollment when available
  const firstLesson = useMemo(() => {
    if (!enrollment?.course.sections?.[0]?.lessons?.[0]) {
      return null;
    }
    return enrollment.course.sections[0].lessons[0] as Lesson;
  }, [enrollment]);

  // Use lazy initialization for currentLesson
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(() => {
    // This initializer only runs once when component mounts
    // We'll update it via effect if needed when enrollment loads
    return null;
  });
  const [completing, setCompleting] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [submissionData, setSubmissionData] = useState<
    AssignmentSubmissionData | undefined
  >(undefined);
  const hasInitializedLesson = useRef(false);

  // Set initial lesson when enrollment data becomes available
  useEffect(() => {
    if (firstLesson && !hasInitializedLesson.current && !currentLesson) {
      hasInitializedLesson.current = true;
      // Use setTimeout to defer state update and avoid synchronous setState in effect
      setTimeout(() => {
        setCurrentLesson(firstLesson);
      }, 0);
    }
  }, [firstLesson, currentLesson]);

  useEffect(() => {
    if (currentLesson) {
      dispatch(clearLessonContent());
      dispatch(fetchLessonContent(currentLesson.id));
    }
  }, [dispatch, currentLesson]);

  const handleLessonClick = (lessonId: number) => {
    if (!enrollment?.course.sections) {
      return;
    }

    const lesson = enrollment.course.sections
      .flatMap((s: Section) => s.lessons || [])
      .find((l: Lesson) => l.id === lessonId);

    if (lesson) {
      setCurrentLesson(lesson);
      dispatch(clearLessonContent());
    }
  };

  const handleCompleteLesson = async (
    assignmentSubmissionData?: AssignmentSubmissionData
  ) => {
    if (!currentLesson || !lessonContent) return;

    setCompleting(true);

    // Use submission data from AssignmentLesson component if provided
    const finalSubmissionData = assignmentSubmissionData || submissionData;

    const result = await dispatch(
      completeLesson({
        lessonId: currentLesson.id,
        watchTime:
          watchTime || currentLesson.duration || lessonContent.duration || 0,
        submissionData: finalSubmissionData,
      })
    );

    if (completeLesson.fulfilled.match(result)) {
      // Refresh enrollment data
      dispatch(fetchMyEnrollments());
      // Reset watch time and submission data
      setWatchTime(0);
      setSubmissionData(undefined);
    } else {
      const errorMessage =
        (result.payload as string) || "Failed to complete lesson";
      alert(errorMessage);
    }
    setCompleting(false);
  };

  const handleProgressUpdate = (newWatchTime: number) => {
    setWatchTime(newWatchTime);
  };

  // Reset watch time and submission data when lesson changes - using setTimeout to defer update
  useEffect(() => {
    if (currentLesson) {
      const timeoutId = setTimeout(() => {
        setWatchTime(0);
        setSubmissionData(undefined);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [currentLesson]);

  const loading = enrollmentsLoading;
  const error = !enrollment ? "You are not enrolled in this course" : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="card p-12 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {error || "Unable to access this course"}
          </p>
          <button
            onClick={() => router.push("/courses")}
            className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-base-dark">
      {/* Header */}
      <div className="bg-surface dark:bg-base-dark border-b border-border dark:border-[#1E293B] sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {enrollment.course.title}
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {enrollment.progress || 0}% Complete
                </p>
              </div>
            </div>
            <div className="w-48 bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${enrollment.progress || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video/PDF Player */}
            <div className="card p-6">
              {currentLesson ? (
                <>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                    {currentLesson.title}
                  </h2>

                  {lessonContent ? (
                    <LessonRenderer
                      lesson={lessonContent}
                      onComplete={handleCompleteLesson}
                      onProgressUpdate={handleProgressUpdate}
                      currentWatchTime={watchTime}
                      isCompleted={currentLesson.isCompleted}
                      isCompleting={completing}
                    />
                  ) : (
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg h-96 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Loading content...
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Select a lesson to begin
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Course Content
              </h3>
              <LessonList
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                sections={(enrollment.course.sections || []) as any}
                currentLessonId={currentLesson?.id}
                onLessonClick={handleLessonClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
