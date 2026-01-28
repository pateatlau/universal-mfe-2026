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
import { AUTH_STORAGE_KEY, getAuthErrorMessage } from './constants';

// Auth service will be injected at runtime
let authService: AuthService | null = null;

// Event emitter will be injected at runtime
let emitAuthEvent: ((type: string, payload: Record<string, unknown>) => void) | null = null;

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
        provider: 'google',
      });
    } catch (error) {
      const message = getAuthErrorMessage((error as { code?: string }).code || '');
      set({ error: message, isLoading: false });
      emitAuthEvent?.('AUTH_ERROR', { code: (error as { code?: string }).code, message });
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
        provider: 'github',
      });
    } catch (error) {
      const message = getAuthErrorMessage((error as { code?: string }).code || '');
      set({ error: message, isLoading: false });
      emitAuthEvent?.('AUTH_ERROR', { code: (error as { code?: string }).code, message });
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
          const updatedUser = { ...user, idToken: token, tokenExpiry: Date.now() + 3600000 };
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
    if (get().isInitialized) {
      return () => {}; // Already initialized
    }

    set({ isLoading: true });

    // Load persisted user
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

    // Subscribe to auth state changes
    const service = getAuthService();
    const unsubscribe = service.onAuthStateChanged((user) => {
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
        persistUser(user);
        emitAuthEvent?.('USER_LOGGED_IN', {
          userId: user.id,
          email: user.email,
          displayName: user.displayName,
          provider: user.provider,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        clearPersistedUser();
      }
    });

    set({ isLoading: false, isInitialized: true });

    return unsubscribe;
  },
}));

// =============================================================================
// Persistence Helpers
// =============================================================================

async function persistUser(user: User): Promise<void> {
  if (!isStorageConfigured()) return;
  try {
    // Don't persist sensitive token data
    const { idToken, ...safeUser } = user;
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
