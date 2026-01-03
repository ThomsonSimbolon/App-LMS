"use client";

import { useState, useMemo } from "react";
import { VideoPlayer } from "../course/VideoPlayer";
import {
  LessonContent,
  VideoLessonContent,
  LessonContentData,
} from "@/store/slices/lessonSlice";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { CheckCircle } from "lucide-react";

interface VideoLessonProps {
  lesson: LessonContent;
  onComplete?: () => void;
  onProgressUpdate?: (watchTime: number) => void;
  currentWatchTime?: number;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

export function VideoLesson({
  lesson,
  onComplete,
  onProgressUpdate,
  currentWatchTime = 0,
  isCompleted = false,
  isCompleting = false,
}: VideoLessonProps) {
  const [watchTime, setWatchTime] = useState(currentWatchTime);

  // Type guard untuk memastikan content adalah VideoLessonContent
  const isVideoContent = (
    content: LessonContentData
  ): content is VideoLessonContent => {
    return "videoUrl" in content;
  };

  const { content } = lesson;

  // Extract properti dengan type safety dan nilai default
  const videoContent = isVideoContent(content) ? content : null;
  const videoUrl: string = videoContent?.videoUrl || "";
  const contentDuration: number | undefined = videoContent?.duration;
  const contentMinWatchPercentage: number | undefined =
    videoContent?.minWatchPercentage;
  const duration: number = lesson.duration || contentDuration || 0;
  const minWatchPercentage: number = contentMinWatchPercentage || 80;

  // Calculate watch percentage and completion status using useMemo to avoid setState in effect
  // Hooks harus dipanggil sebelum early return
  const { watchPercentage, canComplete } = useMemo(() => {
    if (duration > 0 && watchTime > 0) {
      const percentage = (watchTime / duration) * 100;
      return {
        watchPercentage: Math.round(percentage),
        canComplete: percentage >= minWatchPercentage,
      };
    }
    return { watchPercentage: 0, canComplete: false };
  }, [watchTime, duration, minWatchPercentage]);

  // Early return setelah semua hooks dipanggil
  if (!isVideoContent(content)) {
    return (
      <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">
          Invalid video lesson content
        </p>
      </div>
    );
  }

  const handleProgress = (progress: number) => {
    if (duration > 0) {
      const currentTime = (progress / 100) * duration;
      const newWatchTime = Math.floor(currentTime);
      setWatchTime(newWatchTime);
      if (onProgressUpdate) {
        onProgressUpdate(newWatchTime);
      }
    }
  };

  const handleEnded = () => {
    if (duration > 0) {
      setWatchTime(duration);
      if (onProgressUpdate) {
        onProgressUpdate(duration);
      }
    }
  };

  if (!videoUrl) {
    return (
      <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">
          Video URL not available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="primary">Video Lesson</Badge>
        {duration > 0 && (
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Duration: {Math.floor(duration / 60)}m {duration % 60}s
          </span>
        )}
      </div>

      <VideoPlayer
        url={videoUrl}
        onProgress={handleProgress}
        onEnded={handleEnded}
      />

      {duration > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Watch Progress
            </span>
            <span className="font-medium text-slate-900 dark:text-white">
              {watchPercentage}% / {minWatchPercentage}% required
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                canComplete ? "bg-success-600" : "bg-primary-600"
              }`}
              style={{ width: `${Math.min(watchPercentage, 100)}%` }}
            />
          </div>
          {!canComplete && (
            <p className="text-sm text-warning-600 dark:text-warning-400">
              Watch at least {minWatchPercentage}% to complete this lesson
            </p>
          )}
        </div>
      )}

      {lesson.description && (
        <div className="mt-4 prose dark:prose-invert max-w-none">
          <p className="text-slate-700 dark:text-slate-300">
            {lesson.description}
          </p>
        </div>
      )}

      {onComplete && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-success-600 dark:text-success-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Lesson Completed</span>
            </div>
          ) : (
            <Button
              onClick={onComplete}
              disabled={!canComplete || isCompleting}
              className="w-full"
            >
              {isCompleting
                ? "Marking Complete..."
                : canComplete
                ? "Mark as Complete"
                : `Watch ${minWatchPercentage}% to Complete`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
