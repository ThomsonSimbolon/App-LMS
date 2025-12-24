'use client';

import React from 'react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="btn btn-ghost p-2 w-10 h-10 rounded-full" disabled>
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "btn btn-ghost p-2 w-10 h-10 rounded-full",
        "transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "focus-visible:ring-primary-500"
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        // Sun icon for light mode - smooth transition
        <svg 
          className="w-5 h-5 text-neutral-700 dark:text-neutral-200 transition-all duration-200" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon for dark mode - smooth transition
        <svg 
          className="w-5 h-5 text-neutral-700 dark:text-neutral-200 transition-all duration-200" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
