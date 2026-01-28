# Firebase Authentication Implementation Plan

**Status:** Phase 0 - Planning
**Last Updated:** 2026-01-28
**Version:** 1.1 (Added MFE State Management Architecture section)
**Target:** Universal authentication across Web, Android, and iOS with MFE-compatible architecture
**Cost Target:** $0/month (Firebase Spark Plan)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Requirements](#authentication-requirements)
3. [Finalized Technology Decisions](#finalized-technology-decisions)
4. [Pre-requisites](#pre-requisites)
5. [Architecture Overview](#architecture-overview)
6. [**MFE State Management Architecture**](#mfe-state-management-architecture) ⭐ NEW
7. [Phase 1: Foundation & Storage Abstraction](#phase-1-foundation--storage-abstraction)
8. [Phase 2: Recreate shared-auth-store Source Files](#phase-2-recreate-shared-auth-store-source-files)
9. [Phase 3: Firebase SDK Integration (Mobile)](#phase-3-firebase-sdk-integration-mobile)
10. [Phase 4: Firebase SDK Integration (Web)](#phase-4-firebase-sdk-integration-web)
11. [Phase 5: Auth UI Components](#phase-5-auth-ui-components)
12. [Phase 6: Protected Routes & Auth Guards](#phase-6-protected-routes--auth-guards)
13. [Phase 7: CI/CD Integration](#phase-7-cicd-integration)
14. [Phase 8: Testing & Documentation](#phase-8-testing--documentation)
15. [Cost Summary](#cost-summary)
16. [Timeline Summary](#timeline-summary)
17. [Success Criteria](#success-criteria)
18. [Risk Mitigation](#risk-mitigation)
19. [References](#references)

---

## Overview

This document outlines the implementation plan for Firebase Authentication in the Universal Microfrontend Platform. The goal is to provide secure, cross-platform authentication with email/password and social login providers (Google, GitHub) while maintaining the MFE architecture principles of loose coupling and independent deployability.

### Key Architectural Decision

This document introduces a critical distinction between **Platform State** and **MFE-Owned State**:

| State Type | Location | Examples | Communication |
|------------|----------|----------|---------------|
| **Platform State** | Shared packages | Auth, Theme, i18n | Direct import |
| **MFE-Owned State** | Inside MFE package | Cart, Checkout, Profile | Event bus only |

Firebase Auth is implemented as **Platform State** in `shared-auth-store` because authentication is a platform-wide concern that all MFEs need consistent access to. Future domain-specific MFEs (Cart, Checkout, etc.) should use **private Zustand stores** and communicate via the event bus.

See [MFE State Management Architecture](#mfe-state-management-architecture) for detailed guidelines.

---

## Authentication Requirements

### Functional Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| Email/Password Sign Up | P0 | Core requirement |
| Email/Password Sign In | P0 | Core requirement |
| Google Sign In | P0 | Most requested social login |
| GitHub Sign In | P1 | Developer-focused apps |
| Password Reset | P0 | Email-based recovery |
| Session Persistence | P0 | Remember logged-in users |
| Auth State Sync | P0 | Sync across MFEs via event bus |
| Protected Routes | P0 | Route-level access control |
| Sign Out | P0 | Clear session across all MFEs |

### Non-Functional Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| **Cross-Platform** | Web + Android + iOS | Single auth implementation |
| **MFE Compatible** | Event bus integration | Auth state shared via events |
| **Offline Support** | Cached auth state | User stays logged in offline |
| **Security** | Firebase Security Rules | Server-side validation |
| **Performance** | < 500ms auth operations | Perceived instant |
| **Cost** | $0/month | Firebase Spark Plan (50K MAU free) |

---

## Finalized Technology Decisions

| Component | Decision | Rationale |
|-----------|----------|-----------|
| **Auth Provider** | Firebase Authentication | Already using Firebase for hosting/distribution |
| **Mobile SDK** | `@react-native-firebase/auth` | Native performance, proven stability |
| **Web SDK** | `firebase` (modular v9+) | Tree-shakeable, smaller bundle |
| **State Management** | Zustand (`shared-auth-store`) | Already established pattern |
| **Cross-MFE Sync** | Event Bus | Already implemented in `shared-event-bus` |
| **Token Storage** | Platform-native | Keychain (iOS), Keystore (Android), httpOnly (web) |
| **Social Login - Google** | `@react-native-google-signin/google-signin` | Official, well-maintained |
| **Social Login - GitHub** | Firebase OAuth redirect | No native SDK needed |

---

## Pre-requisites

### Firebase Console Setup (Manual)

- [ ] **Firebase Project Created** (Task 6.5 - already done: `universal-mfe`)
  - [ ] Project ID: `universal-mfe`
  - [ ] Web app registered
  - [ ] Android app registered (`com.mobilehosttmp`)
  - [ ] iOS app registered (future: requires Apple Developer account)

- [ ] **Authentication Providers Enabled**
  - [ ] Email/Password provider enabled
  - [ ] Google provider enabled
  - [ ] GitHub provider enabled (requires GitHub OAuth app)

- [ ] **GitHub OAuth App Created**
  - [ ] Go to: GitHub → Settings → Developer settings → OAuth Apps → New
  - [ ] Application name: `Universal MFE Auth`
  - [ ] Homepage URL: `https://universal-mfe.web.app`
  - [ ] Authorization callback URL: From Firebase Console
  - [ ] Note Client ID and Client Secret for Firebase

### Configuration Files Required

| File | Platform | Location | Notes |
|------|----------|----------|-------|
| `google-services.json` | Android | `packages/mobile-host/android/app/` | From Firebase Console |
| `GoogleService-Info.plist` | iOS | `packages/mobile-host/ios/` | From Firebase Console |
| Firebase config object | Web | `packages/web-shell/src/config/firebase.ts` | API keys (public) |

### GitHub Secrets Required

| Secret | Purpose | Source |
|--------|---------|--------|
| `GOOGLE_SERVICES_JSON_BASE64` | Android Firebase config | Base64-encoded google-services.json |
| `GOOGLE_SERVICE_INFO_PLIST_BASE64` | iOS Firebase config | Base64-encoded GoogleService-Info.plist |

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Firebase Authentication                         │
│                          (Email/Password, Google, GitHub)                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Platform Auth Services                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   Web Auth Service  │  │ Android Auth Service│  │  iOS Auth Service   │ │
│  │  (firebase/auth)    │  │(@react-native-      │  │(@react-native-      │ │
│  │                     │  │ firebase/auth)      │  │ firebase/auth)      │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      shared-auth-store (Zustand)                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  State: user, isAuthenticated, isLoading, error                     │   │
│  │  Actions: signIn, signUp, signOut, signInWithGoogle, signInWithGitHub│  │
│  │  Persistence: Platform-native secure storage                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      shared-event-bus (Cross-MFE Sync)                      │
│  Events: USER_LOGGED_IN, USER_LOGGED_OUT, SESSION_EXPIRED, AUTH_ERROR      │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                     ┌─────────────────┼─────────────────┐
                     ▼                 ▼                 ▼
              ┌───────────┐     ┌───────────┐     ┌───────────┐
              │ Web Shell │     │Mobile Host│     │  Remotes  │
              │  (Host)   │     │  (Host)   │     │  (MFEs)   │
              └───────────┘     └───────────┘     └───────────┘
```

### Auth State Flow

```
1. User initiates login (email/Google/GitHub)
                     │
                     ▼
2. Platform-specific auth service handles authentication
   - Web: firebase/auth signInWithEmailAndPassword/signInWithPopup
   - Mobile: @react-native-firebase/auth + @react-native-google-signin
                     │
                     ▼
3. Firebase returns user object + tokens
                     │
                     ▼
4. shared-auth-store updates state
   - Sets user object
   - Sets isAuthenticated = true
   - Persists to secure storage
                     │
                     ▼
5. Event bus emits USER_LOGGED_IN
   - Payload: { userId, email, displayName, roles }
                     │
                     ▼
6. All MFEs receive event and update their local state
   - Can show user-specific content
   - Can enable authenticated features
```

---

## MFE State Management Architecture

### Core Principle: Separation of Platform State vs. MFE-Owned State

A critical architectural decision for MFE systems is **where state lives** and **how it's shared**. This section establishes the patterns that Firebase Auth will follow and that future MFEs should adopt.

### Two Types of State

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PLATFORM LAYER (Shared Packages)                      │
│                                                                              │
│  These stores are SHARED because they represent platform-wide concerns       │
│  that ALL MFEs need consistent access to.                                   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  shared-auth-store     │ WHO is the user? (Identity)                        │
│  shared-theme-context  │ WHAT does it look like? (Appearance)               │
│  shared-i18n           │ WHAT language? (Localization)                      │
│  shared-event-bus      │ HOW do MFEs communicate? (Communication)           │
│  shared-router         │ WHERE can users go? (Navigation definitions)       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    Events (loose coupling - the ONLY way MFEs communicate)
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MFE LAYER (Domain Packages)                         │
│                                                                              │
│  These stores are PRIVATE because they represent domain-specific concerns    │
│  that only the owning MFE needs to manage internally.                       │
│                                                                              │
├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│   mfe-cart       │   mfe-checkout   │   mfe-profile    │   mfe-products     │
│  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐    │
│  │ cartStore  │  │  │checkoutStore│ │  │profileStore│  │  │productStore│    │
│  │ (PRIVATE)  │  │  │ (PRIVATE)  │  │  │ (PRIVATE)  │  │  │ (PRIVATE)  │    │
│  └────────────┘  │  └────────────┘  │  └────────────┘  │  └────────────┘    │
│                  │                  │                  │                    │
│  Emits:          │  Emits:          │  Emits:          │  Emits:            │
│  CART_UPDATED    │  CHECKOUT_DONE   │  PROFILE_UPDATED │  PRODUCT_SELECTED  │
│  CART_CLEARED    │  PAYMENT_FAILED  │                  │  WISHLIST_CHANGED  │
└──────────────────┴──────────────────┴──────────────────┴────────────────────┘
```

### Why This Separation Matters

| Concern | Shared Store | Private Store |
|---------|--------------|---------------|
| **Coupling** | All MFEs depend on it | Only owning MFE depends on it |
| **Deployment** | Changes affect all MFEs | Changes only affect one MFE |
| **Team Ownership** | Platform team owns it | Domain team owns it |
| **Versioning** | Must maintain backwards compatibility | Can change freely |
| **Communication** | Direct import allowed | Event bus ONLY |

### Platform State (Shared Stores)

**Auth is a platform concern** - it belongs in a shared store because:

1. **Every MFE needs to know if user is authenticated** (for protected routes, personalization)
2. **Auth state must be consistent** - user can't be logged in for Cart but logged out for Checkout
3. **It's infrastructure, not domain logic** - auth is not a business feature

**Other platform state examples:**
- Theme (shared-theme-context)
- Language/Locale (shared-i18n)
- Feature flags
- Analytics context

### MFE-Owned State (Private Stores)

**Domain logic belongs in private stores** because:

1. **True independent deployability** - Cart MFE can be deployed without touching Checkout MFE
2. **No version coupling** - Cart's internal state changes don't require other MFEs to update
3. **Team autonomy** - Cart team can refactor completely without affecting Profile team
4. **Failure isolation** - If Cart MFE crashes, it crashes alone

### Cross-MFE Communication Pattern

MFEs communicate **only through the event bus**, never by importing each other's stores.

**Example: Cart notifies other MFEs of changes**

```typescript
// ============================================================================
// INSIDE: Cart MFE (packages/mfe-cart/src/store/cartStore.ts)
// ============================================================================

// This store is PRIVATE - no other MFE imports it
import { create } from 'zustand';
import { eventBus } from '@universal/shared-event-bus';

const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,

  addItem: async (product) => {
    set({ isLoading: true });
    // ... add item logic
    set((state) => ({
      items: [...state.items, product],
      isLoading: false
    }));

    // 🔔 Notify other MFEs via event bus (NOT direct store access)
    eventBus.emit('CART_UPDATED', {
      itemCount: get().items.length,
      totalAmount: calculateTotal(get().items)
    });
  },

  clearCart: () => {
    set({ items: [] });
    eventBus.emit('CART_CLEARED', { reason: 'user_action' });
  },
}));
```

**Example: Header MFE reacts to Cart events**

```typescript
// ============================================================================
// INSIDE: Header MFE (packages/mfe-header/src/components/CartBadge.tsx)
// ============================================================================

// Header DOES NOT import cartStore - it listens to events instead
import { useState } from 'react';
import { useEventListener } from '@universal/shared-event-bus';

function CartBadge() {
  const [cartCount, setCartCount] = useState(0);

  // Listen to cart updates via event bus
  useEventListener('CART_UPDATED', (event) => {
    setCartCount(event.payload.itemCount);
  });

  useEventListener('CART_CLEARED', () => {
    setCartCount(0);
  });

  return <Badge count={cartCount} />;
}
```

**Example: MFEs react to auth events**

```typescript
// ============================================================================
// INSIDE: Cart MFE (reacts to auth changes)
// ============================================================================

import { useEffect } from 'react';
import { useEventListener } from '@universal/shared-event-bus';
import { useCartStore } from './store/cartStore';

function CartProvider({ children }) {
  const loadUserCart = useCartStore((s) => s.loadUserCart);
  const clearCart = useCartStore((s) => s.clearCart);

  // When user logs in, load their saved cart from server
  useEventListener('USER_LOGGED_IN', async (event) => {
    await loadUserCart(event.payload.userId);
  });

  // When user logs out, clear cart or convert to anonymous cart
  useEventListener('USER_LOGGED_OUT', () => {
    clearCart();
  });

  return children;
}
```

### Event Contract Definitions

To maintain type safety while keeping loose coupling, event contracts are defined in `shared-event-bus`:

```typescript
// packages/shared-event-bus/src/events/cart.ts

export type CartEvents = {
  CART_UPDATED: {
    itemCount: number;
    totalAmount: number;
    currency: string;
  };
  CART_CLEARED: {
    reason: 'user_action' | 'checkout_complete' | 'session_expired';
  };
  CART_ITEM_ADDED: {
    productId: string;
    quantity: number;
    price: number;
  };
};

// Usage: eventBus.emit<CartEvents>('CART_UPDATED', { ... })
```

### Firebase Auth in This Architecture

Firebase Auth is a **platform concern** implemented in `shared-auth-store`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           shared-auth-store                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  State (Zustand):                                                    │   │
│  │    • user: User | null                                               │   │
│  │    • isAuthenticated: boolean                                        │   │
│  │    • isLoading: boolean                                              │   │
│  │                                                                      │   │
│  │  Actions:                                                            │   │
│  │    • signInWithEmail(email, password)                                │   │
│  │    • signInWithGoogle()                                              │   │
│  │    • signInWithGitHub()                                              │   │
│  │    • signOut()                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│                           Emits Events on Change                            │
│                                      │                                       │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
  USER_LOGGED_IN              USER_LOGGED_OUT              AUTH_ERROR
  { userId, email,            { reason }                   { code, message }
    displayName,
    provider }
         │                             │                             │
         ▼                             ▼                             ▼
  ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
  │  Cart MFE   │              │ Profile MFE │              │ Header MFE  │
  │ loads user  │              │ clears      │              │  updates    │
  │ saved cart  │              │ local data  │              │  UI state   │
  └─────────────┘              └─────────────┘              └─────────────┘
```

### Guidelines for Future MFEs

When creating new MFEs, follow these rules:

**DO:**
- ✅ Create a private Zustand store inside your MFE package
- ✅ Emit events when state changes that other MFEs might care about
- ✅ Listen to events from other MFEs to react to their changes
- ✅ Import and use shared platform stores (auth, theme, i18n)
- ✅ Define event type contracts in shared-event-bus

**DON'T:**
- ❌ Import another MFE's store directly
- ❌ Expose your store for other MFEs to import
- ❌ Put domain-specific state in shared packages
- ❌ Bypass the event bus for cross-MFE communication
- ❌ Create tight coupling between MFEs

### Benefits of This Architecture

| Benefit | Description |
|---------|-------------|
| **Independent Deployability** | Cart MFE can deploy without touching Checkout MFE |
| **Team Autonomy** | Each team owns their domain completely |
| **Fault Isolation** | One MFE crashing doesn't corrupt shared state |
| **Clear Contracts** | Event types define the communication interface |
| **Scalability** | Add new MFEs without modifying existing ones |
| **Testability** | MFEs can be tested in isolation with mocked events |

---

## Phase 1: Foundation & Storage Abstraction

**Objective:** Create the cross-platform storage abstraction needed for auth persistence.

**Duration:** ~4 hours

### Task 1.1: Implement Storage Abstraction in shared-utils

The `shared-auth-store` requires a cross-platform storage abstraction that doesn't exist yet.

**Create** `packages/shared-utils/src/storage.ts`:

```typescript
/**
 * Cross-Platform Storage Abstraction
 *
 * Provides a unified API for persistent storage across:
 * - Web: localStorage
 * - Mobile: AsyncStorage (via @react-native-async-storage/async-storage)
 *
 * IMPORTANT: This module must NOT import platform-specific code directly.
 * The actual storage implementation is injected at runtime by the host.
 */

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

let storageAdapter: StorageAdapter | null = null;

/**
 * Configure the storage adapter.
 * Must be called once at app initialization by the host.
 *
 * @example
 * // Web host
 * import { configureStorage, createWebStorage } from '@universal/shared-utils';
 * configureStorage(createWebStorage());
 *
 * // Mobile host
 * import { configureStorage, createMobileStorage } from '@universal/shared-utils';
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * configureStorage(createMobileStorage(AsyncStorage));
 */
export function configureStorage(adapter: StorageAdapter): void {
  storageAdapter = adapter;
}

/**
 * Get the configured storage adapter.
 * Throws if storage hasn't been configured.
 */
export function getStorage(): StorageAdapter {
  if (!storageAdapter) {
    throw new Error(
      '[shared-utils] Storage not configured. ' +
      'Call configureStorage() with a platform-specific adapter at app initialization.'
    );
  }
  return storageAdapter;
}

/**
 * Check if storage has been configured.
 */
export function isStorageConfigured(): boolean {
  return storageAdapter !== null;
}

// =============================================================================
// JSON Helpers
// =============================================================================

/**
 * Get a JSON value from storage.
 */
export async function getJSON<T>(key: string): Promise<T | null> {
  const storage = getStorage();
  const value = await storage.getItem(key);
  if (value === null) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    console.warn(`[shared-utils] Failed to parse JSON for key: ${key}`);
    return null;
  }
}

/**
 * Set a JSON value in storage.
 */
export async function setJSON<T>(key: string, value: T): Promise<void> {
  const storage = getStorage();
  await storage.setItem(key, JSON.stringify(value));
}

/**
 * Remove a value from storage.
 */
export async function removeItem(key: string): Promise<void> {
  const storage = getStorage();
  await storage.removeItem(key);
}

// =============================================================================
// Platform-Specific Adapter Factories
// =============================================================================

/**
 * Create a storage adapter for web (uses localStorage).
 */
export function createWebStorage(): StorageAdapter {
  return {
    async getItem(key: string): Promise<string | null> {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    async setItem(key: string, value: string): Promise<void> {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('[shared-utils] localStorage.setItem failed:', error);
      }
    },
    async removeItem(key: string): Promise<void> {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    },
    async clear(): Promise<void> {
      try {
        localStorage.clear();
      } catch {
        // Ignore
      }
    },
  };
}

/**
 * Create a storage adapter for mobile (uses AsyncStorage).
 *
 * @param asyncStorage - The AsyncStorage instance from @react-native-async-storage
 */
export function createMobileStorage(asyncStorage: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}): StorageAdapter {
  return {
    getItem: (key) => asyncStorage.getItem(key),
    setItem: (key, value) => asyncStorage.setItem(key, value),
    removeItem: (key) => asyncStorage.removeItem(key),
    clear: () => asyncStorage.clear(),
  };
}
```

**Update** `packages/shared-utils/src/index.ts`:

```typescript
// ... existing exports ...

// Storage abstraction
export {
  type StorageAdapter,
  configureStorage,
  getStorage,
  isStorageConfigured,
  getJSON,
  setJSON,
  removeItem,
  createWebStorage,
  createMobileStorage,
} from './storage';
```

### Task 1.2: Add AsyncStorage Dependency to Mobile Packages

**Run:**
```bash
yarn workspace @universal/mobile-host add @react-native-async-storage/async-storage
yarn workspace @universal/mobile-remote-hello add @react-native-async-storage/async-storage
```

**Note:** Web doesn't need additional dependencies (uses built-in localStorage).

### Task 1.3: Configure Storage in Hosts

**Web Shell** (`packages/web-shell/src/index.tsx`):
```typescript
import { configureStorage, createWebStorage } from '@universal/shared-utils';

// Configure storage before rendering app
configureStorage(createWebStorage());

// ... rest of app initialization
```

**Mobile Host** (`packages/mobile-host/src/App.tsx`):
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStorage, createMobileStorage } from '@universal/shared-utils';

// Configure storage before rendering app
configureStorage(createMobileStorage(AsyncStorage));

// ... rest of app initialization
```

### Task 1.4: Rebuild shared-utils

```bash
yarn workspace @universal/shared-utils build
```

### Verification Steps

- [ ] `yarn build:shared` passes
- [ ] `yarn typecheck` passes
- [ ] Storage abstraction works on web (test with simple setJSON/getJSON)
- [ ] Storage abstraction works on mobile (test with simple setJSON/getJSON)

---

## Phase 2: Recreate shared-auth-store Source Files

**Objective:** Recreate the missing source files for `shared-auth-store` with Firebase integration points.

**Duration:** ~6 hours

### Task 2.1: Create Package Structure

```
packages/shared-auth-store/
├── src/
│   ├── index.ts              # Public exports
│   ├── types.ts              # Type definitions
│   ├── store.ts              # Zustand store
│   ├── authService.ts        # Auth service interface
│   ├── firebaseAuthService.ts # Firebase implementation
│   ├── mockAuthService.ts    # Mock for testing
│   └── constants.ts          # Storage keys, etc.
├── package.json
└── tsconfig.json
```

### Task 2.2: Create Type Definitions

**Create** `packages/shared-auth-store/src/types.ts`:

```typescript
/**
 * @universal/shared-auth-store
 *
 * Type definitions for authentication store.
 */

/**
 * User roles for Role-Based Access Control (RBAC)
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
}

/**
 * Authentication provider types
 */
export type AuthProvider = 'email' | 'google' | 'github' | 'anonymous';

/**
 * User interface - represents the authenticated user
 */
export interface User {
  /** Unique user identifier (Firebase UID) */
  id: string;
  /** User's email address */
  email: string | null;
  /** Display name */
  displayName: string | null;
  /** Profile photo URL */
  photoURL: string | null;
  /** Whether email is verified */
  emailVerified: boolean;
  /** User role for RBAC */
  role: UserRole;
  /** Auth provider used to sign in */
  provider: AuthProvider;
  /** Firebase ID token (for API calls) */
  idToken?: string;
  /** Token expiration timestamp */
  tokenExpiry?: number;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  /** Current authenticated user (null if not authenticated) */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is being loaded/verified */
  isLoading: boolean;
  /** Error message from last auth operation */
  error: string | null;
  /** Whether auth state has been initialized */
  isInitialized: boolean;
}

/**
 * Auth store actions
 */
export interface AuthActions {
  // Email/Password
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Social Login
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;

  // Session Management
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // State Management
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // RBAC
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;

  // Initialization
  initializeAuth: () => Promise<() => void>;
}

/**
 * Combined auth store type
 */
export type AuthStore = AuthState & AuthActions;

/**
 * Auth service interface - implemented by platform-specific services
 */
export interface AuthService {
  // Email/Password
  signInWithEmail(email: string, password: string): Promise<User>;
  signUpWithEmail(email: string, password: string, displayName?: string): Promise<User>;
  resetPassword(email: string): Promise<void>;

  // Social Login
  signInWithGoogle(): Promise<User>;
  signInWithGitHub(): Promise<User>;

  // Session Management
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  refreshToken(): Promise<string | null>;

  // Auth State Listener
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

/**
 * Credentials for email sign-in
 */
export interface EmailCredentials {
  email: string;
  password: string;
}

/**
 * Sign-up data
 */
export interface SignUpData extends EmailCredentials {
  displayName?: string;
}
```

### Task 2.3: Create Constants

**Create** `packages/shared-auth-store/src/constants.ts`:

```typescript
/**
 * Storage key for persisted auth state
 */
export const AUTH_STORAGE_KEY = '@universal/auth-state';

/**
 * Storage key for auth tokens
 */
export const AUTH_TOKEN_KEY = '@universal/auth-token';

/**
 * Token refresh threshold (5 minutes before expiry)
 */
export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Auth event types (for event bus)
 */
export const AUTH_EVENTS = {
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
} as const;

/**
 * Auth error codes
 */
export const AUTH_ERROR_CODES = {
  INVALID_EMAIL: 'auth/invalid-email',
  USER_DISABLED: 'auth/user-disabled',
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  NETWORK_ERROR: 'auth/network-request-failed',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
  POPUP_CLOSED: 'auth/popup-closed-by-user',
  CANCELLED: 'auth/cancelled',
} as const;

/**
 * Human-readable error messages
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_ERROR_CODES.INVALID_EMAIL]: 'Please enter a valid email address.',
  [AUTH_ERROR_CODES.USER_DISABLED]: 'This account has been disabled.',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'No account found with this email.',
  [AUTH_ERROR_CODES.WRONG_PASSWORD]: 'Incorrect password. Please try again.',
  [AUTH_ERROR_CODES.EMAIL_ALREADY_IN_USE]: 'An account already exists with this email.',
  [AUTH_ERROR_CODES.WEAK_PASSWORD]: 'Password should be at least 6 characters.',
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [AUTH_ERROR_CODES.TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later.',
  [AUTH_ERROR_CODES.POPUP_CLOSED]: 'Sign-in was cancelled.',
  [AUTH_ERROR_CODES.CANCELLED]: 'Sign-in was cancelled.',
};

/**
 * Get user-friendly error message from Firebase error code
 */
export function getAuthErrorMessage(errorCode: string): string {
  return AUTH_ERROR_MESSAGES[errorCode] || 'An unexpected error occurred. Please try again.';
}
```

### Task 2.4: Create Zustand Store

**Create** `packages/shared-auth-store/src/store.ts`:

```typescript
/**
 * @universal/shared-auth-store
 *
 * Zustand store for authentication state management.
 *
 * Features:
 * - Cross-platform auth state
 * - Firebase integration
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
```

### Task 2.5: Create Index Exports

**Create** `packages/shared-auth-store/src/index.ts`:

```typescript
/**
 * @universal/shared-auth-store
 *
 * Cross-platform authentication store for the Universal MFE Platform.
 */

// Types
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

// Store
export {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useIsAuthLoading,
  useAuthError,
  configureAuthService,
  configureAuthEventEmitter,
} from './store';

// Constants
export {
  AUTH_STORAGE_KEY,
  AUTH_TOKEN_KEY,
  AUTH_EVENTS,
  AUTH_ERROR_CODES,
  AUTH_ERROR_MESSAGES,
  getAuthErrorMessage,
} from './constants';

// RBAC Helpers
export { hasRole, hasAnyRole } from './rbac';
```

### Task 2.6: Create RBAC Helpers

**Create** `packages/shared-auth-store/src/rbac.ts`:

```typescript
/**
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
```

### Task 2.7: Update package.json

**Create/Update** `packages/shared-auth-store/package.json`:

```json
{
  "name": "@universal/shared-auth-store",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "zustand": "5.0.4"
  },
  "peerDependencies": {
    "@universal/shared-utils": "*",
    "react": ">=18.0.0"
  },
  "devDependencies": {
    "typescript": "5.9.3"
  }
}
```

### Verification Steps

- [ ] `yarn workspace @universal/shared-auth-store build` passes
- [ ] `yarn typecheck` passes
- [ ] Types are correctly exported
- [ ] Store can be imported in hosts

---

## Phase 3: Firebase SDK Integration (Mobile)

**Objective:** Implement Firebase Authentication for React Native (Android + iOS).

**Duration:** ~8 hours

### Task 3.1: Install React Native Firebase Dependencies

```bash
# Core Firebase
yarn workspace @universal/mobile-host add @react-native-firebase/app @react-native-firebase/auth

# Google Sign-In
yarn workspace @universal/mobile-host add @react-native-google-signin/google-signin

# Pod install for iOS
cd packages/mobile-host/ios && pod install --repo-update
```

### Task 3.2: Configure Android

**Already partially configured** in Task 6.5. Additional steps:

1. **SHA-1 Fingerprint** (for Google Sign-In):
```bash
cd packages/mobile-host/android
./gradlew signingReport
# Copy SHA-1 from debug keystore
# Add to Firebase Console → Project Settings → Your Apps → Android → Add fingerprint
```

2. **Update `android/build.gradle`** (root):
```groovy
buildscript {
    dependencies {
        // ... existing
        classpath 'com.google.gms:google-services:4.4.4'
    }
}
```

3. **Update `android/app/build.gradle`**:
```groovy
// Already has conditional apply:
if (file("google-services.json").exists()) {
    apply plugin: "com.google.gms.google-services"
}
```

4. **Add `google-services.json`**:
   - Download from Firebase Console
   - Place at `packages/mobile-host/android/app/google-services.json`
   - File is gitignored

### Task 3.3: Configure iOS

1. **Download `GoogleService-Info.plist`** from Firebase Console

2. **Add to iOS project**:
   - Place at `packages/mobile-host/ios/GoogleService-Info.plist`
   - Add to Xcode project (drag into project navigator)
   - Ensure "Copy items if needed" is checked

3. **Update `ios/Podfile`** if needed (usually automatic)

4. **Configure URL Schemes** for Google Sign-In:
   - Open `ios/MobileHostTmp/Info.plist`
   - Add URL scheme from `GoogleService-Info.plist` (REVERSED_CLIENT_ID)

### Task 3.4: Create Mobile Firebase Auth Service

**Create** `packages/mobile-host/src/services/firebaseAuthService.ts`:

```typescript
/**
 * Firebase Authentication Service for React Native
 *
 * Implements AuthService interface using @react-native-firebase/auth
 * and @react-native-google-signin/google-signin.
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { AuthService, User, UserRole } from '@universal/shared-auth-store';

// Configure Google Sign-In
// IMPORTANT: Replace with your actual Web Client ID from:
// Firebase Console → Project Settings → Your apps → Web app → Web Client ID
// The ID format is: 'XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com'
GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});

/**
 * Map Firebase user to our User type
 */
function mapFirebaseUser(firebaseUser: FirebaseAuthTypes.User): User {
  // Determine provider from providerData
  const providerData = firebaseUser.providerData[0];
  let provider: User['provider'] = 'email';

  if (providerData?.providerId === 'google.com') {
    provider = 'google';
  } else if (providerData?.providerId === 'github.com') {
    provider = 'github';
  }

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    role: UserRole.CUSTOMER, // Default role - could be fetched from Firestore
    provider,
  };
}

/**
 * Firebase Auth Service implementation
 */
export const firebaseAuthService: AuthService = {
  // ===========================================================================
  // Email/Password
  // ===========================================================================

  async signInWithEmail(email: string, password: string): Promise<User> {
    const result = await auth().signInWithEmailAndPassword(email, password);
    if (!result.user) throw new Error('Sign in failed');
    return mapFirebaseUser(result.user);
  },

  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
    const result = await auth().createUserWithEmailAndPassword(email, password);
    if (!result.user) throw new Error('Sign up failed');

    if (displayName) {
      await result.user.updateProfile({ displayName });
    }

    return mapFirebaseUser(result.user);
  },

  async resetPassword(email: string): Promise<void> {
    await auth().sendPasswordResetEmail(email);
  },

  // ===========================================================================
  // Google Sign-In
  // ===========================================================================

  async signInWithGoogle(): Promise<User> {
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get user ID token
    const signInResult = await GoogleSignin.signIn();
    const idToken = signInResult.data?.idToken;

    if (!idToken) {
      throw new Error('No ID token returned from Google Sign-In');
    }

    // Create Firebase credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase
    const result = await auth().signInWithCredential(googleCredential);
    if (!result.user) throw new Error('Google sign in failed');

    return mapFirebaseUser(result.user);
  },

  // ===========================================================================
  // GitHub Sign-In
  // ===========================================================================

  async signInWithGitHub(): Promise<User> {
    // GitHub OAuth for React Native requires an OAuth library like react-native-app-auth
    // since signInWithRedirect/signInWithPopup are web-only methods.
    //
    // Flow:
    // 1. Use react-native-app-auth to perform GitHub OAuth and get access token
    // 2. Create Firebase credential from the GitHub access token
    // 3. Sign in to Firebase with the credential
    //
    // Prerequisites:
    // - Install: yarn add react-native-app-auth
    // - Configure GitHub OAuth App in GitHub Developer Settings
    // - Add redirect URI to your app's URL scheme

    // Import at top of file: import { authorize } from 'react-native-app-auth';

    const githubAuthConfig = {
      issuer: 'https://github.com',
      clientId: process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
      redirectUrl: 'your.app.scheme://oauth/github', // Configure in app URL schemes
      scopes: ['user:email'],
      serviceConfiguration: {
        authorizationEndpoint: 'https://github.com/login/oauth/authorize',
        tokenEndpoint: 'https://github.com/login/oauth/access_token',
      },
    };

    // Perform OAuth flow in in-app browser/custom tab
    // Note: authorize is imported from react-native-app-auth
    const { authorize } = await import('react-native-app-auth');
    const authResult = await authorize(githubAuthConfig);

    if (!authResult.accessToken) {
      throw new Error('GitHub OAuth failed - no access token received');
    }

    // Create Firebase credential from GitHub access token
    const githubCredential = auth.GithubAuthProvider.credential(authResult.accessToken);

    // Sign in to Firebase with the GitHub credential
    const userCredential = await auth().signInWithCredential(githubCredential);

    if (!userCredential.user) {
      throw new Error('GitHub sign in failed');
    }

    return mapFirebaseUser(userCredential.user);
  },

  // ===========================================================================
  // Session Management
  // ===========================================================================

  async signOut(): Promise<void> {
    // Sign out from Google if signed in
    try {
      await GoogleSignin.signOut();
    } catch {
      // Ignore - user might not have signed in with Google
    }

    // Sign out from Firebase
    await auth().signOut();
  },

  getCurrentUser(): User | null {
    const firebaseUser = auth().currentUser;
    return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
  },

  async refreshToken(): Promise<string | null> {
    const user = auth().currentUser;
    if (!user) return null;

    return user.getIdToken(true);
  },

  // ===========================================================================
  // Auth State Listener
  // ===========================================================================

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return auth().onAuthStateChanged((firebaseUser) => {
      callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
  },
};
```

### Task 3.5: Initialize Auth in Mobile Host

**Update** `packages/mobile-host/src/App.tsx`:

```typescript
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStorage, createMobileStorage } from '@universal/shared-utils';
import {
  configureAuthService,
  configureAuthEventEmitter,
  useAuthStore
} from '@universal/shared-auth-store';
import { useEventBus } from '@universal/shared-event-bus';
import { firebaseAuthService } from './services/firebaseAuthService';

// Configure storage (before any other code runs)
configureStorage(createMobileStorage(AsyncStorage));

// Configure auth service
configureAuthService(firebaseAuthService);

function App() {
  const eventBus = useEventBus();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Configure event emitter for cross-MFE sync
    configureAuthEventEmitter((type, payload) => {
      eventBus.emit(type as any, payload);
    });

    // Initialize auth
    const unsubscribe = initializeAuth();

    return () => {
      unsubscribe.then((unsub) => unsub?.());
    };
  }, []);

  // ... rest of app
}
```

### Verification Steps

- [ ] Firebase app initializes without errors on Android
- [ ] Firebase app initializes without errors on iOS
- [ ] Email sign-in works on both platforms
- [ ] Email sign-up works on both platforms
- [ ] Google sign-in works on both platforms
- [ ] Sign-out works on both platforms
- [ ] Auth state persists across app restarts
- [ ] Event bus receives USER_LOGGED_IN events

---

## Phase 4: Firebase SDK Integration (Web)

**Objective:** Implement Firebase Authentication for Web using modular Firebase SDK.

**Duration:** ~4 hours

### Task 4.1: Install Firebase Web SDK

```bash
yarn workspace @universal/web-shell add firebase
yarn workspace @universal/web-remote-hello add firebase
```

### Task 4.2: Create Firebase Configuration

**Create** `packages/web-shell/src/config/firebase.ts`:

```typescript
/**
 * Firebase Configuration for Web
 *
 * These are public API keys - they are safe to commit.
 * Security is enforced through Firebase Security Rules.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'universal-mfe.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'universal-mfe',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'universal-mfe.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth, firebaseConfig };
```

### Task 4.3: Create Web Firebase Auth Service

**Create** `packages/web-shell/src/services/firebaseAuthService.ts`:

```typescript
/**
 * Firebase Authentication Service for Web
 *
 * Implements AuthService interface using Firebase JS SDK (modular).
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { AuthService, User, UserRole } from '@universal/shared-auth-store';

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Add scopes
googleProvider.addScope('profile');
googleProvider.addScope('email');
githubProvider.addScope('user:email');

/**
 * Map Firebase user to our User type
 */
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  // Determine provider from providerData
  const providerData = firebaseUser.providerData[0];
  let provider: User['provider'] = 'email';

  if (providerData?.providerId === 'google.com') {
    provider = 'google';
  } else if (providerData?.providerId === 'github.com') {
    provider = 'github';
  }

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    role: UserRole.CUSTOMER, // Default role
    provider,
  };
}

/**
 * Firebase Auth Service implementation for Web
 */
export const firebaseAuthService: AuthService = {
  async signInWithEmail(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(result.user);
  },

  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(result.user, { displayName });
    }

    return mapFirebaseUser(result.user);
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUser(result.user);
  },

  async signInWithGitHub(): Promise<User> {
    const result = await signInWithPopup(auth, githubProvider);
    return mapFirebaseUser(result.user);
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  },

  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
  },

  async refreshToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(true);
  },

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
  },
};
```

### Task 4.4: Initialize Auth in Web Shell

**Update** `packages/web-shell/src/index.tsx`:

```typescript
import { configureStorage, createWebStorage } from '@universal/shared-utils';
import {
  configureAuthService,
  configureAuthEventEmitter,
  useAuthStore
} from '@universal/shared-auth-store';
import { firebaseAuthService } from './services/firebaseAuthService';

// Configure storage
configureStorage(createWebStorage());

// Configure auth service
configureAuthService(firebaseAuthService);

// In App component:
function App() {
  const eventBus = useEventBus();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    configureAuthEventEmitter((type, payload) => {
      eventBus.emit(type as any, payload);
    });

    const cleanup = initializeAuth();
    return () => {
      cleanup.then((unsub) => unsub?.());
    };
  }, []);

  // ... rest of app
}
```

### Task 4.5: Configure Environment Variables

**Create** `packages/web-shell/.env.example`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Verification Steps

- [ ] Firebase initializes without errors on web
- [ ] Email sign-in works
- [ ] Email sign-up works
- [ ] Google sign-in popup works
- [ ] GitHub sign-in popup works
- [ ] Sign-out works
- [ ] Auth state persists across page refreshes
- [ ] Event bus receives USER_LOGGED_IN events

---

## Phase 5: Auth UI Components

**Objective:** Create universal auth UI components using React Native primitives.

**Duration:** ~8 hours

### Task 5.1: Create Auth Screens in shared-hello-ui

**Create** `packages/shared-hello-ui/src/components/auth/`:

```
auth/
├── LoginScreen.tsx        # Email/password + social login buttons
├── SignUpScreen.tsx       # Registration form
├── ForgotPasswordScreen.tsx # Password reset form
├── AuthButton.tsx         # Reusable auth button
├── SocialLoginButtons.tsx # Google + GitHub buttons
├── AuthInput.tsx          # Themed input field
├── AuthError.tsx          # Error display component
└── index.ts               # Exports
```

### Task 5.2: LoginScreen Component

**Create** `packages/shared-hello-ui/src/components/auth/LoginScreen.tsx`:

```typescript
/**
 * LoginScreen - Universal login component
 *
 * Uses React Native primitives for cross-platform compatibility.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@universal/shared-theme-context';
import { useTranslation } from '@universal/shared-i18n';
import { useAuthStore, useIsAuthLoading, useAuthError } from '@universal/shared-auth-store';

interface LoginScreenProps {
  onSignUpPress?: () => void;
  onForgotPasswordPress?: () => void;
  onLoginSuccess?: () => void;
}

export function LoginScreen({
  onSignUpPress,
  onForgotPasswordPress,
  onLoginSuccess,
}: LoginScreenProps) {
  const { theme } = useTheme();
  const { t } = useTranslation('auth');
  const isLoading = useIsAuthLoading();
  const error = useAuthError();

  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithGitHub = useAuthStore((state) => state.signInWithGitHub);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async () => {
    try {
      await signInWithEmail(email, password);
      onLoginSuccess?.();
    } catch {
      // Error is handled by store
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      onLoginSuccess?.();
    } catch {
      // Error is handled by store
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await signInWithGitHub();
      onLoginSuccess?.();
    } catch {
      // Error is handled by store
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('login.title', { defaultValue: 'Sign In' })}</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={clearError}>
            <Text style={styles.dismissText}>✕</Text>
          </Pressable>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder={t('login.email', { defaultValue: 'Email' })}
        placeholderTextColor={theme.colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder={t('login.password', { defaultValue: 'Password' })}
        placeholderTextColor={theme.colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <Pressable
        style={[styles.button, styles.primaryButton]}
        onPress={handleEmailLogin}
        disabled={isLoading || !email || !password}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.textInverse} />
        ) : (
          <Text style={styles.buttonText}>
            {t('login.signIn', { defaultValue: 'Sign In' })}
          </Text>
        )}
      </Pressable>

      <Pressable onPress={onForgotPasswordPress} disabled={isLoading}>
        <Text style={styles.linkText}>
          {t('login.forgotPassword', { defaultValue: 'Forgot Password?' })}
        </Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>
          {t('login.or', { defaultValue: 'or' })}
        </Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        style={[styles.button, styles.socialButton, styles.googleButton]}
        onPress={handleGoogleLogin}
        disabled={isLoading}
      >
        <Text style={styles.socialButtonText}>
          {t('login.continueWithGoogle', { defaultValue: 'Continue with Google' })}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.socialButton, styles.githubButton]}
        onPress={handleGitHubLogin}
        disabled={isLoading}
      >
        <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
          {t('login.continueWithGitHub', { defaultValue: 'Continue with GitHub' })}
        </Text>
      </Pressable>

      <Pressable onPress={onSignUpPress} disabled={isLoading}>
        <Text style={styles.linkText}>
          {t('login.noAccount', { defaultValue: "Don't have an account? Sign Up" })}
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      color: theme.colors.text,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    button: {
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      color: theme.colors.textInverse,
      fontSize: 16,
      fontWeight: '600',
    },
    linkText: {
      color: theme.colors.primary,
      textAlign: 'center',
      marginVertical: theme.spacing.sm,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      marginHorizontal: theme.spacing.md,
      color: theme.colors.textSecondary,
    },
    socialButton: {
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    googleButton: {
      backgroundColor: '#FFFFFF',
    },
    githubButton: {
      backgroundColor: '#24292e',
    },
    socialButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.error + '20',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    errorText: {
      flex: 1,
      color: theme.colors.error,
    },
    dismissText: {
      color: theme.colors.error,
      padding: theme.spacing.xs,
    },
  });
```

### Task 5.3: SignUpScreen Component

Similar structure to LoginScreen with:
- Email, password, confirm password, display name fields
- Password strength indicator
- Terms acceptance checkbox
- Link to login screen

### Task 5.4: ForgotPasswordScreen Component

Simple form with:
- Email input
- Submit button
- Success message after sending reset email
- Link back to login

### Task 5.5: Add i18n Keys

**Update** `packages/shared-i18n/src/translations/en.ts`:

```typescript
auth: {
  login: {
    title: 'Sign In',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    forgotPassword: 'Forgot Password?',
    or: 'or',
    continueWithGoogle: 'Continue with Google',
    continueWithGitHub: 'Continue with GitHub',
    noAccount: "Don't have an account? Sign Up",
  },
  signup: {
    title: 'Create Account',
    displayName: 'Display Name',
    confirmPassword: 'Confirm Password',
    signUp: 'Sign Up',
    hasAccount: 'Already have an account? Sign In',
    termsAgreement: 'I agree to the Terms of Service and Privacy Policy',
  },
  forgotPassword: {
    title: 'Reset Password',
    description: 'Enter your email and we\'ll send you a reset link.',
    send: 'Send Reset Link',
    success: 'Password reset email sent! Check your inbox.',
    backToLogin: 'Back to Sign In',
  },
  errors: {
    invalidEmail: 'Please enter a valid email address.',
    weakPassword: 'Password should be at least 6 characters.',
    passwordMismatch: 'Passwords do not match.',
    required: 'This field is required.',
  },
},
```

**Also add Hindi translations** in `hi.ts`.

### Verification Steps

- [ ] LoginScreen renders correctly on all platforms
- [ ] SignUpScreen renders correctly on all platforms
- [ ] ForgotPasswordScreen renders correctly on all platforms
- [ ] Theme changes apply correctly
- [ ] i18n translations work
- [ ] Accessibility labels present

---

## Phase 6: Protected Routes & Auth Guards

**Objective:** Implement route protection and auth guards.

**Duration:** ~4 hours

### Task 6.1: Create Auth Guard Hook

**Create** `packages/shared-auth-store/src/hooks/useAuthGuard.ts`:

```typescript
/**
 * Auth Guard Hook
 *
 * Checks authentication status and emits LOGIN_REQUIRED event if needed.
 */

import { useEffect } from 'react';
import { useAuthStore } from '../store';
import { AUTH_EVENTS } from '../constants';

interface UseAuthGuardOptions {
  /** Route ID requiring auth */
  routeId?: string;
  /** Callback when auth is required */
  onAuthRequired?: () => void;
  /** Custom message for login screen */
  message?: string;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { routeId, onAuthRequired, message } = options;
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isInitialized && !isAuthenticated) {
      // Emit LOGIN_REQUIRED event
      // Event bus will handle showing login UI
      onAuthRequired?.();
    }
  }, [isAuthenticated, isLoading, isInitialized, onAuthRequired]);

  return {
    isAuthenticated,
    isLoading,
    isInitialized,
    requiresAuth: !isAuthenticated && !isLoading && isInitialized,
  };
}
```

### Task 6.2: Create AuthGuard Component

**Create** `packages/shared-hello-ui/src/components/auth/AuthGuard.tsx`:

```typescript
/**
 * AuthGuard Component
 *
 * Wraps protected content and handles auth state.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@universal/shared-auth-store';
import { useTheme } from '@universal/shared-theme-context';
import { LoginScreen } from './LoginScreen';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Show login screen inline vs redirect */
  inline?: boolean;
  /** Fallback while loading */
  loadingFallback?: React.ReactNode;
  /** Custom unauthorized component */
  unauthorizedFallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  inline = true,
  loadingFallback,
  unauthorizedFallback,
}: AuthGuardProps) {
  const { theme } = useTheme();
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();

  // Show loading state
  if (!isInitialized || isLoading) {
    return loadingFallback || (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Show unauthorized state
  if (!isAuthenticated) {
    return unauthorizedFallback || (inline ? <LoginScreen /> : null);
  }

  // User is authenticated
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### Task 6.3: Update Route Metadata

**Update** `packages/shared-router/src/routes.ts` to add more protected routes:

```typescript
[Routes.PROFILE]: {
  id: Routes.PROFILE,
  labelKey: 'navigation.profile',
  icon: 'user',
  showInNav: true,
  navOrder: 2,
  requiresAuth: true,  // Protected
},
// Add new routes as needed
```

### Verification Steps

- [ ] Protected routes redirect to login when not authenticated
- [ ] Protected routes render content when authenticated
- [ ] Loading state shows while checking auth
- [ ] LOGIN_REQUIRED event is emitted correctly

---

## Phase 7: CI/CD Integration

**Objective:** Update CI/CD workflows to handle Firebase configuration.

**Duration:** ~4 hours

### Task 7.1: Add GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `GOOGLE_SERVICES_JSON_BASE64` | Base64-encoded google-services.json |
| `GOOGLE_SERVICE_INFO_PLIST_BASE64` | Base64-encoded GoogleService-Info.plist |
| `FIREBASE_WEB_API_KEY` | Firebase web API key |
| `FIREBASE_WEB_AUTH_DOMAIN` | Firebase web auth domain |
| `FIREBASE_WEB_PROJECT_ID` | Firebase project ID |
| `FIREBASE_WEB_APP_ID` | Firebase web app ID |

### Task 7.2: Update deploy-android.yml

```yaml
- name: Decode google-services.json
  run: |
    echo "${{ secrets.GOOGLE_SERVICES_JSON_BASE64 }}" | base64 -d > packages/mobile-host/android/app/google-services.json
```

### Task 7.3: Update deploy-ios.yml

```yaml
- name: Decode GoogleService-Info.plist
  run: |
    echo "${{ secrets.GOOGLE_SERVICE_INFO_PLIST_BASE64 }}" | base64 -d > packages/mobile-host/ios/GoogleService-Info.plist
```

### Task 7.4: Update deploy-web.yml

```yaml
env:
  VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_WEB_API_KEY }}
  VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_WEB_AUTH_DOMAIN }}
  VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_WEB_PROJECT_ID }}
  VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_WEB_APP_ID }}
```

### Verification Steps

- [ ] CI builds pass with Firebase configuration
- [ ] Android release APK includes google-services.json
- [ ] iOS release bundle includes GoogleService-Info.plist
- [ ] Web deployment has correct Firebase environment variables

---

## Phase 8: Testing & Documentation

**Objective:** Comprehensive testing and documentation.

**Duration:** ~6 hours

### Task 8.1: Manual Testing Checklist

#### Email/Password Flow
- [ ] Sign up with new email (web, Android, iOS)
- [ ] Sign in with existing email (web, Android, iOS)
- [ ] Sign in with wrong password shows error
- [ ] Sign up with existing email shows error
- [ ] Password reset sends email
- [ ] Sign out clears session

#### Google Sign-In Flow
- [ ] Google sign-in popup/redirect works (web)
- [ ] Google sign-in works (Android)
- [ ] Google sign-in works (iOS)
- [ ] Account linking works when using same email
- [ ] Cancel/dismiss is handled gracefully

#### GitHub Sign-In Flow
- [ ] GitHub sign-in popup works (web)
- [ ] GitHub sign-in redirect works (mobile)
- [ ] Cancel/dismiss is handled gracefully

#### Cross-Platform
- [ ] Auth state syncs across MFEs (event bus)
- [ ] Auth state persists across app restarts
- [ ] Protected routes work correctly
- [ ] Loading states show appropriately
- [ ] Error messages are user-friendly

### Task 8.2: Update Documentation

- [ ] Update `docs/PATTERNS-STATE-MANAGEMENT.md` with Firebase auth patterns
- [ ] Create `docs/FIREBASE-AUTH-GUIDE.md` for developers
- [ ] Update `README.md` with auth setup instructions
- [ ] Add auth flow diagrams

### Task 8.3: Add Crash Monitoring Breadcrumbs

Add Sentry/Crashlytics breadcrumbs for auth events (if crash monitoring is implemented):

```typescript
// On sign-in success
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User signed in',
  level: 'info',
  data: { provider: user.provider },
});

// On auth error
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'Auth error',
  level: 'error',
  data: { code: error.code },
});
```

---

## Cost Summary

| Item | Cost | Notes |
|------|------|-------|
| Firebase Auth (Spark Plan) | $0/month | Up to 50,000 MAU free |
| Firebase Hosting | $0/month | Already configured |
| Firebase App Distribution | $0/month | Already configured |
| GitHub Actions | $0/month | Within free tier |
| **Total** | **$0/month** | All free tier |

### Cost Triggers

| Usage | Free Tier Limit | Overage Cost |
|-------|-----------------|--------------|
| Monthly Active Users | 50,000 | $0.0055/MAU (Blaze Plan) |
| Phone Auth (SMS) | 10 verifications/day | $0.01-0.06/verification |
| Anonymous Auth | Unlimited | $0 |

---

## Timeline Summary

| Phase | Tasks | Estimated Effort |
|-------|-------|------------------|
| **Phase 1** | Storage Abstraction | ~4 hours |
| **Phase 2** | shared-auth-store | ~6 hours |
| **Phase 3** | Mobile Firebase Integration | ~8 hours |
| **Phase 4** | Web Firebase Integration | ~4 hours |
| **Phase 5** | Auth UI Components | ~8 hours |
| **Phase 6** | Protected Routes | ~4 hours |
| **Phase 7** | CI/CD Integration | ~4 hours |
| **Phase 8** | Testing & Documentation | ~6 hours |
| **Total** | | **~44 hours** |

---

## Success Criteria

| Metric | Target | Verification |
|--------|--------|--------------|
| Email Sign-Up | ✅ Works | Test on all platforms |
| Email Sign-In | ✅ Works | Test on all platforms |
| Google Sign-In | ✅ Works | Test on all platforms |
| GitHub Sign-In | ✅ Works | Test on all platforms |
| Password Reset | ✅ Works | Test email delivery |
| Session Persistence | ✅ Works | Restart app, verify logged in |
| Cross-MFE Sync | ✅ Works | Login in host, verify in remote |
| Protected Routes | ✅ Works | Access protected route, verify redirect |
| Error Handling | ✅ Works | Test invalid credentials |
| CI/CD Integration | ✅ Works | Verify builds pass |
| Cost | $0/month | Monitor Firebase console |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Firebase SDK version conflicts** | Lock exact versions, test thoroughly |
| **Google Sign-In on iOS requires Apple Developer account** | Defer iOS Google Sign-In until account acquired |
| **GitHub OAuth redirect issues on mobile** | Use in-app browser for better UX |
| **Token expiration during offline use** | Implement token refresh on app foreground |
| **Rate limiting by Firebase** | Add exponential backoff, user-friendly messages |

---

## Dependencies

### External Services Required
1. ✅ Firebase Project (already created: `universal-mfe`)
2. 🔲 GitHub OAuth App (needs creation)
3. 🔲 Google Cloud Console (Web Client ID for Google Sign-In)

### Packages to Install

**Mobile:**
- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-google-signin/google-signin`
- `@react-native-async-storage/async-storage`

**Web:**
- `firebase`

**Shared:**
- (no new packages, uses existing zustand)

---

## Notes

### Apple Sign-In Requirement

When submitting to Apple App Store, if you offer social login (Google, Facebook, etc.), you **must** also offer "Sign in with Apple". This is not implemented in this plan as it requires:
1. Apple Developer Account ($99/year)
2. App Store submission

Add Apple Sign-In in Phase 9 when ready for App Store submission.

### Security Considerations

1. **Never store raw passwords** - Firebase handles password hashing
2. **Use Security Rules** - Validate all Firestore/RTDB access server-side
3. **Token rotation** - Firebase tokens auto-refresh; implement foreground refresh
4. **Secure storage** - Use platform-native secure storage (Keychain/Keystore)
5. **HTTPS only** - All Firebase communication is HTTPS

---

## References

### Official Documentation
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [@react-native-firebase/auth](https://rnfirebase.io/auth/usage)
- [@react-native-google-signin](https://github.com/react-native-google-signin/google-signin)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)

### Project Documentation
- [PATTERNS-STATE-MANAGEMENT.md](./PATTERNS-STATE-MANAGEMENT.md)
- [PATTERNS-EVENT-BUS.md](./PATTERNS-EVENT-BUS.md)
- [CI-CD-IMPLEMENTATION-PLAN.md](./CI-CD-IMPLEMENTATION-PLAN.md)

---

**Document End**

*This document should be reviewed and updated as implementation progresses.*
