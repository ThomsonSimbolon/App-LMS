"use client";

import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/layouts";
import { CourseCard } from "@/components/course/CourseCard";
import { CourseFilters, FilterState } from "@/components/course/CourseFilters";
import Skeleton from "@/components/ui/Skeleton";
import { BookX, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCourses, clearError } from "@/store/slices/courseSlice";

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, loading, error, pagination } = useAppSelector(
    (state) => state.course
  );
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    sort: "newest",
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
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
        <div className="container-custom">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Explore Courses
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Discover your next learning adventure
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Filters
                </h2>
                <CourseFilters onFilterChange={handleFilterChange} />
              </div>
            </div>

            {/* Courses Grid */}
            <div className="lg:col-span-3">
              {error && (
                <div className="bg-error/10 border border-error text-error rounded-lg p-4 mb-6">
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
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <BookX className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    No courses found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
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
                        level={
                          course.level as
                            | "BEGINNER"
                            | "INTERMEDIATE"
                            | "ADVANCED"
                        }
                        type={course.type as "FREE" | "PAID" | "PREMIUM"}
                        price={course.price}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        enrollmentCount={(course as any).enrollmentCount || 0}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        rating={(course as any).rating || 0}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        isEnrolled={(course as any).isEnrolled || false}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        version={(course as any).version || 1}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn btn-outline px-4 py-2 disabled:opacity-50 flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <span className="flex items-center px-4 text-slate-700 dark:text-slate-300">
                        Page {page} of {pagination.pages}
                      </span>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= pagination.pages}
                        className="btn btn-outline px-4 py-2 disabled:opacity-50 flex items-center gap-2"
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
      </div>
      <Footer />
    </>
  );
}
