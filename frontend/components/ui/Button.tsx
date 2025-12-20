import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'btn';
    
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm',
      secondary: 'bg-accent-600 hover:bg-accent-700 text-white focus:ring-accent-500 shadow-sm',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 focus:ring-primary-500',
      ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:ring-neutral-500',
      danger: 'bg-error-DEFAULT hover:bg-error-dark text-white focus:ring-error-DEFAULT shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && 'opacity-70 cursor-wait',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="animate-spin">⏳</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
