# Firebase Authentication Implementation Plan

**Status:** Phase 4 Complete - Ready for Phase 5
**Last Updated:** 2026-01-28
**Version:** 1.5 (Phase 1, 2, 3 & 4 completed with comprehensive documentation)
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

- [x] **Firebase Project Created** (Task 6.5 - already done: `universal-mfe`)
  - [x] Project ID: `universal-mfe`
  - [x] Web app registered
  - [x] Android app registered (`com.mobilehosttmp`)
  - [x] iOS app registered (`com.universal.mobilehost`)

- [x] **Authentication Providers Enabled**
  - [x] Email/Password provider enabled
  - [x] Google provider enabled
  - [x] GitHub provider enabled (requires GitHub OAuth app)

- [x] **GitHub OAuth App Created**
  - [x] Go to: GitHub → Settings → Developer settings → OAuth Apps → New
  - [x] Application name: `Universal MFE Auth`
  - [x] Homepage URL: `https://universal-mfe.web.app`
  - [x] Authorization callback URL: From Firebase Console
  - [x] Note Client ID and Client Secret for Firebase

### Configuration Files Required

| File | Platform | Location | Status |
|------|----------|----------|--------|
| `google-services.json` | Android | `packages/mobile-host/android/app/` | ✅ Added |
| `GoogleService-Info.plist` | iOS | `packages/mobile-host/ios/` | ✅ Added |
| Firebase config object | Web | `.env` (root) | ✅ Added |

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

## Phase 1: Foundation & Storage Abstraction ✅ COMPLETED

**Objective:** Create the cross-platform storage abstraction needed for auth persistence.

**Status:** ✅ Completed on 2026-01-28

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

- [x] `yarn build:shared` passes (10/10 packages)
- [x] `yarn typecheck` passes (23/23 tasks)
- [ ] Storage abstraction works on web (test with simple setJSON/getJSON)
- [ ] Storage abstraction works on mobile (test with simple setJSON/getJSON)

---

## Phase 2: Recreate shared-auth-store Source Files ✅ COMPLETED

**Objective:** Recreate the missing source files for `shared-auth-store` with Firebase integration points.

**Status:** ✅ Completed on 2026-01-28

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

- [x] `yarn workspace @universal/shared-auth-store build` passes
- [x] `yarn typecheck` passes
- [x] Types are correctly exported
- [ ] Store can be imported in hosts (pending integration)

---

## Phase 3: Firebase SDK Integration (Mobile) ✅ COMPLETED

**Objective:** Implement Firebase Authentication for React Native (Android + iOS).

**Status:** ✅ Completed on 2026-01-28

**Duration:** ~8 hours

### Summary

Phase 3 integrates the Firebase Authentication SDK into the React Native mobile host app, enabling native authentication flows for both Android and iOS. This phase focuses on the native SDK integration only - UI components with sign-in buttons will be implemented in Phase 5.

### What Was Implemented

1. **Firebase Auth Service** (`packages/mobile-host/src/services/firebaseAuthService.ts`)
   - Implements the `AuthService` interface from `shared-auth-store`
   - Supports email/password, Google Sign-In, and GitHub OAuth
   - Maps Firebase user objects to our unified `User` type

2. **Auth Store Integration** (`packages/mobile-host/src/App.tsx`)
   - Configures storage, auth service, and event emitter in `useEffect`
   - Initializes auth listener via `initializeAuth()`
   - Emits auth events to the event bus for cross-MFE sync

3. **Native Configuration**
   - Android: `google-services.json`, Gradle configuration
   - iOS: `GoogleService-Info.plist`, Podfile configuration, AppDelegate changes

### Issues Encountered and Fixes Applied

#### Issue 1: PatchMFConsolePlugin Platform.OS Polyfill (Android & iOS)

**Problem:** The bundler was crashing with errors related to `Platform.OS` being undefined in debug builds.

**Root Cause:** The `PatchMFConsolePlugin` (used to polyfill `console` for Hermes + Module Federation) also generates a `Platform.constants` polyfill. This requires the `PLATFORM` environment variable to be set at bundler startup to determine the correct `Platform.OS` value (`'android'` or `'ios'`).

