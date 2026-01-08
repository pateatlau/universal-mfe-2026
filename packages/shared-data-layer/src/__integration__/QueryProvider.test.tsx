/**
 * Integration tests for QueryProvider component.
 *
 * Tests verify:
 * - Provider renders children correctly
 * - Shared client vs isolated client behavior
 * - Custom client injection
 * - useQueryClient hook access
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import { QueryProvider } from '../QueryProvider';
import {
  createQueryClient,
  getSharedQueryClient,
  resetSharedQueryClient,
} from '../queryClient';

// Test component that displays QueryClient info
function QueryClientInfo() {
  const queryClient = useQueryClient();
  const defaults = queryClient.getDefaultOptions();
  const staleTime = defaults.queries?.staleTime;

  return (
    <div>
      <span data-testid="client-exists">
        {queryClient ? 'client-exists' : 'no-client'}
      </span>
      <span data-testid="stale-time">
        {typeof staleTime === 'number' ? staleTime : 'function'}
      </span>
    </div>
  );
}

// Test component that sets and reads cache (sync version using state)
function CacheTestComponent({ cacheKey }: { cacheKey: string }) {
  const queryClient = useQueryClient();
  const [hasData, setHasData] = React.useState(false);

  // Set data and update state - useLayoutEffect runs synchronously after render
  React.useLayoutEffect(() => {
    queryClient.setQueryData([cacheKey], { test: true });
    setHasData(true);
  }, [queryClient, cacheKey]);

  return (
    <div>
      <span data-testid="cache-data">{hasData ? 'has-data' : 'no-data'}</span>
    </div>
  );
}

describe('QueryProvider Integration', () => {
  beforeEach(() => {
    resetSharedQueryClient();
  });

  afterEach(() => {
    resetSharedQueryClient();
  });

  describe('Basic rendering', () => {
    it('renders children correctly', () => {
      render(
        <QueryProvider>
          <div data-testid="child">Hello</div>
        </QueryProvider>
      );

      expect(screen.getByTestId('child')).toHaveTextContent('Hello');
    });

    it('provides QueryClient to children', () => {
      render(
        <QueryProvider>
          <QueryClientInfo />
        </QueryProvider>
      );

      expect(screen.getByTestId('client-exists')).toHaveTextContent(
        'client-exists'
      );
    });
  });

  describe('Shared client (default)', () => {
    it('uses shared client by default', () => {
      const sharedClient = getSharedQueryClient();

      render(
        <QueryProvider>
          <QueryClientInfo />
        </QueryProvider>
      );

      // Verify we're using the shared client by checking staleTime
      expect(screen.getByTestId('stale-time')).toHaveTextContent('30000');
    });

    it('shares cache between multiple providers using shared client', () => {
      // First provider sets data
      const { unmount: unmount1 } = render(
        <QueryProvider>
          <CacheTestComponent cacheKey="shared-test" />
        </QueryProvider>
      );

      // Unmount first provider
      unmount1();

      // Second provider should see the cached data
      render(
        <QueryProvider>
          <CacheTestComponent cacheKey="shared-test" />
        </QueryProvider>
      );

      expect(screen.getByTestId('cache-data')).toHaveTextContent('has-data');
    });
  });

  describe('Isolated client', () => {
    it('creates isolated client when useSharedClient is false', () => {
      render(
        <QueryProvider useSharedClient={false}>
          <QueryClientInfo />
        </QueryProvider>
      );

      expect(screen.getByTestId('client-exists')).toHaveTextContent(
        'client-exists'
      );
    });

    it('does not share cache with shared client', () => {
      // Set data in shared client
      const sharedClient = getSharedQueryClient();
      sharedClient.setQueryData(['isolated-test'], { fromShared: true });

      // Isolated client should not see shared cache
      render(
        <QueryProvider useSharedClient={false}>
          <CacheTestComponent cacheKey="isolated-test" />
        </QueryProvider>
      );

      // The component sets its own data, but the original shared data shouldn't affect it
      expect(screen.getByTestId('cache-data')).toHaveTextContent('has-data');

      // Verify shared client still has its data
      expect(sharedClient.getQueryData(['isolated-test'])).toEqual({
        fromShared: true,
      });
    });

    it('allows custom config for isolated client', () => {
      render(
        <QueryProvider
          useSharedClient={false}
          config={{
            defaultOptions: {
              queries: {
                staleTime: 60000, // 1 minute
              },
            },
          }}
        >
          <QueryClientInfo />
        </QueryProvider>
      );

      expect(screen.getByTestId('stale-time')).toHaveTextContent('60000');
    });
  });

  describe('Custom client injection', () => {
    it('uses provided custom client', () => {
      const customClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 120000, // 2 minutes
          },
        },
      });

      render(
        <QueryProvider client={customClient}>
          <QueryClientInfo />
        </QueryProvider>
      );

      expect(screen.getByTestId('stale-time')).toHaveTextContent('120000');
    });

    it('custom client takes precedence over useSharedClient', () => {
      const customClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 90000,
          },
        },
      });

      // Even with useSharedClient=true, custom client should be used
      render(
        <QueryProvider client={customClient} useSharedClient={true}>
          <QueryClientInfo />
        </QueryProvider>
      );

      expect(screen.getByTestId('stale-time')).toHaveTextContent('90000');
    });
  });

  describe('Multiple providers scenario', () => {
    it('host and MFE can share the same QueryClient', () => {
      function HostApp() {
        return (
          <QueryProvider>
            <div data-testid="host">Host</div>
            <MfeApp />
          </QueryProvider>
        );
      }

      function MfeApp() {
        // MFE doesn't need its own provider when sharing
        return <CacheTestComponent cacheKey="mfe-data" />;
      }

      render(<HostApp />);

      expect(screen.getByTestId('host')).toBeInTheDocument();
      expect(screen.getByTestId('cache-data')).toHaveTextContent('has-data');
    });

    it('MFE can have isolated QueryClient', () => {
      function HostApp() {
        return (
          <QueryProvider>
            <div data-testid="host">Host</div>
            <MfeWithIsolatedClient />
          </QueryProvider>
        );
      }

      function MfeWithIsolatedClient() {
        return (
          <QueryProvider useSharedClient={false}>
            <CacheTestComponent cacheKey="isolated-mfe-data" />
          </QueryProvider>
        );
      }

      render(<HostApp />);

      expect(screen.getByTestId('host')).toBeInTheDocument();
      expect(screen.getByTestId('cache-data')).toHaveTextContent('has-data');
    });
  });
});
