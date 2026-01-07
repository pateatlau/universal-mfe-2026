/**
 * useRemoteLoader
 *
 * A hook for loading remote MFE modules with:
 * - Automatic retry with exponential backoff
 * - Timeout handling
 * - Event emission for loading states
 * - TypeScript type safety
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { EventBus } from '../EventBus';
import type { BaseEvent } from '../types';
import { RemoteEventTypes } from '../events/remote';

export interface RemoteLoaderOptions {
  /** Name of the remote module */
  remoteName: string;
  /** Timeout in milliseconds for the load attempt (default: 10000) */
  timeout?: number;
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds for exponential backoff (default: 1000) */
  retryDelay?: number;
  /** Whether to automatically retry on failure (default: true) */
  autoRetry?: boolean;
  /** Event bus instance for emitting events */
  eventBus?: EventBus<BaseEvent>;
  /** Callback when loading starts */
  onLoadStart?: () => void;
  /** Callback when loading succeeds */
  onLoadSuccess?: (module: unknown) => void;
  /** Callback when loading fails */
  onLoadError?: (error: Error, attempt: number) => void;
  /** Callback when retrying */
  onRetry?: (attempt: number, delay: number) => void;
}

export interface RemoteLoaderState<T> {
  /** The loaded module component */
  module: T | null;
  /** Whether the module is currently loading */
  loading: boolean;
  /** Error if loading failed */
  error: Error | null;
  /** Number of load attempts made */
  attempts: number;
  /** Whether retrying is in progress */
  retrying: boolean;
}

export interface RemoteLoaderResult<T> extends RemoteLoaderState<T> {
  /** Function to trigger loading the remote */
  load: () => Promise<void>;
  /** Function to retry loading the remote */
  retry: () => Promise<void>;
  /** Function to reset the loader state */
  reset: () => void;
}

/**
 * Creates a promise that rejects after a timeout.
 */
function createTimeout(ms: number, remoteName: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout: Failed to load ${remoteName} within ${ms}ms`));
    }, ms);
  });
}

/**
 * Calculates delay with exponential backoff and jitter.
 */
function calculateBackoff(attempt: number, baseDelay: number): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  // Add jitter (±25%)
  const jitter = exponentialDelay * (0.75 + Math.random() * 0.5);
  // Cap at 30 seconds
  return Math.min(jitter, 30000);
}

/**
 * Hook for loading remote MFE modules with retry logic.
 *
 * Usage:
 * ```tsx
 * const { module: HelloRemote, loading, error, load, retry } = useRemoteLoader<typeof HelloRemote>({
 *   remoteName: 'HelloRemote',
 *   eventBus: bus,
 * });
 *
 * useEffect(() => { load(); }, [load]);
 *
 * if (loading) return <RemoteLoadingFallback />;
 * if (error) return <RemoteErrorFallback error={error} onRetry={retry} />;
 * if (HelloRemote) return <HelloRemote />;
 * ```
 */
export function useRemoteLoader<T = React.ComponentType<unknown>>(
  loadFn: () => Promise<T>,
  options: RemoteLoaderOptions
): RemoteLoaderResult<T> {
  const {
    remoteName,
    timeout = 10000,
    maxRetries = 3,
    retryDelay = 1000,
    autoRetry = true,
    eventBus,
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    onRetry,
  } = options;

  const [state, setState] = useState<RemoteLoaderState<T>>({
    module: null,
    loading: false,
    error: null,
    attempts: 0,
    retrying: false,
  });

  // Track if component is mounted to prevent state updates after unmount
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Emit an event via the event bus.
   */
  const emitEvent = useCallback(
    (type: string, payload: Record<string, unknown>) => {
      if (eventBus) {
        eventBus.emit(type, payload, 1, { source: 'useRemoteLoader' });
      }
    },
    [eventBus]
  );

  /**
   * Internal load function with retry logic.
   */
  const loadWithRetry = useCallback(
    async (attempt: number = 0): Promise<void> => {
      if (!mountedRef.current) return;

      // Emit loading event
      emitEvent(RemoteEventTypes.REMOTE_LOADING, {
        remoteName,
        attempt,
      });

      onLoadStart?.();

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        attempts: attempt + 1,
        retrying: attempt > 0,
      }));

      try {
        // Race between load and timeout
        const module = await Promise.race([
          loadFn(),
          createTimeout(timeout, remoteName),
        ]);

        if (!mountedRef.current) return;

        // Emit success event
        emitEvent(RemoteEventTypes.REMOTE_LOADED, {
          remoteName,
          attempts: attempt + 1,
        });

        onLoadSuccess?.(module);

        setState((prev) => ({
          ...prev,
          module,
          loading: false,
          error: null,
          retrying: false,
        }));
      } catch (error) {
        if (!mountedRef.current) return;

        const err = error instanceof Error ? error : new Error(String(error));

        onLoadError?.(err, attempt + 1);

        // Check if we should retry
        const shouldRetry = autoRetry && attempt < maxRetries - 1;

        if (shouldRetry) {
          const delay = calculateBackoff(attempt, retryDelay);

          // Emit retrying event
          emitEvent(RemoteEventTypes.REMOTE_RETRYING, {
            remoteName,
            attempt: attempt + 1,
            nextAttempt: attempt + 2,
            delay,
            error: err.message,
          });

          onRetry?.(attempt + 2, delay);

          // Wait and retry
          await new Promise((resolve) => setTimeout(resolve, delay));

          if (mountedRef.current) {
            return loadWithRetry(attempt + 1);
          }
        } else {
          // Emit failure event
          emitEvent(RemoteEventTypes.REMOTE_LOAD_FAILED, {
            remoteName,
            error: err.message,
            errorCode: 'LOAD_ERROR',
            attempts: attempt + 1,
            retryable: true,
          });

          setState((prev) => ({
            ...prev,
            loading: false,
            error: err,
            retrying: false,
          }));
        }
      }
    },
    [
      loadFn,
      remoteName,
      timeout,
      maxRetries,
      retryDelay,
      autoRetry,
      emitEvent,
      onLoadStart,
      onLoadSuccess,
      onLoadError,
      onRetry,
    ]
  );

  /**
   * Public load function.
   */
  const load = useCallback(async (): Promise<void> => {
    // Don't reload if already loaded
    if (state.module && !state.error) return;
    return loadWithRetry(0);
  }, [loadWithRetry, state.module, state.error]);

  /**
   * Manual retry function (resets attempt count).
   */
  const retry = useCallback(async (): Promise<void> => {
    setState((prev) => ({
      ...prev,
      attempts: 0,
      error: null,
    }));
    return loadWithRetry(0);
  }, [loadWithRetry]);

  /**
   * Reset the loader state.
   */
  const reset = useCallback((): void => {
    abortControllerRef.current?.abort();
    setState({
      module: null,
      loading: false,
      error: null,
      attempts: 0,
      retrying: false,
    });
  }, []);

  return {
    ...state,
    load,
    retry,
    reset,
  };
}

export default useRemoteLoader;