**Fix:** Updated `packages/mobile-host/package.json` bundler scripts:
```json
{
  "start:bundler:android": "yarn kill:bundler:android && PLATFORM=android react-native start --platform android --port 8081",
  "start:bundler:ios": "yarn kill:bundler:ios && PLATFORM=ios react-native start --platform ios --port 8082"
}
```

**Commit:** `5ef33b8` - fix(mobile): resolve iOS and Android build issues for Firebase Auth

---

#### Issue 2: Firebase Auth Initialization Order (Mobile)

**Problem:** Auth service was being configured at module load time, before React Native runtime was fully initialized, causing `AsyncStorage` and Firebase native modules to fail.

**Root Cause:** The original code called `configureStorage()` and `configureAuthService()` at the top level of `App.tsx`, outside of React lifecycle.

**Fix:** Moved all configuration inside a `useEffect` hook in the `AuthInitializer` component:
```typescript
function AuthInitializer() {
  const isConfigured = useRef(false);

  useEffect(() => {
    if (!isConfigured.current) {
      // Configure storage with AsyncStorage
      if (!isStorageConfigured()) {
        configureStorage(createMobileStorage(AsyncStorage));
      }
      // Configure auth service with Firebase
      configureAuthService(firebaseAuthService);
      // Configure event emitter for cross-MFE auth sync
      configureAuthEventEmitter((type, payload) => {
        bus.emit<AuthEvents>(eventType, payload);
      });
      isConfigured.current = true;
    }
    // Initialize auth...
  }, []);
}
```

**Commit:** `5dae160` - fix(mobile-host): defer storage and auth config to useEffect

---

#### Issue 3: iOS Build Failure - FirebaseAuth-Swift.h Not Found

**Problem:** iOS build failed with error:
```
error: 'FirebaseAuth/FirebaseAuth-Swift.h' file not found
```

**Root Cause:** Firebase Auth is a Swift pod that requires framework-based builds for Swift interop. However, using `use_frameworks!` globally breaks React Native 0.80 + New Architecture due to "Multiple commands produce" header conflicts.

**Attempted Solutions That Failed:**
1. Adding modular headers for Firebase pods only → Still got Swift.h not found
2. Using `use_frameworks! :linkage => :static` → "Multiple commands produce" header errors from React Native
3. Using `use_modular_headers!` globally → Module redefinition errors
4. `BUILD_LIBRARY_FOR_DISTRIBUTION = YES` → Same duplicate headers error

**Final Solution:** Selective dynamic frameworks using `pre_install` hook. This makes Firebase pods build as dynamic frameworks (for Swift interop) while keeping React Native pods as static libraries.

```ruby
# packages/mobile-host/ios/Podfile

# Firebase configuration for React Native 0.80 + New Architecture
$RNFirebaseAsStaticFramework = true

# Modular headers for Firebase Swift pod dependencies
pod 'FirebaseAuthInterop', :modular_headers => true
pod 'FirebaseAppCheckInterop', :modular_headers => true
pod 'FirebaseCoreInternal', :modular_headers => true
pod 'GoogleUtilities', :modular_headers => true
pod 'RecaptchaInterop', :modular_headers => true

# Force Firebase and its dependencies to build as dynamic frameworks for Swift interop
# while keeping React Native pods as static libraries
pre_install do |installer|
  installer.pod_targets.each do |pod|
    firebase_related = ['Firebase', 'Google', 'GTMSessionFetcher', 'GTMAppAuth',
                        'AppAuth', 'AppCheckCore', 'PromisesObjC', 'RecaptchaInterop']
    if firebase_related.any? { |prefix| pod.name.start_with?(prefix) }
      def pod.build_type
        Pod::BuildType.dynamic_framework
      end
    end
  end
end
```

**Commit:** `5ef33b8` - fix(mobile): resolve iOS and Android build issues for Firebase Auth

---

#### Issue 4: GoogleService-Info.plist Not Found in App Bundle

**Problem:** After iOS build succeeded, the app showed a red error screen:
```
RNGoogleSignin: failed to determine clientID - GoogleService-Info.plist was not found and iosClientId was not provided.
```

