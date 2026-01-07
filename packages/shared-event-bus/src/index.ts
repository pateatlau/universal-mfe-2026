/**
 * Shared Event Bus
 *
 * A lightweight, type-safe event bus for inter-MFE communication.
 *
 * @example
 * ```ts
 * import { createEventBus, type BaseEvent, type EventDefinition } from '@universal/shared-event-bus';
 *
 * // Define your events
 * type UserLoginEvent = EventDefinition<'USER_LOGIN', { userId: string }, 1>;
 * type UserLogoutEvent = EventDefinition<'USER_LOGOUT', {}, 1>;
 * type AuthEvents = UserLoginEvent | UserLogoutEvent;
 *
 * // Create event bus
 * const bus = createEventBus<AuthEvents>({ debug: true });
 *
 * // Subscribe to events
 * const subscription = bus.subscribe('USER_LOGIN', (event) => {
 *   console.log('User logged in:', event.payload.userId);
 * });
 *
 * // Emit events
 * bus.emit('USER_LOGIN', { userId: '123' });
 *
 * // Cleanup
 * subscription.unsubscribe();
 * ```
 */

// Core types
export type {
  BaseEvent,
  EventHandler,
  Subscription,
  EventFilter,
  SubscribeOptions,
  EmitOptions,
  EventBusOptions,
  EventBusStats,
  EventHistoryEntry,
  EventDefinition,
  EventType,
  EventPayload,
  EventUnion,
} from './types';

// Core implementation
export { createEventBus, WILDCARD_EVENT, type EventBus } from './EventBus';

// React integration
export {
  EventBusProvider,
  useEventBusContext,
  type EventBusProviderProps,
} from './EventBusProvider';

// React hooks
export {
  useEventBus,
  useEventListener,
  useEventListenerOnce,
  useEventListenerMultiple,
  useEventSubscriber,
  useEventEmitter,
  useTypedEmitter,
  useEventEmitters,
  useEmitOnCondition,
  type UseEventEmitterOptions,
} from './hooks';
