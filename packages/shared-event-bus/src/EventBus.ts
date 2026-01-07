/**
 * EventBus - Core pub/sub implementation
 *
 * A lightweight, type-safe event bus for inter-MFE communication.
 * Features:
 * - Type-safe events with discriminated unions
 * - Event versioning for forward compatibility
 * - Priority-based handler execution
 * - Event history for debugging
 * - Wildcard subscriptions
 */

import type {
  BaseEvent,
  EventHandler,
  Subscription,
  SubscribeOptions,
  EmitOptions,
  EventBusOptions,
  EventBusStats,
  EventHistoryEntry,
} from './types';

/** Internal handler entry with metadata */
interface HandlerEntry<E extends BaseEvent> {
  id: string;
  handler: EventHandler<E>;
  priority: number;
  once: boolean;
  filter?: (event: E) => boolean;
}

/** Wildcard event type for subscribing to all events */
export const WILDCARD_EVENT = '*';

/**
 * Generate a unique subscription ID.
 */
function generateId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a new EventBus instance.
 *
 * @param options - Configuration options
 * @returns EventBus instance
 *
 * @example
 * ```ts
 * const bus = createEventBus({ debug: true });
 *
 * // Subscribe to events
 * bus.subscribe('USER_LOGGED_IN', (event) => {
 *   console.log('User logged in:', event.payload.userId);
 * });
 *
 * // Emit events
 * bus.emit('USER_LOGGED_IN', { userId: '123' });
 * ```
 */