**Root Cause:** The `GoogleService-Info.plist` file existed in the `ios/` directory but was not added to the Xcode project. It needed to be:
1. Added as a file reference in the project
2. Added to the MobileHostTmp group
3. Added to the Resources build phase

**Fix:** Manually added the file to `project.pbxproj`:
```
// PBXFileReference section
A1B2C3D4E5F607890A1B2C3E /* GoogleService-Info.plist */ = {isa = PBXFileReference; ...};

// PBXGroup children
A1B2C3D4E5F607890A1B2C3E /* GoogleService-Info.plist */,

// PBXResourcesBuildPhase files
A1B2C3D4E5F607890A1B2C3D /* GoogleService-Info.plist in Resources */,
```

**Commit:** `6a06c46` - fix(ios): add GoogleService-Info.plist to Xcode project and initialize Firebase

---

#### Issue 5: Firebase Not Initialized on iOS

**Problem:** Even after adding the plist, the app showed:
```
[MobileHost] Auth initialization failed: [Error: No Firebase App '[DEFAULT]' has been created - call firebase.initializeApp()]
```

**Root Cause:** Firebase on iOS requires explicit initialization in the AppDelegate before React Native starts. The `FirebaseApp.configure()` call was missing.

**Fix:** Updated `packages/mobile-host/ios/MobileHostTmp/AppDelegate.swift`:
```swift
import FirebaseCore

func application(
  _ application: UIApplication,
  didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
) -> Bool {
  // Initialize Firebase before React Native starts
  FirebaseApp.configure()

  let delegate = ReactNativeDelegate()
  // ... rest of initialization
}
```

**Commit:** `6a06c46` - fix(ios): add GoogleService-Info.plist to Xcode project and initialize Firebase

---

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

2. **Add to iOS project** (CRITICAL - must be in Xcode project, not just filesystem):
   - Place at `packages/mobile-host/ios/GoogleService-Info.plist`
   - Open Xcode workspace: `packages/mobile-host/ios/MobileHostTmp.xcworkspace`
   - Drag `GoogleService-Info.plist` into the MobileHostTmp group in the Project Navigator
   - Ensure "Copy items if needed" is checked
   - Ensure "Add to targets: MobileHostTmp" is checked
   - Verify it appears in Build Phases → Copy Bundle Resources

3. **Initialize Firebase in AppDelegate** (CRITICAL):
   ```swift
   // packages/mobile-host/ios/MobileHostTmp/AppDelegate.swift
   import FirebaseCore

   func application(...) -> Bool {
     FirebaseApp.configure()  // MUST be before React Native initialization
     // ...
   }
   ```

4. **Configure Podfile for Firebase + React Native 0.80**:
   - Use selective dynamic frameworks (see Issue 3 fix above)
   - Add modular headers for Firebase Swift dependencies
   - Run `pod install` after changes

5. **Configure URL Schemes** for Google Sign-In:
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

- [x] Dependencies installed (`@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-google-signin/google-signin`, `@react-native-async-storage/async-storage`)
- [x] iOS URL schemes configured for Google Sign-In
- [x] iOS pods installed with Firebase modular headers
- [x] Android SHA-1 fingerprint generated (via `./gradlew signingReport`)
- [x] Mobile Firebase Auth Service created (`packages/mobile-host/src/services/firebaseAuthService.ts`)
- [x] Auth initialized in Mobile Host (`App.tsx`)
- [x] `yarn typecheck` passes
- [x] Firebase app initializes without errors on Android
- [x] Firebase app initializes without errors on iOS
- [x] App loads and existing functionality works on both platforms
- [x] **Manual**: SHA-1 fingerprint added to Firebase Console
- [x] **Manual**: Updated `google-services.json` downloaded and placed in `android/app/`
- [ ] **Manual**: Email sign-in works on both platforms (requires Phase 5 UI)
- [ ] **Manual**: Google sign-in works on both platforms (requires Phase 5 UI)

---

### Firebase Console Manual Setup Steps

These steps must be completed in the Firebase Console before Google Sign-In will work.

#### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **universal-mfe**

