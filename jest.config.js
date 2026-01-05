/** @type {import('jest').Config} */
module.exports = {
  // Use workspace projects for monorepo
  // Note: shared-hello-ui testing requires full RN runtime setup
  // For now, only test pure TypeScript packages
  projects: ['<rootDir>/packages/shared-utils'],

  // Coverage collected per-project (see individual jest.config.js)
  coverageReporters: ['text', 'text-summary', 'lcov'],
};
