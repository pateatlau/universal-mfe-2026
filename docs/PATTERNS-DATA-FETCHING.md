# Data Fetching Patterns

This document describes the data fetching architecture and patterns using React Query (TanStack Query) in the Universal MFE Platform.

## Overview

The platform uses **React Query v5** (`@tanstack/react-query`) for server state management, implemented in the `@universal/shared-data-layer` package.

## QueryClient Configuration

### Default Configuration

```typescript
// packages/shared-data-layer/src/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

const defaultQueryOptions = {
  queries: {
    staleTime: 30 * 1000,        // Data fresh for 30 seconds
    gcTime: 5 * 60 * 1000,       // Cache kept for 5 minutes
    retry: 3,                     // Retry failed queries 3 times
    refetchOnWindowFocus: false,  // Prevent noise on mobile
    refetchOnMount: false,        // Use cached data
    refetchOnReconnect: true,     // Refetch on network reconnect
  },
  mutations: {
    retry: 1,  // Conservative with side effects
  },
};

export function createQueryClient(options?: QueryClientConfig): QueryClient {
  return new QueryClient({
    defaultOptions: {
      ...defaultQueryOptions,
      ...options?.defaultOptions,
    },
  });
}
```

### QueryClient Strategies

#### 1. Shared Client (Default)

Use for cache sharing across host and MFEs:

```typescript
import { getSharedQueryClient, QueryProvider } from '@universal/shared-data-layer';

// Host app
function App() {
  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
}
```

#### 2. Isolated Client

Use for MFEs that need independent caching:

```typescript
<QueryProvider useSharedClient={false}>
  <MfeApp />
</QueryProvider>
```

#### 3. Custom Client

Use for specific configuration needs:

```typescript
const customClient = createQueryClient({
  defaultOptions: {
    queries: { staleTime: 60000 },
  },
});

<QueryProvider client={customClient}>
  <App />
</QueryProvider>
```

## Query Key Factory Pattern

Organize query keys for consistent invalidation:

```typescript
// packages/shared-data-layer/src/hooks/useExampleQuery.ts
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: { userId?: number }) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
};

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

export const commentKeys = {
  all: ['comments'] as const,
  byPost: (postId: number) => [...commentKeys.all, 'post', postId] as const,
};
```

## API Layer Pattern

### Type-Safe API Functions

```typescript
// packages/shared-data-layer/src/api/exampleApi.ts
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface CreatePostParams {
  userId: number;
  title: string;
  body: string;
}

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText
    );
  }
  return response.json();
}

export async function fetchPosts(): Promise<Post[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  return handleResponse<Post[]>(response);
}

export async function fetchPost(id: number): Promise<Post> {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  return handleResponse<Post>(response);
}

export async function createPost(params: CreatePostParams): Promise<Post> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse<Post>(response);
}
```

## Query Hooks

### Basic Query Hook

```typescript
export function usePosts() {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: fetchPosts,
  });
}
```

### Conditional Query Hook

```typescript
export function usePost(id: number | undefined) {
  return useQuery({
    queryKey: postKeys.detail(id!),
    queryFn: () => fetchPost(id!),
    enabled: id !== undefined,  // Only run when id is available
  });
}
```

### Filtered Query Hook

```typescript
export function usePostsByUser(userId: number | undefined) {
  return useQuery({
    queryKey: postKeys.list({ userId }),
    queryFn: () => fetchPostsByUser(userId!),
    enabled: userId !== undefined,
  });
}
```

### Parallel Queries

```typescript
export function usePostWithDetails(postId: number) {
  // Fetch post and comments in parallel
  const results = useQueries({
    queries: [
      {
        queryKey: postKeys.detail(postId),
        queryFn: () => fetchPost(postId),
      },
      {
        queryKey: commentKeys.byPost(postId),
        queryFn: () => fetchComments(postId),
      },
    ],
  });

  const [postResult, commentsResult] = results;
  const post = postResult.data;
  const comments = commentsResult.data;

  // Dependent query - fetch author after post loads
  const authorResult = useQuery({
    queryKey: userKeys.detail(post?.userId ?? 0),
    queryFn: () => fetchUser(post!.userId),
    enabled: !!post?.userId,
  });

  return {
    post,
    author: authorResult.data,
    comments,
    isLoading: results.some((r) => r.isLoading) || authorResult.isLoading,
    isError: results.some((r) => r.isError) || authorResult.isError,
    errors: [
      postResult.error,
      commentsResult.error,
      authorResult.error,
    ].filter(Boolean),
  };
}
```

## Mutation Hooks

### Create Mutation

```typescript
export function useCreatePost(options?: UseCreatePostOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      // Invalidate list to refetch with new data
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });

      // Optionally add to cache immediately
      queryClient.setQueryData(postKeys.detail(newPost.id), newPost);
    },
    ...options,
  });
}
```

### Update Mutation with Optimistic Updates

