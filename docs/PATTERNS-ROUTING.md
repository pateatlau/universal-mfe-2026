# Routing Patterns

This document describes the routing architecture and ownership model in the Universal MFE Platform.

## Core Principle: Host-Owned Routing

The platform follows a strict **host-owned routing** pattern:

| Responsibility | Owner | Notes |
|----------------|-------|-------|
| Route definitions | Hosts only | Routes defined in App.tsx |
| Route IDs (semantic) | Shared | Constants in `shared-router` |
| URL mapping | Hosts only | Hosts decide URL structure |
| Navigation UI | Hosts | Links and navigation components |
| Remote loading | Hosts | Hosts load remotes at routes |
| Router imports | Hosts only | **Never** import routers in remotes |

## Route ID Abstraction

### Route Constants

```typescript
// packages/shared-router/src/routes.ts
export const Routes = {
  HOME: 'home',
  SETTINGS: 'settings',
  PROFILE: 'profile',
  REMOTE_HELLO: 'remote-hello',
  REMOTE_DETAIL: 'remote-detail',
} as const;

export type RouteId = (typeof Routes)[keyof typeof Routes];
```

### Route Metadata

```typescript
// packages/shared-router/src/routes.ts
export interface RouteMetadata {
  label: string;        // i18n key for display
  icon?: string;        // Icon identifier
  requiresAuth: boolean;
  showInNav: boolean;
  navOrder?: number;
}

export const routeMetadata: Record<RouteId, RouteMetadata> = {
  [Routes.HOME]: {
    label: 'navigation.home',
    icon: 'home',
    requiresAuth: false,
    showInNav: true,
    navOrder: 1,
  },
  [Routes.SETTINGS]: {
    label: 'navigation.settings',
    icon: 'settings',
    requiresAuth: false,
    showInNav: true,
    navOrder: 2,
  },
  [Routes.REMOTE_HELLO]: {
    label: 'navigation.remoteHello',
    icon: 'module',
    requiresAuth: false,
    showInNav: true,
    navOrder: 3,
  },
  // ...
};
```

### Route Helpers

```typescript
// Get routes for navigation menus (filtered and sorted)
export function getNavigationRoutes(): RouteId[] {
  return Object.entries(routeMetadata)
    .filter(([_, meta]) => meta.showInNav)
    .sort((a, b) => (a[1].navOrder ?? 99) - (b[1].navOrder ?? 99))
    .map(([id]) => id as RouteId);
}

// Get routes requiring authentication
export function getProtectedRoutes(): RouteId[] {
  return Object.entries(routeMetadata)
    .filter(([_, meta]) => meta.requiresAuth)
    .map(([id]) => id as RouteId);
}

// Check if a route requires auth
export function isProtectedRoute(routeId: RouteId): boolean {
  return routeMetadata[routeId]?.requiresAuth ?? false;
}

// Validate a string is a valid route ID
export function isValidRouteId(value: string): value is RouteId {
  return Object.values(Routes).includes(value as RouteId);
}
```

## Type-Safe Route Parameters

```typescript
// packages/shared-router/src/types.ts
export type RouteParams<R extends RouteId> = R extends 'remote-detail'
  ? { id: string }
  : R extends 'profile'
  ? { userId?: string }
  : Record<string, never>;

export interface NavigationIntent<R extends RouteId = RouteId> {
  routeId: R;
  params?: RouteParams<R>;
  replace?: boolean;
  state?: Record<string, unknown>;
}
```

## Host Route Configuration

### Web Host (React Router DOM)

```typescript
// packages/web-shell/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Routes as RouteIds } from '@universal/shared-router';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to home */}
        <Route path="/" element={<Navigate to={`/${RouteIds.HOME}`} replace />} />

        {/* Main routes */}
        <Route path={`/${RouteIds.HOME}`} element={<Home />} />
        <Route path={`/${RouteIds.SETTINGS}`} element={<Settings />} />
        <Route path={`/${RouteIds.REMOTE_HELLO}`} element={<Remote />} />

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<Navigate to={`/${RouteIds.HOME}`} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Mobile Host (React Router Native)

```typescript
// packages/mobile-host/src/App.tsx
import { NativeRouter, Routes, Route, Link } from 'react-router-native';
import { Routes as RouteIds } from '@universal/shared-router';

function App() {
  return (
    <NativeRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path={`/${RouteIds.HOME}`} element={<Home />} />
        <Route path={`/${RouteIds.SETTINGS}`} element={<Settings />} />
        <Route path={`/${RouteIds.REMOTE_HELLO}`} element={<Remote />} />
      </Routes>
    </NativeRouter>
  );
}
```

## Navigation Patterns

### Direct Link Navigation (Host Only)

```typescript
// In host components only
import { Link } from 'react-router-dom'; // or 'react-router-native'
import { Routes } from '@universal/shared-router';

