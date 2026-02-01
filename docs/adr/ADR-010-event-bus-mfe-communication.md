# ADR-010: Event Bus for Inter-MFE Communication

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

Microfrontends need to communicate without tight coupling:

1. **Auth changes**: MFEs need to know when user logs in/out
2. **Theme changes**: All MFEs must update when theme toggles
3. **Navigation requests**: MFEs request navigation without knowing routes
4. **Custom events**: Feature-specific cross-MFE communication

Coupling concerns:
- Direct imports between MFEs create deployment dependencies
- Shared state via context couples lifecycles
- Props drilling doesn't scale across MFE boundaries

## Decision

**Implement a type-safe event bus** for inter-MFE communication.

Architecture:
- Global singleton bus accessible from any MFE
- Discriminated union types for event payloads
- Publish/subscribe pattern with automatic cleanup
- Event categories for organization

```typescript
// Event definition
interface ThemeChangedEvent {
  type: 'THEME_CHANGED';
  payload: { theme: 'light' | 'dark' };
}

// Publishing
eventBus.emit({
  type: 'THEME_CHANGED',
  payload: { theme: 'dark' },
});

// Subscribing
useEventListener('THEME_CHANGED', (event) => {
  console.log('Theme changed to:', event.payload.theme);
});
```

## Consequences

### Positive

1. **Loose coupling**: MFEs communicate without imports
2. **Type safety**: Full TypeScript support for events
3. **Testability**: Events are easily mockable
4. **Debugging**: Event history and logging available
5. **Scalability**: Add new events without changing existing code
6. **Cleanup**: Automatic unsubscription on component unmount

### Negative

1. **Indirection**: Harder to trace event flow than direct calls
2. **No guaranteed delivery**: Fire-and-forget model
3. **Potential event explosion**: Too many event types
4. **Global state**: Bus is a singleton (hard to isolate in tests)

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Event naming conflicts | Low | Medium | Namespaced event types; TypeScript unions |
| Memory leaks | Medium | Medium | Automatic cleanup; useEffect unsubscribe |
| Event storms | Low | Medium | Rate limiting; debounce handlers |
| Debugging difficulty | Medium | Low | Event history; debug logging mode |

## Alternatives Considered

### Alternative 1: Shared Context

**Description**: Use React Context for shared state across MFEs.

**Rejected because**:
- Context doesn't cross MFE bundle boundaries
- Creates tight coupling via provider hierarchy
- Re-renders propagate to all consumers
- Not suitable for event-driven communication

### Alternative 2: Window Custom Events

**Description**: Use browser CustomEvent API.

**Rejected because**:
- No type safety
- Web-only (no React Native support)
- No automatic cleanup
- Harder to debug

### Alternative 3: Redux Shared Store

**Description**: Single Redux store shared across MFEs.

**Rejected because**:
- Heavy coupling to Redux
- Action types must be globally unique
- Store shape becomes unwieldy
- MFE independence compromised

### Alternative 4: PostMessage (iframe)

**Description**: Use postMessage for iframe-based MFEs.

**Rejected because**:
- We don't use iframes
- Serialization overhead
- No type safety
- Complex origin validation

## Event Categories

| Category | Events | Owner |
|----------|--------|-------|
| **Navigation** | NAVIGATE_TO, NAVIGATE_BACK, NAVIGATION_COMPLETED | Host |
| **Theme** | THEME_CHANGED, THEME_CHANGE_REQUEST | Host |
| **Locale** | LOCALE_CHANGED, LOCALE_CHANGE_REQUEST | Host |
| **Auth** | USER_LOGGED_IN, USER_LOGGED_OUT, SESSION_EXPIRED | Host |
| **Remote** | REMOTE_LOADING, REMOTE_LOADED, REMOTE_LOAD_FAILED | Host |
| **Interaction** | BUTTON_PRESSED, FORM_SUBMITTED, CUSTOM_ACTION | MFE |

## API Design

### Core Hooks

```typescript
// Subscribe to single event type
useEventListener('THEME_CHANGED', (event) => {
  // Handle theme change
});

// Subscribe once (auto-unsubscribe after first event)
useEventListenerOnce('USER_LOGGED_IN', (event) => {
  // Handle login once
});

// Subscribe to multiple event types
useEventListenerMultiple(['THEME_CHANGED', 'LOCALE_CHANGED'], (event) => {
  // Handle either event type
});

// Emit events
const emit = useEventEmitter();
emit({ type: 'NAVIGATE_TO', payload: { route: '/settings' } });
```

### Advanced Features

```typescript
// Priority-based handling
eventBus.on('AUTH_ERROR', handler, { priority: 10 });

// Event correlation
emit({
  type: 'NAVIGATE_TO',
  payload: { route: '/login' },
  correlationId: 'auth-flow-123',
});

// Event history (debugging)
const history = eventBus.getHistory();
const stats = eventBus.getStats();
```

## Implementation

Location: `packages/shared-event-bus/`

Key files:
- `EventBus.ts` - Core bus implementation
- `types.ts` - Event type definitions
- `hooks.ts` - React hooks for subscription
- `index.ts` - Public API exports

## References

- [Event-Driven Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)
- [Microfrontend Communication Patterns](https://micro-frontends.org/)
