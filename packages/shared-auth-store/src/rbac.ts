/**
 * @universal/shared-auth-store
 *
 * Role-Based Access Control (RBAC) helper functions.
 *
 * These are standalone functions that can be used outside of React components.
 */

import type { User, UserRole } from './types';

/**
 * Check if a user has a specific role.
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * Check if a user has any of the specified roles.
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if a user has all of the specified roles.
 * (Useful if you implement multi-role systems in the future)
 */
export function hasAllRoles(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  // Currently, users have a single role, so this only works for single-role arrays
  return roles.length === 1 && roles.includes(user.role);
}
