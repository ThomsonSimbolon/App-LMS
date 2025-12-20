'use client';

import { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface CourseFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  categoryId?: number;
  level?: string;
  type?: string;
  sort: string;
}

const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const types = ['FREE', 'PAID', 'PREMIUM'];
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'title', label: 'Title (A-Z)' },
];

export function CourseFilters({ onFilterChange }: CourseFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sort: 'newest',
  });

  const handleChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = { search: '', sort: 'newest' };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search courses..."
            className="input pl-9"
          />
        </div>
      </div>

      {/* Level Filter */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Level
        </label>
        <select
          value={filters.level || ''}
          onChange={(e) => handleChange('level', e.target.value)}
          className="input"
        >
          <option value="">All Levels</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level.charAt(0) + level.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Type
        </label>
        <select
          value={filters.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          className="input"
        >
          <option value="">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Sort By
        </label>
        <select
          value={filters.sort}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="input"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full btn bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white px-4 py-2 text-sm flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Filters
      </button>
    </div>
  );
}
