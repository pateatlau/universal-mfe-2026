/**
 * @universal/shared-auth-store
 *
 * Zustand store for authentication state management.
 *
 * Features:
 * - Cross-platform auth state
 * - Firebase integration (via injected AuthService)
 * - Event bus synchronization
 * - RBAC helpers
 * - Token management
 */

import { create } from 'zustand';
import { getJSON, setJSON, removeItem, isStorageConfigured } from '@universal/shared-utils';
import type { AuthStore, AuthState, User, UserRole, AuthService } from './types';
import { AUTH_STORAGE_KEY, TOKEN_LIFETIME_MS, getAuthErrorMessage } from './constants';

// Auth service will be injected at runtime
let authService: AuthService | null = null;

// Event emitter will be injected at runtime
let emitAuthEvent: ((type: string, payload: Record<string, unknown>) => void) | null = null;

// Initialization state for idempotency
let initPromise: Promise<() => void> | null = null;
let currentUnsubscribe: (() => void) | null = null;

/**
 * Configure the auth service implementation.
 * Must be called once at app initialization.
 */
export function configureAuthService(service: AuthService): void {
  authService = service;
}

/**
 * Configure the event emitter for cross-MFE sync.
 * Must be called once at app initialization.
 */
export function configureAuthEventEmitter(
  emitter: (type: string, payload: Record<string, unknown>) => void
): void {
  emitAuthEvent = emitter;
}

/**
 * Get the configured auth service.
 */
function getAuthService(): AuthService {
  if (!authService) {
    throw new Error(
      '[shared-auth-store] Auth service not configured. ' +
        'Call configureAuthService() at app initialization.'
    );
  }
  return authService;
}

