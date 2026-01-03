'use client';

import { getLessonIcon, formatDuration } from '@/lib/lessonUtils';

interface Lesson {
  id: number;
  title: string;
  type: string;
  duration?: number;
  isCompleted?: boolean;
  isLocked?: boolean;
}

interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface LessonListProps {
  sections: Section[];
  currentLessonId?: number;
  onLessonClick: (lessonId: number) => void;
}

export function LessonList({ sections, currentLessonId, onLessonClick }: LessonListProps) {

  return (
    <div className="space-y-4">
      {sections.map((section, sectionIdx) => (
        <div key={section.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {/* Section Header */}
          <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Section {sectionIdx + 1}: {section.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {section.lessons.length} lessons
            </p>
          </div>

          {/* Lessons */}
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {section.lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => !lesson.isLocked && onLessonClick(lesson.id)}
                disabled={lesson.isLocked}
                className={`w-full text-left p-4 transition-colors ${
                  lesson.id === currentLessonId
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : lesson.isLocked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <span className="text-xl">{getLessonIcon(lesson.type)}</span>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${
                      lesson.id === currentLessonId
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {lesson.title}
                    </h4>
                    {lesson.duration && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDuration(lesson.duration)}
                      </p>
                    )}
                  </div>

                  {/* Status Icons */}
                  <div className="flex items-center gap-2">
                    {lesson.isCompleted && (
                      <span className="text-accent-600 dark:text-accent-400">
                        ✓
                      </span>
                    )}
                    {lesson.isLocked && (
                      <span className="text-slate-400">
                        🔒
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
