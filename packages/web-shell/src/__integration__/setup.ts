/**
 * Integration test setup for web-shell
 *
 * This file configures the test environment for integration tests that verify
 * cross-package interactions, provider composition, and routing behavior.
 *
 * Note: react-native is mocked via moduleNameMapper in jest.integration.config.js
 * pointing to ./mocks/react-native.ts
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Suppress console errors for known React warnings in tests
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: An update to') ||
      message.includes('act(...)') ||
      message.includes('not wrapped in act') ||
      message.includes('non-boolean attribute'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Global test timeout for integration tests (longer than unit tests)
jest.setTimeout(10000);
