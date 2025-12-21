'use client';

import { useRouter } from 'next/navigation';
import { LessonContent } from '@/store/slices/lessonSlice';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Clock, Award } from 'lucide-react';

interface ExamLessonProps {
  lesson: LessonContent;
  onComplete?: () => void;
}

export function ExamLesson({ lesson, onComplete }: ExamLessonProps) {
  const router = useRouter();
  const { content } = lesson;
  const quizId = content.quizId;
  const passingScore = content.passingScore ?? 70;
  const timeLimit = content.timeLimit;

  const handleTakeExam = () => {
    if (quizId) {
      router.push(`/dashboard/quizzes/${quizId}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="error">Exam</Badge>
        {lesson.isRequired && <Badge variant="default">Required</Badge>}
      </div>

      <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Exam Information
        </h3>

        <div className="space-y-3 mb-6">
          {quizId && (
            <div>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Exam ID:
              </span>{' '}
              <span className="text-neutral-600 dark:text-neutral-400">
                #{quizId}
              </span>
            </div>
          )}

          {passingScore !== undefined && (
            <div>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Passing Score:
              </span>{' '}
              <span className="text-neutral-600 dark:text-neutral-400">
                {passingScore}%
              </span>
            </div>
          )}

          {timeLimit && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Time Limit:
              </span>{' '}
              <span className="text-neutral-600 dark:text-neutral-400">
                {Math.floor(timeLimit / 60)} minutes
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Complete this exam through the quiz system. You must pass the exam to complete this lesson.
          </p>
          {quizId ? (
            <Button
              onClick={handleTakeExam}
              className="w-full"
            >
              Take Exam
            </Button>
          ) : (
            <p className="text-sm text-warning-600 dark:text-warning-400">
              Exam not yet configured. Please contact your instructor.
            </p>
          )}
        </div>
      </div>

      {lesson.description && (
        <div className="mt-4 prose dark:prose-invert max-w-none">
          <p className="text-neutral-700 dark:text-neutral-300">
            {lesson.description}
          </p>
        </div>
      )}
    </div>
  );
}