#### Step 2: Add Android SHA-1 Fingerprint (REQUIRED for Google Sign-In on Android)

Google Sign-In requires the SHA-1 fingerprint of the signing certificate to verify the app's identity.

1. **Get your debug SHA-1 fingerprint:**
   ```bash
   cd packages/mobile-host/android
   ./gradlew signingReport
   ```
   Look for the `SHA1:` line under `Variant: debug`. The output will look like:
   ```
   SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
   ```
   Copy this value for the next step.

2. **Add to Firebase Console:**
   - Go to **Project Settings** (gear icon) → **General**
   - Scroll to **Your apps** → **Android apps**
   - Click on your Android app (`com.mobilehosttmp`)
   - Click **Add fingerprint**
   - Paste the SHA-1 fingerprint
   - Click **Save**

3. **Download updated google-services.json:**
   - After adding the fingerprint, click **Download google-services.json**
   - Replace `packages/mobile-host/android/app/google-services.json`

#### Step 3: Configure Google Sign-In in Google Cloud Console

1. **Access Google Cloud Console:**
   - From Firebase Console → Project Settings → General
   - Click the link to **Google Cloud Console** for your project

2. **Enable APIs:**
   - Go to **APIs & Services** → **Enabled APIs & services**
   - Ensure **Google Sign-In API** is enabled
   - If not, click **+ ENABLE APIS AND SERVICES** and search for "Google Sign-In"

3. **Configure OAuth Consent Screen** (if not already done):
   - Go to **APIs & Services** → **OAuth consent screen**
   - Select **External** (for testing) or **Internal** (for organization)
   - Fill in required fields:
     - App name: `Universal MFE`
     - User support email: Your email
     - Developer contact email: Your email
   - Click **Save and Continue**
   - Skip Scopes (defaults are fine for auth)
   - Add test users if using External (your email)
   - Click **Save**

4. **Note your Web Client ID:**
   - Go to **APIs & Services** → **Credentials**
   - Find the **Web client (auto created by Google Service)** OAuth 2.0 Client ID
   - Copy this ID - it's needed for the mobile Google Sign-In configuration
   - Format: `XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`

#### Step 4: Update Mobile Firebase Auth Service with Web Client ID

1. **Update `packages/mobile-host/src/services/firebaseAuthService.ts`:**
   ```typescript
   GoogleSignin.configure({
     webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // From Step 3.4
     offlineAccess: true,
   });
   ```

2. **Alternatively, use environment variable** (recommended):
   - Set `GOOGLE_WEB_CLIENT_ID` in your environment
   - The code already checks for this: `process.env.GOOGLE_WEB_CLIENT_ID`

#### Step 5: Configure iOS URL Scheme (REQUIRED for Google Sign-In on iOS)

1. **Get REVERSED_CLIENT_ID:**
   - Open `packages/mobile-host/ios/GoogleService-Info.plist`
   - Find the `REVERSED_CLIENT_ID` value
   - Format: `com.googleusercontent.apps.XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

2. **Add URL Scheme in Xcode:**
   - Open `packages/mobile-host/ios/MobileHostTmp.xcworkspace` in Xcode
   - Select the **MobileHostTmp** project in the navigator
   - Select the **MobileHostTmp** target
   - Go to **Info** tab → **URL Types**
   - Click **+** to add a new URL type
   - Set **URL Schemes** to your `REVERSED_CLIENT_ID`
   - Leave other fields empty or set Identifier to `google-signin`

3. **Alternative: Edit Info.plist directly:**
   ```xml
   <!-- packages/mobile-host/ios/MobileHostTmp/Info.plist -->
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
       </array>
     </dict>
   </array>
   ```

#### Step 6: Enable GitHub Authentication (Optional)

1. **Create GitHub OAuth App:**
   - Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
   - Application name: `Universal MFE Auth`
   - Homepage URL: `https://universal-mfe.web.app`
   - Authorization callback URL: Get from Firebase Console (see below)

2. **Get callback URL from Firebase:**
   - Go to Firebase Console → Authentication → Sign-in method → GitHub
   - Copy the **Authorization callback URL** (format: `https://universal-mfe.firebaseapp.com/__/auth/handler`)
   - Use this as the callback URL in your GitHub OAuth App

