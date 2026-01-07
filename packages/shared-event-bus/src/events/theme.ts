/**
 * Theme Events
 *
 * Events for theme changes and preferences.
 *
 * @version 1 - Initial release
 */

import type { EventDefinition } from '../types';

/**
 * Theme name type (matches shared-theme-context).
 */
export type ThemeName = 'light' | 'dark' | 'system';

/**
 * Theme has changed.
 *
 * Emitted by host when theme changes.
 * MFEs can listen to sync their theme state.
 *
 * @example
 * ```ts
 * useEventListener('THEME_CHANGED', (event) => {
 *   setLocalTheme(event.payload.theme);
 * });
 * ```
 */
export type ThemeChangedEvent = EventDefinition<
  'THEME_CHANGED',
  {
    /** New theme name */
    theme: ThemeName;
    /** Previous theme name */
    previousTheme?: ThemeName;
    /** Whether this was triggered by system preference */
    isSystemPreference?: boolean;
  },
  1
>;

/**
 * Request to change theme.
 *
 * MFEs emit this to request theme change.
 * Host handles the actual theme switch.
 *
 * @example
 * ```ts
 * emit('THEME_CHANGE_REQUEST', { theme: 'dark' });
 * ```
 */
export type ThemeChangeRequestEvent = EventDefinition<
  'THEME_CHANGE_REQUEST',
  {
    /** Requested theme */
    theme: ThemeName;
  },
  1
>;

/**
 * Union of all theme events.
 */
export type ThemeEvents = ThemeChangedEvent | ThemeChangeRequestEvent;

/**
 * Theme event type constants.
 */
export const ThemeEventTypes = {
  THEME_CHANGED: 'THEME_CHANGED',
  THEME_CHANGE_REQUEST: 'THEME_CHANGE_REQUEST',
} as const;
