/**
 * EventHistory - Event history viewer for debugging
 *
 * Provides utilities for inspecting event history,
 * filtering events, and exporting for analysis.
 */

import type { BaseEvent, EventBus, EventHistoryEntry } from '../index';

/**
 * Filter options for querying event history.
 */
export interface HistoryFilter {
  /** Filter by event type(s) */
  types?: string[];
  /** Filter by source */
  source?: string;
  /** Filter by time range (start timestamp) */
  since?: number;
  /** Filter by time range (end timestamp) */
  until?: number;
  /** Filter by correlation ID */
  correlationId?: string;
  /** Filter by version */
  version?: number;
  /** Custom filter predicate */
  predicate?: (event: BaseEvent) => boolean;
}

/**
 * Event history statistics.
 */
export interface HistoryStats {
  /** Total number of events */
  totalEvents: number;
  /** Events by type */
  byType: Record<string, number>;
  /** Events by source */
  bySource: Record<string, number>;
  /** Average events per minute */
  eventsPerMinute: number;
  /** Time span of history (ms) */
  timeSpan: number;
  /** Most frequent event type */
  mostFrequent: { type: string; count: number } | null;
}

/**
 * Create a history viewer for an event bus.
 *
 * Provides methods to query, filter, and analyze event history.
 *
 * @param bus - Event bus instance
 * @returns History viewer object
 *
 * @example
 * ```ts
 * const bus = createEventBus<AppEvents>({ maxHistorySize: 500 });
 * const history = createHistoryViewer(bus);
 *
 * // Get recent navigation events
 * const navEvents = history.filter({ types: ['NAVIGATE_TO', 'NAVIGATE_BACK'] });
 *
 * // Get stats
 * const stats = history.getStats();
 * console.log('Most frequent:', stats.mostFrequent);
 *
 * // Export for analysis
 * const json = history.export();
 * ```
 */
