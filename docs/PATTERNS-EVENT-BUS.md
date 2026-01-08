# Event Bus Patterns

This document describes the event bus architecture and patterns for inter-MFE communication in the Universal MFE Platform.

## Overview

The event bus (`@universal/shared-event-bus`) provides:

- Type-safe pub/sub for inter-MFE communication
- Global singleton for cross-bundle event sharing
- Priority-based event handling
- Event history for debugging
- Automatic cleanup on unmount

## Why Event Bus?

| Approach | Pros | Cons |
|----------|------|------|
| **Direct imports** | Simple | Tight coupling, not MFE-friendly |
| **Shared state** | Immediate sync | All MFEs must know schema |
| **Event bus** | Loose coupling | Requires event definitions |

The event bus enables:
- **Independent deployment**: MFEs don't import each other
- **Loose coupling**: Fire-and-forget communication
- **Type safety**: Discriminated unions for events
- **Debugging**: Event history and statistics

## Global Singleton Pattern

### Why Global?

In Module Federation, each remote loads as a separate bundle without sharing React context. Without a global singleton, each `EventBusProvider` would create an isolated bus.

```typescript
// packages/shared-event-bus/src/EventBusProvider.tsx
const GLOBAL_EVENT_BUS_KEY = '__UNIVERSAL_EVENT_BUS__';

function getGlobalEventBus<Events extends BaseEvent>(
  options?: EventBusOptions
): EventBus<Events> {
  const global = globalThis as typeof globalThis & {
    [GLOBAL_EVENT_BUS_KEY]?: EventBus<Events>;
  };

  if (!global[GLOBAL_EVENT_BUS_KEY]) {
    global[GLOBAL_EVENT_BUS_KEY] = createEventBus<Events>(options);
  }

  return global[GLOBAL_EVENT_BUS_KEY];
}
```

### Provider Setup

```typescript
import { EventBusProvider } from '@universal/shared-event-bus';

function App() {
  return (
    <EventBusProvider>
      <AppContent />
    </EventBusProvider>
  );
}
```

## Event Type Definitions

### Base Event Interface

```typescript
// packages/shared-event-bus/src/types.ts
interface BaseEvent<T extends string = string, P = unknown> {
  type: T;
  payload: P;
  version: number;
  timestamp: number;
  source?: string;
  correlationId?: string;
}
```

### Event Categories

#### Navigation Events

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

#### Theme Events

```typescript
export const ThemeEventTypes = {
  THEME_CHANGED: 'THEME_CHANGED',
  THEME_CHANGE_REQUEST: 'THEME_CHANGE_REQUEST',
} as const;

export interface ThemeChangedPayload {
  theme: 'light' | 'dark';
  previousTheme?: 'light' | 'dark';
}
```

#### Locale Events

```typescript
export const LocaleEventTypes = {
  LOCALE_CHANGED: 'LOCALE_CHANGED',
  LOCALE_CHANGE_REQUEST: 'LOCALE_CHANGE_REQUEST',
} as const;

export interface LocaleChangedPayload {
  locale: string;
  previousLocale?: string;
}
```

#### Authentication Events

```typescript
export const AuthEventTypes = {
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
} as const;
```

#### Remote Module Events

```typescript
export const RemoteEventTypes = {
  REMOTE_LOADING: 'REMOTE_LOADING',
  REMOTE_LOADED: 'REMOTE_LOADED',
  REMOTE_LOAD_FAILED: 'REMOTE_LOAD_FAILED',
  REMOTE_RETRYING: 'REMOTE_RETRYING',
  REMOTE_UNLOADED: 'REMOTE_UNLOADED',
} as const;
```

#### Interaction Events

```typescript
export const InteractionEventTypes = {
  BUTTON_PRESSED: 'BUTTON_PRESSED',
  FORM_SUBMITTED: 'FORM_SUBMITTED',
  ITEM_SELECTED: 'ITEM_SELECTED',
  CUSTOM_ACTION: 'CUSTOM_ACTION',
} as const;

export interface ButtonPressedPayload {
  buttonId: string;
  metadata?: Record<string, unknown>;
}
```

