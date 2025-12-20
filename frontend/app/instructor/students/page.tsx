'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function InstructorStudentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const students = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', course: 'React Fundamentals', progress: 75, joinedAt: '2025-10-15' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', course: 'Advanced Node.js', progress: 30, joinedAt: '2025-11-02' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', course: 'React Fundamentals', progress: 100, joinedAt: '2025-09-20' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', course: 'UI/UX Design Masterclass', progress: 10, joinedAt: '2025-12-01' },
    { id: 5, name: 'Evan Wright', email: 'evan@example.com', course: 'Advanced Node.js', progress: 0, joinedAt: '2025-12-05' },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">{student.name}</div>
                        <div className="text-neutral-500 text-xs">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                      {student.course}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                      {student.joinedAt}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
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
          Showing {filteredStudents.length} students
        </div>
      </Card>
    </div>
  );
}
