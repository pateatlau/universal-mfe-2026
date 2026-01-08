/** @type {import('jest').Config} */
module.exports = {
  // Use workspace projects for monorepo
  // Each package has its own jest.config.js with specific settings
  projects: [
    '<rootDir>/packages/shared-utils',
    '<rootDir>/packages/shared-hello-ui',
    '<rootDir>/packages/shared-theme-context',
  ],

  // Coverage collected per-project (see individual jest.config.js)
  coverageReporters: ['text', 'text-summary', 'lcov'],
};
