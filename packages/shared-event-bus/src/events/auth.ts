/**
 * Authentication Events
 *
 * Events for authentication state changes and user actions.
 *
 * @version 1 - Initial release
 */

import type { EventDefinition } from '../types';

/**
 * User has logged in successfully.
 *
 * Emitted by auth module after successful authentication.
 *
 * @example
 * ```ts
 * emit('USER_LOGGED_IN', {
 *   userId: '123',
 *   email: 'user@example.com',
 *   roles: ['user', 'admin'],
 * });
 * ```
 */
export type UserLoggedInEvent = EventDefinition<
  'USER_LOGGED_IN',
  {
    /** User identifier */
    userId: string;
    /** User email (optional) */
    email?: string;
    /** User display name (optional) */
    displayName?: string;
    /** User roles for authorization */
    roles?: string[];
  },
  1
>;

/**
 * User has logged out.
 *
 * Emitted when user explicitly logs out.
 *
 * @example
 * ```ts
 * emit('USER_LOGGED_OUT', { reason: 'user_initiated' });
 * ```
 */
export type UserLoggedOutEvent = EventDefinition<
  'USER_LOGGED_OUT',
  {
    /** Reason for logout */
    reason?: 'user_initiated' | 'session_expired' | 'forced' | 'error';
  },
  1
>;

/**
 * User session has expired.
 *
 * Emitted when the auth token expires or becomes invalid.
 * Different from USER_LOGGED_OUT as it wasn't user-initiated.
 *
 * @example
 * ```ts
 * emit('SESSION_EXPIRED', {
 *   expiredAt: Date.now(),
 *   redirectTo: '/login',
 * });
 * ```
 */
export type SessionExpiredEvent = EventDefinition<
  'SESSION_EXPIRED',
  {
    /** Timestamp when session expired */
    expiredAt: number;
    /** Suggested redirect path */
    redirectTo?: string;
  },
  1
>;

/**
 * Authentication error occurred.
 *
 * Emitted when authentication fails (login, token refresh, etc.).
 *
 * @example
 * ```ts
 * emit('AUTH_ERROR', {
 *   code: 'INVALID_CREDENTIALS',
 *   message: 'Invalid email or password',
 * });
 * ```
 */
export type AuthErrorEvent = EventDefinition<
  'AUTH_ERROR',
  {
    /** Error code for programmatic handling */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Whether retry is possible */
    retryable?: boolean;
  },
  1
>;

/**
 * Request to show login UI.
 *
 * MFEs emit this when they need the user to authenticate.
 *
 * @example
 * ```ts
 * emit('LOGIN_REQUIRED', {
 *   returnTo: '/dashboard',
 *   message: 'Please log in to continue',
 * });
 * ```
 */
export type LoginRequiredEvent = EventDefinition<
  'LOGIN_REQUIRED',
  {
    /** Path to return to after login */
    returnTo?: string;
    /** Optional message to show on login screen */
    message?: string;
  },
  1
>;

/**
 * User profile has been updated.
 *
 * Emitted when user profile information changes.
 *
 * @example
 * ```ts
 * emit('USER_PROFILE_UPDATED', {
 *   userId: '123',
 *   changes: ['displayName', 'avatar'],
 * });
 * ```
 */
export type UserProfileUpdatedEvent = EventDefinition<
  'USER_PROFILE_UPDATED',
  {
    /** User identifier */
    userId: string;
    /** List of changed fields */
    changes: string[];
    /** New profile data (partial) */
    profile?: Record<string, unknown>;
  },
  1
>;

/**
 * Union of all authentication events.
 */
export type AuthEvents =
  | UserLoggedInEvent
  | UserLoggedOutEvent
  | SessionExpiredEvent
  | AuthErrorEvent
  | LoginRequiredEvent
  | UserProfileUpdatedEvent;

/**
 * Auth event type constants.
 */
export const AuthEventTypes = {
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
} as const;
