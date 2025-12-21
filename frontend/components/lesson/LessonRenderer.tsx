'use client';

import { LessonContent, AssignmentSubmissionData } from '@/store/slices/lessonSlice';
import { VideoLesson } from './VideoLesson';
import { MaterialLesson } from './MaterialLesson';
import { LiveSessionLesson } from './LiveSessionLesson';
import { AssignmentLesson } from './AssignmentLesson';
import { QuizLesson } from './QuizLesson';
import { ExamLesson } from './ExamLesson';
import { DiscussionLesson } from './DiscussionLesson';

interface LessonRendererProps {
  lesson: LessonContent;
  onComplete?: (submissionData?: AssignmentSubmissionData) => void;
  onProgressUpdate?: (watchTime: number) => void;
  currentWatchTime?: number;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

export function LessonRenderer({ 
  lesson, 
  onComplete,
  onProgressUpdate,
  currentWatchTime,
  isCompleted,
  isCompleting
}: LessonRendererProps) {
  if (!lesson) {
    return (
      <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <p className="text-neutral-600 dark:text-neutral-400">
          Lesson content not available
        </p>
      </div>
    );
  }

  const { type } = lesson;

  switch (type) {
    case 'VIDEO':
      return (
        <VideoLesson
          lesson={lesson}
          onComplete={onComplete}
          onProgressUpdate={onProgressUpdate}
          currentWatchTime={currentWatchTime}
          isCompleted={isCompleted}
          isCompleting={isCompleting}
        />
      );

    case 'MATERIAL':
      return (
        <MaterialLesson
          lesson={lesson}
          onComplete={onComplete}
          isCompleted={isCompleted}
          isCompleting={isCompleting}
        />
      );

    case 'LIVE_SESSION':
      return (
        <LiveSessionLesson
          lesson={lesson}
          onComplete={onComplete}
          isCompleted={isCompleted}
          isCompleting={isCompleting}
        />
      );

    case 'ASSIGNMENT':
      return (
        <AssignmentLesson
          lesson={lesson}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    case 'QUIZ':
      return (
        <QuizLesson
          lesson={lesson}
          onComplete={onComplete}
        />
      );

    case 'EXAM':
      return (
        <ExamLesson
          lesson={lesson}
          onComplete={onComplete}
        />
      );

    case 'DISCUSSION':
      return (
        <DiscussionLesson
          lesson={lesson}
          onComplete={onComplete}
          isCompleted={isCompleted}
          isCompleting={isCompleting}
        />
      );

    default:
      return (
        <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <p className="text-neutral-600 dark:text-neutral-400">
            Unknown lesson type: {type}
          </p>
        </div>
      );
  }
}

