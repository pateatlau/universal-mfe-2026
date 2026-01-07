/**
 * Example React Query mutation hooks for modifying data.
 *
 * These hooks demonstrate best practices:
 * - Optimistic updates with rollback on error
 * - Cache invalidation after mutations
 * - Type-safe mutation variables and context
 * - onSuccess/onError callbacks for side effects
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
  createPost,
  updatePost,
  deletePost,
  type Post,
  type CreatePostParams,
  type UpdatePostParams,
} from '../api/exampleApi';
import { postKeys } from './useExampleQuery';

// =============================================================================
// Create Post
// =============================================================================

type UseCreatePostOptions = Omit<
  UseMutationOptions<Post, Error, CreatePostParams>,
  'mutationFn'
>;

/**
 * Hook to create a new post.
 *
 * @example
 * ```tsx
 * function CreatePostForm() {
 *   const createPost = useCreatePost({
 *     onSuccess: (newPost) => {
 *       console.log('Created post:', newPost.id);
 *     },
 *   });
 *
 *   const handleSubmit = () => {
 *     createPost.mutate({
 *       userId: 1,
 *       title: 'My New Post',
 *       body: 'Post content here...',
 *     });
 *   };
 *
 *   return (
 *     <Pressable onPress={handleSubmit} disabled={createPost.isPending}>
 *       <Text>{createPost.isPending ? 'Creating...' : 'Create Post'}</Text>
 *     </Pressable>
 *   );
 * }
 * ```
 */
export function useCreatePost(options?: UseCreatePostOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      // Invalidate the posts list to refetch with new data
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });

      // Optionally, add the new post to the cache immediately
      queryClient.setQueryData(postKeys.detail(newPost.id), newPost);
    },
    ...options,
  });
}

// =============================================================================
// Update Post
// =============================================================================

type UseUpdatePostOptions = Omit<
  UseMutationOptions<Post, Error, UpdatePostParams, { previousPost: Post | undefined }>,
  'mutationFn'
>;

/**
 * Hook to update an existing post with optimistic updates.
 *
 * This demonstrates optimistic updates:
 * 1. Before mutation: Save current data and update cache optimistically
 * 2. On error: Rollback to previous data
 * 3. On success/settle: Invalidate to ensure consistency
 *
 * @example
 * ```tsx
 * function EditPostForm({ post }: { post: Post }) {
 *   const [title, setTitle] = useState(post.title);
 *   const updatePost = useUpdatePost();
 *
 *   const handleSave = () => {
 *     updatePost.mutate({ id: post.id, title });
 *   };
 *
 *   return (
 *     <View>
 *       <TextInput value={title} onChangeText={setTitle} />
 *       <Pressable onPress={handleSave}>
 *         <Text>Save</Text>
 *       </Pressable>
 *     </View>
 *   );
 * }
 * ```
 */
export function useUpdatePost(options?: UseUpdatePostOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,

    // Optimistic update: Update cache before server responds
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: postKeys.detail(variables.id) });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<Post>(postKeys.detail(variables.id));

      // Optimistically update the cache
      if (previousPost) {
        queryClient.setQueryData(postKeys.detail(variables.id), {
          ...previousPost,
          ...variables,
        });
      }

      // Return context with previous value for rollback
      return { previousPost };
    },

    // Rollback on error
    onError: (_error, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(variables.id), context.previousPost);
      }
    },

    // Always refetch after error or success to ensure consistency
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },

    ...options,
  });
}

// =============================================================================
// Delete Post
// =============================================================================

type UseDeletePostOptions = Omit<
  UseMutationOptions<void, Error, number, { previousPosts: Post[] | undefined }>,
  'mutationFn'
>;

/**
 * Hook to delete a post with optimistic updates.
 *
 * @example
 * ```tsx
 * function PostCard({ post }: { post: Post }) {
 *   const deletePost = useDeletePost({
 *     onSuccess: () => {
 *       // Navigate away or show success message
 *     },
 *   });
 *
 *   return (
 *     <View>
 *       <Text>{post.title}</Text>
 *       <Pressable
 *         onPress={() => deletePost.mutate(post.id)}
 *         disabled={deletePost.isPending}
 *       >
 *         <Text>{deletePost.isPending ? 'Deleting...' : 'Delete'}</Text>
 *       </Pressable>
 *     </View>
 *   );
 * }
 * ```
 */
export function useDeletePost(options?: UseDeletePostOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,

    // Optimistic update: Remove from list immediately
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<Post[]>(postKeys.lists());

      // Optimistically remove the post from the list
      if (previousPosts) {
        queryClient.setQueryData(
          postKeys.lists(),
          previousPosts.filter((post) => post.id !== postId)
        );
      }

      // Remove the individual post cache
      queryClient.removeQueries({ queryKey: postKeys.detail(postId) });

      return { previousPosts };
    },

    // Rollback on error
    onError: (_error, _postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(postKeys.lists(), context.previousPosts);
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },

    ...options,
  });
}

// =============================================================================
// Bulk Operations Example
// =============================================================================

/**
 * Hook to delete multiple posts.
 * Demonstrates handling bulk operations with proper cache management.
 *
 * @example
 * ```tsx
 * function BulkDeleteButton({ selectedIds }: { selectedIds: number[] }) {
 *   const bulkDelete = useBulkDeletePosts();
 *
 *   return (
 *     <Pressable
 *       onPress={() => bulkDelete.mutate(selectedIds)}
 *       disabled={bulkDelete.isPending}
 *     >
 *       <Text>Delete {selectedIds.length} posts</Text>
 *     </Pressable>
 *   );
 * }
 * ```
 */
type BulkDeleteContext = { previousPosts: Post[] | undefined };

export function useBulkDeletePosts(
  options?: Omit<UseMutationOptions<void[], Error, number[], BulkDeleteContext>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postIds: number[]) => {
      // Delete posts in parallel
      return Promise.all(postIds.map((id) => deletePost(id)));
    },

    onMutate: async (postIds): Promise<BulkDeleteContext> => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      const previousPosts = queryClient.getQueryData<Post[]>(postKeys.lists());

      if (previousPosts) {
        queryClient.setQueryData(
          postKeys.lists(),
          previousPosts.filter((post) => !postIds.includes(post.id))
        );
      }

      // Remove individual caches
      postIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: postKeys.detail(id) });
      });

      return { previousPosts };
    },

    onError: (_error, _postIds, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(postKeys.lists(), context.previousPosts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },

    ...options,
  });
}
