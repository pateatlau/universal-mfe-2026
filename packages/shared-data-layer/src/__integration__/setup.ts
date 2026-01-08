/**
 * Integration test setup for shared-data-layer.
 *
 * Configures:
 * - @testing-library/jest-dom matchers
 * - Console filtering for expected warnings
 */

import '@testing-library/jest-dom';

// Suppress expected React Query warnings during tests
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('QueryClient') ||
      message.includes('React Query'))
  ) {
    return;
  }
  originalWarn(...args);
};

// Global test timeout for integration tests
jest.setTimeout(15000);
