/**
 * Navigation Events
 *
 * Events for navigation between views/screens.
 * MFEs emit navigation intents; hosts handle actual routing.
 *
 * @version 1 - Initial release
 */

import type { EventDefinition } from '../types';

/**
 * Request navigation to a specific route.
 *
 * MFEs should emit this event to request navigation.
 * The host application handles the actual routing.
 *
 * @example
 * ```ts
 * emit('NAVIGATE_TO', {
 *   path: '/settings',
 *   params: { tab: 'profile' },
 * });
 * ```
 */
export type NavigateToEvent = EventDefinition<
  'NAVIGATE_TO',
  {
    /** Target path or route name */
    path: string;
    /** Optional route parameters */
    params?: Record<string, string | number | boolean>;
    /** Replace current history entry instead of pushing */
    replace?: boolean;
  },
  1
>;

/**
 * Request navigation back to previous screen.
 *
 * @example
 * ```ts
 * emit('NAVIGATE_BACK', {});
 * ```
 */
export type NavigateBackEvent = EventDefinition<
  'NAVIGATE_BACK',
  {
    /** Number of steps to go back (default: 1) */
    steps?: number;
    /** Fallback path if no history */
    fallback?: string;
  },
  1
>;

/**
 * Notification that navigation has completed.
 *
 * Emitted by host after navigation is complete.
 * MFEs can listen for this to perform post-navigation actions.
 *
 * @example
 * ```ts
 * useEventListener('NAVIGATION_COMPLETED', (event) => {
 *   console.log('Now at:', event.payload.path);
 * });
 * ```
 */
export type NavigationCompletedEvent = EventDefinition<
  'NAVIGATION_COMPLETED',
  {
    /** Current path after navigation */
    path: string;
    /** Previous path before navigation */
    previousPath?: string;
    /** Route parameters */
    params?: Record<string, string | number | boolean>;
  },
  1
>;

/**
 * Request to open an external URL.
 *
 * Use this instead of directly calling window.open or Linking.openURL
 * to allow the host to handle external links appropriately.
 *
 * @example
 * ```ts
 * emit('OPEN_EXTERNAL_URL', {
 *   url: 'https://example.com',
 *   newTab: true,
 * });
 * ```
 */
export type OpenExternalUrlEvent = EventDefinition<
  'OPEN_EXTERNAL_URL',
  {
    /** URL to open */
    url: string;
    /** Open in new tab/window (web only) */
    newTab?: boolean;
  },
  1
>;

/**
 * Union of all navigation events.
 */
export type NavigationEvents =
  | NavigateToEvent
  | NavigateBackEvent
  | NavigationCompletedEvent
  | OpenExternalUrlEvent;

/**
 * Navigation event type constants.
 */
export const NavigationEventTypes = {
  NAVIGATE_TO: 'NAVIGATE_TO',
  NAVIGATE_BACK: 'NAVIGATE_BACK',
  NAVIGATION_COMPLETED: 'NAVIGATION_COMPLETED',
  OPEN_EXTERNAL_URL: 'OPEN_EXTERNAL_URL',
} as const;