```typescript
export function useUpdatePost(options?: UseUpdatePostOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,

    // Optimistic update
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: postKeys.detail(variables.id),
      });

      // Snapshot previous value
      const previousPost = queryClient.getQueryData<Post>(
        postKeys.detail(variables.id)
      );

      // Optimistically update cache
      if (previousPost) {
        queryClient.setQueryData(postKeys.detail(variables.id), {
          ...previousPost,
          ...variables,
        });
      }

      // Return context for rollback
      return { previousPost };
    },

    // Rollback on error
    onError: (_error, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(
          postKeys.detail(variables.id),
          context.previousPost
        );
      }
    },

    // Refetch to ensure consistency
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },

    ...options,
  });
}
```

### Delete Mutation with Optimistic Updates

```typescript
export function useDeletePost(options?: UseDeletePostOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      const previousPosts = queryClient.getQueryData<Post[]>(postKeys.lists());

      // Optimistically remove from list
      if (previousPosts) {
        queryClient.setQueryData(
          postKeys.lists(),
          previousPosts.filter((post) => post.id !== postId)
        );
      }

      return { previousPosts };
    },

    onError: (_error, _postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(postKeys.lists(), context.previousPosts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },

    ...options,
  });
}
```

### Bulk Operations

```typescript
export function useBulkDeletePosts(options?: UseBulkDeletePostsOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postIds: number[]) => {
      return Promise.all(postIds.map((id) => deletePost(id)));
    },

    onMutate: async (postIds) => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });

      const previousPosts = queryClient.getQueryData<Post[]>(postKeys.lists());

      if (previousPosts) {
        queryClient.setQueryData(
          postKeys.lists(),
          previousPosts.filter((post) => !postIds.includes(post.id))
        );
      }

      return { previousPosts };
    },

    onError: (_error, _postIds, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(postKeys.lists(), context.previousPosts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },

    ...options,
  });
}
```

## Usage in Components

```typescript
import { usePosts, useCreatePost, useDeletePost } from '@universal/shared-data-layer';

function PostList() {
  const { data: posts, isLoading, isError, error } = usePosts();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();

  if (isLoading) return <Text>Loading...</Text>;
  if (isError) return <Text>Error: {error.message}</Text>;

  const handleCreate = () => {
    createPost.mutate(
      { userId: 1, title: 'New Post', body: 'Content' },
      {
        onSuccess: () => console.log('Post created!'),
        onError: (error) => console.error('Failed:', error),
      }
    );
  };

  const handleDelete = (id: number) => {
    deletePost.mutate(id);
  };

  return (
    <View>
      <Pressable onPress={handleCreate}>
        <Text>Create Post</Text>
      </Pressable>
      {posts?.map((post) => (
        <View key={post.id}>
          <Text>{post.title}</Text>
          <Pressable onPress={() => handleDelete(post.id)}>
            <Text>Delete</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}
```

## Provider Integration

The QueryProvider should wrap your app near the top of the component tree:

```typescript
// packages/web-shell/src/index.tsx
import { QueryProvider } from '@universal/shared-data-layer';
import { EventBusProvider } from '@universal/shared-event-bus';
import { I18nProvider } from '@universal/shared-i18n';
import { ThemeProvider } from '@universal/shared-theme-context';

function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <EventBusProvider>
          <I18nProvider translations={locales} initialLocale="en">
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </I18nProvider>
        </EventBusProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}
```

## Testing Data Fetching

### Testing Query Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePosts } from '../useExampleQuery';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('usePosts', () => {
  it('should fetch posts', async () => {
    const { result } = renderHook(() => usePosts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(100);
  });
});
```

### Testing Mutations

```typescript
describe('useCreatePost', () => {
  it('should create a post and invalidate cache', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreatePost(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await result.current.mutateAsync({
      userId: 1,
      title: 'Test',
      body: 'Content',
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: postKeys.lists(),
    });
  });
});
```

## Key Principles

1. **Query Key Factories**: Use consistent key structure for proper invalidation
2. **Type Safety**: All API functions and hooks are fully typed
3. **Optimistic Updates**: Provide instant feedback with rollback on error
4. **Error Handling**: Custom `ApiError` class preserves HTTP status
5. **Conditional Fetching**: Use `enabled` flag for dependent queries
6. **Cache Management**: Proper invalidation after mutations
7. **Mobile Optimization**: Disable noisy refetch behaviors

## Exported API

The `@universal/shared-data-layer` package exports:

**Utilities:**
- `createQueryClient`, `getSharedQueryClient`, `resetSharedQueryClient`
- `QueryProvider`
- Full React Query re-exports

**API Functions:**
- `fetchPosts`, `fetchPost`, `createPost`, `updatePost`, `deletePost`
- `fetchUsers`, `fetchUser`
- `fetchComments`
- `ApiError`

**Hooks:**
- `usePosts`, `usePost`, `usePostsByUser`, `usePostWithDetails`
- `useUsers`, `useUser`
- `useComments`
- `useCreatePost`, `useUpdatePost`, `useDeletePost`, `useBulkDeletePosts`

**Query Keys:**
- `postKeys`, `userKeys`, `commentKeys`
