/**
 * @universal/shared-auth-store
 * 
 * Unit tests for authentication store.
 */

import { useAuthStore } from './store';
import { UserRole } from './types';
import { mockLogin, mockSignup } from './authService';
import { setJSON, getJSON, storage } from '@universal/shared-utils';

// Mock the storage utilities
jest.mock('@universal/shared-utils', () => {
  const mockStorage: Record<string, string> = {};
  return {
    storage: {
      getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
      setItem: jest.fn((key: string, value: string) => {
        mockStorage[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete mockStorage[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
        return Promise.resolve();
      }),
      getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStorage))),
    },
    setJSON: jest.fn((key: string, value: any) => {
      mockStorage[key] = JSON.stringify(value);
      return Promise.resolve();
    }),
    getJSON: jest.fn((key: string) => {
      const value = mockStorage[key];
      return Promise.resolve(value ? JSON.parse(value) : null);
    }),
  };
});

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useAuthStore.getState();
    store.logout();
    store.clearSession();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const store = useAuthStore.getState();
      
      await store.login('admin@example.com', 'admin123');
      
      const state = useAuthStore.getState();
      expect(state.user).not.toBeNull();
      expect(state.user?.email).toBe('admin@example.com');
      expect(state.user?.role).toBe(UserRole.ADMIN);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state during login', async () => {
      const store = useAuthStore.getState();
      
      const loginPromise = store.login('customer@example.com', 'customer123');
      
      // Check loading state immediately
      const loadingState = useAuthStore.getState();
      expect(loadingState.isLoading).toBe(true);
      
      await loginPromise;
      
      // Check loading state after completion
      const finalState = useAuthStore.getState();
      expect(finalState.isLoading).toBe(false);
    });

    it('should handle login failure with invalid credentials', async () => {
      const store = useAuthStore.getState();
      
      await expect(store.login('invalid@example.com', 'wrongpassword')).rejects.toThrow();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeTruthy();
    });

    it('should persist user to storage after successful login', async () => {
      const store = useAuthStore.getState();
      
      await store.login('vendor@example.com', 'vendor123');
      
      expect(setJSON).toHaveBeenCalledWith('@universal/auth-state', expect.objectContaining({
        user: expect.objectContaining({
          email: 'vendor@example.com',
          role: UserRole.VENDOR,
        }),
      }));
    });

    it('should clear previous errors before login', async () => {
      const store = useAuthStore.getState();
      
      // Set an error first
      store.setError('Previous error');
      expect(useAuthStore.getState().error).toBe('Previous error');
      
      // Login should clear the error
      await store.login('customer@example.com', 'customer123');
      
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const store = useAuthStore.getState();
      
      // Login first
      await store.login('admin@example.com', 'admin123');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      
      // Logout
      store.logout();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear persisted storage on logout', async () => {
      const store = useAuthStore.getState();
      
      // Login first
      await store.login('customer@example.com', 'customer123');
      
      // Logout
      store.logout();
      
      // Wait for async storage removal
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(storage.removeItem).toHaveBeenCalledWith('@universal/auth-state');
    });
  });

  describe('Signup', () => {
    it('should signup successfully with new email', async () => {
      const store = useAuthStore.getState();
      
      await store.signup('newuser@example.com', 'password123');
      
      const state = useAuthStore.getState();
      expect(state.user).not.toBeNull();
      expect(state.user?.email).toBe('newuser@example.com');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set loading state during signup', async () => {
      const store = useAuthStore.getState();
      
      const signupPromise = store.signup('newuser2@example.com', 'password123');
      
      // Check loading state immediately
      const loadingState = useAuthStore.getState();
      expect(loadingState.isLoading).toBe(true);
      
      await signupPromise;
      
      // Check loading state after completion
      const finalState = useAuthStore.getState();
      expect(finalState.isLoading).toBe(false);
    });

    it('should handle signup failure with existing email', async () => {
      const store = useAuthStore.getState();
      
      // First signup should succeed
      await store.signup('existing@example.com', 'password123');
      
      // Second signup with same email should fail
      await expect(store.signup('existing@example.com', 'password123')).rejects.toThrow();
      
      const state = useAuthStore.getState();
      expect(state.error).toBeTruthy();
    });

    it('should persist user to storage after successful signup', async () => {
      const store = useAuthStore.getState();
      
      await store.signup('newuser3@example.com', 'password123');
      
      expect(setJSON).toHaveBeenCalledWith('@universal/auth-state', expect.objectContaining({
        user: expect.objectContaining({
          email: 'newuser3@example.com',
        }),
      }));
    });

    it('should assign role based on email pattern', async () => {
      const store = useAuthStore.getState();
      
      // Test admin role
      await store.signup('adminuser@example.com', 'password123');
      expect(useAuthStore.getState().user?.role).toBe(UserRole.ADMIN);
      
      store.logout();
      
      // Test vendor role
      await store.signup('vendoruser@example.com', 'password123');
      expect(useAuthStore.getState().user?.role).toBe(UserRole.VENDOR);
      
      store.logout();
      
      // Test default customer role
      await store.signup('regularuser@example.com', 'password123');
      expect(useAuthStore.getState().user?.role).toBe(UserRole.CUSTOMER);
    });
  });

  describe('RBAC Helpers', () => {
    beforeEach(async () => {
      const store = useAuthStore.getState();
      await store.login('admin@example.com', 'admin123');
    });

    it('hasRole should return true for user with matching role', () => {
      const store = useAuthStore.getState();
      expect(store.hasRole(UserRole.ADMIN)).toBe(true);
    });

    it('hasRole should return false for user without matching role', () => {
      const store = useAuthStore.getState();
      expect(store.hasRole(UserRole.CUSTOMER)).toBe(false);
    });

    it('hasRole should return false when user is null', () => {
      const store = useAuthStore.getState();
      store.logout();
      expect(store.hasRole(UserRole.ADMIN)).toBe(false);
    });

    it('hasAnyRole should return true if user has one of the roles', () => {
      const store = useAuthStore.getState();
      expect(store.hasAnyRole([UserRole.ADMIN, UserRole.VENDOR])).toBe(true);
    });

    it('hasAnyRole should return false if user has none of the roles', () => {
      const store = useAuthStore.getState();
      expect(store.hasAnyRole([UserRole.CUSTOMER, UserRole.VENDOR])).toBe(false);
    });

    it('hasAnyRole should return false when user is null', () => {
      const store = useAuthStore.getState();
      store.logout();
      expect(store.hasAnyRole([UserRole.ADMIN, UserRole.VENDOR])).toBe(false);
    });
  });

  describe('Session Persistence', () => {
    it('should load session from storage', async () => {
      // Set up mock storage with persisted user
      const mockUser = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
      };
      (getJSON as jest.Mock).mockResolvedValueOnce({ user: mockUser });
      
      const store = useAuthStore.getState();
      await store.loadSession();
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should handle empty session in storage', async () => {
      (getJSON as jest.Mock).mockResolvedValueOnce(null);
      
      const store = useAuthStore.getState();
      await store.loadSession();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should clear session completely', async () => {
      const store = useAuthStore.getState();
      
      // Login first
      await store.login('customer@example.com', 'customer123');
      
      // Clear session
      await store.clearSession();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(storage.removeItem).toHaveBeenCalledWith('@universal/auth-state');
    });
  });

  describe('Error Handling', () => {
    it('should set error state on login failure', async () => {
      const store = useAuthStore.getState();
      
      try {
        await store.login('invalid@example.com', 'wrongpassword');
      } catch (error) {
        // Expected to throw
      }
      
      const state = useAuthStore.getState();
      expect(state.error).toBeTruthy();
      expect(state.isLoading).toBe(false);
    });

    it('should clear error when clearError is called', () => {
      const store = useAuthStore.getState();
      
      store.setError('Test error');
      expect(useAuthStore.getState().error).toBe('Test error');
      
      store.clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should set loading state correctly', () => {
      const store = useAuthStore.getState();
      
      store.setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
      
      store.setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should update state correctly on login', async () => {
      const store = useAuthStore.getState();
      const initialState = useAuthStore.getState();
      
      await store.login('vendor@example.com', 'vendor123');
      
      const finalState = useAuthStore.getState();
      expect(finalState.user).not.toEqual(initialState.user);
      expect(finalState.isAuthenticated).not.toBe(initialState.isAuthenticated);
    });

    it('should maintain state consistency across multiple operations', async () => {
      const store = useAuthStore.getState();
      
      // Login
      await store.login('customer@example.com', 'customer123');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      
      // Logout
      store.logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      
      // Login again
      await store.login('admin@example.com', 'admin123');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.role).toBe(UserRole.ADMIN);
    });
  });
});

