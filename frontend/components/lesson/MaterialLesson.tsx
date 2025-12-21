'use client';

import { PDFViewer } from '../course/PDFViewer';
import { LessonContent } from '@/store/slices/lessonSlice';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { getFileUrl } from '@/lib/api';
import { CheckCircle } from 'lucide-react';

interface MaterialLessonProps {
  lesson: LessonContent;
  onComplete?: () => void;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

export function MaterialLesson({ 
  lesson, 
  onComplete,
  isCompleted = false,
  isCompleting = false
}: MaterialLessonProps) {
  const { content } = lesson;
  const fileUrl = content.fileUrl;
  const textContent = content.content;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="default">Material</Badge>
        {content.fileType && (
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {content.fileType}
          </span>
        )}
      </div>

      {fileUrl ? (
        <div className="space-y-4">
          <PDFViewer url={getFileUrl(fileUrl)} />
          {content.fileType && (
            <div className="flex justify-end">
              <a
                href={getFileUrl(fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Download {content.fileType}
              </a>
            </div>
          )}
        </div>
      ) : textContent ? (
        <div className="prose dark:prose-invert max-w-none bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <div dangerouslySetInnerHTML={{ __html: textContent }} />
        </div>
      ) : (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <p className="text-neutral-600 dark:text-neutral-400">
            Material content not available
          </p>
        </div>
      )}

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
              <span className="font-medium">Lesson Completed</span>
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

