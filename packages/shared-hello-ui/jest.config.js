/**
 * Jest Configuration for @universal/shared-hello-ui
 * 
 * React Native components - uses react-test-renderer for simpler testing
 */

const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  displayName: 'shared-hello-ui',
  testEnvironment: 'node',
  // Mock react-native to avoid ES module issues
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^react-native$': '<rootDir>/src/__mocks__/react-native.tsx',
  },
  // Use jsdom for DOM testing (mocked react-native uses DOM elements)
  testEnvironment: 'jsdom',
  // Transform dependencies
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library|@universal)/)',
  ],
};