/**
 * Initial auth state
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isInitialized: false,
};

/**
 * Create the authentication store
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  // =========================================================================
  // Email/Password Authentication
  // =========================================================================

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const service = getAuthService();
      const user = await service.signInWithEmail(email, password);

      set({ user, isAuthenticated: true, isLoading: false });
      await persistUser(user);

      emitAuthEvent?.('USER_LOGGED_IN', {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        provider: user.provider,
      });
    } catch (error) {
      const message = getAuthErrorMessage((error as { code?: string }).code || '');
      set({ error: message, isLoading: false });
      emitAuthEvent?.('AUTH_ERROR', { code: (error as { code?: string }).code, message });
      throw error;
    }
  },

  signUpWithEmail: async (email: string, password: string, displayName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const service = getAuthService();
      const user = await service.signUpWithEmail(email, password, displayName);

      set({ user, isAuthenticated: true, isLoading: false });
      await persistUser(user);

      emitAuthEvent?.('USER_LOGGED_IN', {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        provider: user.provider,
      });
    } catch (error) {
      const message = getAuthErrorMessage((error as { code?: string }).code || '');
      set({ error: message, isLoading: false });
      emitAuthEvent?.('AUTH_ERROR', { code: (error as { code?: string }).code, message });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const service = getAuthService();
      await service.resetPassword(email);
      set({ isLoading: false });
    } catch (error) {
      const message = getAuthErrorMessage((error as { code?: string }).code || '');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // =========================================================================
  // Social Login
  // =========================================================================

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const service = getAuthService();
      const user = await service.signInWithGoogle();

      set({ user, isAuthenticated: true, isLoading: false });
      await persistUser(user);

      emitAuthEvent?.('USER_LOGGED_IN', {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        provider: user.provider,
      });
    } catch (error) {
      const errorCode = (error as { code?: string }).code || '';
      const errorMessage = (error as { message?: string }).message || '';
      const message = getAuthErrorMessage(errorCode);

      // Log detailed error for debugging OAuth issues
      console.error('[shared-auth-store] Google sign-in failed:', {
        code: errorCode,
        message: errorMessage,
        fullError: error,
      });

      set({ error: message, isLoading: false });
      emitAuthEvent?.('AUTH_ERROR', { code: errorCode, message });
      throw error;
    }
  },

  signInWithGitHub: async () => {
    set({ isLoading: true, error: null });
    try {
      const service = getAuthService();
      const user = await service.signInWithGitHub();

      set({ user, isAuthenticated: true, isLoading: false });
      await persistUser(user);

      emitAuthEvent?.('USER_LOGGED_IN', {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        provider: user.provider,
      });
    } catch (error) {
      const errorCode = (error as { code?: string }).code || '';
      const errorMessage = (error as { message?: string }).message || '';
      const message = getAuthErrorMessage(errorCode);

      // Log detailed error for debugging OAuth issues
      console.error('[shared-auth-store] GitHub sign-in failed:', {
        code: errorCode,
        message: errorMessage,
        fullError: error,
      });

      set({ error: message, isLoading: false });
      emitAuthEvent?.('AUTH_ERROR', { code: errorCode, message });
      throw error;
    }
  },

  // =========================================================================
  // Session Management
  // =========================================================================

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const service = getAuthService();
      await service.signOut();

      set({ user: null, isAuthenticated: false, isLoading: false });
      await clearPersistedUser();

      emitAuthEvent?.('USER_LOGGED_OUT', { reason: 'user_initiated' });
    } catch (error) {
      const message = getAuthErrorMessage((error as { code?: string }).code || '');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const service = getAuthService();
      const token = await service.refreshToken();

      if (token) {
        const { user } = get();
        if (user) {
          const updatedUser = {
            ...user,
            idToken: token,
            tokenExpiry: Date.now() + TOKEN_LIFETIME_MS,
          };
          set({ user: updatedUser });
          await persistUser(updatedUser);
        }
      }
    } catch (error) {
      console.warn('[shared-auth-store] Token refresh failed:', error);
      // Don't throw - silent refresh failure shouldn't break the app
    }
  },

  // =========================================================================
  // State Management
  // =========================================================================

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  clearError: () => set({ error: null }),

  // =========================================================================
  // RBAC Helpers
  // =========================================================================

  hasRole: (role: UserRole) => {
    const { user } = get();
    return user?.role === role;
  },

  hasAnyRole: (roles: UserRole[]) => {
    const { user } = get();
    return user ? roles.includes(user.role) : false;
  },

  // =========================================================================
  // Initialization
  // =========================================================================

  initializeAuth: async () => {
    // Return cached promise if initialization is already in progress or complete
    if (initPromise) {
      return initPromise.then(() => {
        // Return the current unsubscribe function (or no-op if none)
        return currentUnsubscribe || (() => {});
      });
    }

    // Create and cache the initialization promise
    initPromise = (async () => {
      // CRITICAL: Set up a failsafe timeout FIRST, before any async operations
      // This ensures we never get stuck on the loading screen even if something
      // throws synchronously or Firebase never responds (Android release build issue)
      const failsafeTimeout = setTimeout(() => {
        if (!get().isInitialized) {
          console.warn('[shared-auth-store] Auth initialization failsafe timeout triggered');
          set({ isLoading: false, isInitialized: true });
        }
      }, 10000); // 10 second absolute failsafe

      try {
        set({ isLoading: true });

        // Load persisted user for immediate UI feedback
        if (isStorageConfigured()) {
          try {
            const persistedUser = await getJSON<User>(AUTH_STORAGE_KEY);
            if (persistedUser) {
              set({ user: persistedUser, isAuthenticated: true });
            }
          } catch (error) {
            console.warn('[shared-auth-store] Failed to load persisted user:', error);
          }
        }

        // Track if we've received the first auth state callback
        let isFirstCallback = true;

        // Unsubscribe from previous listener if exists
        if (currentUnsubscribe) {
          currentUnsubscribe();
          currentUnsubscribe = null;
        }

        // Subscribe to auth state changes
        const service = getAuthService();
        const unsubscribe = service.onAuthStateChanged((user) => {
          // Clear the failsafe timeout since we got a response
          clearTimeout(failsafeTimeout);

          // Only set isInitialized on the first callback to avoid race conditions
          const shouldMarkInitialized = isFirstCallback;
          isFirstCallback = false;

          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              ...(shouldMarkInitialized && { isInitialized: true }),
            });
            // Handle persistence errors explicitly
            persistUser(user).catch((err) => {
              console.warn('[shared-auth-store] Failed to persist user in auth callback:', err);
            });
            emitAuthEvent?.('USER_LOGGED_IN', {
              userId: user.id,
              email: user.email,
              displayName: user.displayName,
              provider: user.provider,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              ...(shouldMarkInitialized && { isInitialized: true }),
            });
            // Handle persistence errors explicitly
            clearPersistedUser().catch((err) => {
              console.warn('[shared-auth-store] Failed to clear user in auth callback:', err);
            });
          }
        });

        // Store the unsubscribe handle
        currentUnsubscribe = unsubscribe;

        // If the auth service fires the callback synchronously, isInitialized
        // will already be set. If not, we set loading to false but wait for
        // the callback to set isInitialized.
        if (!get().isInitialized) {
          // Auth service hasn't fired yet - set a shorter timeout as a first pass
          // The failsafe timeout above will catch any remaining cases
          setTimeout(() => {
            if (!get().isInitialized) {
              console.warn('[shared-auth-store] Auth callback timeout - marking as initialized');
              set({ isLoading: false, isInitialized: true });
            }
          }, 5000); // 5 second timeout for auth service to respond
        }

        return unsubscribe;
      } catch (error) {
        // Clear the failsafe timeout since we're handling the error
        clearTimeout(failsafeTimeout);
        // Clear cached state on error so retry is possible
        initPromise = null;
        currentUnsubscribe = null;
        // CRITICAL: Set isInitialized to true even on error to prevent infinite loading
        // This allows the UI to show an error state or fallback instead of a spinner
        set({ isLoading: false, isInitialized: true, error: 'Failed to initialize authentication' });
        throw error;
      }
    })();

    return initPromise;
  },
}));

// =============================================================================
// Persistence Helpers
// =============================================================================

async function persistUser(user: User): Promise<void> {
  if (!isStorageConfigured()) return;
  try {
    // Don't persist sensitive token data or related metadata
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { idToken, tokenExpiry, ...safeUser } = user;
    await setJSON(AUTH_STORAGE_KEY, safeUser);
  } catch (error) {
    console.warn('[shared-auth-store] Failed to persist user:', error);
  }
}

async function clearPersistedUser(): Promise<void> {
  if (!isStorageConfigured()) return;
  try {
    await removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.warn('[shared-auth-store] Failed to clear persisted user:', error);
  }
}

// =============================================================================
// Selector Hooks
// =============================================================================

/**
 * Selector for just the user object
 */
export const useUser = () => useAuthStore((state) => state.user);

/**
 * Selector for authentication status
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

/**
 * Selector for loading status
 */
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);

/**
 * Selector for error message
 */
export const useAuthError = () => useAuthStore((state) => state.error);

/**
 * Selector for initialization status
 */
export const useIsAuthInitialized = () => useAuthStore((state) => state.isInitialized);
