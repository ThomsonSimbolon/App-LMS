import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getFileUrl } from "@/lib/api";

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  instructor?: {
    firstName: string;
    lastName?: string | null;
  };
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  type: "FREE" | "PAID" | "PREMIUM";
  price?: number;
  enrollmentCount?: number;
  rating?: number;
  isEnrolled?: boolean;
  version?: string;
  basePath?: string;
}

const levelColors = {
  BEGINNER: "bg-success/10 dark:bg-success/20 text-success dark:text-success",
  INTERMEDIATE:
    "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400",
  ADVANCED: "bg-error/10 dark:bg-error/20 text-error dark:text-error",
};

const typeColors = {
  FREE: "bg-success/10 dark:bg-success/20 text-success dark:text-success",
  PAID: "bg-warning/10 dark:bg-warning/20 text-warning dark:text-warning",
  PREMIUM:
    "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400",
};

export function CourseCard({
  id,
  title,
  description,
  thumbnail,
  instructor,
  level,
  type,
  price,
  enrollmentCount = 0,
  rating,
  isEnrolled = false,
  version,
  basePath = "/courses",
}: CourseCardProps) {
  return (
    <Link href={`${basePath}/${id}`}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-soft rounded-xl overflow-hidden h-full flex flex-col hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-200 group">
        {/* Thumbnail */}
        <div className="relative h-48 bg-slate-200 dark:bg-slate-800">
          {thumbnail && getFileUrl(thumbnail) ? (
            <Image
              src={getFileUrl(thumbnail)}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-600">
              <span className="text-white text-5xl font-bold">
                {title.charAt(0)}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`badge ${typeColors[type]}`}>
              {type === "FREE"
                ? "Free"
                : type === "PAID"
                ? `$${price}`
                : "Premium"}
            </span>
            {isEnrolled && (
              <span className="badge bg-success text-white">Enrolled</span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            <span className={`badge ${levelColors[level]}`}>
              {level.charAt(0) + level.slice(1).toLowerCase()}
            </span>
            {version && (
              <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                v{version}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              {instructor ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                    {instructor.firstName.charAt(0)}
                    {instructor.lastName?.charAt(0) || ""}
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {instructor.firstName} {instructor.lastName || ""}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                    ?
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Unknown Instructor
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              {rating && (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-warning"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {rating.toFixed(1)}
                </span>
              )}
              <span>{enrollmentCount} students</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
