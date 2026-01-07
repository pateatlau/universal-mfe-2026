/**
 * Standard Event Types
 *
 * Pre-defined event types for common inter-MFE communication patterns.
 * All events follow the versioning convention for forward compatibility.
 *
 * ## Event Versioning Rules
 *
 * 1. All events include a `version` field (currently v1 for all events)
 * 2. Event evolution is **append-only**: new fields can be added, existing fields cannot be removed
 * 3. Breaking changes require a new event type (e.g., `NAVIGATE_TO_V2`)
 * 4. Host is responsible for handling multiple event versions during migration periods
 *
 * ## Event Ownership
 *
 * - **Host-owned events**: Emitted by host, consumed by MFEs
 *   - `THEME_CHANGED`, `LOCALE_CHANGED`, `NAVIGATION_COMPLETED`
 *
 * - **MFE-emitted events**: Emitted by MFEs, consumed by host
 *   - `NAVIGATE_TO`, `NAVIGATE_BACK`, `THEME_CHANGE_REQUEST`, `LOCALE_CHANGE_REQUEST`
 *
 * - **Bidirectional events**: Can be emitted by either host or MFEs
 *   - Auth events, Remote events (depending on architecture)
 *
 * @example
 * ```ts
 * import {
 *   type AppEvents,
 *   NavigationEventTypes,
 *   AuthEventTypes,
 * } from '@universal/shared-event-bus/events';
 *
 * // Create typed event bus
 * const bus = createEventBus<AppEvents>();
 *
 * // Use event type constants
 * bus.subscribe(NavigationEventTypes.NAVIGATE_TO, (event) => {
 *   router.push(event.payload.path);
 * });
 * ```
 */

// Navigation events
export {
  type NavigateToEvent,
  type NavigateBackEvent,
  type NavigationCompletedEvent,
  type OpenExternalUrlEvent,
  type NavigationEvents,
  NavigationEventTypes,
} from './navigation';

// Authentication events
export {
  type UserLoggedInEvent,
  type UserLoggedOutEvent,
  type SessionExpiredEvent,
  type AuthErrorEvent,
  type LoginRequiredEvent,
  type UserProfileUpdatedEvent,
  type AuthEvents,
  AuthEventTypes,
} from './auth';

// Theme events
export {
  type ThemeName,
  type ThemeChangedEvent,
  type ThemeChangeRequestEvent,
  type ThemeEvents,
  ThemeEventTypes,
} from './theme';

// Locale events
export {
  type LocaleChangedEvent,
  type LocaleChangeRequestEvent,
  type LocaleEvents,
  LocaleEventTypes,
} from './locale';

// Remote module events
export {
  type RemoteLoadingEvent,
  type RemoteLoadedEvent,
  type RemoteLoadFailedEvent,
  type RemoteRetryingEvent,
  type RemoteUnloadedEvent,
  type RemoteEvents,
  RemoteEventTypes,
} from './remote';

/**
 * Union of all standard application events.
 *
 * Use this type for a fully-typed event bus that handles
 * all standard events.
 *
 * @example
 * ```ts
 * const bus = createEventBus<AppEvents>({ debug: true });
 * ```
 */
import type { NavigationEvents } from './navigation';
import { NavigationEventTypes } from './navigation';
import type { AuthEvents } from './auth';
import { AuthEventTypes } from './auth';
import type { ThemeEvents } from './theme';
import { ThemeEventTypes } from './theme';
import type { LocaleEvents } from './locale';
import { LocaleEventTypes } from './locale';
import type { RemoteEvents } from './remote';
import { RemoteEventTypes } from './remote';

export type AppEvents =
  | NavigationEvents
  | AuthEvents
  | ThemeEvents
  | LocaleEvents
  | RemoteEvents;

/**
 * All event type constants combined.
 */
export const EventTypes = {
  ...NavigationEventTypes,
  ...AuthEventTypes,
  ...ThemeEventTypes,
  ...LocaleEventTypes,
  ...RemoteEventTypes,
} as const;

/**
 * Event version metadata.
 *
 * Documents the current version of each event type.
 * Use this for compatibility checks.
 */
export const EventVersions: Record<keyof typeof EventTypes, number> = {
  // Navigation events (v1)
  NAVIGATE_TO: 1,
  NAVIGATE_BACK: 1,
  NAVIGATION_COMPLETED: 1,
  OPEN_EXTERNAL_URL: 1,
  // Auth events (v1)
  USER_LOGGED_IN: 1,
  USER_LOGGED_OUT: 1,
  SESSION_EXPIRED: 1,
  AUTH_ERROR: 1,
  LOGIN_REQUIRED: 1,
  USER_PROFILE_UPDATED: 1,
  // Theme events (v1)
  THEME_CHANGED: 1,
  THEME_CHANGE_REQUEST: 1,
  // Locale events (v1)
  LOCALE_CHANGED: 1,
  LOCALE_CHANGE_REQUEST: 1,
  // Remote events (v1)
  REMOTE_LOADING: 1,
  REMOTE_LOADED: 1,
  REMOTE_LOAD_FAILED: 1,
  REMOTE_RETRYING: 1,
  REMOTE_UNLOADED: 1,
};
