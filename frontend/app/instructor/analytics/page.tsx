'use client';

import React from 'react';
import Card from '@/components/ui/Card';

export default function InstructorAnalyticsPage() {
  const stats = [
    { label: 'Total Students', value: '1,234', change: '+12%', trend: 'up' },
    { label: 'Avg. Course Rating', value: '4.8', change: '+0.2', trend: 'up' },
    { label: 'Course Completion Rate', value: '68%', change: '-2%', trend: 'down' },
    { label: 'Total Revenue', value: '$12.5k', change: '+8%', trend: 'up' },
  ];

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

      {/* Charts Placeholders */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
            Enrollment Growth
          </h3>
          <div className="h-64 flex items-end gap-2 justify-between px-2">
             {[40, 65, 50, 80, 55, 90, 70, 85, 95, 75, 80, 100].map((h, i) => (
               <div key={i} className="w-full bg-primary-100 dark:bg-primary-900/30 rounded-t-sm relative group cursor-pointer">
                 <div 
                   className="absolute bottom-0 left-0 right-0 bg-primary-600 rounded-t-sm transition-all group-hover:bg-primary-500"
                   style={{ height: `${h}%` }}
                 ></div>
                 <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded">
                   {h}
                 </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-neutral-500">
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
            Student Engagement
          </h3>
          <div className="h-64 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-100 dark:border-neutral-800 border-dashed">
            <p className="text-neutral-500">Chart Visualization Placeholder</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