export function createHistoryViewer<Events extends BaseEvent>(
  bus: EventBus<Events>
) {
  /**
   * Get all events from history.
   */
  function getAll(): EventHistoryEntry<Events>[] {
    return bus.getHistory();
  }

  /**
   * Filter events by criteria.
   */
  function filter(options: HistoryFilter): EventHistoryEntry<Events>[] {
    let entries = bus.getHistory();

    if (options.types && options.types.length > 0) {
      entries = entries.filter((e) => options.types!.includes(e.event.type));
    }

    if (options.source) {
      entries = entries.filter((e) => e.event.source === options.source);
    }

    if (options.since !== undefined) {
      entries = entries.filter((e) => e.event.timestamp >= options.since!);
    }

    if (options.until !== undefined) {
      entries = entries.filter((e) => e.event.timestamp <= options.until!);
    }

    if (options.correlationId) {
      entries = entries.filter(
        (e) => e.event.correlationId === options.correlationId
      );
    }

    if (options.version !== undefined) {
      entries = entries.filter((e) => e.event.version === options.version);
    }

    if (options.predicate) {
      entries = entries.filter((e) => options.predicate!(e.event));
    }

    return entries;
  }

  /**
   * Get events from the last N milliseconds.
   */
  function recent(ms: number): EventHistoryEntry<Events>[] {
    const since = Date.now() - ms;
    return filter({ since });
  }

  /**
   * Get the last N events.
   */
  function last(count: number): EventHistoryEntry<Events>[] {
    return bus.getHistory(undefined, count);
  }

  /**
   * Find events by payload content.
   */
  function search(
    query: string | RegExp,
    field?: string
  ): EventHistoryEntry<Events>[] {
    const regex = typeof query === 'string' ? new RegExp(query, 'i') : query;

    return bus.getHistory().filter((entry) => {
      const payload = entry.event.payload;
      if (!payload || typeof payload !== 'object') {
        return false;
      }

      if (field) {
        const value = (payload as Record<string, unknown>)[field];
        return value !== undefined && regex.test(String(value));
      }

      // Search all string values
      return Object.values(payload as Record<string, unknown>).some(
        (value) => typeof value === 'string' && regex.test(value)
      );
    });
  }

  /**
   * Get statistics about event history.
   */
  function getStats(): HistoryStats {
    const entries = bus.getHistory();

    if (entries.length === 0) {
      return {
        totalEvents: 0,
        byType: {},
        bySource: {},
        eventsPerMinute: 0,
        timeSpan: 0,
        mostFrequent: null,
      };
    }

    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const entry of entries) {
      // Count by type
      byType[entry.event.type] = (byType[entry.event.type] || 0) + 1;

      // Count by source
      const source = entry.event.source || '(no source)';
      bySource[source] = (bySource[source] || 0) + 1;
    }

    // Find most frequent
    let mostFrequent: { type: string; count: number } | null = null;
    for (const [type, count] of Object.entries(byType)) {
      if (!mostFrequent || count > mostFrequent.count) {
        mostFrequent = { type, count };
      }
    }

    // Calculate time span and rate
    const timestamps = entries.map((e) => e.event.timestamp);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeSpan = maxTime - minTime;
    const eventsPerMinute =
      timeSpan > 0 ? (entries.length / timeSpan) * 60000 : 0;

    return {
      totalEvents: entries.length,
      byType,
      bySource,
      eventsPerMinute: Math.round(eventsPerMinute * 100) / 100,
      timeSpan,
      mostFrequent,
    };
  }

  /**
   * Group events by a key.
   */
  function groupBy(
    key: 'type' | 'source' | 'correlationId' | ((event: BaseEvent) => string)
  ): Map<string, EventHistoryEntry<Events>[]> {
    const groups = new Map<string, EventHistoryEntry<Events>[]>();
    const entries = bus.getHistory();

    for (const entry of entries) {
      let groupKey: string;

      if (typeof key === 'function') {
        groupKey = key(entry.event);
      } else if (key === 'type') {
        groupKey = entry.event.type;
      } else if (key === 'source') {
        groupKey = entry.event.source || '(no source)';
      } else {
        groupKey = entry.event.correlationId || '(no correlation)';
      }

      const group = groups.get(groupKey) || [];
      group.push(entry);
      groups.set(groupKey, group);
    }

    return groups;
  }

  /**
   * Export history as JSON string.
   */
  function exportJson(options?: HistoryFilter): string {
    const entries = options ? filter(options) : bus.getHistory();
    return JSON.stringify(
      entries.map((e) => ({
        type: e.event.type,
        version: e.event.version,
        payload: e.event.payload,
        timestamp: e.event.timestamp,
        source: e.event.source,
        correlationId: e.event.correlationId,
        handlerCount: e.handlerCount,
        processingTime: e.processingTime,
      })),
      null,
      2
    );
  }

  /**
   * Print formatted history to console.
   */
  function print(options?: HistoryFilter & { limit?: number }): void {
    const entries = options ? filter(options) : bus.getHistory();
    const limited = options?.limit ? entries.slice(0, options.limit) : entries;

    console.group(`Event History (${limited.length} of ${entries.length})`);

    for (const entry of limited) {
      const time = new Date(entry.event.timestamp).toISOString();
      console.log(
        `[${time}] ${entry.event.type}`,
        entry.event.payload,
        `(${entry.handlerCount} handlers, ${entry.processingTime.toFixed(2)}ms)`
      );
    }

    console.groupEnd();
  }

  /**
   * Clear event history.
   */
  function clear(): void {
    bus.clearHistory();
  }

  return {
    getAll,
    filter,
    recent,
    last,
    search,
    getStats,
    groupBy,
    export: exportJson,
    print,
    clear,
  };
}

/**
 * Type for the history viewer object.
 */
export type HistoryViewer<Events extends BaseEvent> = ReturnType<
  typeof createHistoryViewer<Events>
>;
