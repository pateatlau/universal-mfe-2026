/**
 * Jest setup file for React Native component testing
 *
 * This file provides comprehensive mocks for React Native modules
 * that don't exist in the Jest node environment.
 */

// Import jest-dom matchers for DOM assertions (toBeInTheDocument, etc.)
require('@testing-library/jest-dom');

// Global mocks for testing-library
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Silence console warnings during tests (optional - comment out for debugging)
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filter out known React Native warnings that don't affect tests
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Animated: `useNativeDriver`') ||
      message.includes('componentWillReceiveProps') ||
      message.includes('componentWillMount'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// Silence console errors for expected test scenarios (optional - comment out for debugging)
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: An update to') ||
      message.includes('act(...)') ||
      // React Native accessible prop is not valid in DOM but works via our mock
      message.includes('non-boolean attribute `accessible`'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
