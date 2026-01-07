// QueryClient utilities
export {
  createQueryClient,
  getSharedQueryClient,
  resetSharedQueryClient,
  defaultQueryClientConfig,
} from './queryClient';

// React Provider
export { QueryProvider, type QueryProviderProps } from './QueryProvider';

// Example API (demonstrates typed API functions pattern)
export {
  // Types
  type Post,
  type CreatePostParams,
  type UpdatePostParams,
  type User,
  type Comment,
  // Error class
  ApiError,
  // Posts API
  fetchPosts,
  fetchPost,
  fetchPostsByUser,
  createPost,
  updatePost,
  deletePost,
  // Users API
  fetchUsers,
  fetchUser,
  // Comments API
  fetchComments,
} from './api';

// Example hooks (demonstrates React Query patterns)
export {
  // Query key factories
  postKeys,
  userKeys,
  commentKeys,
  // Posts hooks
  usePosts,
  usePost,
  usePostsByUser,
  usePostWithDetails,
  // Users hooks
  useUsers,
  useUser,
  // Comments hooks
  useComments,
  // Mutation hooks
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useBulkDeletePosts,
} from './hooks';

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
