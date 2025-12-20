'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, GraduationCap, UserCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeInstructors: 0
  });

  useEffect(() => {
    // Note: Role protection is handled by AdminLayout
    // Mock stats for now - in real app, fetch from API
    // We will implement real stats fetching when creating the specific management pages
    setTimeout(() => {
      setStats({
        totalUsers: 152,
        totalCourses: 24,
        totalEnrollments: 450,
        activeInstructors: 12
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Overview of platform performance and statistics
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers, Icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
          { label: 'Total Courses', value: stats.totalCourses, Icon: BookOpen, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
          { label: 'Enrollments', value: stats.totalEnrollments, Icon: GraduationCap, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
          { label: 'Instructors', value: stats.activeInstructors, Icon: UserCheck, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
        ].map((stat, i) => {
          const IconComponent = stat.Icon;
          return (
            <div key={i} className="card p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Recent Activities</h3>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500 italic">Activity log coming soon...</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/admin/users')}
              className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors"
            >
              <div className="mb-2 text-primary-600 dark:text-primary-400">
                <Users className="w-6 h-6" />
              </div>
              <div className="font-semibold text-neutral-900 dark:text-white">Manage Users</div>
            </button>
            <button 
              onClick={() => router.push('/admin/courses')}
              className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors"
            >
              <div className="mb-2 text-primary-600 dark:text-primary-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="font-semibold text-neutral-900 dark:text-white">Manage Courses</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
