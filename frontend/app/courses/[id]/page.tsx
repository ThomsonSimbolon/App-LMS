'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header, Footer } from '@/components/layouts';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${params.id}`,
        { headers }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch course');
      }

      setCourse(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/enrollments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: parseInt(params.id) }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Enrollment failed');
      }

      alert('Successfully enrolled!');
      fetchCourse(); // Refresh course data
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const goToCourse = () => {
    router.push(`/learn/${params.id}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
          <div className="container-custom">
            <Skeleton className="h-64 mb-8" />
            <Skeleton className="h-12 mb-4" />
            <Skeleton className="h-32" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
          <div className="container-custom">
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                Course Not Found
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error || 'The course you are looking for does not exist.'}</p>
              <button onClick={() => router.push('/courses')} className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3">
                Browse Courses
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-white/20">{course.category?.name || 'General'}</Badge>
                  <Badge className="bg-white/20">{course.level}</Badge>
                  <Badge className="bg-white/20">{course.type}</Badge>
                </div>
                <h1 className="text-4xl font-bold  mb-4">{course.title}</h1>
                <p className="text-lg text-white/90 mb-6">{course.description}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">
                      {course.instructor?.firstName?.charAt(0)}{course.instructor?.lastName?.charAt(0)}
                    </div>
                    <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
                  </div>
                  {course.stats && (
                    <>
                      <span>•</span>
                      <span>{course.stats.enrollmentCount} students</span>
                      <span>•</span>
                      <span>{course.stats.totalLessons} lessons</span>
                    </>
                  )}
                </div>
                {course.isEnrolled ? (
                  <button onClick={goToCourse} className="btn bg-white hover:bg-white/90 text-primary-600 px-8 py-3 text-lg font-semibold">
                    Go to Course
                  </button>
                ) : (
                  <button onClick={handleEnroll} disabled={enrolling} className="btn bg-white hover:bg-white/90 text-primary-600 px-8 py-3 text-lg font-semibold disabled:opacity-50">
                    {enrolling ? 'Enrolling...' : course.type === 'FREE' ? 'Enroll for Free' : `Enroll - $${course.price}`}
                  </button>
                )}
              </div>
              <div className="relative h-80 rounded-xl overflow-hidden shadow-2xl">
                {course.thumbnail ? (
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 backdrop-blur flex items-center justify-center">
                    <span className="text-8xl font-bold">{course.title.charAt(0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="container-custom py-12">
          <div className="border-b border-neutral-200 dark:border-neutral-800 mb-8">
            <div className="flex gap-8">
              {['overview', 'curriculum'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-2 font-medium transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">About This Course</h2>
              <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line">{course.description}</p>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section: any, idx: number) => (
                  <div key={section.id} className="card">
                    <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                        Section {idx + 1}: {section.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {section.lessons?.length || 0} lessons
                      </p>
                    </div>
                    <div className="p-4">
                      {section.lessons && section.lessons.length > 0 ? (
                        <ul className="space-y-2">
                          {section.lessons.map((lesson: any) => (
                            <li key={lesson.id} className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg">
                              <span className="text-neutral-600 dark:text-neutral-400">
                                {lesson.type === 'VIDEO' ? '▶️' : lesson.type === 'PDF' ? '📄' : '📝'}
                              </span>
                              <span className="flex-1 text-neutral-700 dark:text-neutral-300">{lesson.title}</span>
                              {lesson.isFree && <Badge className="bg-accent-100 text-accent-700">Free Preview</Badge>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-neutral-600 dark:text-neutral-400 text-center py-4">No lessons yet</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="card p-12 text-center">
                  <p className="text-neural-600 dark:text-neutral-400">Curriculum not available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
