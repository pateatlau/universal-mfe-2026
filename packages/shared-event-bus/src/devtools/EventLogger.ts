/**
 * EventLogger - Console logging for event bus debugging
 *
 * Provides formatted console output for event bus activity.
 * Useful during development to trace event flow.
 */

import type { BaseEvent, EventBus } from '../index';
import { WILDCARD_EVENT } from '../EventBus';

/**
 * Log level for event logger.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Options for EventLogger.
 */
export interface EventLoggerOptions {
  /** Prefix for all log messages */
  prefix?: string;
  /** Whether to include timestamps */
  showTimestamp?: boolean;
  /** Whether to include event payload */
  showPayload?: boolean;
  /** Whether to use colored output (console supports it) */
  useColors?: boolean;
  /** Minimum log level to display */
  minLevel?: LogLevel;
  /** Event types to include (empty = all) */
  includeEvents?: string[];
  /** Event types to exclude */
  excludeEvents?: string[];
  /** Custom formatter function */
  formatter?: (event: BaseEvent, metadata: LogMetadata) => string;
}

/**
 * Metadata passed to custom formatter.
 */
export interface LogMetadata {
  /** Formatted timestamp */
  timestamp: string;
  /** Direction indicator */
  direction: 'emit' | 'receive';
  /** Number of handlers that received this event */
  handlerCount?: number;
}

/**
 * Log level priorities (lower = more verbose).
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Console colors for different event categories.
 */
const COLORS = {
  navigation: '#3b82f6', // blue
  auth: '#10b981', // green
  theme: '#8b5cf6', // purple
  locale: '#f59e0b', // amber
  remote: '#ef4444', // red
  default: '#6b7280', // gray
} as const;

/**
 * Get color for event type.
 */
function getEventColor(eventType: string): string {
  if (eventType.startsWith('NAVIGATE') || eventType.includes('NAVIGATION')) {
    return COLORS.navigation;
  }
  if (eventType.includes('USER') || eventType.includes('AUTH') || eventType.includes('SESSION') || eventType.includes('LOGIN')) {
    return COLORS.auth;
  }
  if (eventType.includes('THEME')) {
    return COLORS.theme;
  }
  if (eventType.includes('LOCALE')) {
    return COLORS.locale;
  }
  if (eventType.includes('REMOTE')) {
    return COLORS.remote;
  }
  return COLORS.default;
}

/**
 * Format timestamp for logging.
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[1].replace('Z', '');
}

/**
 * Create an event logger that subscribes to all events.
 *
 * @param bus - Event bus instance to log
 * @param options - Logger options
 * @returns Unsubscribe function
 *
 * @example
 * ```ts
 * const bus = createEventBus<AppEvents>();
 *
 * // Enable logging in development
 * if (__DEV__) {
 *   const unsubscribe = createEventLogger(bus, {
 *     prefix: '[EventBus]',
 *     showPayload: true,
 *     excludeEvents: ['REMOTE_LOADING'], // Too noisy
 *   });
 *
 *   // Later: unsubscribe() to stop logging
 * }
 * ```
 */
export function createEventLogger<Events extends BaseEvent>(
  bus: EventBus<Events>,
  options: EventLoggerOptions = {}
): () => void {
  const {
    prefix = '[EventBus]',
    showTimestamp = true,
    showPayload = true,
    useColors = true,
    minLevel = 'debug',
    includeEvents = [],
    excludeEvents = [],
    formatter,
  } = options;

  const subscription = bus.subscribe(WILDCARD_EVENT as Events['type'], (event) => {
    // Filter by include/exclude lists
    if (includeEvents.length > 0 && !includeEvents.includes(event.type)) {
      return;
    }
    if (excludeEvents.includes(event.type)) {
      return;
    }

    const timestamp = formatTimestamp(event.timestamp);
    const metadata: LogMetadata = {
      timestamp,
      direction: 'emit',
    };

    // Use custom formatter if provided
    if (formatter) {
      console.log(formatter(event, metadata));
      return;
    }

    // Build log message
    const parts: string[] = [];

    if (showTimestamp) {
      parts.push(`[${timestamp}]`);
    }

    parts.push(prefix);
    parts.push(event.type);

    if (event.version !== 1) {
      parts.push(`(v${event.version})`);
    }

    if (event.source) {
      parts.push(`from:${event.source}`);
    }

    // Log with or without colors
    if (useColors && typeof window !== 'undefined') {
      const color = getEventColor(event.type);
      console.log(
        `%c${parts.join(' ')}`,
        `color: ${color}; font-weight: bold;`,
        showPayload ? event.payload : ''
      );
    } else {
      console.log(parts.join(' '), showPayload ? event.payload : '');
    }
  });

  return () => subscription.unsubscribe();
}

/**
 * Create a logger that groups related events.
 *
 * Groups events by correlationId for easier tracing.
 *
 * @param bus - Event bus instance
 * @param options - Logger options
 * @returns Unsubscribe function
 *
 * @example
 * ```ts
 * const unsubscribe = createGroupedEventLogger(bus, {
 *   prefix: '[Auth Flow]',
 * });
 * ```
 */
export function createGroupedEventLogger<Events extends BaseEvent>(
  bus: EventBus<Events>,
  options: EventLoggerOptions = {}
): () => void {
  const { prefix = '[EventBus]' } = options;
  const correlationGroups = new Map<string, BaseEvent[]>();

  const subscription = bus.subscribe(WILDCARD_EVENT as Events['type'], (event) => {
    if (event.correlationId) {
      const group = correlationGroups.get(event.correlationId) || [];
      group.push(event);
      correlationGroups.set(event.correlationId, group);

      // Log as group
      console.groupCollapsed(
        `${prefix} [${event.correlationId}] ${event.type} (${group.length} events)`
      );
      group.forEach((e, i) => {
        console.log(`${i + 1}. ${e.type}`, e.payload);
      });
      console.groupEnd();
    } else {
      // Log individually
      console.log(`${prefix} ${event.type}`, event.payload);
    }
  });

  return () => {
    subscription.unsubscribe();
    correlationGroups.clear();
  };
}

/**
 * Create a table logger for batch viewing.
 *
 * Collects events and displays them in a table format.
 *
 * @param bus - Event bus instance
 * @param batchSize - Number of events before logging table (default: 10)
 * @returns Object with unsubscribe and flush methods
 *
 * @example
 * ```ts
 * const { unsubscribe, flush } = createTableLogger(bus, 5);
 *
 * // Manually flush remaining events
 * flush();
 * ```
 */
export function createTableLogger<Events extends BaseEvent>(
  bus: EventBus<Events>,
  batchSize: number = 10
): { unsubscribe: () => void; flush: () => void } {
  const batch: Array<{
    time: string;
    type: string;
    version: number;
    source: string;
    payload: string;
  }> = [];

  const flush = () => {
    if (batch.length > 0) {
      console.table(batch);
      batch.length = 0;
    }
  };

  const subscription = bus.subscribe(WILDCARD_EVENT as Events['type'], (event) => {
    batch.push({
      time: formatTimestamp(event.timestamp),
      type: event.type,
      version: event.version,
      source: event.source || '-',
      payload: JSON.stringify(event.payload).slice(0, 50),
    });

    if (batch.length >= batchSize) {
      flush();
    }
  });

  return {
    unsubscribe: () => {
      flush();
      subscription.unsubscribe();
    },
    flush,
  };
}
