# Enterprise Enhancements Implementation Plan

**Status:** Awaiting User Approval
**Last Updated:** 2026-01-06
**Target:** Seed project foundation for enterprise-level applications
**Branch:** `enhancements`

---

## Overview

This document outlines the implementation plan to enhance the Universal Microfrontend Platform with enterprise-ready features. The goal is to provide a solid foundation/seed project that is "ready to go out of the box" for real-world projects.

---

## Validated Assumptions (from codebase exploration)

| Assumption | Status | Notes |
|------------|--------|-------|
| Yarn Classic workspaces | ✅ Valid | 7 packages, hoisted deps configured correctly |
| Storage abstraction exists | ✅ Valid | `packages/shared-utils/dist/storage.js` - cross-platform |
| Zustand implemented | ✅ Valid | `packages/shared-auth-store/dist/store.js` - with persistence |
| No routing exists | ✅ Valid | Clean slate in both web-shell and mobile-host |
| RN primitives only in shared-ui | ✅ Valid | Uses `View`, `Text`, `Pressable` only |
| CI workflow exists | ✅ Valid | Comprehensive GitHub Actions for all platforms |

---

## Features to Implement

| Feature | Status | Phase |
|---------|--------|-------|
| Turborepo Migration | Pending | 1 |
| Design Tokens & Theming (dark/light mode) | Pending | 2 |
| React Query (TanStack Query) | Pending | 3 |
| React Router 7 | Pending | 4 |
| RN Component Unit Testing | Pending | 5 |
| E2E Testing (Playwright + Maestro) | Pending | 6 |
| Documentation & Patterns | Pending | 7 |

**Already Implemented (before this plan):**
- Zustand (exists in `packages/shared-auth-store/`)
- LocalStorage (exists in `packages/shared-utils/` via storage abstraction)

---

## Phase 1: Turborepo Migration

Migrate from Yarn Classic workspaces to Turborepo for improved build performance, caching, and task orchestration.

### Task 1.1: Install and configure Turborepo
**Files to create:**
- `turbo.json` - Turborepo configuration

**Files to modify:**
- `package.json` (root) - add turbo dependency and scripts

**Dependencies:**
- `turbo` (exact version to be determined)

### Task 1.2: Define pipeline tasks
**Configure in `turbo.json`:**
- `build` - builds packages with proper dependency ordering
- `typecheck` - runs TypeScript checks
- `lint` - runs ESLint
- `test` - runs Jest tests
- `dev` - development servers (no caching)

### Task 1.3: Update package.json scripts
**Files to modify:**
- `package.json` (root) - update scripts to use `turbo run`
- Individual package scripts may need adjustment

### Task 1.4: Configure caching
**Configure in `turbo.json`:**
- Define inputs/outputs for each task
- Configure remote caching (optional, for CI)

### Task 1.5: Update CI workflows
**Files to modify:**
- `.github/workflows/ci.yml` - leverage Turborepo caching

### Task 1.6: Update documentation
**Files to modify:**
- `CLAUDE.md` - document Turborepo usage
- `README.md` - update build instructions

---

## Phase 2: Design Tokens & Theming

### Task 2.1: Create shared-design-tokens package
**Files to create:**
- `packages/shared-design-tokens/package.json`
- `packages/shared-design-tokens/tsconfig.json`
- `packages/shared-design-tokens/src/colors.ts`
- `packages/shared-design-tokens/src/spacing.ts`
- `packages/shared-design-tokens/src/typography.ts`
- `packages/shared-design-tokens/src/shadows.ts`
- `packages/shared-design-tokens/src/themes.ts`
- `packages/shared-design-tokens/src/index.ts`

### Task 2.2: Create shared-theme-context package
**Files to create:**
- `packages/shared-theme-context/package.json`
- `packages/shared-theme-context/tsconfig.json`
- `packages/shared-theme-context/src/ThemeProvider.tsx`
- `packages/shared-theme-context/src/useTheme.ts`
- `packages/shared-theme-context/src/index.ts`

### Task 2.3: Update shared-hello-ui to use theming
**Files to modify:**
- `packages/shared-hello-ui/package.json` - add dependencies
- `packages/shared-hello-ui/src/HelloUniversal.tsx` - use theme tokens

