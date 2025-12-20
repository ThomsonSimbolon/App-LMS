'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CourseCard } from '@/components/course/CourseCard';
import Badge from '@/components/ui/Badge';

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/my-courses?limit=100`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 - Unauthorized (token expired or invalid)
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        throw new Error(data.message || data.error || 'Failed to fetch courses');
      }

      setCourses(data.data?.courses || []);
    } catch (err: any) {
      console.error('Fetch my courses error:', err);
      setError(err.message || 'Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (courseId: number) => {
    router.push(`/instructor/courses/${courseId}`); // Assuming edit page
  };

  const handleDelete = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete course');

      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err: any) {
      alert(err.message);
    }
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
          onClick={() => router.push('/instructor/courses/create')}
          className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3"
        >
          + Create New Course
        </button>
      </div>

      {error && (
        <div className="bg-error-light/10 border border-error text-error-dark dark:text-error-light rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="card p-12 text-center text-neutral-600 dark:text-neutral-400">
          <p className="mb-4">You haven't created any courses yet.</p>
          <button 
            onClick={() => router.push('/instructor/courses/create')}
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
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                )}
                <div className="absolute top-2 right-2">
                   <Badge variant={course.isPublished ? 'success' : 'warning'}>
                     {course.isPublished ? 'Published' : 'Draft'}
                   </Badge>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
                <div className="flex justify-between items-center text-sm text-neutral-500 mb-4">
                   <span>{course.category?.name}</span>
                   <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(course.id)}
                    className="flex-1 btn bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white py-2 text-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id)}
                    className="btn bg-red-50 text-red-600 hover:bg-red-100 p-2"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
