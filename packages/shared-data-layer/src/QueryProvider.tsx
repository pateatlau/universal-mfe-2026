import React, { useMemo, type ReactNode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryClientConfig,
} from '@tanstack/react-query';
import { createQueryClient, getSharedQueryClient } from './queryClient';

export interface QueryProviderProps {
  /**
   * Child components that will have access to React Query.
   */
  children: ReactNode;

  /**
   * Custom QueryClient instance. If not provided, uses shared singleton.
   */
  client?: QueryClient;

  /**
   * Configuration overrides when creating a new QueryClient.
   * Only used if `client` is not provided and `useSharedClient` is false.
   */
  config?: QueryClientConfig;

  /**
   * Whether to use the shared singleton QueryClient.
   * Default: true (recommended for host apps)
   *
   * Set to false if you need an isolated QueryClient (e.g., for testing
   * or for MFEs that need completely independent caching).
   */
  useSharedClient?: boolean;
}

/**
 * QueryProvider wraps your app with React Query's QueryClientProvider.
 *
 * By default, it uses a shared singleton QueryClient to enable cache sharing
 * across the application. MFEs loaded into the same host will share the cache.
 *
 * @example
 * ```tsx
 * // Host app - uses shared client (default)
 * function App() {
 *   return (
 *     <QueryProvider>
 *       <MyApp />
 *     </QueryProvider>
 *   );
 * }
 *
 * // MFE with isolated client
 * function RemoteApp() {
 *   return (
 *     <QueryProvider useSharedClient={false}>
 *       <MyRemote />
 *     </QueryProvider>
 *   );
 * }
 *
 * // Custom configuration
 * function App() {
 *   return (
 *     <QueryProvider
 *       useSharedClient={false}
 *       config={{
 *         defaultOptions: {
 *           queries: { staleTime: 60000 }
 *         }
 *       }}
 *     >
 *       <MyApp />
 *     </QueryProvider>
 *   );
 * }
 * ```
 */
export function QueryProvider({
  children,
  client,
  config,
  useSharedClient = true,
}: QueryProviderProps): React.ReactElement {
  const queryClient = useMemo(() => {
    // If a custom client is provided, use it
    if (client) {
      return client;
    }

    // Use shared singleton or create a new instance
    if (useSharedClient) {
      return getSharedQueryClient();
    }

    // Create a new isolated instance
    return createQueryClient(config);
  }, [client, config, useSharedClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
