'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/course/VideoPlayer';
import { PDFViewer } from '@/components/course/PDFViewer';
import { LessonList } from '@/components/course/LessonList';

export default function LearnPage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchEnrollmentData();
  }, [params.courseId]);

  useEffect(() => {
    if (currentLesson) {
      fetchLessonContent(currentLesson.id);
    }
  }, [currentLesson]);

  const fetchEnrollmentData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Get user's enrollments
      const enrollmentsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/enrollments/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const enrollmentsData = await enrollmentsRes.json();
      
      if (!enrollmentsRes.ok) throw new Error(enrollmentsData.error);

      // Find enrollment for this course
      const courseEnrollment = enrollmentsData.data.enrollments?.find(
        (e: any) => e.course.id === parseInt(params.courseId)
      );

      if (!courseEnrollment) {
        setError('You are not enrolled in this course');
        setLoading(false);
        return;
      }

      setEnrollment(courseEnrollment);
      
      // Set first available lesson as current
      if (courseEnrollment.course.sections?.[0]?.lessons?.[0]) {
        setCurrentLesson(courseEnrollment.course.sections[0].lessons[0]);
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchLessonContent = async (lessonId: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonId}/content`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setLessonContent(data.data);
    } catch (err: any) {
      console.error('Failed to fetch lesson content:', err);
    }
  };

  const handleLessonClick = (lessonId: number) => {
    const lesson = enrollment?.course.sections
      .flatMap((s: any) => s.lessons)
      .find((l: any) => l.id === lessonId);
    
    if (lesson) {
      setCurrentLesson(lesson);
      setLessonContent(null);
    }
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson) return;
    
    const token = localStorage.getItem('accessToken');
    setCompleting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/lessons/${currentLesson.id}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ watchTime: currentLesson.duration || 0 }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      alert('Lesson marked as complete!');
      fetchEnrollmentData(); // Refresh data
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="card p-12 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error || 'Unable to access this course'}</p>
          <button onClick={() => router.push('/courses')} className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3">
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/dashboard')} className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
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
            <div className="w-48 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div
                className="bg-accent-600 h-2 rounded-full transition-all"
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
                    <>
                      {currentLesson.type === 'VIDEO' && lessonContent.contentUrl && (
                        <VideoPlayer url={lessonContent.contentUrl} />
                      )}
                      {currentLesson.type === 'PDF' && lessonContent.contentUrl && (
                        <PDFViewer url={lessonContent.contentUrl} />
                      )}
                      {currentLesson.type === 'TEXT' && (
                        <div className="prose dark:prose-invert max-w-none">
                          <p>{lessonContent.textContent}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg h-96 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading content...</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                    <button
                      onClick={handleCompleteLesson}
                      disabled={completing || currentLesson.isCompleted}
                      className="btn bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 disabled:opacity-50"
                    >
                      {currentLesson.isCompleted ? '✓ Completed' : completing ? 'Marking Complete...' : 'Mark as Complete'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-600 dark:text-neutral-400">Select a lesson to begin</p>
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
                sections={enrollment.course.sections || []}
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
