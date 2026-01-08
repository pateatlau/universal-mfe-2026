/**
 * Jest configuration for web-shell integration tests
 *
 * Integration tests verify cross-package interactions, provider composition,
 * routing behavior, and API interactions without full browser automation.
 */

module.exports = {
  displayName: 'web-shell-integration',
  rootDir: '.',
  testMatch: ['<rootDir>/src/__integration__/**/*.test.{ts,tsx}'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/src/__integration__/setup.ts'],
  moduleNameMapper: {
    // Map react-native to our mock for jsdom environment
    '^react-native$': '<rootDir>/src/__integration__/mocks/react-native.ts',
    // Map workspace dependencies to source for better debugging
    '^@universal/shared-utils$': '<rootDir>/../shared-utils/src/index.ts',
    '^@universal/shared-design-tokens$': '<rootDir>/../shared-design-tokens/src/index.ts',
    '^@universal/shared-theme-context$': '<rootDir>/../shared-theme-context/src/index.ts',
    '^@universal/shared-a11y$': '<rootDir>/../shared-a11y/src/index.ts',
    '^@universal/shared-i18n$': '<rootDir>/../shared-i18n/src/index.ts',
    '^@universal/shared-event-bus$': '<rootDir>/../shared-event-bus/src/index.ts',
    '^@universal/shared-data-layer$': '<rootDir>/../shared-data-layer/src/index.ts',
    '^@universal/shared-router$': '<rootDir>/../shared-router/src/index.ts',
  },
  // Longer timeout for integration tests
  testTimeout: 10000,
  // Collect coverage from integration test runs
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__integration__/**',
  ],
};
