/**
 * Remote Module Events
 *
 * Events for remote MFE loading lifecycle.
 *
 * @version 1 - Initial release
 */

import type { EventDefinition } from '../types';

/**
 * Remote module is being loaded.
 *
 * Emitted when starting to load a remote module.
 *
 * @example
 * ```ts
 * emit('REMOTE_LOADING', {
 *   remoteName: 'HelloRemote',
 *   url: 'http://localhost:9003/remoteEntry.js',
 * });
 * ```
 */
export type RemoteLoadingEvent = EventDefinition<
  'REMOTE_LOADING',
  {
    /** Name of the remote module */
    remoteName: string;
    /** URL being loaded */
    url?: string;
    /** Start timestamp */
    startedAt: number;
  },
  1
>;

/**
 * Remote module loaded successfully.
 *
 * Emitted after a remote module has been loaded and initialized.
 *
 * @example
 * ```ts
 * useEventListener('REMOTE_LOADED', (event) => {
 *   console.log(`${event.payload.remoteName} loaded in ${event.payload.loadTime}ms`);
 * });
 * ```
 */
export type RemoteLoadedEvent = EventDefinition<
  'REMOTE_LOADED',
  {
    /** Name of the remote module */
    remoteName: string;
    /** URL that was loaded */
    url?: string;
    /** Time to load in milliseconds */
    loadTime: number;
    /** Module version if available */
    version?: string;
  },
  1
>;

/**
 * Remote module failed to load.
 *
 * Emitted when a remote module fails to load.
 *
 * @example
 * ```ts
 * useEventListener('REMOTE_LOAD_FAILED', (event) => {
 *   showErrorToast(`Failed to load ${event.payload.remoteName}`);
 * });
 * ```
 */
export type RemoteLoadFailedEvent = EventDefinition<
  'REMOTE_LOAD_FAILED',
  {
    /** Name of the remote module */
    remoteName: string;
    /** URL that failed */
    url?: string;
    /** Error code for programmatic handling */
    errorCode: 'NETWORK_ERROR' | 'TIMEOUT' | 'SCRIPT_ERROR' | 'INIT_ERROR' | 'RENDER_ERROR' | 'LOAD_ERROR' | 'UNKNOWN';
    /** Error message */
    errorMessage: string;
    /** Number of retry attempts made */
    retryCount?: number;
    /** Whether more retries will be attempted */
    willRetry?: boolean;
  },
  1
>;

/**
 * Remote module is being retried.
 *
 * Emitted when retrying a failed remote module load.
 *
 * @example
 * ```ts
 * useEventListener('REMOTE_RETRYING', (event) => {
 *   console.log(`Retrying ${event.payload.remoteName} (attempt ${event.payload.attempt})`);
 * });
 * ```
 */
export type RemoteRetryingEvent = EventDefinition<
  'REMOTE_RETRYING',
  {
    /** Name of the remote module */
    remoteName: string;
    /** Current retry attempt number */
    attempt: number;
    /** Maximum retry attempts */
    maxAttempts: number;
    /** Delay before retry in ms */
    delayMs: number;
  },
  1
>;

/**
 * Remote module has been unloaded.
 *
 * Emitted when a remote module is unloaded/unmounted.
 *
 * @example
 * ```ts
 * emit('REMOTE_UNLOADED', { remoteName: 'HelloRemote' });
 * ```
 */
export type RemoteUnloadedEvent = EventDefinition<
  'REMOTE_UNLOADED',
  {
    /** Name of the remote module */
    remoteName: string;
    /** Reason for unload */
    reason?: 'unmount' | 'error' | 'refresh';
  },
  1
>;

/**
 * Union of all remote module events.
 */
export type RemoteEvents =
  | RemoteLoadingEvent
  | RemoteLoadedEvent
  | RemoteLoadFailedEvent
  | RemoteRetryingEvent
  | RemoteUnloadedEvent;

/**
 * Remote event type constants.
 */
export const RemoteEventTypes = {
  REMOTE_LOADING: 'REMOTE_LOADING',
  REMOTE_LOADED: 'REMOTE_LOADED',
  REMOTE_LOAD_FAILED: 'REMOTE_LOAD_FAILED',
  REMOTE_RETRYING: 'REMOTE_RETRYING',
  REMOTE_UNLOADED: 'REMOTE_UNLOADED',
} as const;
