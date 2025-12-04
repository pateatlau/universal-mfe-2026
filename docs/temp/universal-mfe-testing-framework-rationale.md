# Testing Framework Rationale - Jest for All Platforms

**Date:** 2026-01-XX  
**Status:** ✅ **DECISION** - Unified Jest Approach  
**Context:** Universal MFE Platform - Testing Strategy

---

## Decision

**Use Jest for both Web and Mobile** to maximize code sharing and consistency.

---

## Rationale: Unified Jest Approach

### Core Principle: Maximum Code Sharing

The **Universal MFE Platform** is built on the principle of **maximum code sharing** between web and mobile. This extends to testing infrastructure:

- ✅ **Shared test utilities** - Same helpers, mocks, matchers
- ✅ **Shared configurations** - Common Jest config patterns
- ✅ **Shared patterns** - Same testing patterns across platforms
- ✅ **Single framework** - Team only needs to learn Jest
- ✅ **Consistency** - Same tooling, same commands, same workflow

---

## Why Jest for Both?

### 1. React Native Requirement

**Jest is Required for Mobile:**

- ✅ **Official Support:** Jest is the official testing framework for React Native
- ✅ **React Native Testing Library:** Built specifically for Jest
- ✅ **Native Module Mocking:** Jest has mature mocking for native modules
- ✅ **Hermes Compatibility:** Jest works seamlessly with Hermes engine
- ✅ **Ecosystem:** 90%+ of React Native projects use Jest
- ✅ **Documentation:** All React Native testing docs assume Jest

**This is non-negotiable** - React Native testing requires Jest.

---

### 2. Code Sharing Priority

**Unified Framework Enables:**

- ✅ **Shared Test Utilities:**
  ```typescript
  // packages/shared-test-utils/
  export const createMockRemote = () => { /* ... */ };
  export const mockModuleFederation = () => { /* ... */ };
  // Used by both web and mobile tests
  ```

- ✅ **Shared Configurations:**
  ```javascript
  // jest.config.base.js (shared)
  module.exports = {
    preset: 'ts-jest',
    // Common config for all packages
  };
  ```

- ✅ **Shared Patterns:**
  - Same test structure
  - Same mocking patterns
  - Same assertions
  - Same utilities

- ✅ **Shared Knowledge:**
  - Team only needs Jest
  - Same debugging techniques
  - Same CI/CD patterns

---

### 3. Consistency Benefits

**Unified Approach Provides:**

- ✅ **Same Commands:**
  ```bash
  # Works the same everywhere
  yarn test
  yarn test:watch
  yarn test:coverage
  ```

- ✅ **Same Patterns:**
  ```typescript
  // Same test structure everywhere
  describe('Component', () => {
    it('should render', () => {
      // Same patterns
    });
  });
  ```

- ✅ **Same Tooling:**
  - Same test runner
  - Same coverage tools
  - Same debugging tools

---

## Trade-offs

### What We Gain

✅ **Maximum Code Sharing:**
- Shared test utilities
- Shared configurations
- Shared patterns
- Shared knowledge

✅ **Consistency:**
- Same framework everywhere
- Same commands
- Same workflow

✅ **Simplicity:**
- One framework to learn
- One set of docs
- One set of tools

✅ **Alignment with Platform Goals:**
- Matches Universal MFE Platform philosophy
- Common codebase approach

---

### What We Accept

⚠️ **Web Performance:**
- Jest is slower than Vitest for web (4x slower)
- **Acceptable trade-off** for consistency and code sharing

⚠️ **TypeScript Support:**
- Jest has good (but not optimal) TypeScript support
- **Acceptable** - still works well with ts-jest

⚠️ **Modern Tooling:**
- Jest uses older CommonJS-first architecture
- **Acceptable** - still production-ready and reliable

---

## Comparison: Unified vs Hybrid

### Unified Approach (Jest Everywhere) ✅

