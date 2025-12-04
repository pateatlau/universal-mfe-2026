/**
 * Jest Configuration for @universal/shared-utils
 * 
 * Pure TypeScript utilities - no React, no DOM
 */

const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  displayName: 'shared-utils',
  testEnvironment: 'node',
};