### Combined App Events

```typescript
// packages/shared-event-bus/src/events/index.ts
export type AppEvents =
  | NavigationEvent
  | ThemeEvent
  | LocaleEvent
  | AuthEvent
  | RemoteEvent
  | InteractionEvent;
```

## Event Bus API

### useEventBus Hook

```typescript
import { useEventBus, AppEvents } from '@universal/shared-event-bus';

function MyComponent() {
  const bus = useEventBus<AppEvents>();

  // Emit an event
  bus.emit(
    ThemeEventTypes.THEME_CHANGED,
    { theme: 'dark', previousTheme: 'light' },
    1,  // version
    { source: 'MyComponent' }
  );

  // Subscribe to events
  const subscription = bus.subscribe(
    ThemeEventTypes.THEME_CHANGED,
    (event) => {
      console.log('Theme changed:', event.payload.theme);
    }
  );

  // Unsubscribe
  subscription.unsubscribe();

  return <View />;
}
```

### useEventEmitter Hook

Stable, memoized emit function:

```typescript
import { useEventEmitter } from '@universal/shared-event-bus';

function Button() {
  const emit = useEventEmitter<AppEvents>();

  const handlePress = () => {
    emit(
      InteractionEventTypes.BUTTON_PRESSED,
      { buttonId: 'submit-btn' },
      1,
      { source: 'Button' }
    );
  };

  return (
    <Pressable onPress={handlePress}>
      <Text>Press</Text>
    </Pressable>
  );
}
```

### useEventListener Hook

Subscribe with automatic cleanup:

```typescript
import { useEventListener } from '@universal/shared-event-bus';

function ThemeObserver() {
  useEventListener(
    ThemeEventTypes.THEME_CHANGED,
    (event) => {
      console.log('Theme changed to:', event.payload.theme);
    },
    {
      priority: 1,  // Lower = earlier execution
    }
  );

  return null;
}
```

### useEventListenerOnce Hook

Single-fire subscription:

```typescript
import { useEventListenerOnce } from '@universal/shared-event-bus';

function OneTimeHandler() {
  useEventListenerOnce(
    AuthEventTypes.USER_LOGGED_IN,
    (event) => {
      // Only fires once, then auto-unsubscribes
      showWelcomeMessage(event.payload.user);
    }
  );

  return null;
}
```

### useEventListenerMultiple Hook

Subscribe to multiple event types:

```typescript
import { useEventListenerMultiple } from '@universal/shared-event-bus';

function AuthMonitor() {
  useEventListenerMultiple(
    [
      AuthEventTypes.USER_LOGGED_IN,
      AuthEventTypes.USER_LOGGED_OUT,
      AuthEventTypes.SESSION_EXPIRED,
    ],
    (event) => {
      // Handle any auth event
      logAuthEvent(event);
    }
  );

  return null;
}
```

## Event Bus Methods

### emit

```typescript
bus.emit<E extends AppEvents>(
  eventType: E['type'],
  payload: E['payload'],
  version?: number,
  options?: { source?: string; correlationId?: string }
): E;
```

### subscribe

```typescript
bus.subscribe<E extends AppEvents>(
  eventType: E['type'],
  handler: (event: E) => void,
  options?: {
    priority?: number;      // Lower = earlier (default: 0)
    filter?: (event: E) => boolean;
  }
): Subscription;
```

### subscribeOnce

```typescript
bus.subscribeOnce<E extends AppEvents>(
  eventType: E['type'],
  handler: (event: E) => void,
  options?: { priority?: number; filter?: (event: E) => boolean }
): Subscription;
```

### waitFor

```typescript
const event = await bus.waitFor<ThemeChangedEvent>(
  ThemeEventTypes.THEME_CHANGED,
  5000,  // timeout ms
  (event) => event.payload.theme === 'dark'  // optional filter
);
```

### hasSubscribers

