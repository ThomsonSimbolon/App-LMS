"use client";

import React from "react";
import Badge from "@/components/ui/Badge";
import { PlayCircle, FileText } from "lucide-react";

export default function StudentQuizzesPage() {
  // Mock data
  const quizzes = [
    {
      id: 1,
      title: "React Fundamentals Quiz",
      course: "React for Beginners",
      status: "Completed",
      score: 85,
      date: "2025-10-20",
    },
    {
      id: 2,
      title: "Advanced CSS Assessment",
      course: "CSS Masterclass",
      status: "Failed",
      score: 60,
      date: "2025-11-05",
    },
    {
      id: 3,
      title: "Node.js Basics",
      course: "Node.js Zero to Hero",
      status: "Pending",
      score: null,
      date: null,
    },
  ];

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
          My Quizzes
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Track your quiz attempts and scores
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                  Quiz Title
                </th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                  Course
                </th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                  Score
                </th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white">
                  Date
                </th>
                <th className="px-6 py-4 font-semibold text-neutral-900 dark:text-white text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <tr
                    key={quiz.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                      {quiz.title}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                      {quiz.course}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          quiz.status === "Completed"
                            ? "success"
                            : quiz.status === "Failed"
                            ? "error"
                            : "warning"
                        }
                      >
                        {quiz.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                      {quiz.score ? `${quiz.score}%` : "-"}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                      {quiz.date || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {quiz.status === "Pending" ? (
                        <button className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm">
                          <PlayCircle className="w-4 h-4 mr-1.5" />
                          Start Quiz
                        </button>
                      ) : (
                        <button className="inline-flex items-center text-neutral-500 hover:text-neutral-600 font-medium text-sm">
                          <FileText className="w-4 h-4 mr-1.5" />
                          View Results
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-neutral-500"
                  >
                    No quizzes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
