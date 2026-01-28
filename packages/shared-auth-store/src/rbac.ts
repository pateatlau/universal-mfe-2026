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
 * Check if a user has the specified role (single-role system).
 *
 * NOTE: This function is named hasAllRoles for forward compatibility with
 * multi-role systems, but currently users have only one role. When called
 * with multiple roles, it returns true only if the array contains exactly
 * the user's single role (i.e., all "required" roles are satisfied by
 * having that one role).
 *
 * When multi-role support is added, update the User type to have roles: UserRole[]
 * and change this to: return roles.every(role => user.roles.includes(role));
 */
export function hasAllRoles(user: User | null, roles: UserRole[]): boolean {
  if (!user) return false;
  if (roles.length === 0) return true;
  // Single-role system: user must have the one role, and only one role is required
  return roles.length === 1 && roles[0] === user.role;
}
