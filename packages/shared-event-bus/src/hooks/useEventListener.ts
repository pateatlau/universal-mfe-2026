/**
 * useEventListener - Hook to subscribe to events with automatic cleanup
 *
 * Subscribes to events and automatically unsubscribes when the component unmounts.
 * This is the recommended way to listen for events in React components.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useEventBusContext } from '../EventBusProvider';
import { WILDCARD_EVENT } from '../EventBus';
import type { BaseEvent, EventHandler, SubscribeOptions } from '../types';

/**
 * Hook to subscribe to a specific event type.
 *
 * Automatically handles subscription cleanup on component unmount.
 * The handler is stable across re-renders (no need to memoize).
 *
 * @param eventType - The event type to listen for (or '*' for all events)
 * @param handler - Handler function called when event is emitted
 * @param options - Optional subscription options (filter, priority)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [lastAction, setLastAction] = useState<string | null>(null);
 *
 *   // Subscribe to USER_ACTION events
 *   useEventListener<UserActionEvent>('USER_ACTION', (event) => {
 *     setLastAction(event.payload.action);
 *   });
 *
 *   return <Text>Last action: {lastAction}</Text>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With filter - only handle specific events
 * useEventListener<NavigationEvent>(
 *   'NAVIGATE_TO',
 *   (event) => console.log('Navigating to:', event.payload.path),
 *   { filter: (e) => e.payload.path.startsWith('/admin') }
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Listen to all events (wildcard)
 * useEventListener('*', (event) => {
 *   console.log('Event:', event.type, event.payload);
 * });
 * ```
 */
export function useEventListener<E extends BaseEvent = BaseEvent>(
  eventType: E['type'] | typeof WILDCARD_EVENT,
  handler: EventHandler<E>,
  options?: Omit<SubscribeOptions<E>, 'once'>
): void {
  const bus = useEventBusContext<E>();

  // Keep handler in ref to avoid re-subscribing on handler changes
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  // Keep options in ref
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    // Create stable handler wrapper
    const stableHandler: EventHandler<E> = (event) => {
      handlerRef.current(event);
    };

    // Subscribe with current options
    const subscription = bus.subscribe(eventType, stableHandler, {
      ...optionsRef.current,
      once: false, // Never use once with this hook - use useEventListenerOnce instead
    });

    // Cleanup on unmount or when eventType changes
    return () => {
      subscription.unsubscribe();
    };
  }, [bus, eventType]);
}

/**
 * Hook to subscribe to a single event occurrence.
 *
 * Automatically unsubscribes after receiving one event or on unmount.
 * Useful for one-time event handling like confirmations or responses.
 *
 * @param eventType - The event type to listen for
 * @param handler - Handler function called when event is emitted
 * @param options - Optional subscription options (filter, priority)
 *
 * @example
 * ```tsx
 * function ConfirmDialog() {
 *   const [result, setResult] = useState<boolean | null>(null);
 *
 *   // Listen for confirmation response (only once)
 *   useEventListenerOnce<ConfirmResponseEvent>(
 *     'CONFIRM_RESPONSE',
 *     (event) => setResult(event.payload.confirmed)
 *   );
 *
 *   return <Text>Waiting for confirmation...</Text>;
 * }
 * ```
 */
export function useEventListenerOnce<E extends BaseEvent = BaseEvent>(
  eventType: E['type'],
  handler: EventHandler<E>,
  options?: Omit<SubscribeOptions<E>, 'once'>
): void {
  const bus = useEventBusContext<E>();

  // Keep handler in ref
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  // Keep options in ref to avoid re-subscriptions on every render
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Track if we've already handled an event
  const handledRef = useRef(false);

  useEffect(() => {
    // Reset handled flag when eventType changes
    handledRef.current = false;

    const stableHandler: EventHandler<E> = (event) => {
      if (!handledRef.current) {
        handledRef.current = true;
        handlerRef.current(event);
      }
    };

    const subscription = bus.subscribe(eventType, stableHandler, {
      ...optionsRef.current,
      once: true,
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [bus, eventType]);
}

/**
 * Hook to subscribe to multiple event types with a single handler.
 *
 * Useful when you want to handle related events in the same way.
 *
 * @param eventTypes - Array of event types to listen for
 * @param handler - Handler function called when any event is emitted
 * @param options - Optional subscription options
 *
 * @example
 * ```tsx
 * function ActivityLog() {
 *   const [activities, setActivities] = useState<string[]>([]);
 *
 *   useEventListenerMultiple(
 *     ['USER_LOGIN', 'USER_LOGOUT', 'USER_ACTION'],
 *     (event) => {
 *       setActivities((prev) => [...prev, `${event.type}: ${JSON.stringify(event.payload)}`]);
 *     }
 *   );
 *
 *   return <Text>Activities: {activities.length}</Text>;
 * }
 * ```
 */
export function useEventListenerMultiple<E extends BaseEvent = BaseEvent>(
  eventTypes: E['type'][],
  handler: EventHandler<E>,
  options?: Omit<SubscribeOptions<E>, 'once'>
): void {
  const bus = useEventBusContext<E>();

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  // Keep options in ref to avoid re-subscriptions on every render
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const stableHandler: EventHandler<E> = (event) => {
      handlerRef.current(event);
    };

    // Subscribe to all event types
    const subscriptions = eventTypes.map((eventType) =>
      bus.subscribe(eventType, stableHandler, optionsRef.current)
    );

    // Cleanup all subscriptions
    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [bus, eventTypes.join(',')]); // Join eventTypes for stable dependency
}

/**
 * Hook that returns a callback to subscribe to events imperatively.
 *
 * Useful when you need to subscribe/unsubscribe based on user actions.
 * All subscriptions are cleaned up on unmount.
 *
 * @returns Object with subscribe function and active subscription count
 *
 * @example
 * ```tsx
 * function DynamicListener() {
 *   const { subscribe, subscriptionCount } = useEventSubscriber();
 *
 *   const handleStartListening = () => {
 *     subscribe('DATA_UPDATE', (event) => {
 *       console.log('Data updated:', event.payload);
 *     });
 *   };
 *
 *   return (
 *     <View>
 *       <Button onPress={handleStartListening}>Start Listening</Button>
 *       <Text>Active subscriptions: {subscriptionCount}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useEventSubscriber<E extends BaseEvent = BaseEvent>(): {
  subscribe: (
    eventType: E['type'],
    handler: EventHandler<E>,
    options?: SubscribeOptions<E>
  ) => () => void;
  subscriptionCount: number;
} {
  const bus = useEventBusContext<E>();
  const subscriptionsRef = useRef<Set<() => void>>(new Set());
  // Track subscription count in state for reactivity
  const [subscriptionCount, setSubscriptionCount] = useState(0);

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
      subscriptionsRef.current.clear();
      // Note: no need to setSubscriptionCount here since component is unmounting
    };
  }, []);

  const subscribe = useCallback(
    (
      eventType: E['type'],
      handler: EventHandler<E>,
      options?: SubscribeOptions<E>
    ): (() => void) => {
      const subscription = bus.subscribe(eventType, handler, options);

      const unsubscribe = () => {
        subscription.unsubscribe();
        subscriptionsRef.current.delete(unsubscribe);
        setSubscriptionCount(subscriptionsRef.current.size);
      };

      subscriptionsRef.current.add(unsubscribe);
      setSubscriptionCount(subscriptionsRef.current.size);
      return unsubscribe;
    },
    [bus]
  );

  return {
    subscribe,
    subscriptionCount,
  };
}
