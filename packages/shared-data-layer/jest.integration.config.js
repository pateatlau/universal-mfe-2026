/** @type {import('jest').Config} */
module.exports = {
  displayName: 'shared-data-layer-integration',
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
  // Map workspace dependencies to source
  moduleNameMapper: {
    '^@universal/shared-utils$': '<rootDir>/../shared-utils/src/index.ts',
  },
  // Longer timeout for integration tests
  testTimeout: 15000,
  // Collect coverage from integration test runs
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/__integration__/**'],
};
