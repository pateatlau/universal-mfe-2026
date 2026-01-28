/**
 * @universal/shared-auth-store
 *
 * Cross-platform authentication store for the Universal MFE Platform.
 *
 * This package provides:
 * - Zustand-based auth state management
 * - Firebase Auth integration (via injected service)
 * - Role-based access control (RBAC)
 * - Cross-MFE synchronization via event bus
 * - Session persistence
 */

// =============================================================================
// Types
// =============================================================================

export {
  UserRole,
  type User,
  type AuthState,
  type AuthActions,
  type AuthStore,
  type AuthService,
  type AuthProvider,
  type EmailCredentials,
  type SignUpData,
} from './types';

// =============================================================================
// Store
// =============================================================================

export {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useIsAuthLoading,
  useAuthError,
  useIsAuthInitialized,
  configureAuthService,
  configureAuthEventEmitter,
} from './store';

// =============================================================================
// Constants
// =============================================================================

export {
  AUTH_STORAGE_KEY,
  AUTH_TOKEN_KEY,
  TOKEN_REFRESH_THRESHOLD_MS,
  TOKEN_LIFETIME_MS,
  AUTH_EVENTS,
  AUTH_ERROR_CODES,
  AUTH_ERROR_MESSAGES,
  getAuthErrorMessage,
} from './constants';

// =============================================================================
// RBAC Helpers
// =============================================================================

export { hasRole, hasAnyRole, hasAllRoles } from './rbac';
