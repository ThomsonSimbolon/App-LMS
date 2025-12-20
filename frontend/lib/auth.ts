/**
 * Utility functions untuk authentication dan authorization
 */

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'ASSESSOR';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  role: {
    id: number;
    name: Role;
  };
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Check if user has specific role(s)
 */
export function hasRole(user: User | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.includes(user.role.name);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  const user = getCurrentUser();
  return !!(token && user);
}

/**
 * Check if user is admin (ADMIN or SUPER_ADMIN)
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, ['ADMIN', 'SUPER_ADMIN']);
}

/**
 * Check if user is instructor
 */
export function isInstructor(user: User | null): boolean {
  return hasRole(user, ['INSTRUCTOR']);
}

/**
 * Check if user is student
 */
export function isStudent(user: User | null): boolean {
  return hasRole(user, ['STUDENT']);
}

/**
 * Get user's role name
 */
export function getUserRole(user: User | null): Role | null {
  return user?.role.name || null;
}

/**
 * Get user's display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return `${user.firstName} ${user.lastName || ''}`.trim() || user.email;
}

/**
 * Get user's initials for avatar
 */
export function getUserInitials(user: User | null): string {
  if (!user) return 'GU';
  const first = user.firstName?.[0]?.toUpperCase() || '';
  const last = user.lastName?.[0]?.toUpperCase() || '';
  return (first + last) || user.email[0]?.toUpperCase() || 'U';
}

