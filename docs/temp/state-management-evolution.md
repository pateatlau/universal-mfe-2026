# State Management Evolution: POC-1 → POC-2

**Date:** 2026-01-XX  
**Status:** Architecture Decision

---

## Overview

State management strategy evolves from POC-1 to POC-2 to improve MFE decoupling and scalability.

---

## POC-1: Shared Zustand Stores (Acceptable for POC)

### Strategy

**Inter-MFE Communication:**
- ✅ Shared Zustand stores (e.g., `@universal/shared-auth-store`)
- ✅ MFEs import and use shared stores directly
- ⚠️ Creates coupling between MFEs

**Within-MFE State:**
- ✅ Zustand stores within single MFEs
- ✅ Component state with `useState`
- ✅ Form state with React Hook Form

**Server State:**
- ✅ TanStack Query for API data

### Example: POC-1 Shared Store

```typescript
// packages/shared-auth-store/src/index.ts
// Shared across all MFEs (shell, auth-mfe, payments-mfe)
import { create } from 'zustand';

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const user = await mockLogin(email, password);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
```

**Usage in MFEs:**

```typescript
// packages/web-remote-auth/src/SignIn.tsx
import { useAuthStore } from '@universal/shared-auth-store';

function SignIn() {
  const login = useAuthStore(state => state.login);
  // ...
}

// packages/web-remote-payments/src/PaymentsPage.tsx
import { useAuthStore } from '@universal/shared-auth-store';

function PaymentsPage() {
  const user = useAuthStore(state => state.user);
  // ...
}
```

### Pros

- ✅ Simple to implement
- ✅ Works immediately
- ✅ No additional infrastructure needed
- ✅ Acceptable for POC-1

### Cons

- ⚠️ Creates coupling between MFEs
- ⚠️ MFEs must know about shared stores
- ⚠️ Harder to test MFEs in isolation
- ⚠️ Not ideal for production at scale

---

## POC-2: Event Bus + MFE-Local Zustand (Decoupled)

### Strategy

**Inter-MFE Communication:**
- ✅ Event bus for communication between MFEs
- ✅ MFEs publish/subscribe to events
- ✅ No shared state dependencies

**Within-MFE State:**
- ✅ Zustand stores within single MFEs only
- ✅ Component state with `useState`
- ✅ Form state with React Hook Form

**Server State:**
- ✅ TanStack Query for API data

### Example: POC-2 Event Bus

```typescript
// packages/shared-event-bus/src/index.ts
class EventBus {
  private listeners: Map<string, Set<Function>> = new Map();

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}

export const EventBus = new EventBus();
```

### Example: POC-2 MFE-Local Store

```typescript
// packages/web-remote-auth/src/stores/useAuthStore.ts
// MFE-local store (not shared)
import { create } from 'zustand';
import { EventBus } from '@universal/shared-event-bus';

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email, password) => {
    const user = await mockLogin(email, password);
    set({ user, isAuthenticated: true });
    // Publish event for other MFEs
    EventBus.emit('auth:login', { user });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
    // Publish event for other MFEs
    EventBus.emit('auth:logout', {});
  },
}));
```

**Usage in MFEs:**

```typescript
// packages/web-remote-auth/src/SignIn.tsx
import { useAuthStore } from '../stores/useAuthStore'; // MFE-local

function SignIn() {
  const login = useAuthStore(state => state.login);
  // ...
}

// packages/web-remote-payments/src/PaymentsPage.tsx
import { EventBus } from '@universal/shared-event-bus';
import { useQueryClient } from '@tanstack/react-query';

function PaymentsPage() {
  const queryClient = useQueryClient();
  
  // Subscribe to auth events
  useEffect(() => {
    const handleAuthLogin = (data: { user: User }) => {
      // Refresh payments when user logs in
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    };

    EventBus.on('auth:login', handleAuthLogin);
    return () => EventBus.off('auth:login', handleAuthLogin);
  }, [queryClient]);
  
  // ...
}
```

### Pros

- ✅ Decouples MFEs (no shared state dependencies)
- ✅ Loose coupling (MFEs don't need to know about each other)
- ✅ Scalable (easy to add/remove MFEs)
- ✅ Testable (can mock event bus)
- ✅ Production-ready pattern

### Cons

- ⚠️ More complex setup
- ⚠️ Need to manage event subscriptions
- ⚠️ Need to document event contracts

---

## Migration Path: POC-1 → POC-2

### Step 1: Create Event Bus Package

```bash
# Create shared event bus package
mkdir -p packages/shared-event-bus/src
```

### Step 2: Implement Event Bus

```typescript
// packages/shared-event-bus/src/index.ts
// Implement EventBus class (see example above)
```

### Step 3: Migrate Auth Store

```typescript
// Move from shared-auth-store to web-remote-auth/stores/useAuthStore.ts
// Add EventBus.emit() calls for login/logout
```

### Step 4: Update MFEs to Use Event Bus

```typescript
// Update payments-mfe to subscribe to auth events
// Remove direct imports of shared-auth-store
```

### Step 5: Remove Shared Store Package

```bash
# Remove packages/shared-auth-store
# Update all imports
```

---

## State Management Summary

| State Type | POC-1 | POC-2 |
|------------|-------|-------|
| **Inter-MFE Communication** | Shared Zustand stores | Event bus |
| **Within-MFE State** | Zustand stores | Zustand stores (MFE-local) |
| **Server State** | TanStack Query | TanStack Query |
| **Component State** | useState | useState |
| **Form State** | React Hook Form | React Hook Form |

---

## Event Bus Event Contracts (POC-2)

### Auth Events

```typescript
// auth:login
EventBus.emit('auth:login', { user: User });

// auth:logout
EventBus.emit('auth:logout', {});

// auth:user-updated
EventBus.emit('auth:user-updated', { user: User });
```

### Payments Events

```typescript
// payments:created
EventBus.emit('payments:created', { payment: Payment });

// payments:updated
EventBus.emit('payments:updated', { payment: Payment });

// payments:deleted
EventBus.emit('payments:deleted', { paymentId: string });
```

### UI Events

```typescript
// ui:navigation
EventBus.emit('ui:navigation', { route: string });

// ui:modal-open
EventBus.emit('ui:modal-open', { modalId: string });

// ui:modal-close
EventBus.emit('ui:modal-close', { modalId: string });
```

---

## Benefits of Event Bus Approach

### 1. Decoupling

- MFEs don't need to know about each other
- No shared state dependencies
- Easy to add/remove MFEs

### 2. Scalability

- New MFEs can subscribe to existing events
- No need to modify existing MFEs
- Easy to extend event contracts

### 3. Testability

- Can mock event bus in tests
- Test MFEs in isolation
- Test event contracts separately

### 4. Production-Ready

- Industry standard pattern for microfrontends
- Used by major companies
- Well-documented and supported

---

## Recommendations

### POC-1

- ✅ Use shared Zustand stores for inter-MFE communication
- ✅ Keep it simple and functional
- ✅ Document the shared stores clearly

### POC-2

- ✅ Migrate to event bus for inter-MFE communication
- ✅ Move Zustand stores to MFE-local
- ✅ Document event contracts
- ✅ Add event bus tests

---

**Last Updated:** 2026-01-XX  
**Status:** Architecture Decision - POC-1 → POC-2 Evolution

