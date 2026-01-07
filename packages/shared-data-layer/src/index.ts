// QueryClient utilities
export {
  createQueryClient,
  getSharedQueryClient,
  resetSharedQueryClient,
  defaultQueryClientConfig,
} from './queryClient';

// React Provider
export { QueryProvider, type QueryProviderProps } from './QueryProvider';

// Re-export commonly used React Query hooks and types
// This allows consumers to import everything from @universal/shared-data-layer
export {
  // Hooks
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  useQueries,
  useIsFetching,
  useIsMutating,
  useSuspenseQuery,
  useSuspenseInfiniteQuery,
  useSuspenseQueries,
  usePrefetchQuery,
  usePrefetchInfiniteQuery,
  // Utilities
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
  focusManager,
  onlineManager,
  // Types
  type QueryKey,
  type QueryFunction,
  type QueryOptions,
  type UseQueryOptions,
  type UseQueryResult,
  type UseMutationOptions,
  type UseMutationResult,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  type InfiniteData,
  type QueryClientConfig,
  type QueryObserverResult,
  type MutationObserverResult,
} from '@tanstack/react-query';
