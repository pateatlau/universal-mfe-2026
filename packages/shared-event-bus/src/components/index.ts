/**
 * Remote Loading Components
 *
 * Reusable components for handling remote MFE loading states:
 * - RemoteLoadingFallback: Loading indicator
 * - RemoteErrorFallback: Error display with retry
 * - RemoteErrorBoundary: React Error Boundary for catching render errors
 * - useRemoteLoader: Hook for loading with retry and timeout
 */

export {
  RemoteLoadingFallback,
  type RemoteLoadingFallbackProps,
} from './RemoteLoadingFallback';

export {
  RemoteErrorFallback,
  type RemoteErrorFallbackProps,
} from './RemoteErrorFallback';

export {
  RemoteErrorBoundary,
  type RemoteErrorBoundaryProps,
  type ErrorFallbackRenderProps,
} from './RemoteErrorBoundary';

export {
  useRemoteLoader,
  type RemoteLoaderOptions,
  type RemoteLoaderState,
  type RemoteLoaderResult,
} from './useRemoteLoader';
