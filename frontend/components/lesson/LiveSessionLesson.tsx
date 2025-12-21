'use client';

import { LessonContent } from '@/store/slices/lessonSlice';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Calendar, Clock, ExternalLink, CheckCircle } from 'lucide-react';

interface LiveSessionLessonProps {
  lesson: LessonContent;
  onComplete?: () => void;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

export function LiveSessionLesson({ 
  lesson, 
  onComplete,
  isCompleted = false,
  isCompleting = false
}: LiveSessionLessonProps) {
  const { content } = lesson;
  const meetingUrl = content.meetingUrl;
  const scheduledAt = content.scheduledAt;
  const duration = lesson.duration || content.duration || 0;

  const isUpcoming = scheduledAt ? new Date(scheduledAt) > new Date() : false;
  const isPast = scheduledAt ? new Date(scheduledAt) < new Date() : false;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="primary">Live Session</Badge>
        {isUpcoming && <Badge variant="warning">Upcoming</Badge>}
        {isPast && <Badge variant="default">Past</Badge>}
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Live Session Details
        </h3>

        {meetingUrl && (
          <div className="mb-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Meeting URL:
            </p>
            <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline break-all"
            >
              {meetingUrl}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {scheduledAt && (
          <div className="mb-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Scheduled:
            </p>
            <p className="text-neutral-900 dark:text-white">
              {new Date(scheduledAt).toLocaleString()}
            </p>
          </div>
        )}

        {duration > 0 && (
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Duration:
            </p>
            <p className="text-neutral-900 dark:text-white">
              {Math.floor(duration / 60)} minutes
            </p>
          </div>
        )}

        {!meetingUrl && (
          <div className="mt-4 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
            <p className="text-sm text-warning-700 dark:text-warning-300">
              Meeting URL will be provided by the instructor
            </p>
          </div>
        )}
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
              <span className="font-medium">Attendance Marked</span>
            </div>
          ) : (
            <Button
              onClick={onComplete}
              disabled={isCompleting}
              className="w-full"
            >
              {isCompleting ? 'Marking Complete...' : 'Mark Attendance'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

