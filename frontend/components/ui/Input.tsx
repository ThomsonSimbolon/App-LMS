import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'input',
            error && 'border-error-DEFAULT focus:ring-error-DEFAULT',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-error-DEFAULT">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
