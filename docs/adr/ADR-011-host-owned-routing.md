# ADR-011: Host-Owned Routing Model

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

Microfrontend architectures must handle routing carefully:

1. **URL ownership**: Who defines what routes exist?
2. **Navigation**: How do MFEs navigate to other routes?
3. **Deep linking**: How are external links handled?
4. **History**: Who manages browser/app history?

Routing models:
- **Host-owned**: Host defines all routes, MFEs are URL-agnostic
- **MFE-owned**: Each MFE defines its own routes
- **Hybrid**: Host owns top-level, MFEs own sub-routes

## Decision

**Implement host-owned routing** where:

1. **Host defines all routes** and their URL mappings
2. **MFEs are URL-agnostic** (don't know their URLs)
3. **Navigation via event bus** (MFEs request, host executes)
4. **Route constants shared** via `shared-router` package

```typescript
// Host route definition
const routes = [
  { path: '/', element: <Home /> },
  { path: '/hello', element: <RemoteHello /> },
  { path: '/settings', element: <Settings />, protected: true },
  { path: '/login', element: <Login /> },
];

// MFE navigation request (doesn't know URL)
eventBus.emit({
  type: 'NAVIGATE_TO',
  payload: { route: RouteNames.SETTINGS },
});

// Host handles navigation
useEventListener('NAVIGATE_TO', ({ payload }) => {
  navigate(getPathForRoute(payload.route));
});
```

## Consequences

### Positive

1. **Single source of truth**: All routes in one place
2. **MFE independence**: MFEs don't hardcode URLs
3. **Easy refactoring**: Change URLs without touching MFEs
4. **Auth guards centralized**: Protected routes in host
5. **Deep linking controlled**: Host manages URL → route mapping
6. **Analytics**: Navigation tracking in one place

### Negative

1. **Host bottleneck**: Route changes require host update
2. **Indirection**: MFEs can't directly navigate
3. **Event overhead**: Navigation is async (event → handler → navigate)
4. **Limited MFE autonomy**: MFEs can't define their own routes

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Host becomes bottleneck | Medium | Medium | Clear ownership; fast PR reviews for route changes |
| Navigation latency | Low | Low | Event bus is synchronous; minimal overhead |
| Route constant drift | Low | Medium | Type-safe constants; compile-time checks |

## Alternatives Considered

### Alternative 1: MFE-Owned Routing

**Description**: Each MFE defines and owns its routes.

**Rejected because**:
- URL conflicts between MFEs
- No centralized auth guards
- Deep linking becomes complex
- Analytics tracking fragmented
- Hard to maintain URL consistency

### Alternative 2: Hybrid Routing

**Description**: Host owns top-level, MFEs own sub-routes.

**Rejected because**:
- Complexity of ownership boundaries
- Potential for MFE route conflicts
- Auth guards must be duplicated
- Deep linking split between host and MFE

### Alternative 3: URL-Based MFE Loading

**Description**: URL patterns determine which MFE loads.

**Rejected because**:
- Couples MFEs to URL structure
- Hard to reorganize routes
- MFE boundaries visible in URLs
- Less flexible than explicit routes

## Route Constants

Shared route names prevent magic strings:

```typescript
// packages/shared-router/src/routes.ts
export const RouteNames = {
  HOME: 'home',
  REMOTE_HELLO: 'remote-hello',
  SETTINGS: 'settings',
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOT_PASSWORD: 'forgot-password',
} as const;

export type RouteName = typeof RouteNames[keyof typeof RouteNames];
```

## Navigation Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    MFE      │     │  Event Bus  │     │    Host     │
│             │     │             │     │             │
│  Button     │────▶│ NAVIGATE_TO │────▶│  Router     │
│  clicked    │     │ { route }   │     │  navigate() │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  URL Change │
                                        │  /settings  │
                                        └─────────────┘
```

## Protected Routes

Host handles authentication guards:

```typescript
// Host route configuration
const routes = [
  {
    path: '/settings',
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
  },
];

// ProtectedRoute component
function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    eventBus.emit({
      type: 'NAVIGATE_TO',
      payload: { route: RouteNames.LOGIN },
    });
    return null;
  }

  return children;
}
```

## Implementation

Web: React Router 6.x
Mobile: React Navigation (via React Router Native)

Location: `packages/shared-router/`

## References

- [React Router Documentation](https://reactrouter.com/)
- [Microfrontend Routing Patterns](https://micro-frontends.org/)
