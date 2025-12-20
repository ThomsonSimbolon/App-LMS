'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EnrolledCourseCard } from '@/components/dashboard/EnrolledCourseCard';

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchEnrollments();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [activeFilter, enrollments]);

  const fetchEnrollments = async () => {
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/enrollments/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      setEnrollments(data.data.enrollments || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    switch (activeFilter) {
      case 'active':
        setFilteredEnrollments(enrollments.filter(e => e.progress > 0 && e.progress < 100));
        break;
      case 'completed':
        setFilteredEnrollments(enrollments.filter(e => e.progress === 100));
        break;
      default:
        setFilteredEnrollments(enrollments);
    }
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
          My Courses
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
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
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
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
              <div className="h-40 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
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
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            {activeFilter === 'completed'
              ? 'No completed courses yet'
              : activeFilter === 'active'
              ? 'No courses in progress'
              : 'No enrolled courses yet'}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {activeFilter === 'all'
              ? 'Start learning by enrolling in a course'
              : 'Complete a course to see it here'}
          </p>
          {activeFilter === 'all' && (
            <button
              onClick={() => router.push('/courses')}
              className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3"
            >
              Browse Courses
            </button>
          )}
        </div>
      )}
    </div>
  );
}