export function createEventBus<Events extends BaseEvent = BaseEvent>(
  options: EventBusOptions = {}
) {
  const {
    maxHistorySize = 100,
    debug = false,
    logger = console.log,
    name = 'EventBus',
  } = options;

  // Storage for handlers by event type
  const handlers = new Map<string, HandlerEntry<Events>[]>();

  // Event history for debugging
  const eventHistory: EventHistoryEntry<Events>[] = [];

  // Statistics
  let totalEventsEmitted = 0;
  const eventCounts: Record<string, number> = {};

  /**
   * Log a debug message if debug mode is enabled.
   */
  function log(message: string, data?: unknown): void {
    if (debug) {
      logger(`[${name}] ${message}`, data);
    }
  }

  /**
   * Get handlers for a specific event type, sorted by priority.
   */
  function getHandlers(eventType: string): HandlerEntry<Events>[] {
    const typeHandlers = handlers.get(eventType) || [];
    const wildcardHandlers = handlers.get(WILDCARD_EVENT) || [];
    return [...typeHandlers, ...wildcardHandlers].sort(
      (a, b) => a.priority - b.priority
    );
  }

  /**
   * Subscribe to an event type.
   *
   * @param eventType - The event type to subscribe to (or '*' for all events)
   * @param handler - Handler function called when event is emitted
   * @param options - Subscription options
   * @returns Subscription object with unsubscribe method
   */
  function subscribe<E extends Events>(
    eventType: E['type'] | typeof WILDCARD_EVENT,
    handler: EventHandler<E>,
    options: SubscribeOptions<E> = {}
  ): Subscription {
    const { filter, priority = 0, once = false } = options;

    const id = generateId();
    const entry: HandlerEntry<Events> = {
      id,
      handler: handler as EventHandler<Events>,
      priority,
      once,
      filter: filter as ((event: Events) => boolean) | undefined,
    };

    const existing = handlers.get(eventType) || [];
    handlers.set(eventType, [...existing, entry]);

    log(`Subscribed to "${eventType}"`, { id, priority, once });

    return {
      id,
      unsubscribe: () => {
        const current = handlers.get(eventType) || [];
        handlers.set(
          eventType,
          current.filter((h) => h.id !== id)
        );
        log(`Unsubscribed from "${eventType}"`, { id });
      },
    };
  }

  /**
   * Subscribe to an event type, receiving only one event.
   *
   * @param eventType - The event type to subscribe to
   * @param handler - Handler function called when event is emitted
   * @param options - Subscription options (once is always true)
   * @returns Subscription object with unsubscribe method
   */
  function subscribeOnce<E extends Events>(
    eventType: E['type'],
    handler: EventHandler<E>,
    options: Omit<SubscribeOptions<E>, 'once'> = {}
  ): Subscription {
    return subscribe(eventType, handler, { ...options, once: true });
  }

  /**
   * Emit an event to all subscribers.
   *
   * @param eventType - The event type
   * @param payload - Event payload
   * @param version - Event version (default: 1)
   * @param options - Emit options
   * @returns The emitted event
   */
  function emit<E extends Events>(
    eventType: E['type'],
    payload: E['payload'],
    version: number = 1,
    options: EmitOptions = {}
  ): E {
    const event = {
      type: eventType,
      version,
      payload,
      timestamp: Date.now(),
      source: options.source,
      correlationId: options.correlationId,
    } as E;

    const startTime = performance.now();
    const matchingHandlers = getHandlers(eventType);
    const handlersToRemove: string[] = [];

    log(`Emitting "${eventType}"`, { payload, version, handlerCount: matchingHandlers.length });

    for (const entry of matchingHandlers) {
      // Apply filter if present
      if (entry.filter && !entry.filter(event)) {
        continue;
      }

      try {
        entry.handler(event);
      } catch (error) {
        console.error(`[${name}] Handler error for "${eventType}":`, error);
      }

      // Mark once handlers for removal
      if (entry.once) {
        handlersToRemove.push(entry.id);
      }
    }

    // Remove once handlers
    for (const id of handlersToRemove) {
      for (const [type, entries] of handlers) {
        handlers.set(
          type,
          entries.filter((h) => h.id !== id)
        );
      }
    }

    const processingTime = performance.now() - startTime;

    // Update statistics
    totalEventsEmitted++;
    eventCounts[eventType] = (eventCounts[eventType] || 0) + 1;

    // Add to history
    const historyEntry: EventHistoryEntry<Events> = {
      event,
      handlerCount: matchingHandlers.length,
      processingTime,
    };
    eventHistory.push(historyEntry);

    // Trim history if needed
    while (eventHistory.length > maxHistorySize) {
      eventHistory.shift();
    }

    return event;
  }

  /**
   * Check if there are any subscribers for an event type.
   *
   * @param eventType - The event type to check
   * @returns True if there are subscribers
   */
  function hasSubscribers(eventType: string): boolean {
    const typeHandlers = handlers.get(eventType) || [];
    const wildcardHandlers = handlers.get(WILDCARD_EVENT) || [];
    return typeHandlers.length > 0 || wildcardHandlers.length > 0;
  }

  /**
   * Get the number of subscribers for an event type.
   *
   * @param eventType - The event type to check
   * @returns Number of subscribers
   */
  function subscriberCount(eventType: string): number {
    const typeHandlers = handlers.get(eventType) || [];
    const wildcardHandlers = handlers.get(WILDCARD_EVENT) || [];
    return typeHandlers.length + wildcardHandlers.length;
  }

  /**
   * Remove all subscribers for an event type.
   *
   * @param eventType - The event type to clear (omit to clear all)
   */
  function clear(eventType?: string): void {
    if (eventType) {
      handlers.delete(eventType);
      log(`Cleared subscribers for "${eventType}"`);
    } else {
      handlers.clear();
      log('Cleared all subscribers');
    }
  }

  /**
   * Get event history.
   *
   * @param eventType - Optional filter by event type
   * @param limit - Maximum number of entries to return
   * @returns Array of history entries (newest first)
   */
  function getHistory(
    eventType?: string,
    limit?: number
  ): EventHistoryEntry<Events>[] {
    let result = [...eventHistory].reverse();

    if (eventType) {
      result = result.filter((entry) => entry.event.type === eventType);
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }

  /**
   * Clear event history.
   */
  function clearHistory(): void {
    eventHistory.length = 0;
    log('Cleared event history');
  }

  /**
   * Get event bus statistics.
   */
  function getStats(): EventBusStats {
    let activeSubscriptions = 0;
    for (const entries of handlers.values()) {
      activeSubscriptions += entries.length;
    }

    return {
      totalEventsEmitted,
      activeSubscriptions,
      eventCounts: { ...eventCounts },
      historySize: eventHistory.length,
    };
  }

  /**
   * Wait for an event to be emitted.
   *
   * @param eventType - The event type to wait for
   * @param timeout - Maximum time to wait in ms (default: 30000)
   * @param filter - Optional filter predicate
   * @returns Promise that resolves with the event
   */
  function waitFor<E extends Events>(
    eventType: E['type'],
    timeout: number = 30000,
    filter?: (event: E) => boolean
  ): Promise<E> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        subscription.unsubscribe();
        reject(new Error(`Timeout waiting for event "${eventType}"`));
      }, timeout);

      const subscription = subscribe<E>(
        eventType,
        (event) => {
          clearTimeout(timeoutId);
          resolve(event);
        },
        { filter, once: true }
      );
    });
  }

  return {
    subscribe,
    subscribeOnce,
    emit,
    hasSubscribers,
    subscriberCount,
    clear,
    getHistory,
    clearHistory,
    getStats,
    waitFor,
  };
}

/** Event bus instance type */
export type EventBus<Events extends BaseEvent = BaseEvent> = ReturnType<
  typeof createEventBus<Events>
>;
