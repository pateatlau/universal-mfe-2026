import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

/**
 * Default configuration for React Query in the microfrontend architecture.
 *
 * These defaults are optimized for:
 * - Universal apps (web + mobile)
 * - MFE independence (each MFE can override)
 * - Developer experience (sensible retry/stale time)
 */
export const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Data is considered fresh for 30 seconds
      staleTime: 30 * 1000,

      // Cache data for 5 minutes after it becomes unused
      gcTime: 5 * 60 * 1000,

      // Retry failed requests up to 3 times with exponential backoff
      retry: 3,

      // Don't refetch on window focus by default (can be noisy on mobile)
      refetchOnWindowFocus: false,

      // Don't refetch when component remounts if data is fresh
      refetchOnMount: false,

      // Refetch when network reconnects
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once (be conservative with side effects)
      retry: 1,
    },
  },
};

/**
 * Creates a new QueryClient instance with default configuration.
 *
 * @param configOverrides - Optional configuration overrides
 * @returns A configured QueryClient instance
 *
 * @example
 * ```tsx
 * // Use defaults
 * const queryClient = createQueryClient();
 *
 * // Override specific options
 * const queryClient = createQueryClient({
 *   defaultOptions: {
 *     queries: {
 *       staleTime: 60 * 1000, // 1 minute
 *     },
 *   },
 * });
 * ```
 */
export function createQueryClient(configOverrides?: QueryClientConfig): QueryClient {
  const mergedConfig: QueryClientConfig = {
    ...defaultQueryClientConfig,
    ...configOverrides,
    defaultOptions: {
      ...defaultQueryClientConfig.defaultOptions,
      ...configOverrides?.defaultOptions,
      queries: {
        ...defaultQueryClientConfig.defaultOptions?.queries,
        ...configOverrides?.defaultOptions?.queries,
      },
      mutations: {
        ...defaultQueryClientConfig.defaultOptions?.mutations,
        ...configOverrides?.defaultOptions?.mutations,
      },
    },
  };

  return new QueryClient(mergedConfig);
}

/**
 * Singleton QueryClient instance for apps that need a shared client.
 *
 * Use this when you need the same QueryClient across the entire app.
 * For MFE isolation, create separate instances with createQueryClient().
 */
let sharedQueryClient: QueryClient | null = null;

/**
 * Gets or creates the shared QueryClient singleton.
 *
 * @returns The shared QueryClient instance
 *
 * @example
 * ```tsx
 * // In host app
 * const queryClient = getSharedQueryClient();
 * ```
 */
export function getSharedQueryClient(): QueryClient {
  if (!sharedQueryClient) {
    sharedQueryClient = createQueryClient();
  }
  return sharedQueryClient;
}

/**
 * Resets the shared QueryClient singleton.
 * Useful for testing or when you need to clear all cached data.
 */
export function resetSharedQueryClient(): void {
  if (sharedQueryClient) {
    sharedQueryClient.clear();
    sharedQueryClient = null;
  }
}