### Task 2.4: Integrate theming into host applications
**Files to modify:**
- `packages/web-shell/package.json`
- `packages/web-shell/src/App.tsx`
- `packages/mobile-host/package.json`
- `packages/mobile-host/src/App.tsx`

### Task 2.5: Update build scripts
**Files to modify:**
- `turbo.json` - ensure proper build order for new packages

---

## Phase 3: Data Fetching with React Query

### Task 3.1: Create shared-data-layer package
**Files to create:**
- `packages/shared-data-layer/package.json`
- `packages/shared-data-layer/tsconfig.json`
- `packages/shared-data-layer/src/queryClient.ts`
- `packages/shared-data-layer/src/QueryProvider.tsx`
- `packages/shared-data-layer/src/index.ts`

**Dependencies:**
- `@tanstack/react-query` (exact version: 5.62.16)

### Task 3.2: Create example API hooks
**Files to create:**
- `packages/shared-data-layer/src/api/exampleApi.ts`
- `packages/shared-data-layer/src/hooks/useExampleQuery.ts`
- `packages/shared-data-layer/src/hooks/useExampleMutation.ts`

### Task 3.3: Integrate QueryProvider into hosts
**Files to modify:**
- `packages/web-shell/src/App.tsx`
- `packages/mobile-host/src/App.tsx`

### Task 3.4: Update build configuration
**Files to modify:**
- `turbo.json` - add shared-data-layer to pipeline

---

## Phase 4: Routing with React Router 7

### Task 4.1: Create shared-router package
**Files to create:**
- `packages/shared-router/package.json`
- `packages/shared-router/tsconfig.json`
- `packages/shared-router/src/types.ts`
- `packages/shared-router/src/routes.ts`
- `packages/shared-router/src/index.ts`

**Dependencies:**
- `react-router` (exact version: 7.1.1)

### Task 4.2: Implement web routing
**Files to create:**
- `packages/web-shell/src/pages/Home.tsx`
- `packages/web-shell/src/pages/Remote.tsx`
- `packages/web-shell/src/pages/Settings.tsx`

**Files to modify:**
- `packages/web-shell/package.json` - add `react-router-dom`
- `packages/web-shell/src/App.tsx` - add BrowserRouter and routes

### Task 4.3: Implement mobile routing
**Files to create:**
- `packages/mobile-host/src/pages/Home.tsx`
- `packages/mobile-host/src/pages/Remote.tsx`
- `packages/mobile-host/src/pages/Settings.tsx`

**Files to modify:**
- `packages/mobile-host/package.json` - add `react-router-native`
- `packages/mobile-host/src/App.tsx` - add NativeRouter and routes

### Task 4.4: Update build configuration
**Files to modify:**
- `turbo.json` - add shared-router to pipeline

---

## Phase 5: React Native Component Unit Testing

### Task 5.1: Add testing dependencies
**Files to modify:**
- `package.json` (root) - add:
  - `@testing-library/react-native` (12.9.0)
  - `react-test-renderer` (19.1.0)

**Files to create:**
- `jest.setup.js` (root) - React Native mocks

### Task 5.2: Configure Jest for shared-hello-ui
**Files to create:**
- `packages/shared-hello-ui/jest.config.js`
- `packages/shared-hello-ui/src/__tests__/HelloUniversal.test.tsx`

### Task 5.3: Configure Jest for shared-theme-context
**Files to create:**
- `packages/shared-theme-context/jest.config.js`
- `packages/shared-theme-context/src/__tests__/ThemeProvider.test.tsx`

### Task 5.4: Update root Jest config
**Files to modify:**
- `jest.config.js` (root) - add new projects

### Task 5.5: Update CI workflow
**Files to modify:**
- `.github/workflows/ci.yml`

---

## Phase 6: E2E Testing

### Task 6.1: Setup Playwright for web
**Files to create:**
- `packages/web-shell/playwright.config.ts`
- `packages/web-shell/e2e/smoke.spec.ts`
- `packages/web-shell/e2e/remote-loading.spec.ts`
- `packages/web-shell/e2e/routing.spec.ts`
- `packages/web-shell/e2e/theming.spec.ts`

