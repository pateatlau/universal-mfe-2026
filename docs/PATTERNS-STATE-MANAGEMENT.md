# State Management Patterns

This document describes the state management architecture and patterns used in the Universal MFE Platform.

## Overview

The platform uses a layered state management approach:

| Layer | Technology | Scope | Persistence | Purpose |
|-------|-----------|-------|-------------|---------|
| **Auth State** | Zustand | All MFEs | localStorage/AsyncStorage | User authentication, RBAC |
| **Local MFE State** | Zustand | Single MFE | Optional | UI state, preferences |
| **Inter-MFE Communication** | Event Bus | All MFEs | None (real-time) | Navigation, theme/locale sync |
| **Cross-Platform Storage** | Abstraction layer | All platforms | Platform-specific | Preferences, sessions |

## Zustand Store Pattern

### Shared Auth Store

The auth store (`@universal/shared-auth-store`) demonstrates the pattern for shared state across MFEs:

```typescript
// packages/shared-auth-store/src/store.ts
import { create } from 'zustand';
import { storage, setJSON, getJSON } from '@universal/shared-utils';

const AUTH_STORAGE_KEY = '@universal/auth-state';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  clearSession: () => Promise<void>;

  // RBAC helpers
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    const state = get();
    state.clearError();
    set({ isLoading: true });

    try {
      const user = await authService.login(email, password);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      await persistState(user);
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    set({
      user: null,
      isAuthenticated: false,
    });
    await storage.removeItem(AUTH_STORAGE_KEY);
  },

  hasRole: (role) => get().user?.roles.includes(role) ?? false,
  hasAnyRole: (roles) => roles.some((role) => get().hasRole(role)),
}));
```

### Local MFE Store

Each MFE can have its own isolated store for local state:

```typescript
// packages/web-remote-hello/src/store/localStore.ts
import { create } from 'zustand';

interface HelloLocalStore {
  localPressCount: number;
  lastPressedAt: Date | null;
  preferences: {
    showAnimations: boolean;
    customGreeting: string | null;
  };

  // Actions
  incrementPressCount: () => void;
  resetPressCount: () => void;
  toggleAnimations: () => void;
  setCustomGreeting: (greeting: string | null) => void;
  reset: () => void;
}

export const useHelloLocalStore = create<HelloLocalStore>((set) => ({
  localPressCount: 0,
  lastPressedAt: null,
  preferences: {
    showAnimations: true,
    customGreeting: null,
  },

  incrementPressCount: () =>
    set((state) => ({
      localPressCount: state.localPressCount + 1,
      lastPressedAt: new Date(),
    })),

  resetPressCount: () =>
    set({ localPressCount: 0, lastPressedAt: null }),

  toggleAnimations: () =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        showAnimations: !state.preferences.showAnimations,
      },
    })),

  setCustomGreeting: (greeting) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        customGreeting: greeting,
      },
    })),

  reset: () =>
    set({
      localPressCount: 0,
      lastPressedAt: null,
      preferences: { showAnimations: true, customGreeting: null },
    }),
}));
```

### Selector Hooks for Performance

Create selector hooks to prevent unnecessary re-renders:

```typescript
// Optimized: Only re-renders when localPressCount changes
export const useLocalPressCount = () =>
  useHelloLocalStore((state) => state.localPressCount);

// Optimized: Only re-renders when preferences change
export const usePreferences = () =>
  useHelloLocalStore((state) => state.preferences);

// Optimized: Only re-renders when showAnimations changes
export const useShowAnimations = () =>
  useHelloLocalStore((state) => state.preferences.showAnimations);
```

## Cross-Platform Storage Abstraction

### Storage Interface

The storage abstraction (`@universal/shared-utils`) provides a unified API:

```typescript
// packages/shared-utils/src/storage.ts
interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}
```

### Platform Detection

Storage implementation is selected at runtime:

- **Web**: Uses `localStorage` via `WebStorage` class
- **Mobile**: Uses `@react-native-async-storage/async-storage` via `MobileStorage` class

```typescript
// Convenience functions
export async function setJSON<T>(key: string, value: T): Promise<void> {
  await storage.setItem(key, JSON.stringify(value));
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const value = await storage.getItem(key);
  return value ? JSON.parse(value) : null;
}

export async function setString(key: string, value: string): Promise<void> {
  await storage.setItem(key, value);
}

export async function getString(key: string): Promise<string | null> {
  return storage.getItem(key);
}
```

### Persistence Best Practices

```typescript
// 1. Always wrap in try-catch
async function persistState(user: User) {
  try {
    if (user) {
      await setJSON(AUTH_STORAGE_KEY, { user });
    } else {
      await storage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to persist auth state:', error);
    // Don't throw - persistence failure shouldn't break the app
  }
}

// 2. Load with fallback
async function loadPersistedState(): Promise<PersistedState | null> {
  try {
    return await getJSON(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to load persisted auth state:', error);
    return null; // Graceful fallback
  }
}

// 3. Use namespaced keys
const AUTH_STORAGE_KEY = '@universal/auth-state';
const THEME_STORAGE_KEY = '@universal/theme';
const LOCALE_STORAGE_KEY = '@universal/locale';
```

## State Ownership Model

### Host Owns Shared State

The host application owns state that affects multiple MFEs:

- **Authentication**: User session, roles, permissions
- **Theme**: Light/dark mode preference
- **Locale**: Language preference
- **Navigation**: Route state

### MFEs Own Local State

Each MFE owns its isolated state:

- **UI State**: Form values, expanded/collapsed sections
- **Preferences**: MFE-specific settings
- **Interaction State**: Press counts, scroll positions

### Event Bus for Synchronization

State changes that affect other MFEs are communicated via events:

```typescript
// Host emits theme change
bus.emit(ThemeEventTypes.THEME_CHANGED, {
  theme: 'dark',
  previousTheme: 'light',
});

// Remote listens and updates local state
useEventListener(ThemeEventTypes.THEME_CHANGED, (event) => {
  setLocalTheme(event.theme);
});
```

## Testing State Management

### Testing Zustand Stores

```typescript
import { useAuthStore } from '../store';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout();
    useAuthStore.getState().clearSession();
  });

  it('should login successfully', async () => {
    await useAuthStore.getState().login('test@example.com', 'password');

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('test@example.com');
  });

  it('should check roles correctly', async () => {
    await useAuthStore.getState().login('admin@example.com', 'password');

    expect(useAuthStore.getState().hasRole('ADMIN')).toBe(true);
    expect(useAuthStore.getState().hasRole('CUSTOMER')).toBe(false);
    expect(useAuthStore.getState().hasAnyRole(['ADMIN', 'CUSTOMER'])).toBe(true);
  });
});
```

### Mocking Storage in Tests

```typescript
// Mock storage for tests
jest.mock('@universal/shared-utils', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  setJSON: jest.fn(),
  getJSON: jest.fn(),
}));
```

## Key Principles

1. **Loose Coupling**: MFEs don't directly access each other's stores
2. **Type Safety**: Full TypeScript types for all state and actions
3. **Immutable Updates**: Use functional state updates with `set()`
4. **Selector Optimization**: Use selectors to prevent unnecessary re-renders
5. **Error Resilience**: Persistence operations never break the app
6. **Clear Ownership**: Each piece of state has a clear owner (host or MFE)

## File Locations

| Component | Path |
|-----------|------|
| Auth Store | `packages/shared-auth-store/src/store.ts` |
| Storage Abstraction | `packages/shared-utils/src/storage.ts` |
| Local MFE Stores | `packages/*/src/store/localStore.ts` |
| Event Bus | `packages/shared-event-bus/src/` |
