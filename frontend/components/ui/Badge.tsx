import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
      primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
      success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    };

    return (
      <span
        ref={ref}
        className={cn('badge', variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
