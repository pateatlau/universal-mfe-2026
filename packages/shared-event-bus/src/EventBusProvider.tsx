/**
 * EventBusProvider - React context provider for the event bus
 *
 * Provides event bus instance to the React component tree.
 * Each provider creates its own isolated event bus instance.
 */

import React, { createContext, useContext, useMemo, useRef, useEffect } from 'react';
import { createEventBus, type EventBus } from './EventBus';
import type { BaseEvent, EventBusOptions } from './types';

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
  /** Optional existing event bus instance (for sharing across providers) */
  eventBus?: EventBus<Events>;
  /** Options for creating a new event bus (ignored if eventBus is provided) */
  options?: EventBusOptions;
}

/**
 * Provider component that supplies the event bus to the component tree.
 *
 * @example
 * ```tsx
 * // Create a new event bus for the app
 * <EventBusProvider options={{ debug: true }}>
 *   <App />
 * </EventBusProvider>
 *
 * // Or share an existing event bus
 * const bus = createEventBus();
 * <EventBusProvider eventBus={bus}>
 *   <App />
 * </EventBusProvider>
 * ```
 */
export function EventBusProvider<Events extends BaseEvent = BaseEvent>({
  children,
  eventBus,
  options,
}: EventBusProviderProps<Events>): React.ReactElement {
  // Create event bus instance (memoized to prevent recreation on re-renders)
  const bus = useMemo(() => {
    return eventBus || createEventBus<Events>(options);
  }, [eventBus, options]);

  // Store in ref for cleanup
  const busRef = useRef(bus);
  busRef.current = bus;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all subscriptions when provider unmounts
      busRef.current.clear();
    };
  }, []);

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
