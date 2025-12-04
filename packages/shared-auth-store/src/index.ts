/**
 * @universal/shared-auth-store
 * 
 * Authentication state management store using Zustand.
 * 
 * This package provides:
 * - User authentication state
 * - Login/logout/signup actions
 * - Role-based access control (RBAC)
 * - Session persistence
 * 
 * Pure TypeScript - no React Native dependencies
 */

// ============================================================================
// Store Hook
// ============================================================================

/**
 * Main authentication store hook
 * 
 * @example
 * ```tsx
 * import { useAuthStore } from '@universal/shared-auth-store';
 * 
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuthStore();
 *   // ...
 * }
 * ```
 */
export { useAuthStore } from './store';

// ============================================================================
// Types
// ============================================================================

/**
 * User interface with role-based access control
 */
export type { User, AuthState } from './types';

/**
 * User roles enum (ADMIN, CUSTOMER, VENDOR)
 */
export { UserRole } from './types';

// ============================================================================
// RBAC Helpers
// ============================================================================

/**
 * Helper function to check if current user has a specific role
 * 
 * @param role - The role to check
 * @returns true if user has the role, false otherwise
 * 
 * @example
 * ```tsx
 * import { useAuthStore, UserRole, hasRole } from '@universal/shared-auth-store';
 * 
 * function AdminPanel() {
 *   const user = useAuthStore(state => state.user);
 *   if (!hasRole(user, UserRole.ADMIN)) {
 *     return <div>Access denied</div>;
 *   }
 *   return <div>Admin content</div>;
 * }
 * ```
 */
export function hasRole(user: { role: import('./types').UserRole } | null, role: import('./types').UserRole): boolean {
  return user?.role === role;
}

/**
 * Helper function to check if current user has any of the specified roles
 * 
 * @param user - The user object (can be null)
 * @param roles - Array of roles to check
 * @returns true if user has any of the roles, false otherwise
 * 
 * @example
 * ```tsx
 * import { useAuthStore, UserRole, hasAnyRole } from '@universal/shared-auth-store';
 * 
 * function VendorOrAdminPanel() {
 *   const user = useAuthStore(state => state.user);
 *   if (!hasAnyRole(user, [UserRole.VENDOR, UserRole.ADMIN])) {
 *     return <div>Access denied</div>;
 *   }
 *   return <div>Vendor/Admin content</div>;
 * }
 * ```
 */
export function hasAnyRole(
  user: { role: import('./types').UserRole } | null,
  roles: import('./types').UserRole[]
): boolean {
  if (!user) {
    return false;
  }
  return roles.includes(user.role);
}

// ============================================================================
// Mock Authentication Service (for testing/development)
// ============================================================================

/**
 * Mock authentication service functions
 * 
 * These are exported for testing and development purposes.
 * In production, these would be replaced with actual API calls.
 * 
 * @example
 * ```tsx
 * import { mockLogin, mockSignup } from '@universal/shared-auth-store';
 * 
 * // In tests
 * await mockLogin('admin@example.com', 'admin123');
 * ```
 */
export { mockLogin, mockSignup, mockLogout } from './authService';

