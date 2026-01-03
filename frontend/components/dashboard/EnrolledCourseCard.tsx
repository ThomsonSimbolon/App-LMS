import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { getFileUrl } from "@/lib/api";

interface EnrolledCourseCardProps {
  courseId: number;
  title: string;
  thumbnail?: string;
  progress: number;
  instructor?: {
    firstName: string;
    lastName?: string | null;
  };
  lastAccessedAt?: string;
}

export function EnrolledCourseCard({
  courseId,
  title,
  thumbnail,
  progress,
  instructor,
  lastAccessedAt,
}: EnrolledCourseCardProps) {
  const formatDate = (dateString?: string) => {
    // ... function content unchanged
    if (!dateString) return "Not started";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Link href={`/learn/${courseId}`}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-soft rounded-xl overflow-hidden hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-200 group">
        {/* Thumbnail */}
        <div className="relative h-40 bg-slate-200 dark:bg-slate-800">
          {thumbnail ? (
            <Image
              src={getFileUrl(thumbnail)}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-600">
              <span className="text-white text-4xl font-bold">
                {title.charAt(0)}
              </span>
            </div>
          )}

          {/* Progress Badge */}
          {progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
              <div className="flex items-center justify-between text-xs text-white mb-1">
                <span>{progress}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-accent-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h3>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {instructor ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium">
                    {instructor.firstName.charAt(0)}
                    {instructor.lastName?.charAt(0) || ""}
                  </div>
                  <span className="text-slate-600 dark:text-slate-400">
                    {instructor.firstName} {instructor.lastName || ""}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium">
                    ?
                  </div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Unknown Instructor
                  </span>
                </>
              )}
            </div>

            <span className="text-slate-500 dark:text-slate-500 text-xs">
              {formatDate(lastAccessedAt)}
            </span>
          </div>

          {progress === 100 && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center text-sm font-medium text-accent-600 dark:text-accent-400">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Completed
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
