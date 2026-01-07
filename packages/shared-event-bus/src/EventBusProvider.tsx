/**
 * EventBusProvider - React context provider for the event bus
 *
 * Provides event bus instance to the React component tree.
 * Uses a GLOBAL SINGLETON pattern to ensure all MFEs share the same event bus.
 *
 * ## Why a Global Singleton?
 *
 * In a Module Federation architecture, each remote MFE loads as a separate bundle
 * and doesn't inherit React context from the host. If each provider created its
 * own event bus, events would be isolated within each MFE.
 *
 * By using a global singleton (attached to `globalThis`), all MFEs share the same
 * event bus instance, enabling true inter-MFE communication:
 *
 * ```
 * Host App (bus)  ←──────────────→  Remote MFE (same bus via globalThis)
 *      │                                     │
 *      └─── BUTTON_PRESSED ─────────────────►│
 *           (emitted by remote,              │
 *            received by host)               │
 * ```
 */

import React, { createContext, useContext, useMemo } from 'react';
import { createEventBus, type EventBus } from './EventBus';
import type { BaseEvent, EventBusOptions } from './types';

/**
 * Global key for the shared event bus instance.
 * Using a Symbol would be more unique, but strings work better across
 * different module instances in Module Federation.
 */
const GLOBAL_EVENT_BUS_KEY = '__UNIVERSAL_EVENT_BUS__';

/**
 * Get or create the global event bus instance.
 * This ensures all MFEs share the same bus.
 */
function getGlobalEventBus<Events extends BaseEvent>(
  options?: EventBusOptions
): EventBus<Events> {
  // Use globalThis for cross-environment compatibility (browser, Node.js, etc.)
  const global = globalThis as typeof globalThis & {
    [GLOBAL_EVENT_BUS_KEY]?: EventBus<Events>;
  };

  if (!global[GLOBAL_EVENT_BUS_KEY]) {
    global[GLOBAL_EVENT_BUS_KEY] = createEventBus<Events>(options);
  }

  return global[GLOBAL_EVENT_BUS_KEY];
}

/**
 * Context for the event bus instance.
 */
const EventBusContext = createContext<EventBus<BaseEvent> | null>(null);

/**
 * Props for EventBusProvider component.
 */
export interface EventBusProviderProps<Events extends BaseEvent = BaseEvent> {
  /** Child components */
  children: React.ReactNode;
  /** Optional existing event bus instance (for advanced use cases) */
  eventBus?: EventBus<Events>;
  /** Options for creating/configuring the event bus */
  options?: EventBusOptions;
}

/**
 * Provider component that supplies the event bus to the component tree.
 *
 * Uses a global singleton pattern to ensure all MFEs share the same event bus.
 * The first provider to render creates the global instance; subsequent providers
 * reuse it.
 *
 * @example
 * ```tsx
 * // Host app
 * <EventBusProvider options={{ debug: true, name: 'HostApp' }}>
 *   <App />
 * </EventBusProvider>
 *
 * // Remote MFE (automatically uses the same global bus)
 * <EventBusProvider options={{ name: 'RemoteMFE' }}>
 *   <HelloRemote />
 * </EventBusProvider>
 * ```
 */
export function EventBusProvider<Events extends BaseEvent = BaseEvent>({
  children,
  eventBus,
  options,
}: EventBusProviderProps<Events>): React.ReactElement {
  // Use provided bus, or get/create the global singleton
  const bus = useMemo(() => {
    return eventBus || getGlobalEventBus<Events>(options);
  }, [eventBus, options]);

  // Note: We intentionally do NOT clear the global bus on unmount.
  // The global bus persists for the lifetime of the application.
  // Individual subscriptions should be cleaned up by useEventListener hooks.

  return (
    <EventBusContext.Provider value={bus as EventBus<BaseEvent>}>
      {children}
    </EventBusContext.Provider>
  );
}

/**
 * Hook to access the event bus instance from context.
 *
 * @throws Error if used outside of EventBusProvider
 * @returns The event bus instance
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const bus = useEventBusContext();
 *
 *   const handleClick = () => {
 *     bus.emit('BUTTON_CLICKED', { buttonId: 'submit' });
 *   };
 *
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 */
export function useEventBusContext<
  Events extends BaseEvent = BaseEvent,
>(): EventBus<Events> {
  const context = useContext(EventBusContext);

  if (!context) {
    throw new Error(
      'useEventBusContext must be used within an EventBusProvider. ' +
        'Wrap your component tree with <EventBusProvider>.'
    );
  }

  return context as EventBus<Events>;
}

/**
 * Display name for React DevTools.
 */
EventBusProvider.displayName = 'EventBusProvider';
