import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    // Nuxt UI style semantic badge variants - using solid colors for better contrast
    const variants = {
      default: "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200",
      primary: "bg-primary-600 text-white dark:bg-primary-500",
      success: "bg-success text-white dark:bg-success-500",
      warning: "bg-warning text-white dark:bg-warning",
      error: "bg-error text-white dark:bg-error-500",
      info: "bg-info text-white dark:bg-info-500",
    };

    return (
      <span
        ref={ref}
        className={cn("badge", variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
