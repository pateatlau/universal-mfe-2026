/**
 * Event Bus Types
 *
 * Core type definitions for the type-safe event bus system.
 * All events include a version field for forward compatibility.
 */

/**
 * Base event interface that all events must extend.
 * The version field enables event schema evolution.
 */
export interface BaseEvent<T extends string = string, P = unknown> {
  /** Event type identifier */
  type: T;
  /** Event schema version for forward compatibility */
  version: number;
  /** Event payload data */
  payload: P;
  /** Timestamp when event was created */
  timestamp: number;
  /** Optional source identifier (e.g., MFE name) */
  source?: string;
  /** Optional correlation ID for tracing related events */
  correlationId?: string;
}

/**
 * Event handler function type.
 * Handlers receive the event and can optionally return a cleanup function.
 */
export type EventHandler<E extends BaseEvent> = (event: E) => void | (() => void);

/**
 * Subscription returned when subscribing to events.
 * Call unsubscribe() to remove the handler.
 */
export interface Subscription {
  /** Remove this subscription */
  unsubscribe: () => void;
  /** Unique subscription ID */
  id: string;
}

/**
 * Event filter predicate for conditional subscriptions.
 * Return true to receive the event, false to skip.
 */
export type EventFilter<E extends BaseEvent> = (event: E) => boolean;

/**
 * Options for subscribing to events.
 */
export interface SubscribeOptions<E extends BaseEvent> {
  /** Optional filter to receive only matching events */
  filter?: EventFilter<E>;
  /** Priority for handler execution (lower = earlier, default: 0) */
  priority?: number;
  /** Only receive events once, then auto-unsubscribe */
  once?: boolean;
}

/**
 * Options for emitting events.
 */
export interface EmitOptions {
  /** Source identifier (e.g., MFE name) */
  source?: string;
  /** Correlation ID for tracing */
  correlationId?: string;
}

/**
 * Event bus configuration options.
 */
export interface EventBusOptions {
  /** Maximum number of events to keep in history (default: 100) */
  maxHistorySize?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Custom logger function */
  logger?: (message: string, data?: unknown) => void;
  /** Event bus name for identification */
  name?: string;
}

/**
 * Event bus statistics.
 */
export interface EventBusStats {
  /** Total number of events emitted */
  totalEventsEmitted: number;
  /** Number of active subscriptions */
  activeSubscriptions: number;
  /** Event counts by type */
  eventCounts: Record<string, number>;
  /** History size */
  historySize: number;
}

/**
 * Event history entry with metadata.
 */
export interface EventHistoryEntry<E extends BaseEvent = BaseEvent> {
  /** The event that was emitted */
  event: E;
  /** Number of handlers that received this event */
  handlerCount: number;
  /** Processing time in milliseconds */
  processingTime: number;
}

/**
 * Helper type to create event definitions.
 * Use this to define your event types.
 *
 * @example
 * ```ts
 * type MyEvent = EventDefinition<'MY_EVENT', { message: string }, 1>;
 * // Results in: { type: 'MY_EVENT', version: 1, payload: { message: string }, timestamp: number, ... }
 * ```
 */
export type EventDefinition<
  T extends string,
  P,
  V extends number = 1,
> = BaseEvent<T, P> & { version: V };

/**
 * Extract event type string from an event definition.
 */
export type EventType<E extends BaseEvent> = E['type'];

/**
 * Extract payload type from an event definition.
 */
export type EventPayload<E extends BaseEvent> = E['payload'];

/**
 * Union type helper for creating event maps.
 * Use this to define all events in a namespace.
 *
 * @example
 * ```ts
 * type NavigationEvents =
 *   | EventDefinition<'NAVIGATE_TO', { path: string }, 1>
 *   | EventDefinition<'NAVIGATE_BACK', {}, 1>;
 * ```
 */
export type EventUnion<Events extends BaseEvent> = Events;
