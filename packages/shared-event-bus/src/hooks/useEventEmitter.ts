/**
 * useEventEmitter - Hook to emit events from React components
 *
 * Provides a stable, memoized emit function for use in components.
 * Automatically includes source information when configured.
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useEventBusContext } from '../EventBusProvider';
import type { BaseEvent, EmitOptions } from '../types';

/**
 * Options for useEventEmitter hook.
 */
export interface UseEventEmitterOptions {
  /** Default source identifier for all emitted events */
  source?: string;
  /** Default correlation ID generator */
  generateCorrelationId?: () => string;
}

/**
 * Hook to get a memoized emit function.
 *
 * The returned emit function is stable across re-renders.
 *
 * @param options - Optional configuration for the emitter
 * @returns Memoized emit function
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const emit = useEventEmitter({ source: 'MyComponent' });
 *
 *   const handleClick = () => {
 *     emit('BUTTON_CLICKED', { buttonId: 'submit' });
 *   };
 *
 *   return <Pressable onPress={handleClick}><Text>Click</Text></Pressable>;
 * }
 * ```
 */
export function useEventEmitter<Events extends BaseEvent = BaseEvent>(
  options: UseEventEmitterOptions = {}
): <E extends Events>(
  eventType: E['type'],
  payload: E['payload'],
  version?: number,
  emitOptions?: EmitOptions
) => E {
  const bus = useEventBusContext<Events>();
  const { source, generateCorrelationId } = options;

  const emit = useCallback(
    <E extends Events>(
      eventType: E['type'],
      payload: E['payload'],
      version: number = 1,
      emitOptions: EmitOptions = {}
    ): E => {
      const finalOptions: EmitOptions = {
        source: emitOptions.source ?? source,
        correlationId:
          emitOptions.correlationId ??
          (generateCorrelationId ? generateCorrelationId() : undefined),
      };

      return bus.emit(eventType, payload, version, finalOptions) as E;
    },
    [bus, source, generateCorrelationId]
  );

  return emit;
}

/**
 * Hook to create a typed emitter for a specific event type.
 *
 * Useful when you emit the same event type multiple times.
 *
 * @param eventType - The event type to emit
 * @param version - Event version (default: 1)
 * @param options - Optional emit options
 * @returns Function that emits the event with just the payload
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount] = useState(0);
 *   const emitCountChanged = useTypedEmitter<CountChangedEvent>(
 *     'COUNT_CHANGED',
 *     1,
 *     { source: 'Counter' }
 *   );
 *
 *   const increment = () => {
 *     const newCount = count + 1;
 *     setCount(newCount);
 *     emitCountChanged({ count: newCount, delta: 1 });
 *   };
 *
 *   return <Pressable onPress={increment}><Text>Count: {count}</Text></Pressable>;
 * }
 * ```
 */
export function useTypedEmitter<E extends BaseEvent>(
  eventType: E['type'],
  version: number = 1,
  options: EmitOptions = {}
): (payload: E['payload']) => E {
  const bus = useEventBusContext<E>();

  const emit = useCallback(
    (payload: E['payload']): E => {
      return bus.emit(eventType, payload, version, options) as E;
    },
    [bus, eventType, version, options]
  );

  return emit;
}

/**
 * Hook to create multiple typed emitters at once.
 *
 * Useful when a component needs to emit several different events.
 *
 * @param eventTypes - Array of event types to create emitters for
 * @param options - Shared options for all emitters
 * @returns Object with emit functions keyed by event type
 *
 * @example
 * ```tsx
 * function UserActions() {
 *   const emitters = useEventEmitters<AuthEvents>(
 *     ['USER_LOGIN', 'USER_LOGOUT', 'SESSION_REFRESH'],
 *     { source: 'UserActions' }
 *   );
 *
 *   const handleLogin = () => {
 *     emitters.USER_LOGIN({ userId: '123', timestamp: Date.now() });
 *   };
 *
 *   const handleLogout = () => {
 *     emitters.USER_LOGOUT({});
 *   };
 *
 *   return (
 *     <View>
 *       <Pressable onPress={handleLogin}><Text>Login</Text></Pressable>
 *       <Pressable onPress={handleLogout}><Text>Logout</Text></Pressable>
 *     </View>
 *   );
 * }
 * ```
 */
export function useEventEmitters<Events extends BaseEvent>(
  eventTypes: Events['type'][],
  options: EmitOptions = {}
): Record<Events['type'], (payload: Events['payload'], version?: number) => Events> {
  const bus = useEventBusContext<Events>();

  const emitters = useMemo(() => {
    const result: Record<string, (payload: Events['payload'], version?: number) => Events> = {};

    for (const eventType of eventTypes) {
      result[eventType] = (payload: Events['payload'], version: number = 1) => {
        return bus.emit(eventType, payload, version, options) as Events;
      };
    }

    return result as Record<Events['type'], (payload: Events['payload'], version?: number) => Events>;
  }, [bus, eventTypes.join(','), options]);

  return emitters;
}

/**
 * Hook to emit an event when a condition becomes true.
 *
 * Useful for emitting events based on state changes.
 *
 * @param condition - When true, emit the event
 * @param eventType - The event type to emit
 * @param payload - The event payload (or function returning payload)
 * @param version - Event version (default: 1)
 * @param options - Optional emit options
 *
 * @example
 * ```tsx
 * function DataLoader() {
 *   const [data, setData] = useState<Data | null>(null);
 *   const [loading, setLoading] = useState(true);
 *
 *   // Emit when data is loaded
 *   useEmitOnCondition(
 *     !loading && data !== null,
 *     'DATA_LOADED',
 *     () => ({ dataId: data?.id, timestamp: Date.now() })
 *   );
 *
 *   return loading ? <Text>Loading...</Text> : <DataView data={data} />;
 * }
 * ```
 */
export function useEmitOnCondition<E extends BaseEvent>(
  condition: boolean,
  eventType: E['type'],
  payload: E['payload'] | (() => E['payload']),
  version: number = 1,
  options: EmitOptions = {}
): void {
  const bus = useEventBusContext<E>();
  const emittedRef = useRef(false);

  useEffect(() => {
    // Reset when condition becomes false
    if (!condition) {
      emittedRef.current = false;
      return;
    }

    // Emit when condition becomes true (only once per true cycle)
    if (condition && !emittedRef.current) {
      emittedRef.current = true;
      const resolvedPayload =
        typeof payload === 'function'
          ? (payload as () => E['payload'])()
          : payload;
      bus.emit(eventType, resolvedPayload, version, options);
    }
  }, [bus, condition, eventType, payload, version, options]);
}
