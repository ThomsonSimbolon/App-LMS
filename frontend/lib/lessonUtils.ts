/**
 * Lesson Type Utilities
 * Helper functions for lesson types
 */

export type LessonType = 
  | 'VIDEO' 
  | 'MATERIAL' 
  | 'LIVE_SESSION' 
  | 'ASSIGNMENT' 
  | 'QUIZ' 
  | 'EXAM' 
  | 'DISCUSSION';

/**
 * Get icon emoji for lesson type
 */
export function getLessonIcon(type: string): string {
  switch (type) {
    case 'VIDEO': return '▶️';
    case 'MATERIAL': return '📄';
    case 'LIVE_SESSION': return '🎥';
    case 'ASSIGNMENT': return '📝';
    case 'QUIZ': return '❓';
    case 'EXAM': return '📋';
    case 'DISCUSSION': return '💬';
    // Legacy types (for backward compatibility)
    case 'PDF': return '📄';
    case 'TEXT': return '📝';
    default: return '📌';
  }
}

/**
 * Get lesson type label
 */
export function getLessonTypeLabel(type: string): string {
  switch (type) {
    case 'VIDEO': return 'Video';
    case 'MATERIAL': return 'Material';
    case 'LIVE_SESSION': return 'Live Session';
    case 'ASSIGNMENT': return 'Assignment';
    case 'QUIZ': return 'Quiz';
    case 'EXAM': return 'Exam';
    case 'DISCUSSION': return 'Discussion';
    // Legacy types
    case 'PDF': return 'PDF';
    case 'TEXT': return 'Text';
    default: return type;
  }
}

/**
 * Format duration in seconds to human readable format
 */
export function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  } else if (mins > 0) {
    return `${mins}m`;
  } else {
    return `${secs}s`;
  }
}

