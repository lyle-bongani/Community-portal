import { User } from '@/lib/types';

/**
 * Utility functions to check user type and permissions
 */

/**
 * Check if user is an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.isAdmin === true;
}

/**
 * Check if user is a regular user (not admin)
 */
export function isRegularUser(user: User | null | undefined): boolean {
  return user !== null && user !== undefined && user.isAdmin !== true;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user: User | null | undefined): boolean {
  return user !== null && user !== undefined;
}

/**
 * Get user type as string
 */
export function getUserType(user: User | null | undefined): 'admin' | 'user' | 'guest' {
  if (!user) return 'guest';
  if (user.isAdmin) return 'admin';
  return 'user';
}

/**
 * Check if user has permission to access admin routes
 */
export function canAccessAdmin(user: User | null | undefined): boolean {
  return isAdmin(user);
}
