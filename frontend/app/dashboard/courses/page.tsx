'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EnrolledCourseCard } from '@/components/dashboard/EnrolledCourseCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyEnrollments } from '@/store/slices/enrollmentSlice';

export default function MyCoursesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { enrollments, loading } = useAppSelector((state) => state.enrollment);
  const { user } = useAppSelector((state) => state.auth);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    dispatch(fetchMyEnrollments());
  }, [dispatch, user, router]);

  // Filter enrollments based on active filter
  const filteredEnrollments = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return enrollments.filter((e) => e.progress > 0 && e.progress < 100);
      case 'completed':
        return enrollments.filter((e) => e.progress === 100);
      default:
        return enrollments;
    }
  }, [enrollments, activeFilter]);

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          My Courses
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Manage your enrolled courses
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-8">
        {[
          { key: 'all', label: 'All Courses' },
          { key: 'active', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === filter.key
                ? 'bg-primary-600 text-white'
                : 'btn-outline'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredEnrollments.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEnrollments.map((enrollment) => (
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
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">
            {activeFilter === 'completed' ? '🎓' : '📚'}
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {activeFilter === 'completed'
              ? 'No completed courses yet'
              : activeFilter === 'active'
              ? 'No courses in progress'
              : 'No enrolled courses yet'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {activeFilter === 'all'
              ? 'Start learning by enrolling in a course'
              : 'Complete a course to see it here'}
          </p>
          {activeFilter === 'all' && (
            <button
              onClick={() => router.push('/dashboard/browse-courses')}
              className="btn btn-primary px-6 py-3"
            >
              Browse Courses
            </button>
          )}
        </div>
      )}
    </div>
  );
}
