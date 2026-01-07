/**
 * Example React Query hooks for fetching data.
 *
 * These hooks demonstrate best practices:
 * - Type-safe query keys using arrays
 * - Proper options typing with Omit for required params
 * - Enabled flag for conditional fetching
 * - Select for data transformation
 */

import { useQuery, useQueries, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchPosts,
  fetchPost,
  fetchPostsByUser,
  fetchUsers,
  fetchUser,
  fetchComments,
  type Post,
  type User,
  type Comment,
} from '../api/exampleApi';

// =============================================================================
// Query Keys
// =============================================================================

/**
 * Query key factory for posts.
 * Using a factory ensures consistent key structure across the app.
 */
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: { userId?: number }) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
};

/**
 * Query key factory for users.
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

/**
 * Query key factory for comments.
 */
export const commentKeys = {
  all: ['comments'] as const,
  byPost: (postId: number) => [...commentKeys.all, 'post', postId] as const,
};

// =============================================================================
// Posts Hooks
// =============================================================================

type UsePostsOptions = Omit<
  UseQueryOptions<Post[], Error>,
  'queryKey' | 'queryFn'
>;

/**
 * Hook to fetch all posts.
 *
 * @example
 * ```tsx
 * function PostList() {
 *   const { data: posts, isLoading, error } = usePosts();
 *
 *   if (isLoading) return <Text>Loading...</Text>;
 *   if (error) return <Text>Error: {error.message}</Text>;
 *
 *   return posts.map(post => <PostCard key={post.id} post={post} />);
 * }
 * ```
 */
export function usePosts(options?: UsePostsOptions) {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: fetchPosts,
    ...options,
  });
}

type UsePostsByUserOptions = Omit<
  UseQueryOptions<Post[], Error>,
  'queryKey' | 'queryFn'
>;

/**
 * Hook to fetch posts by user ID.
 *
 * @example
 * ```tsx
 * function UserPosts({ userId }: { userId: number }) {
 *   const { data: posts } = usePostsByUser(userId);
 *   return posts?.map(post => <PostCard key={post.id} post={post} />);
 * }
 * ```
 */
export function usePostsByUser(userId: number, options?: UsePostsByUserOptions) {
  return useQuery({
    queryKey: postKeys.list({ userId }),
    queryFn: () => fetchPostsByUser(userId),
    enabled: userId > 0,
    ...options,
  });
}

type UsePostOptions = Omit<
  UseQueryOptions<Post, Error>,
  'queryKey' | 'queryFn'
>;

/**
 * Hook to fetch a single post by ID.
 *
 * @example
 * ```tsx
 * function PostDetail({ postId }: { postId: number }) {
 *   const { data: post, isLoading } = usePost(postId);
 *
 *   if (isLoading) return <Text>Loading...</Text>;
 *   if (!post) return <Text>Post not found</Text>;
 *
 *   return (
 *     <View>
 *       <Text>{post.title}</Text>
 *       <Text>{post.body}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function usePost(id: number, options?: UsePostOptions) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => fetchPost(id),
    enabled: id > 0,
    ...options,
  });
}

// =============================================================================
// Users Hooks
// =============================================================================

type UseUsersOptions = Omit<
  UseQueryOptions<User[], Error>,
  'queryKey' | 'queryFn'
>;

/**
 * Hook to fetch all users.
 */
export function useUsers(options?: UseUsersOptions) {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: fetchUsers,
    ...options,
  });
}

type UseUserOptions = Omit<
  UseQueryOptions<User, Error>,
  'queryKey' | 'queryFn'
>;

/**
 * Hook to fetch a single user by ID.
 */
export function useUser(id: number, options?: UseUserOptions) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: id > 0,
    ...options,
  });
}

// =============================================================================
// Comments Hooks
// =============================================================================

type UseCommentsOptions = Omit<
  UseQueryOptions<Comment[], Error>,
  'queryKey' | 'queryFn'
>;

/**
 * Hook to fetch comments for a post.
 */
export function useComments(postId: number, options?: UseCommentsOptions) {
  return useQuery({
    queryKey: commentKeys.byPost(postId),
    queryFn: () => fetchComments(postId),
    enabled: postId > 0,
    ...options,
  });
}

// =============================================================================
// Parallel Queries Example
// =============================================================================

/**
 * Hook to fetch a post with its author and comments in parallel.
 * Demonstrates useQueries for parallel data fetching.
 *
 * @example
 * ```tsx
 * function PostWithDetails({ postId }: { postId: number }) {
 *   const { post, author, comments, isLoading } = usePostWithDetails(postId);
 *
 *   if (isLoading) return <Text>Loading...</Text>;
 *
 *   return (
 *     <View>
 *       <Text>{post?.title}</Text>
 *       <Text>By: {author?.name}</Text>
 *       <Text>Comments: {comments?.length}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function usePostWithDetails(postId: number) {
  const results = useQueries({
    queries: [
      {
        queryKey: postKeys.detail(postId),
        queryFn: () => fetchPost(postId),
        enabled: postId > 0,
      },
      {
        queryKey: commentKeys.byPost(postId),
        queryFn: () => fetchComments(postId),
        enabled: postId > 0,
      },
    ],
  });

  const [postResult, commentsResult] = results;
  const post = postResult.data;

  // Fetch author only after we have the post
  const authorResult = useQuery({
    queryKey: userKeys.detail(post?.userId ?? 0),
    queryFn: () => fetchUser(post!.userId),
    enabled: !!post?.userId,
  });

  return {
    post,
    author: authorResult.data,
    comments: commentsResult.data,
    isLoading: postResult.isLoading || commentsResult.isLoading || authorResult.isLoading,
    isError: postResult.isError || commentsResult.isError || authorResult.isError,
    errors: [postResult.error, commentsResult.error, authorResult.error].filter(Boolean),
  };
}
