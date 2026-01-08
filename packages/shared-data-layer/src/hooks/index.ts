// Query hooks
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
} from './useExampleQuery';

// Mutation hooks
export {
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useBulkDeletePosts,
} from './useExampleMutation';
