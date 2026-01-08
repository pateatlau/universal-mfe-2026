// Example API functions and types
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
} from './exampleApi';
