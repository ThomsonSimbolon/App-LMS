'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, GraduationCap, UserCheck, Activity, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import { fetchActivityLogs } from '@/store/slices/activityLogSlice';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.dashboard);
  const { logs: recentActivities, loading: activitiesLoading } = useAppSelector(
    (state) => state.activityLog
  );

  useEffect(() => {
    // Note: Role protection is handled by AdminLayout
    dispatch(fetchDashboardStats());
    // Fetch recent activity logs (limit 5 for dashboard)
    dispatch(fetchActivityLogs({ limit: 5 }));
  }, [dispatch]);

  const formatEventType = (eventType: string) => {
    return eventType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      USER_LOGIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      COURSE_ENROLL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      LESSON_COMPLETE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      QUIZ_SUBMIT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      CERT_REQUESTED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      CERT_APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      CERT_REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return (
      colors[eventType] ||
      'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
    );
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
          { label: 'Total Users', value: stats?.totalUsers ?? 0, Icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
          { label: 'Total Courses', value: stats?.totalCourses ?? 0, Icon: BookOpen, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
          { label: 'Enrollments', value: stats?.totalEnrollments ?? 0, Icon: GraduationCap, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
          { label: 'Instructors', value: stats?.activeInstructors ?? 0, Icon: UserCheck, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Activities</h3>
            <button
              onClick={() => router.push('/admin/activity-logs')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Activity className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getEventTypeColor(log.eventType)}>
                        {formatEventType(log.eventType)}
                      </Badge>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-700 dark:text-neutral-300">
                      {log.user ? (
                        <span>
                          <span className="font-medium">
                            {log.user.firstName} {log.user.lastName}
                          </span>
                          {log.entityType && (
                            <span className="text-neutral-500 dark:text-neutral-400">
                              {' '}
                              • {log.entityType}
                              {log.entityId && ` #${log.entityId}`}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-neutral-500 dark:text-neutral-400 italic">
                          System {log.entityType && `• ${log.entityType}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 italic text-center py-4">
                No recent activities
              </p>
            )}
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
