/**
 * @universal/shared-auth-store
 * 
 * Zustand store for authentication state management.
 * 
 * Features:
 * - User authentication state
 * - Login/logout/signup actions
 * - Role-based access control (RBAC) helpers
 * - Session persistence using cross-platform storage
 */

import { create } from 'zustand';
import { setJSON, getJSON, storage } from '@universal/shared-utils';
import { UserRole, User, AuthState } from './types';
import { mockLogin, mockSignup } from './authService';

/**
 * Storage key for persisting auth state
 */
const AUTH_STORAGE_KEY = '@universal/auth-state';

/**
 * Extended AuthState with actions
 */
interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string) => Promise<void>;
  // RBAC helpers
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  // Internal actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  // Session persistence
  loadSession: () => Promise<void>;
  clearSession: () => Promise<void>;
}

/**
 * Load persisted auth state from storage
 */
async function loadPersistedState(): Promise<Partial<AuthState> | null> {
  try {
    const persisted = await getJSON<{ user: User | null }>(AUTH_STORAGE_KEY);
    return persisted || null;
  } catch (error) {
    console.error('Failed to load persisted auth state:', error);
    return null;
  }
}

/**
 * Persist auth state to storage
 */
async function persistState(user: User | null): Promise<void> {
  try {
    if (user) {
      await setJSON(AUTH_STORAGE_KEY, { user });
    } else {
      await storage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to persist auth state:', error);
  }
}

/**
 * Create the authentication store
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Set loading state
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  // Set error state
  setError: (error: string | null) => {
    set({ error });
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Login action
  login: async (email: string, password: string) => {
    const state = get();
    
    // Clear any previous errors
    state.clearError();
    state.setLoading(true);

    try {
      // Call mock authentication service
      const user = await mockLogin(email, password);

      // Update state
      set({
        user: user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Persist to storage
      await persistState(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // Logout action
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
    // Clear persisted state
    persistState(null).catch((error) => {
      console.error('Failed to clear persisted auth state:', error);
    });
  },

  // Signup action
  signup: async (email: string, password: string) => {
    const state = get();
    
    // Clear any previous errors
    state.clearError();
    state.setLoading(true);

    try {
      // Call mock signup service
      const user = await mockSignup(email, password);

      // Update state
      set({
        user: user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Persist to storage
      await persistState(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // RBAC: Check if user has a specific role
  hasRole: (role: UserRole): boolean => {
    const state = get();
    return state.user?.role === role;
  },

  // RBAC: Check if user has any of the specified roles
  hasAnyRole: (roles: UserRole[]): boolean => {
    const state = get();
    if (!state.user) {
      return false;
    }
    return roles.includes(state.user.role);
  },

  // Load session from storage
  loadSession: async () => {
    const state = get();
    state.setLoading(true);

    try {
      const persisted = await loadPersistedState();
      
      if (persisted?.user) {
        set({
          user: persisted.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      set({
        isLoading: false,
      });
    }
  },

  // Clear session (logout + clear storage)
  clearSession: async () => {
    const state = get();
    state.logout();
    await storage.removeItem(AUTH_STORAGE_KEY);
  },
}));