3. **Add GitHub credentials to Firebase:**
   - In Firebase Console → Authentication → Sign-in method → GitHub
   - Click **Enable**
   - Enter the **Client ID** and **Client Secret** from your GitHub OAuth App
   - Click **Save**

#### Step 7: Verify Configuration

Run these checks to verify your setup:

1. **Android:**
   ```bash
   cd packages/mobile-host
   yarn start:bundler:android  # In terminal 1
   yarn android                 # In terminal 2
   ```
   - App should start without Firebase errors
   - Check Metro bundler output for any auth-related errors

2. **iOS:**
   ```bash
   cd packages/mobile-host
   yarn start:bundler:ios  # In terminal 1
   yarn ios                # In terminal 2
   ```
   - App should start without Firebase errors
   - Check Xcode console for any auth-related errors

3. **Test Auth State Listener:**
   - The app should show "[MobileHost] Auth initialization successful" or similar in logs
   - No more "No Firebase App '[DEFAULT]' has been created" errors

### Current State After Phase 3

| Component | Status | Notes |
|-----------|--------|-------|
| Firebase SDK (Android) | ✅ Integrated | App runs without errors |
| Firebase SDK (iOS) | ✅ Integrated | App runs without errors |
| Auth State Listener | ✅ Working | Listens for auth changes |
| Storage Abstraction | ✅ Working | AsyncStorage configured |
| Event Bus Integration | ✅ Working | Emits auth events |
| Google Sign-In (Android) | ⏳ Pending | Needs SHA-1 in Firebase Console + UI |
| Google Sign-In (iOS) | ⏳ Pending | Needs URL scheme + UI |
| Sign-In UI | ⏳ Phase 5 | Buttons not yet implemented |

### What's Next

Phase 4 will implement the same Firebase Auth integration for the web platform (`web-shell`), and Phase 5 will create the universal sign-in UI components that will trigger the authentication flows.

---

## Phase 4: Firebase SDK Integration (Web) ✅ COMPLETED

**Objective:** Implement Firebase Authentication for Web using modular Firebase SDK.

**Status:** ✅ Completed on 2026-01-28

**Duration:** ~4 hours

### Summary

Phase 4 integrates the Firebase Authentication SDK into the web shell app using the modular Firebase JS SDK (v11.7.0). This phase implements the same `AuthService` interface as the mobile implementation, enabling consistent auth flows across platforms.

### What Was Implemented

1. **Firebase Configuration** (`packages/web-shell/src/config/firebase.ts`)
   - Firebase app initialization with environment variable support
   - Uses `process.env` for configuration (injected via Rspack DefinePlugin)
   - Hardcoded fallback values for development convenience

2. **Firebase Auth Service** (`packages/web-shell/src/services/firebaseAuthService.ts`)
   - Implements the `AuthService` interface from `shared-auth-store`
   - Supports email/password, Google Sign-In (popup), and GitHub Sign-In (popup)
   - Maps Firebase user objects to our unified `User` type

3. **Auth Store Integration** (`packages/web-shell/src/App.tsx`)
   - `AuthInitializer` component configures storage, auth service, and event emitter in `useEffect`
   - Uses `createWebStorage(window.localStorage)` for persistence
   - Emits auth events to the event bus for cross-MFE sync

4. **Rspack Configuration** (`packages/web-shell/rspack.config.mjs`)
   - Added `DefinePlugin` to inject environment variables at build time
   - Firebase config can be overridden via environment variables

5. **Environment Variables** (`packages/web-shell/.env.example`)
   - Template for Firebase configuration
   - Uses `FIREBASE_*` prefix (not `VITE_*` since this uses Rspack)

### Task 4.1: Install Firebase Web SDK

```bash
# Added to packages/web-shell/package.json:
# - firebase: 11.7.0
# - @universal/shared-auth-store: "*"
# - @universal/shared-utils: "*"
yarn install
```

### Task 4.2: Create Firebase Configuration

**Create** `packages/web-shell/src/config/firebase.ts`:

