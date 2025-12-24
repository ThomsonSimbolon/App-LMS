'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { EnrolledCourseCard } from '@/components/dashboard/EnrolledCourseCard';
import { BookOpen, Target, CheckCircle, Trophy, Search, Settings } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyEnrollments } from '@/store/slices/enrollmentSlice';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { enrollments, loading } = useAppSelector((state) => state.enrollment);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    dispatch(fetchMyEnrollments());
  }, [dispatch, user, router]);

  // Calculate stats from enrollments
  const stats = useMemo(() => {
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((e) => e.progress === 100).length;
    const activeCourses = totalCourses - completedCourses;

    return {
      totalCourses,
      activeCourses,
      completedCourses,
      certificates: completedCourses, // Assuming 1 cert per completed course
    };
  }, [enrollments]);

  // Show recent 4 enrollments
  const recentEnrollments = enrollments.slice(0, 4);

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
          Welcome back, {user?.firstName || 'Student'}! 👋
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Continue your learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <DashboardCard
          icon={BookOpen}
          title="Enrolled Courses"
          value={stats.totalCourses}
          subtitle="Total courses"
          href="/dashboard/courses"
          variant="primary"
        />
        <DashboardCard
          icon={Target}
          title="In Progress"
          value={stats.activeCourses}
          subtitle="Active learning"
          variant="info"
        />
        <DashboardCard
          icon={CheckCircle}
          title="Completed"
          value={stats.completedCourses}
          subtitle="Finished courses"
          variant="success"
        />
        <DashboardCard
          icon={Trophy}
          title="Certificates"
          value={stats.certificates}
          subtitle="Earned certificates"
          href="/dashboard/certificates"
          variant="warning"
        />
      </div>

      {/* Recent Courses */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Continue Learning
          </h2>
          {enrollments.length > 4 && recentEnrollments.length > 0 && (
            <button
              onClick={() => router.push('/dashboard/courses')}
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              View All →
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-40 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : recentEnrollments.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentEnrollments.map((enrollment) => (
              <EnrolledCourseCard
                key={enrollment.id}
                courseId={enrollment.course.id}
                title={enrollment.course.title}
                thumbnail={enrollment.course.thumbnail}
                progress={enrollment.progress || 0}
                instructor={enrollment.course.instructor}
                lastAccessedAt={enrollment.lastAccessedAt}
              />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              No enrolled courses yet
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Start learning by enrolling in a course
            </p>
            <button
              onClick={() => router.push('/dashboard/browse-courses')}
              className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse Courses
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/browse-courses')} role="button">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Explore New Courses
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 ml-12">
            Discover courses to expand your knowledge
          </p>
        </div>
        <div className="card p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/profile')} role="button">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <Settings className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Account Settings
            </h3>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 ml-12">
            Manage your profile and preferences
          </p>
        </div>
      </div>
    </div>
  );
}
