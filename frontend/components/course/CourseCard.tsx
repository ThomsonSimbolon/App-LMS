import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: {
    firstName: string;
    lastName: string;
  };
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  type: 'FREE' | 'PAID' | 'PREMIUM';
  price?: number;
  enrollmentCount?: number;
  rating?: number;
  isEnrolled?: boolean;
}

const levelColors = {
  BEGINNER: 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300',
  INTERMEDIATE: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
  ADVANCED: 'bg-error-light/20 text-error-dark dark:text-error-light',
};

const typeColors = {
  FREE: 'bg-success-light/20 text-success-dark dark:text-success-light',
  PAID: 'bg-warning-light/20 text-warning-dark dark:text-warning-light',
  PREMIUM: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
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
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`}>
      <div className="card card-hover overflow-hidden h-full flex flex-col group">
        {/* Thumbnail */}
        <div className="relative h-48 bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-accent-400">
              <span className="text-white text-5xl font-bold">{title.charAt(0)}</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`badge ${typeColors[type]}`}>
              {type === 'FREE' ? 'Free' : type === 'PAID' ? `$${price}` : 'Premium'}
            </span>
            {isEnrolled && (
              <span className="badge bg-accent-500 text-white">
                Enrolled
              </span>
            )}
          </div>
          
          <div className="absolute top-3 right-3">
            <span className={`badge ${levelColors[level]}`}>
              {level.charAt(0) + level.slice(1).toLowerCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
          
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2 flex-1">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-medium">
                {instructor.firstName.charAt(0)}{instructor.lastName.charAt(0)}
              </div>
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {instructor.firstName} {instructor.lastName}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
              {rating && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
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