function Header() {
  return (
    <View style={styles.nav}>
      <Link to={`/${Routes.HOME}`}>
        <Text>Home</Text>
      </Link>
      <Link to={`/${Routes.SETTINGS}`}>
        <Text>Settings</Text>
      </Link>
      <Link to={`/${Routes.REMOTE_HELLO}`}>
        <Text>Remote</Text>
      </Link>
    </View>
  );
}
```

### Programmatic Navigation (Host Only)

```typescript
// In host components only
import { useNavigate } from 'react-router-dom';
import { Routes } from '@universal/shared-router';

function SomeHostComponent() {
  const navigate = useNavigate();

  const handleAction = () => {
    // Navigate programmatically
    navigate(`/${Routes.SETTINGS}`);

    // With replace (no history entry)
    navigate(`/${Routes.HOME}`, { replace: true });

    // With state
    navigate(`/${Routes.REMOTE_HELLO}`, { state: { fromAction: true } });
  };

  return <Pressable onPress={handleAction}><Text>Go</Text></Pressable>;
}
```

## Remote MFE Navigation Pattern

**Critical Rule**: Remotes NEVER import routers or use navigation hooks.

### How Remotes Request Navigation

Remotes use the event bus to request navigation:

```typescript
// packages/shared-event-bus/src/events/navigation.ts
export const NavigationEventTypes = {
  NAVIGATE_TO: 'NAVIGATE_TO',
  NAVIGATE_BACK: 'NAVIGATE_BACK',
  NAVIGATION_COMPLETED: 'NAVIGATION_COMPLETED',
  OPEN_EXTERNAL_URL: 'OPEN_EXTERNAL_URL',
} as const;

export interface NavigateToPayload {
  path: string;
  params?: Record<string, unknown>;
  replace?: boolean;
}

export interface NavigateBackPayload {
  steps?: number;
  fallback?: string;
}
```

### Remote Component Example

```typescript
// packages/web-remote-hello/src/HelloRemote.tsx
import { useEventBus } from '@universal/shared-event-bus';

function HelloRemote({ name, onPress }: HelloRemoteProps) {
  const bus = useEventBus<AppEvents>();

  const handlePress = useCallback(() => {
    // Emit interaction event - host decides what to do
    bus.emit(
      InteractionEventTypes.BUTTON_PRESSED,
      {
        buttonId: 'hello-remote-press-me',
        metadata: { source: 'HelloRemote' },
      },
      1,
      { source: 'HelloRemote' }
    );

    // Backward compatibility callback
    onPress?.();
  }, [bus, onPress]);

  return <HelloUniversal name={name} onPress={handlePress} />;
}
```

### Host Handling Remote Events

```typescript
// packages/web-shell/src/pages/Remote.tsx
import { useEventListener } from '@universal/shared-event-bus';
import { Link } from 'react-router-dom';
import { Routes } from '@universal/shared-router';

function Remote() {
  const [remoteModule, setRemoteModule] = useState(null);

  // Listen for events from remote
  useEventListener(
    InteractionEventTypes.BUTTON_PRESSED,
    (event) => {
      console.log('Remote button pressed:', event);
      // Host can navigate, show toast, log analytics, etc.
    }
  );

  return (
    <View>
      {/* Host owns the back navigation */}
      <Link to={`/${Routes.HOME}`}>
        <Text>Back to Home</Text>
      </Link>

      {/* Remote is rendered here - no routing knowledge */}
      {remoteModule && <remoteModule.default name="World" />}
    </View>
  );
}
```

## Navigation Events

### Event Types

| Event | Direction | Purpose |
|-------|-----------|---------|
| `NAVIGATE_TO` | Remote → Host | Request navigation |
| `NAVIGATE_BACK` | Remote → Host | Request back navigation |
| `NAVIGATION_COMPLETED` | Host → Remote | Notify navigation complete |
| `OPEN_EXTERNAL_URL` | Remote → Host | Open external link |

### Host Listening for Navigation Events

```typescript
// In host App.tsx
import { useEventListener, NavigationEventTypes } from '@universal/shared-event-bus';
import { useNavigate } from 'react-router-dom';

