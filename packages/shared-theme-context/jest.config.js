/**
 * Jest configuration for @universal/shared-theme-context
 *
 * Tests the ThemeProvider and useTheme hooks.
 * Uses jsdom environment since these are React components.
 */

module.exports = {
  displayName: 'shared-theme-context',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
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
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  moduleNameMapper: {
    // Map workspace dependencies to source
    '^@universal/shared-design-tokens$':
      '<rootDir>/../shared-design-tokens/src/index.ts',
  },
};
