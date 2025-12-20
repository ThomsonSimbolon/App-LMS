'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { useRequireRole } from '@/hooks/useAuth';
import { getAccessToken } from '@/lib/auth';
import Image from 'next/image';
import { FileImage } from 'lucide-react';

export default function AdminCoursesPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireRole(['ADMIN', 'SUPER_ADMIN']);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchCourses();
    }
  }, [authLoading]);

  const fetchCourses = async () => {
    try {
      // Note: This fetches published courses. 
      // TODO: Update backend to allow admins to fetch ALL courses (including drafts)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses?limit=100`);
      const data = await response.json();
      
      if (response.ok) {
        setCourses(data.data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    const token = getAccessToken();
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCourses(courses.filter(c => c.id !== courseId));
        setShowDeleteModal(null);
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.instructor?.firstName + ' ' + course.instructor?.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Button variant="primary" onClick={() => router.push('/instructor/courses/create')}>
            + New Course
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {authLoading || loading ? (
          <div className="p-8 text-center text-neutral-500">Loading courses...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Course</th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Instructor</th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Level</th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">Created At</th>
                  <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-neutral-200 dark:bg-neutral-700 overflow-hidden relative flex-shrink-0">
                            {course.thumbnail ? (
                              <Image 
                                src={course.thumbnail} 
                                alt={course.title} 
                                fill 
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                                <FileImage className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-neutral-900 dark:text-white truncate max-w-[200px]" title={course.title}>
                              {course.title}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {course.type === 'FREE' ? 'Free' : `$${course.price}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                        {course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          course.level === 'BEGINNER' ? 'success' :
                          course.level === 'INTERMEDIATE' ? 'warning' : 'danger'
                        }>
                          {course.level}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                        {formatDate(course.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/courses/${course.id}`, '_blank')}
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
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Delete Course?</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete this course? This action cannot be undone and will remove all enrollments and data associated with it.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowDeleteModal(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDeleteCourse(showDeleteModal)}>Delete Course</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
