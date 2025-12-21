'use client';

import { useState, useEffect } from 'react';
import { CourseCard } from '@/components/course/CourseCard';
import { CourseFilters, FilterState } from '@/components/course/CourseFilters';
import Skeleton from '@/components/ui/Skeleton';
import { BookX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCourses, clearError } from '@/store/slices/courseSlice';

export default function BrowseCoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, loading, error, pagination } = useAppSelector((state) => state.course);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sort: 'newest',
  });
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    dispatch(
      fetchCourses({
        ...filters,
        page,
        limit,
      })
    );
  }, [dispatch, filters, page]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page
    dispatch(clearError());
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
          Browse Courses
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Discover your next learning adventure
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Filters
            </h2>
            <CourseFilters onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="lg:col-span-3">
          {error && (
            <div className="bg-error-light/10 border border-error text-error-dark dark:text-error-light rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4">
                  <Skeleton className="h-48 mb-4" />
                  <Skeleton className="h-6 mb-2" />
                  <Skeleton className="h-4 mb-4" />
                  <Skeleton className="h-4" />
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="card p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <BookX className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                No courses found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnail={course.thumbnail}
                    instructor={course.instructor}
                    level={course.level}
                    type={course.type}
                    price={course.price}
                    enrollmentCount={course.enrollmentCount}
                    rating={course.rating}
                    isEnrolled={course.isEnrolled}
                    version={course.version}
                    basePath="/dashboard/courses"
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white px-4 py-2 disabled:opacity-50 flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-neutral-700 dark:text-neutral-300">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= pagination.pages}
                    className="btn bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white px-4 py-2 disabled:opacity-50 flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

