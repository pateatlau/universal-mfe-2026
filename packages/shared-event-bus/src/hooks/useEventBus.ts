/**
 * useEventBus - Hook to access the event bus instance
 *
 * Provides access to the event bus for manual operations.
 * For most cases, prefer useEventListener and useEventEmitter.
 */

import { useEventBusContext } from '../EventBusProvider';
import type { EventBus } from '../EventBus';
import type { BaseEvent } from '../types';

/**
 * Hook to access the event bus instance.
 *
 * Use this when you need direct access to the event bus API.
 * For subscribing to events, prefer useEventListener for automatic cleanup.
 * For emitting events, prefer useEventEmitter for type safety.
 *
 * @returns The event bus instance
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const bus = useEventBus<MyEvents>();
 *
 *   // Access event bus methods directly
 *   const stats = bus.getStats();
 *   const history = bus.getHistory('USER_ACTION', 10);
 *
 *   return (
 *     <View>
 *       <Text>Events emitted: {stats.totalEventsEmitted}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useEventBus<
  Events extends BaseEvent = BaseEvent,
>(): EventBus<Events> {
  return useEventBusContext<Events>();
}
