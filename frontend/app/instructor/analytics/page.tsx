'use client';

import React, { useEffect } from 'react';
import Card from '@/components/ui/Card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyAnalytics } from '@/store/slices/instructorSlice';

export default function InstructorAnalyticsPage() {
  const dispatch = useAppDispatch();
  const { analytics, analyticsLoading, analyticsError } = useAppSelector(
    (state) => state.instructor
  );

  useEffect(() => {
    dispatch(fetchMyAnalytics());
  }, [dispatch]);

  // Format stats from analytics data
  const stats = analytics
    ? [
        {
          label: 'Total Students',
          value: analytics.stats.totalStudents.toLocaleString(),
          change: analytics.changes.totalStudents.value,
          trend: analytics.changes.totalStudents.trend,
        },
        {
          label: 'Avg. Course Rating',
          value: analytics.stats.avgRating > 0 ? analytics.stats.avgRating.toFixed(1) : 'N/A',
          change: analytics.changes.avgRating.value,
          trend: analytics.changes.avgRating.trend,
        },
        {
          label: 'Course Completion Rate',
          value: `${analytics.stats.completionRate}%`,
          change: analytics.changes.completionRate.value,
          trend: analytics.changes.completionRate.trend,
        },
        {
          label: 'Total Revenue',
          value: analytics.stats.totalRevenue > 0 
            ? `$${(analytics.stats.totalRevenue / 1000).toFixed(1)}k` 
            : '$0',
          change: analytics.changes.totalRevenue.value,
          trend: analytics.changes.totalRevenue.trend,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Track course performance and student engagement
        </p>
      </div>

      {/* Stats Grid */}
      {analyticsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading analytics...</span>
        </div>
      ) : analyticsError ? (
        <Card className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p className="font-medium">Error loading analytics</p>
            <p className="text-sm mt-2">{analyticsError}</p>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stat.value}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  stat.trend === 'up' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Charts */}
      {!analyticsLoading && !analyticsError && analytics && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
              Enrollment Growth
            </h3>
            {analytics.trends.enrollmentGrowth.length > 0 ? (
              <>
                <div className="h-64 flex items-end gap-1 justify-between px-2">
                  {analytics.trends.enrollmentGrowth.map((item, i) => {
                    const maxCount = Math.max(...analytics.trends.enrollmentGrowth.map(e => e.count), 1);
                    const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 bg-primary-100 dark:bg-primary-900/30 rounded-t-sm relative group cursor-pointer">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-primary-600 rounded-t-sm transition-all group-hover:bg-primary-500"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {item.month}: {item.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 text-xs text-neutral-500">
                  <span>{analytics.trends.enrollmentGrowth[0]?.month || ''}</span>
                  <span>{analytics.trends.enrollmentGrowth[Math.floor(analytics.trends.enrollmentGrowth.length / 2)]?.month || ''}</span>
                  <span>{analytics.trends.enrollmentGrowth[analytics.trends.enrollmentGrowth.length - 1]?.month || ''}</span>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <p className="text-neutral-500">No enrollment data available</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
              Student Engagement
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Active Students</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                    {analytics.trends.engagement.active}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">
                    {analytics.trends.engagement.active}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Completed</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                    {analytics.trends.engagement.completed}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    {analytics.trends.engagement.completed}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Dropped</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                    {analytics.trends.engagement.dropped}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    {analytics.trends.engagement.dropped}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
