'use client';

import { LessonContent } from '@/store/slices/lessonSlice';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { MessageSquare, CheckCircle } from 'lucide-react';

interface DiscussionLessonProps {
  lesson: LessonContent;
  onComplete?: () => void;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

export function DiscussionLesson({ 
  lesson, 
  onComplete,
  isCompleted = false,
  isCompleting = false
}: DiscussionLessonProps) {
  const { content } = lesson;
  const topic = content.topic;
  const instructions = content.instructions;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="info">Discussion</Badge>
      </div>

      <div className="bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Discussion Forum
        </h3>

        {topic && (
          <div className="mb-4">
            <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
              Topic:
            </h4>
            <p className="text-neutral-700 dark:text-neutral-300">
              {topic}
            </p>
          </div>
        )}

        {instructions && (
          <div className="mb-4 prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: instructions }} />
          </div>
        )}

        <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            ⚠️ Discussion forum feature coming soon. Participate in the discussion to complete this lesson.
          </p>
        </div>
      </div>

      {lesson.description && (
        <div className="mt-4 prose dark:prose-invert max-w-none">
          <p className="text-neutral-700 dark:text-neutral-300">
            {lesson.description}
          </p>
        </div>
      )}

      {onComplete && (
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-success-600 dark:text-success-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Discussion Completed</span>
            </div>
          ) : (
            <Button
              onClick={onComplete}
              disabled={isCompleting}
              className="w-full"
            >
              {isCompleting ? 'Marking Complete...' : 'Mark as Complete'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

