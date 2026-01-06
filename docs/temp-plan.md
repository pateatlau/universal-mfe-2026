# Enterprise Enhancements Implementation Plan

**Status**: Ready for User Approval
**Existing Plan**: `docs/enhancements-implementation-plan.md`
**Branch**: `enhancements`

---

## Summary

This plan implements 7 phases of enterprise-ready enhancements to the Universal MFE Platform. The existing implementation plan at `docs/enhancements-implementation-plan.md` is well-structured and validated against the codebase.

---

## Validated Assumptions

| Assumption | Status | Notes |
|------------|--------|-------|
| Yarn Classic workspaces | ✅ Valid | 7 packages, hoisted deps work |
| Storage abstraction exists | ✅ Valid | `shared-utils/dist/storage.js` |
| Zustand implemented | ✅ Valid | `shared-auth-store/dist/store.js` |
| No routing exists | ✅ Valid | Clean slate in both hosts |
| RN primitives only in shared-ui | ✅ Valid | `View`, `Text`, `Pressable` only |

---

## Implementation Order

### Phase 1: Turborepo Migration
**Files to create:**
- `turbo.json`

**Files to modify:**
- `package.json` (root) - add `turbo` dep, update scripts
- `.github/workflows/ci.yml` - leverage Turborepo caching

**Key tasks:**
1. Install turbo (exact version)
2. Configure pipeline: build, typecheck, lint, test, dev
3. Define inputs/outputs for caching
4. Update root scripts to use `turbo run`
5. Update CI workflow

---

### Phase 2: Design Tokens & Theming
**New packages:**
- `packages/shared-design-tokens/` - Pure TS tokens (colors, spacing, typography)
- `packages/shared-theme-context/` - ThemeProvider + useTheme hook

**Files to modify:**
- `packages/shared-hello-ui/src/HelloUniversal.tsx` - Use theme tokens
- `packages/web-shell/src/App.tsx` - Wrap with ThemeProvider
- `packages/mobile-host/src/App.tsx` - Wrap with ThemeProvider
- `turbo.json` - Add new packages to pipeline

**Pattern to follow:** `shared-auth-store` Zustand + storage integration

---

### Phase 3: React Query (TanStack Query)
**New package:**
- `packages/shared-data-layer/` - QueryClient, QueryProvider, example hooks

**Dependencies:**
- `@tanstack/react-query@5.62.16`

**Files to modify:**
- `packages/web-shell/src/App.tsx` - Wrap with QueryProvider
- `packages/mobile-host/src/App.tsx` - Wrap with QueryProvider
- `turbo.json` - Add shared-data-layer

---

### Phase 4: React Router 7
**New package:**
- `packages/shared-router/` - Route types and definitions

**Dependencies:**
- `react-router@7.1.1`
- `react-router-dom@7.1.1` (web-shell)
- `react-router-native@7.1.1` (mobile-host)

**New page files:**
- `packages/web-shell/src/pages/{Home,Remote,Settings}.tsx`
- `packages/mobile-host/src/pages/{Home,Remote,Settings}.tsx`

**Files to modify:**
- `packages/web-shell/src/App.tsx` - Add BrowserRouter + Routes
- `packages/mobile-host/src/App.tsx` - Add NativeRouter + Routes

---

### Phase 5: RN Component Unit Testing
**Dependencies (root):**
- `@testing-library/react-native@12.9.0`
- `react-test-renderer@19.1.0` (match mobile React version)

**Files to create:**
- `jest.setup.js` (root) - RN mocks
- `packages/shared-hello-ui/jest.config.js`
- `packages/shared-hello-ui/src/__tests__/HelloUniversal.test.tsx`
- `packages/shared-theme-context/jest.config.js`
- `packages/shared-theme-context/src/__tests__/ThemeProvider.test.tsx`

**Files to modify:**
- `jest.config.js` (root) - Add new projects
- `.github/workflows/ci.yml` - Run RN component tests

---

### Phase 6: E2E Testing
**Web (Playwright):**
- `packages/web-shell/playwright.config.ts`
- `packages/web-shell/e2e/*.spec.ts`

**Mobile (Maestro):**
- `packages/mobile-host/.maestro/*.yaml`

**CI workflows:**
- `.github/workflows/e2e-web.yml`
- `.github/workflows/e2e-mobile.yml` (optional)

---

### Phase 7: Documentation
**Files to create:**
- `docs/PATTERNS-*.md` (5 pattern docs)
- `docs/ENTERPRISE-ENHANCEMENTS.md`

**Files to modify:**
- `CLAUDE.md` - Document new features
- `README.md` - Update build instructions

---

## Critical Constraints

1. **Exact versions only** - No `^` or `~` in dependencies
2. **React Native primitives only** - No DOM elements in shared-hello-ui
3. **Sequential phase execution** - Each phase verified before next
4. **Manual verification required** - Per CLAUDE.md workflow

---

## Execution Workflow

For each task:
1. Implement changes
2. Run applicable tests/builds
3. Wait for user manual verification
4. Update `docs/enhancements-implementation-plan.md` status
5. Commit changes
6. Ask: "Do you want me to proceed to the next task?"

---

## Ready to Begin

The existing plan at `docs/enhancements-implementation-plan.md` is comprehensive and validated. Implementation can proceed with Phase 1, Task 1.1 (Install and configure Turborepo).
