'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyStudents } from '@/store/slices/instructorSlice';

export default function InstructorStudentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { students, studentsLoading, studentsError, pagination } = useAppSelector(
    (state) => state.instructor
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch students on mount and when search/filter changes
  useEffect(() => {
    dispatch(
      fetchMyStudents({
        search: debouncedSearch || undefined,
        page: 1,
        limit: 10,
      })
    );
  }, [dispatch, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            My Students
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            View progress of students enrolled in your courses
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search students or courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Student Name</th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Course</th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Progress</th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {studentsLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      <span className="ml-2 text-neutral-500">Loading students...</span>
                    </div>
                  </td>
                </tr>
              ) : studentsError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-red-600">
                    Error: {studentsError}
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={`${student.id}-${student.enrollmentId}`} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">{student.name}</div>
                        <div className="text-neutral-500 text-xs">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                      {student.course.title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500">{Math.round(student.progress)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                      {new Date(student.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => router.push(`/instructor/courses/${student.course.id}`)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-center text-sm text-neutral-500">
          Showing {students.length} of {pagination.total} students
        </div>
      </Card>
    </div>
  );
}