```typescript
if (bus.hasSubscribers(ThemeEventTypes.THEME_CHANGED)) {
  bus.emit(ThemeEventTypes.THEME_CHANGED, { theme: 'dark' });
}
```

### getHistory

```typescript
// Get last 100 events (all types)
const history = bus.getHistory();

// Get last 10 theme events
const themeHistory = bus.getHistory(ThemeEventTypes.THEME_CHANGED, 10);
```

### getStats

```typescript
const stats = bus.getStats();
// {
//   totalEvents: 150,
//   eventCounts: { THEME_CHANGED: 5, LOCALE_CHANGED: 3, ... },
//   activeSubscriptions: 12
// }
```

## Common Patterns

### Host Broadcasting State Changes

```typescript
// packages/web-shell/src/App.tsx
function App() {
  const bus = useEventBus<AppEvents>();
  const [theme, setTheme] = useState<ThemeName>('light');

  const handleThemeChange = useCallback(
    (newTheme: ThemeName) => {
      const previousTheme = theme;
      setTheme(newTheme);

      // Broadcast to all MFEs
      bus.emit(
        ThemeEventTypes.THEME_CHANGED,
        { theme: newTheme, previousTheme },
        1,
        { source: 'WebShell' }
      );
    },
    [bus, theme]
  );

  return (
    <ThemeProvider defaultTheme={theme} onThemeChange={handleThemeChange}>
      <AppContent />
    </ThemeProvider>
  );
}
```

### Remote Listening for State Changes

```typescript
// packages/web-remote-hello/src/HelloRemote.tsx
function HelloRemote({ theme: initialTheme }: HelloRemoteProps) {
  const [currentTheme, setCurrentTheme] = useState(initialTheme ?? 'light');

  // Listen for theme changes from host
  useEventListener(ThemeEventTypes.THEME_CHANGED, (event) => {
    setCurrentTheme(event.payload.theme);
  });

  return (
    <ThemeProvider defaultTheme={currentTheme}>
      <HelloContent />
    </ThemeProvider>
  );
}
```

### Remote Emitting Interaction Events

```typescript
// packages/web-remote-hello/src/HelloRemote.tsx
function HelloRemoteInner({ name, onPress }) {
  const bus = useEventBus<AppEvents>();
  const incrementPressCount = useHelloLocalStore((s) => s.incrementPressCount);
  const localPressCount = useHelloLocalStore((s) => s.localPressCount);

  const handlePress = useCallback(() => {
    // 1. Update local state
    incrementPressCount();

    // 2. Emit event for host/other MFEs
    bus.emit(
      InteractionEventTypes.BUTTON_PRESSED,
      {
        buttonId: 'hello-remote-press-me',
        metadata: { localPressCount: localPressCount + 1 },
      },
      1,
      { source: 'HelloRemote' }
    );

    // 3. Backward-compat callback
    onPress?.();
  }, [bus, incrementPressCount, localPressCount, onPress]);

  return <HelloUniversal name={name} onPress={handlePress} />;
}
```

### Host Handling Remote Events

```typescript
// packages/web-shell/src/pages/Remote.tsx
function Remote() {
  const [eventLog, setEventLog] = useState<string[]>([]);

  useEventListener(InteractionEventTypes.BUTTON_PRESSED, (event) => {
    setEventLog((prev) => [
      ...prev,
      `Button ${event.payload.buttonId} pressed at ${new Date(event.timestamp).toLocaleTimeString()}`,
    ]);
  });

  return (
    <View>
      <HelloRemote name="World" />
      <View>
        <Text>Event Log:</Text>
        {eventLog.map((log, i) => (
          <Text key={i}>{log}</Text>
        ))}
      </View>
    </View>
  );
}
```

## Event Versioning

### Version Field

Every event includes a `version` field for schema evolution:

```typescript
bus.emit(
  ThemeEventTypes.THEME_CHANGED,
  { theme: 'dark' },
  1  // version 1
);
```

### Evolution Strategy