function NavigationEventHandler() {
  const navigate = useNavigate();
  const bus = useEventBus();

  useEventListener(NavigationEventTypes.NAVIGATE_TO, (event) => {
    const { path, replace } = event.payload;
    navigate(path, { replace });

    // Notify completion
    bus.emit(NavigationEventTypes.NAVIGATION_COMPLETED, {
      path,
      previousPath: window.location.pathname,
    });
  });

  useEventListener(NavigationEventTypes.NAVIGATE_BACK, (event) => {
    const { steps = 1, fallback } = event.payload;
    if (window.history.length > steps) {
      navigate(-steps);
    } else if (fallback) {
      navigate(fallback, { replace: true });
    }
  });

  useEventListener(NavigationEventTypes.OPEN_EXTERNAL_URL, (event) => {
    const { url, newTab = true } = event.payload;
    if (newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  });

  return null;
}
```

## Remote Module Loading

### Web Shell Remote Loading

```typescript
// packages/web-shell/src/pages/Remote.tsx
const HelloRemote = lazy(() =>
  import('hello_remote/HelloRemote').catch(() => ({
    default: () => <Text>Failed to load remote</Text>,
  }))
);

function Remote() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <HelloRemote name="World" />
    </Suspense>
  );
}
```

### Mobile Host Remote Loading

```typescript
// packages/mobile-host/src/pages/Remote.tsx
import { ScriptManager, Federated } from '@callstack/repack/client';

function Remote() {
  const [RemoteComponent, setRemoteComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRemote = async () => {
    setLoading(true);
    setError(null);

    try {
      const module = await Federated.importModule(
        'HelloRemote',
        './HelloRemote',
        'default'
      );
      setRemoteComponent(() => module);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Link to={`/${Routes.HOME}`}>
        <Text>Back</Text>
      </Link>

      {loading && <Text>Loading remote...</Text>}
      {error && <Text>Error: {error}</Text>}
      {RemoteComponent && <RemoteComponent name="World" />}

      <Pressable onPress={loadRemote}>
        <Text>Load Remote</Text>
      </Pressable>
    </View>
  );
}
```

## Testing Routing

### Integration Tests

```typescript
// packages/web-shell/src/__integration__/routing.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

function TestApp({ initialEntries }: { initialEntries: string[] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <QueryProvider>
        <EventBusProvider>
          <I18nProvider translations={locales} initialLocale="en">
            <ThemeProvider>
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </ThemeProvider>
          </I18nProvider>
        </EventBusProvider>
      </QueryProvider>
    </MemoryRouter>
  );
}

describe('Routing', () => {
  it('should navigate between routes', async () => {
    render(<TestApp initialEntries={['/home']} />);

    expect(screen.getByText('Welcome')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: /settings/i }));

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should preserve theme across navigation', async () => {
    render(<TestApp initialEntries={['/home']} />);

    // Toggle theme
    await userEvent.click(screen.getByLabelText('Toggle theme'));

    // Navigate
    await userEvent.click(screen.getByRole('link', { name: /settings/i }));

    // Theme should be preserved
    expect(document.body).toHaveClass('dark-theme');
  });
});
```

## Architecture Diagram

```text
Web Shell (Host)                     Mobile Host (Host)
├─ BrowserRouter                     ├─ NativeRouter
├─ Routes: HOME, SETTINGS, etc.      ├─ Routes: HOME, SETTINGS, etc.
├─ Link navigation                   ├─ Link navigation
├─ EventBusProvider                  ├─ EventBusProvider
│  ├─ Listens: NAVIGATE_TO          │  ├─ Listens: NAVIGATE_TO
│  ├─ Emits: NAVIGATION_COMPLETED   │  ├─ Emits: NAVIGATION_COMPLETED
│                                    │
├─ Remote.tsx (Host Page)           ├─ Remote.tsx (Host Page)
│  ├─ Loads HelloRemote             │  ├─ Loads HelloRemote via ScriptManager
│  ├─ Owns back navigation          │  ├─ Owns back navigation
│                                    │
└─ HelloRemote (Remote MFE)         └─ HelloRemote (Remote MFE)
   ├─ NO router imports!             ├─ NO router imports!
   ├─ NO navigation logic            ├─ NO navigation logic
   ├─ Emits: BUTTON_PRESSED          ├─ Emits: BUTTON_PRESSED
   └─ URL-agnostic                   └─ URL-agnostic
```

## Key Principles

1. **Hosts Own Routes**: All route definitions live in host applications
2. **MFEs Are URL-Agnostic**: Remotes never reference URLs or paths
3. **Navigation via Events**: MFEs request navigation through event bus
4. **Semantic Route IDs**: Shared constants for type-safe route references
5. **Platform Consistency**: Same routing patterns on web and mobile
6. **Independent Deployment**: MFEs can deploy without knowing host URLs

## File Locations

| Component | Path |
|-----------|------|
| Route types & constants | `packages/shared-router/src/` |
| Navigation events | `packages/shared-event-bus/src/events/navigation.ts` |
| Web host routing | `packages/web-shell/src/App.tsx` |
| Mobile host routing | `packages/mobile-host/src/App.tsx` |
| Web remote page | `packages/web-shell/src/pages/Remote.tsx` |
| Mobile remote page | `packages/mobile-host/src/pages/Remote.tsx` |