**Pros:**
- ✅ Maximum code sharing
- ✅ Consistency across platforms
- ✅ Single framework
- ✅ Shared utilities and configs
- ✅ Aligns with platform goals

**Cons:**
- ⚠️ Slower for web (acceptable trade-off)
- ⚠️ Less optimal TypeScript (still good)

**Verdict:** ✅ **Chosen** - Code sharing is more valuable than web performance

---

### Hybrid Approach (Vitest + Jest)

**Pros:**
- ✅ Faster web tests
- ✅ Better TypeScript for web
- ✅ Modern tooling for web

**Cons:**
- ❌ Breaks code sharing goal
- ❌ Two frameworks to maintain
- ❌ Different configs and patterns
- ❌ Can't share test utilities easily
- ❌ Team needs to know both

**Verdict:** ❌ **Rejected** - Breaks core platform principle of code sharing

---

## Implementation

### Shared Jest Configuration

```javascript
// jest.config.base.js (root)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@universal/(.*)$': '<rootDir>/packages/$1/src',
  },
  collectCoverageFrom: [
    'packages/**/src/**/*.{ts,tsx}',
    '!packages/**/src/**/*.d.ts',
  ],
};
```

### Web Package Config

```javascript
// packages/web-shell/jest.config.js
const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};
```

### Mobile Package Config

```javascript
// packages/mobile-host/jest.config.js
const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
```

### Shared Package Config

```javascript
// packages/shared-utils/jest.config.js
const baseConfig = require('../../jest.config.base.js');

module.exports = {
  ...baseConfig,
  // Pure TypeScript, no React
};
```

---

## Shared Test Utilities

### Example: Shared Test Utilities Package

```typescript
// packages/shared-test-utils/src/index.ts

// Mock Module Federation
export const mockModuleFederation = () => {
  // Shared mock for both web and mobile
};

// Mock Remote Loading
export const mockRemoteLoad = (remoteName: string) => {
  // Shared mock for both platforms
};

// Common Assertions
export const assertRemoteLoaded = (remote: any) => {
  // Shared assertion logic
};
```

**Usage in Web Tests:**
```typescript
import { mockModuleFederation } from '@universal/shared-test-utils';
```

**Usage in Mobile Tests:**
```typescript
import { mockModuleFederation } from '@universal/shared-test-utils';
```

**Same utilities, same code!**

---

## Performance Considerations

### Jest Performance for Web

**Reality:**
- Jest is slower than Vitest (4x slower)
- But still fast enough for most projects
- Typical test suite: 100 tests in ~2 seconds (vs ~0.5s with Vitest)

**Acceptable Because:**
- ✅ Consistency is more valuable
- ✅ Code sharing is more valuable
- ✅ 2 seconds is still fast enough
- ✅ Watch mode is still responsive

**When to Reconsider:**
- If test suite grows to 1000+ tests
- If test runs take >30 seconds
- If performance becomes a real bottleneck

---

## Conclusion

**Decision: Jest for All Platforms**

**Rationale:**
1. **React Native requires Jest** - Non-negotiable
2. **Maximum code sharing** - Core platform goal
3. **Consistency** - Same framework everywhere
4. **Simplicity** - One framework to learn
5. **Shared infrastructure** - Utilities, configs, patterns

**Trade-offs Accepted:**
- ⚠️ Slower web tests (acceptable)
- ⚠️ Less optimal TypeScript (still good)

**Value Gained:**
- ✅ Maximum code sharing
- ✅ Consistency
- ✅ Simplicity
- ✅ Alignment with platform goals

---

## Related Documentation

- **Testing Assessment:** `docs/temp/universal-mfe-testing-infrastructure-assessment.md`
- **POC-1 Tech Stack:** `docs/universal-mfe-poc-1-tech-stack-analysis.md`

---

**Last Updated:** 2026-01-XX  
**Status:** ✅ Decision Made - Jest for All Platforms