- **Append-only**: New fields can be added, existing cannot be removed
- **Breaking changes**: Create new event type (e.g., `THEME_CHANGED_V2`)
- **Backward compatibility**: Handlers should handle missing optional fields

```typescript
// Handler that works with v1 and v2
useEventListener(ThemeEventTypes.THEME_CHANGED, (event) => {
  const { theme, previousTheme } = event.payload;

  // previousTheme added in v2, might be undefined in v1
  if (previousTheme) {
    analytics.track('theme_changed', { from: previousTheme, to: theme });
  }
});
```

## Priority-Based Execution

```typescript
// Lower priority = earlier execution

// This handler runs first
useEventListener(ThemeEventTypes.THEME_CHANGED, saveToStorage, { priority: -10 });

// This handler runs second (default priority: 0)
useEventListener(ThemeEventTypes.THEME_CHANGED, updateUI);

// This handler runs last
useEventListener(ThemeEventTypes.THEME_CHANGED, logAnalytics, { priority: 10 });
```

## Debugging

### Event History

```typescript
function DebugPanel() {
  const bus = useEventBus<AppEvents>();

  const showHistory = () => {
    const history = bus.getHistory();
    console.log('Event History:', history);
  };

  const showStats = () => {
    const stats = bus.getStats();
    console.log('Event Stats:', stats);
  };

  return (
    <View>
      <Pressable onPress={showHistory}>
        <Text>Show History</Text>
      </Pressable>
      <Pressable onPress={showStats}>
        <Text>Show Stats</Text>
      </Pressable>
    </View>
  );
}
```

### Correlation IDs

Track related events across MFEs:

```typescript
const correlationId = uuid();

// Host emits
bus.emit(
  NavigationEventTypes.NAVIGATE_TO,
  { path: '/remote' },
  1,
  { source: 'Host', correlationId }
);

// Remote can use same correlationId for related events
bus.emit(
  RemoteEventTypes.REMOTE_LOADED,
  { moduleName: 'HelloRemote' },
  1,
  { source: 'Remote', correlationId }
);
```

## Testing Events

```typescript
import { createEventBus } from '@universal/shared-event-bus';

describe('Theme Events', () => {
  it('should emit theme changed event', () => {
    const bus = createEventBus<AppEvents>();
    const handler = jest.fn();

    bus.subscribe(ThemeEventTypes.THEME_CHANGED, handler);

    bus.emit(ThemeEventTypes.THEME_CHANGED, { theme: 'dark' }, 1);

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ThemeEventTypes.THEME_CHANGED,
        payload: { theme: 'dark' },
      })
    );
  });

  it('should filter events', () => {
    const bus = createEventBus<AppEvents>();
    const handler = jest.fn();

    bus.subscribe(ThemeEventTypes.THEME_CHANGED, handler, {
      filter: (event) => event.payload.theme === 'dark',
    });

    bus.emit(ThemeEventTypes.THEME_CHANGED, { theme: 'light' }, 1);
    expect(handler).not.toHaveBeenCalled();

    bus.emit(ThemeEventTypes.THEME_CHANGED, { theme: 'dark' }, 1);
    expect(handler).toHaveBeenCalled();
  });
});
```

## Key Principles

1. **Loose Coupling**: MFEs communicate via events, not imports
2. **Type Safety**: Discriminated unions for compile-time checks
3. **Global Singleton**: Same bus instance across all MFE bundles
4. **Version Evolution**: Events versioned for backward compatibility
5. **Source Tracking**: Events include source for debugging
6. **Auto Cleanup**: Hooks unsubscribe on component unmount
7. **Priority Control**: Deterministic handler execution order

## File Locations

| Component | Path |
|-----------|------|
| Event Bus Core | `packages/shared-event-bus/src/EventBus.ts` |
| Provider | `packages/shared-event-bus/src/EventBusProvider.tsx` |
| Hooks | `packages/shared-event-bus/src/hooks/` |
| Event Definitions | `packages/shared-event-bus/src/events/` |
| Types | `packages/shared-event-bus/src/types.ts` |