**Files to modify:**
- `packages/web-shell/package.json` - add `@playwright/test`

### Task 6.2: Setup Maestro for mobile
**Files to create:**
- `packages/mobile-host/.maestro/README.md`
- `packages/mobile-host/.maestro/smoke.yaml`
- `packages/mobile-host/.maestro/remote-loading.yaml`
- `packages/mobile-host/.maestro/navigation.yaml`
- `packages/mobile-host/.maestro/theming.yaml`

### Task 6.3: Add E2E CI workflows
**Files to create:**
- `.github/workflows/e2e-web.yml`
- `.github/workflows/e2e-mobile.yml` (optional - runs on tags only)

---

## Phase 7: Documentation & Patterns

### Task 7.1: Create pattern documentation
**Files to create:**
- `docs/PATTERNS-STATE-MANAGEMENT.md`
- `docs/PATTERNS-DATA-FETCHING.md`
- `docs/PATTERNS-ROUTING.md`
- `docs/PATTERNS-THEMING.md`
- `docs/PATTERNS-TESTING.md`

### Task 7.2: Create main enhancements document
**Files to create:**
- `docs/ENTERPRISE-ENHANCEMENTS.md`

### Task 7.3: Update existing docs
**Files to modify:**
- `CLAUDE.md`
- `README.md`

---

## Dependency Versions (Exact)

| Package | Version |
|---------|---------|
| turbo | TBD (latest stable) |
| @tanstack/react-query | 5.62.16 |
| react-router | 7.1.1 |
| react-router-dom | 7.1.1 |
| react-router-native | 7.1.1 |
| @testing-library/react-native | 12.9.0 |
| react-test-renderer | 19.1.0 |
| @playwright/test | 1.49.1 |

---

## Build Order (Final - with Turborepo)

Turborepo will automatically determine build order based on dependencies. The expected order:
```
1. shared-utils
2. shared-design-tokens
3. shared-theme-context
4. shared-data-layer
5. shared-router
6. shared-hello-ui
7. shared-auth-store
```

---

## Success Criteria

- [ ] Turborepo caching working locally and in CI
- [ ] Theming system works on web, iOS, and Android
- [ ] Dark mode toggle persists across sessions
- [ ] React Query hooks available and working
- [ ] Routing works on web and mobile
- [ ] RN component tests pass with >50% coverage
- [ ] Web E2E tests pass in CI
- [ ] Mobile E2E flows work locally
- [ ] All pattern documentation complete

---

## Key Design Decisions

### Why Turborepo?
- Intelligent caching reduces build times significantly
- Automatic task orchestration based on dependencies
- Remote caching for CI (optional)
- Works well with existing Yarn Classic workspaces

### Why Pure TS Design Tokens (Not Tailwind/Shadcn)?
- Tailwind CSS requires CSS (web-only)
- Shadcn uses DOM elements (web-only)
- Pure TS tokens work universally with React Native StyleSheet

### Why React Router 7 (Not React Navigation)?
- React Router 7 works on BOTH web and mobile
- Unified routing API across platforms

### Why Maestro (Not Detox)?
- Simpler YAML-based test definitions
- Lower setup complexity
- Works well with GitHub Actions

---

## Cost Estimation

| Item | Cost |
|------|------|
| All dependencies | $0 (open source) |
| GitHub Actions (additional) | ~$0 (within free tier) |
| Turborepo Remote Cache (optional) | $0 (Vercel free tier) |
| **Total** | **$0/month** |

---

## Critical Constraints

1. **Exact versions only** - No `^` or `~` in dependencies (per CLAUDE.md)
2. **React Native primitives only** - No DOM elements in shared packages
3. **Sequential phase execution** - Each phase must be verified before proceeding to next
4. **Manual verification required** - Per CLAUDE.md "Enhancements Implementation Workflow"

---

## Execution Workflow

For each task (per CLAUDE.md):
1. Implement the current task only
2. Run applicable tests/builds to verify
3. **Wait for user manual verification**
4. Update this plan's status (mark task as Complete)
5. Commit the changes
6. Ask: **"Do you want me to proceed to the next task?"** and WAIT for user response

**CRITICAL:** Do NOT proceed to the next task until the user explicitly confirms.