```typescript
/**
 * Firebase Configuration for Web
 *
 * These are public API keys - they are safe to commit.
 * Security is enforced through Firebase Security Rules.
 *
 * Note: Rspack uses process.env, not import.meta.env like Vite.
 * The DefinePlugin in rspack.config.mjs handles the replacement.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Firebase configuration from environment variables
// Falls back to hardcoded values for development (these are public API keys)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyAA2fGYduWsdwXXXDP7KKrIkcaDg3UuS1Q',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'universal-mfe.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'universal-mfe',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'universal-mfe.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '489294318656',
  appId: process.env.FIREBASE_APP_ID || '1:489294318656:web:222b01b55cadc1a0a8a3a5',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-PM1CXVNBED',
};

// Initialize Firebase (only once)
let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);

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
# Firebase Configuration for Web Shell
#
# Copy this file to .env and fill in your Firebase project credentials.
# These values can be found in your Firebase Console:
# Project Settings -> General -> Your apps -> Web app
#
# Note: Firebase config values are public API keys - they are safe to expose.
# Security is enforced through Firebase Security Rules.

# Required Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Optional
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Task 4.6: Update Rspack Configuration

**Update** `packages/web-shell/rspack.config.mjs` to inject environment variables:

```javascript
const { DefinePlugin } = rspack;

// Firebase configuration from environment variables
const firebaseConfig = {
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || '',
};

// In plugins array:
new DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  'process.env.FIREBASE_API_KEY': JSON.stringify(firebaseConfig.FIREBASE_API_KEY),
  'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseConfig.FIREBASE_AUTH_DOMAIN),
  'process.env.FIREBASE_PROJECT_ID': JSON.stringify(firebaseConfig.FIREBASE_PROJECT_ID),
  'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(firebaseConfig.FIREBASE_STORAGE_BUCKET),
  'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(firebaseConfig.FIREBASE_MESSAGING_SENDER_ID),
  'process.env.FIREBASE_APP_ID': JSON.stringify(firebaseConfig.FIREBASE_APP_ID),
  'process.env.FIREBASE_MEASUREMENT_ID': JSON.stringify(firebaseConfig.FIREBASE_MEASUREMENT_ID),
}),
```

### Verification Steps

- [x] Firebase initializes without errors on web (confirmed - dev server starts, no Firebase errors)
- [x] TypeScript types pass (`yarn workspace @universal/web-shell typecheck` - success)
- [x] Build succeeds (`yarn workspace @universal/web-shell build` - success with expected warnings)
- [ ] Email sign-in works (requires UI - Phase 5)
- [ ] Email sign-up works (requires UI - Phase 5)
- [ ] Google sign-in popup works (requires UI - Phase 5)
- [ ] GitHub sign-in popup works (requires UI - Phase 5)
- [ ] Sign-out works (requires UI - Phase 5)
- [ ] Auth state persists across page refreshes (requires UI - Phase 5)
- [ ] Event bus receives USER_LOGGED_IN events (requires UI - Phase 5)

### Key Differences from Implementation Plan

1. **Environment Variables**: Uses `process.env.FIREBASE_*` instead of `import.meta.env.VITE_*` since Rspack uses DefinePlugin, not Vite
2. **Auth Initialization**: Done in `App.tsx` via `AuthInitializer` component (not `index.tsx`) to ensure React lifecycle is ready
3. **Firebase SDK Version**: Uses v11.7.0 (latest stable) instead of generic v9+
4. **web-remote-hello**: Firebase not added to remote - remotes inherit auth state from host via event bus

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
  # Note: Uses FIREBASE_* prefix (not VITE_*) since web-shell uses Rspack's DefinePlugin
  FIREBASE_API_KEY: ${{ secrets.FIREBASE_WEB_API_KEY }}
  FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_WEB_AUTH_DOMAIN }}
  FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_WEB_PROJECT_ID }}
  FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_WEB_STORAGE_BUCKET }}
  FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_WEB_MESSAGING_SENDER_ID }}
  FIREBASE_APP_ID: ${{ secrets.FIREBASE_WEB_APP_ID }}
  FIREBASE_MEASUREMENT_ID: ${{ secrets.FIREBASE_WEB_MEASUREMENT_ID }}
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
