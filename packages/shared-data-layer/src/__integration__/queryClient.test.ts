/**
 * Integration tests for QueryClient and related utilities.
 *
 * Tests verify:
 * - QueryClient creation with default config
 * - QueryClient creation with custom config
 * - Shared QueryClient singleton behavior
 * - Config merging and overrides
 */

import {
  createQueryClient,
  getSharedQueryClient,
  resetSharedQueryClient,
  defaultQueryClientConfig,
} from '../queryClient';

describe('QueryClient Integration', () => {
  beforeEach(() => {
    // Reset singleton before each test
    resetSharedQueryClient();
  });

  afterEach(() => {
    resetSharedQueryClient();
  });

  describe('createQueryClient', () => {
    it('creates a QueryClient with default config', () => {
      const client = createQueryClient();

      expect(client).toBeDefined();
      expect(client.getDefaultOptions()).toBeDefined();
    });

    it('creates independent instances', () => {
      const client1 = createQueryClient();
      const client2 = createQueryClient();

      expect(client1).not.toBe(client2);
    });

    it('applies default staleTime', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();

      expect(options.queries?.staleTime).toBe(30 * 1000);
    });

    it('applies default gcTime', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();

      expect(options.queries?.gcTime).toBe(5 * 60 * 1000);
    });

    it('applies default retry settings', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();

      expect(options.queries?.retry).toBe(3);
      expect(options.mutations?.retry).toBe(1);
    });

    it('disables refetchOnWindowFocus by default', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();

      expect(options.queries?.refetchOnWindowFocus).toBe(false);
    });

    it('enables refetchOnReconnect by default', () => {
      const client = createQueryClient();
      const options = client.getDefaultOptions();

      expect(options.queries?.refetchOnReconnect).toBe(true);
    });
  });

  describe('createQueryClient with overrides', () => {
    it('allows overriding staleTime', () => {
      const client = createQueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
          },
        },
      });
      const options = client.getDefaultOptions();

      expect(options.queries?.staleTime).toBe(60 * 1000);
    });

    it('preserves other defaults when overriding one option', () => {
      const client = createQueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      });
      const options = client.getDefaultOptions();

      // Overridden
      expect(options.queries?.staleTime).toBe(60 * 1000);
      // Preserved from defaults
      expect(options.queries?.gcTime).toBe(5 * 60 * 1000);
      expect(options.queries?.retry).toBe(3);
    });

    it('allows overriding mutation options', () => {
      const client = createQueryClient({
        defaultOptions: {
          mutations: {
            retry: 3,
          },
        },
      });
      const options = client.getDefaultOptions();

      expect(options.mutations?.retry).toBe(3);
    });

    it('allows disabling retries', () => {
      const client = createQueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
          mutations: {
            retry: false,
          },
        },
      });
      const options = client.getDefaultOptions();

      expect(options.queries?.retry).toBe(false);
      expect(options.mutations?.retry).toBe(false);
    });
  });

  describe('getSharedQueryClient', () => {
    it('returns a QueryClient', () => {
      const client = getSharedQueryClient();

      expect(client).toBeDefined();
    });

    it('returns the same instance on subsequent calls', () => {
      const client1 = getSharedQueryClient();
      const client2 = getSharedQueryClient();

      expect(client1).toBe(client2);
    });

    it('has default configuration', () => {
      const client = getSharedQueryClient();
      const options = client.getDefaultOptions();

      expect(options.queries?.staleTime).toBe(30 * 1000);
    });
  });

  describe('resetSharedQueryClient', () => {
    it('clears the shared instance', () => {
      const client1 = getSharedQueryClient();
      resetSharedQueryClient();
      const client2 = getSharedQueryClient();

      expect(client1).not.toBe(client2);
    });

    it('can be called multiple times safely', () => {
      resetSharedQueryClient();
      resetSharedQueryClient();
      resetSharedQueryClient();

      const client = getSharedQueryClient();
      expect(client).toBeDefined();
    });

    it('clears cache on reset', () => {
      const client = getSharedQueryClient();

      // Set some data in the cache
      client.setQueryData(['test-key'], { value: 'test' });
      expect(client.getQueryData(['test-key'])).toEqual({ value: 'test' });

      // Reset should clear the cache
      resetSharedQueryClient();

      // New client should not have the cached data
      const newClient = getSharedQueryClient();
      expect(newClient.getQueryData(['test-key'])).toBeUndefined();
    });
  });

  describe('defaultQueryClientConfig', () => {
    it('exports the default config object', () => {
      expect(defaultQueryClientConfig).toBeDefined();
      expect(defaultQueryClientConfig.defaultOptions).toBeDefined();
    });

    it('has expected query defaults', () => {
      const queryDefaults = defaultQueryClientConfig.defaultOptions?.queries;

      expect(queryDefaults?.staleTime).toBe(30 * 1000);
      expect(queryDefaults?.gcTime).toBe(5 * 60 * 1000);
      expect(queryDefaults?.retry).toBe(3);
      expect(queryDefaults?.refetchOnWindowFocus).toBe(false);
      expect(queryDefaults?.refetchOnMount).toBe(false);
      expect(queryDefaults?.refetchOnReconnect).toBe(true);
    });

    it('has expected mutation defaults', () => {
      const mutationDefaults = defaultQueryClientConfig.defaultOptions?.mutations;

      expect(mutationDefaults?.retry).toBe(1);
    });
  });
});
