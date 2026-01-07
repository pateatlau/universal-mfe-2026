/**
 * RemoteErrorBoundary
 *
 * A React Error Boundary for catching errors in remote MFE components.
 * Provides fallback UI and emits events when errors occur.
 *
 * This boundary catches:
 * - Errors during rendering of the remote component
 * - Errors in lifecycle methods of the remote component
 * - Errors in constructors of child components
 *
 * It does NOT catch:
 * - Errors in event handlers (use try/catch)
 * - Errors in async code (use try/catch or .catch())
 * - Errors in the error boundary itself
 */

import React, { Component, ReactNode } from 'react';
import { RemoteErrorFallback, RemoteErrorFallbackProps } from './RemoteErrorFallback';
import type { EventBus } from '../EventBus';
import type { BaseEvent } from '../types';
import { RemoteEventTypes } from '../events/remote';

export interface RemoteErrorBoundaryProps {
  /** Children to render (the remote component) */
  children: ReactNode;
  /** Name of the remote module for error reporting */
  remoteName: string;
  /** Custom fallback component to render on error */
  fallback?: ReactNode | ((props: ErrorFallbackRenderProps) => ReactNode);
  /** Props to pass to the default fallback component */
  fallbackProps?: Partial<RemoteErrorFallbackProps>;
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Callback to retry loading/rendering */
  onRetry?: () => void;
  /** Event bus instance for emitting error events */
  eventBus?: EventBus<BaseEvent>;
  /** Whether to reset the error state when children change */
  resetOnChildChange?: boolean;
}

export interface ErrorFallbackRenderProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  remoteName: string;
  resetError: () => void;
  retry: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component for remote MFEs.
 *
 * Usage:
 * ```tsx
 * <RemoteErrorBoundary
 *   remoteName="HelloRemote"
 *   onRetry={() => loadRemote()}
 *   eventBus={bus}
 * >
 *   <HelloRemote />
 * </RemoteErrorBoundary>
 * ```
 *
 * With custom fallback:
 * ```tsx
 * <RemoteErrorBoundary
 *   remoteName="HelloRemote"
 *   fallback={({ error, retry }) => (
 *     <MyCustomErrorUI error={error} onRetry={retry} />
 *   )}
 * >
 *   <HelloRemote />
 * </RemoteErrorBoundary>
 * ```
 */
export class RemoteErrorBoundary extends Component<
  RemoteErrorBoundaryProps,
  State
> {
  constructor(props: RemoteErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Emit error event via event bus if provided
    if (this.props.eventBus) {
      this.props.eventBus.emit(
        RemoteEventTypes.REMOTE_LOAD_FAILED,
        {
          remoteName: this.props.remoteName,
          errorMessage: error.message,
          errorCode: 'RENDER_ERROR' as const,
          retryable: true,
        },
        1,
        { source: 'RemoteErrorBoundary' }
      );
    }

    // Log in development
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[RemoteErrorBoundary] Error in ${this.props.remoteName}:`,
        error,
        errorInfo.componentStack
      );
    }
  }

  componentDidUpdate(prevProps: RemoteErrorBoundaryProps): void {
    // Reset error state when children change (if enabled)
    if (
      this.props.resetOnChildChange &&
      this.state.hasError &&
      prevProps.children !== this.props.children
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  retry = (): void => {
    this.resetError();
    this.props.onRetry?.();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, remoteName, fallback, fallbackProps, onRetry } =
      this.props;

    if (hasError && error) {
      // Custom fallback function
      if (typeof fallback === 'function') {
        return fallback({
          error,
          errorInfo,
          remoteName,
          resetError: this.resetError,
          retry: this.retry,
        });
      }

      // Custom fallback element
      if (fallback) {
        return fallback;
      }

      // Default fallback
      return (
        <RemoteErrorFallback
          error={error}
          remoteName={remoteName}
          onRetry={onRetry ? this.retry : undefined}
          {...fallbackProps}
        />
      );
    }

    return children;
  }
}

export default RemoteErrorBoundary;
