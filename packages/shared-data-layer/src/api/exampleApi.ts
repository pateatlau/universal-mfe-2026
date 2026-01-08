/**
 * Example API module demonstrating typed API functions for React Query.
 *
 * This uses JSONPlaceholder (https://jsonplaceholder.typicode.com) as a
 * free fake REST API for testing and prototyping.
 *
 * Pattern:
 * - Define types for request/response data
 * - Create pure async functions that return typed data
 * - Functions handle fetch, error checking, and JSON parsing
 * - React Query hooks consume these functions
 */

// =============================================================================
// Types
// =============================================================================

/**
 * A post from the API.
 */
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

/**
 * Parameters for creating a new post.
 */
export interface CreatePostParams {
  userId: number;
  title: string;
  body: string;
}

/**
 * Parameters for updating an existing post.
 */
export interface UpdatePostParams {
  id: number;
  userId?: number;
  title?: string;
  body?: string;
}

/**
 * A user from the API.
 */
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

/**
 * A comment on a post.
 */
export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Custom error class for API errors with status code.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Helper function to handle fetch responses.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      response.statusText
    );
  }
  return response.json() as Promise<T>;
}

// =============================================================================
// Posts API
// =============================================================================

/**
 * Fetch all posts.
 */
export async function fetchPosts(): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts`);
  return handleResponse<Post[]>(response);
}

/**
 * Fetch a single post by ID.
 */
export async function fetchPost(id: number): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`);
  return handleResponse<Post>(response);
}

/**
 * Fetch posts by user ID.
 */
export async function fetchPostsByUser(userId: number): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts?userId=${userId}`);
  return handleResponse<Post[]>(response);
}

/**
 * Create a new post.
 * Note: JSONPlaceholder doesn't actually persist data, but returns the created object.
 */
export async function createPost(params: CreatePostParams): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return handleResponse<Post>(response);
}

/**
 * Update an existing post (partial update).
 * Note: JSONPlaceholder doesn't actually persist data, but returns the updated object.
 */
export async function updatePost({ id, ...params }: UpdatePostParams): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return handleResponse<Post>(response);
}

/**
 * Delete a post.
 * Note: JSONPlaceholder doesn't actually delete, but returns empty object.
 */
export async function deletePost(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new ApiError(
      `Failed to delete post: ${response.status} ${response.statusText}`,
      response.status,
      response.statusText
    );
  }
}

// =============================================================================
// Users API
// =============================================================================

/**
 * Fetch all users.
 */
export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`);
  return handleResponse<User[]>(response);
}

/**
 * Fetch a single user by ID.
 */
export async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  return handleResponse<User>(response);
}

// =============================================================================
// Comments API
// =============================================================================

/**
 * Fetch comments for a post.
 */
export async function fetchComments(postId: number): Promise<Comment[]> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
  return handleResponse<Comment[]>(response);
}
