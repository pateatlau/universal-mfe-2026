# ADR-007: Zustand for State Management

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

Microfrontend architectures need state management that:

1. **Minimal bundle size**: Each MFE bundles its dependencies
2. **Simple API**: Teams shouldn't need extensive training
3. **Cross-platform**: Works with React and React Native
4. **Flexible**: Support host-owned and MFE-owned state patterns
5. **Testable**: Easy to mock in unit tests

State categories in our architecture:
- **Host-owned**: Auth, theme, locale (shared across MFEs)
- **MFE-owned**: Local UI state (scoped to single MFE)
- **Server state**: API data (handled separately by React Query)

## Decision

**Use Zustand v5.0.5** for client state management.

Pattern implementation:
- Global stores for host-owned state (auth, theme)
- Selector hooks for optimized subscriptions
- Dependency injection for service abstraction
- Cross-platform storage via abstraction layer

```typescript
// Zustand store pattern
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  signIn: async (email, password) => {
    set({ isLoading: true });
    const user = await authService.signIn(email, password);
    set({ user, isLoading: false });
  },
}));

// Selector hook for performance
export const useUser = () => useAuthStore((state) => state.user);
```

## Consequences

### Positive

1. **~2KB bundle**: Minimal impact on MFE bundle sizes
2. **Zero boilerplate**: No actions, reducers, dispatchers
3. **Direct mutations**: Intuitive state updates
4. **Automatic memoization**: Selectors prevent re-renders
5. **TypeScript native**: Excellent type inference
6. **Middleware support**: Devtools, persist, immer available
7. **React 18+ ready**: Concurrent rendering compatible

### Negative

1. **Less structure**: No enforced patterns like Redux
2. **Smaller ecosystem**: Fewer middleware than Redux
3. **Team familiarity**: May need training if Redux-experienced
4. **Global singleton**: Shared stores need careful design

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| State sync issues | Medium | Medium | Event bus for cross-MFE sync |
| Memory leaks | Low | Medium | Proper subscription cleanup |
| Testing complexity | Low | Low | Zustand test utilities available |

## Alternatives Considered

### Alternative 1: Redux Toolkit

**Description**: Industry standard with extensive ecosystem.

**Rejected because**:
- ~10KB+ bundle size (5x larger than Zustand)
- Boilerplate overhead (slices, actions, reducers)
- Overkill for MFE-scoped state
- Complexity not justified for our needs

### Alternative 2: Jotai

**Description**: Atomic state management, primitive-based.

**Rejected because**:
- Atomic model less intuitive for object-based state
- Less established than Zustand
- Similar benefits but less team familiarity
- Zustand better for larger state objects

### Alternative 3: Recoil

**Description**: Meta's atomic state management.

**Rejected because**:
- Larger bundle size
- React-specific (no React Native Web edge cases)
- Less active development
- Complex atom/selector model

### Alternative 4: Context + useReducer

**Description**: Built-in React state management.

**Rejected because**:
- Re-renders all consumers on any change
- No built-in selector optimization
- More boilerplate than Zustand
- Worse performance for frequent updates

## Implementation Patterns

### Selector Optimization

```typescript
// Bad: subscribes to entire store
const { user, isLoading } = useAuthStore();

// Good: subscribes only to user
const user = useAuthStore((state) => state.user);
const isLoading = useAuthStore((state) => state.isLoading);
```

### Dependency Injection

```typescript
// Store doesn't import Firebase directly
let authService: AuthService;

export const configureAuthService = (service: AuthService) => {
  authService = service;
};

// Host configures the service
configureAuthService(new FirebaseAuthService(firebaseApp));
```

### Cross-Platform Storage

```typescript
// Storage abstraction
const storage = Platform.select({
  web: () => localStorage,
  default: () => AsyncStorage,
})();

// Used in store
persist(store, {
  name: '@universal/auth',
  storage: createJSONStorage(() => storage),
});
```

## References

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand vs Redux Comparison](https://docs.pmnd.rs/zustand/getting-started/comparison)
