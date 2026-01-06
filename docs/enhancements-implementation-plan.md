# Enterprise Enhancements Implementation Plan

**Status:** In Progress
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
| Turborepo Migration | In Progress | 1 |
| Design Tokens & Theming (dark/light mode) | Pending | 2 |
| Accessibility | Pending | 3 |
| Internationalization (i18n) | Pending | 4 |
| Event Bus (Inter-MFE Communication) | Pending | 5 |
| React Query (TanStack Query) | Pending | 6 |
| React Router 7 | Pending | 7 |
| RN Component Unit Testing | Pending | 8 |
| Integration Testing | Pending | 9 |
| E2E Testing (Playwright + Maestro) | Pending | 10 |
| Documentation & Patterns | Pending | 11 |

**Already Implemented (before this plan):**
- Zustand (exists in `packages/shared-auth-store/`)
- LocalStorage (exists in `packages/shared-utils/` via storage abstraction)

---

## Phase 1: Turborepo Migration

Migrate from Yarn Classic workspaces to Turborepo for improved build performance, caching, and task orchestration.

### Task 1.1: Install and configure Turborepo ✅ COMPLETE
**Files created:**
- `turbo.json` - Turborepo configuration with task definitions

**Files modified:**
- `package.json` (root) - added `turbo: "2.7.3"` as devDependency

**Notes:**
- `.prettierrc` and `.prettierignore` already existed with proper configuration
- `prettier: "3.5.3"` was already installed
- Verified with `npx turbo run build` - successfully built 4 packages in ~5s

### Task 1.2: Define pipeline tasks
**Configure in `turbo.json`:**
- `build` - builds packages with proper dependency ordering
- `typecheck` - runs TypeScript checks
- `lint` - runs ESLint
- `format` - runs Prettier to fix formatting (no caching)
- `format:check` - checks formatting without modifying (for CI)
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

### Task 1.6: Add architecture enforcement rules
**Purpose:** Automatically enforce architectural boundaries to prevent drift over time.

**Files to create:**
- `eslint-rules/no-cross-mfe-imports.js` - Custom ESLint rule to prevent direct MFE-to-MFE imports
- `eslint-rules/no-dom-in-shared.js` - Custom ESLint rule to prevent DOM usage in shared packages

**Files to modify:**
- `eslint.config.mjs` - add architecture enforcement rules
- `package.json` (root) - add `lint:architecture` script

**Rules enforced:**
- No direct imports between remote MFEs (must use event bus)
- No DOM elements (`div`, `span`, `button`) in `shared-*` packages
- No `window`, `document`, `localStorage` direct usage in shared packages (use abstractions)

### Task 1.7: Update documentation
**Files to modify:**
- `CLAUDE.md` - document Turborepo usage
- `README.md` - update build instructions
- `docs/universal-mfe-all-platforms-testing-guide.md` - update commands to use Turborepo

---

## Phase 2: Design Tokens & Theming

### Task 2.1: Create shared-design-tokens package
**Files to create:**
- `packages/shared-design-tokens/package.json`
- `packages/shared-design-tokens/tsconfig.json`
- `packages/shared-design-tokens/src/primitives/colors.ts` - Raw color palette (blue.500, gray.100, etc.)
- `packages/shared-design-tokens/src/primitives/spacing.ts` - Spacing scale (4, 8, 12, 16, etc.)
- `packages/shared-design-tokens/src/primitives/typography.ts` - Font sizes, weights, line heights
- `packages/shared-design-tokens/src/primitives/shadows.ts` - Shadow definitions
- `packages/shared-design-tokens/src/semantic/colors.ts` - Semantic tokens (surface.background, text.primary, border.default)
- `packages/shared-design-tokens/src/semantic/spacing.ts` - Semantic spacing (layout.padding, component.gap)
- `packages/shared-design-tokens/src/themes.ts` - Light/dark theme compositions using semantic tokens
- `packages/shared-design-tokens/src/index.ts`

**Token architecture:**
- **Primitives**: Raw values (colors, spacing, typography) - internal use only
- **Semantic**: Meaningful aliases (surface.*, text.*, border.*) - used by components
- Components should ONLY use semantic tokens, never primitives directly
- This enables rebranding by only changing semantic → primitive mappings

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

## Phase 3: Accessibility

Build accessible components from the ground up, ensuring WCAG 2.1 AA compliance across web and mobile platforms.

### Task 3.1: Create shared-a11y package
**Files to create:**
- `packages/shared-a11y/package.json`
- `packages/shared-a11y/tsconfig.json`
- `packages/shared-a11y/src/hooks/useAccessibilityInfo.ts` - Platform-aware a11y state (screen reader, reduce motion)
- `packages/shared-a11y/src/hooks/useFocusManagement.ts` - Focus trap and restore utilities
- `packages/shared-a11y/src/hooks/useAnnounce.ts` - Screen reader announcements
- `packages/shared-a11y/src/constants.ts` - ARIA roles, a11y labels
- `packages/shared-a11y/src/index.ts`

**No external dependencies** - Uses React Native's built-in AccessibilityInfo API

### Task 3.2: Create accessible primitive components
**Files to create:**
- `packages/shared-a11y/src/components/AccessibleText.tsx` - Text with proper roles
- `packages/shared-a11y/src/components/AccessibleButton.tsx` - Button with a11y props
- `packages/shared-a11y/src/components/AccessibleInput.tsx` - Input with labels and error announcements
- `packages/shared-a11y/src/components/SkipLink.tsx` - Skip to main content (web)
- `packages/shared-a11y/src/components/VisuallyHidden.tsx` - Screen reader only content

### Task 3.3: Add accessibility props to shared-hello-ui
**Files to modify:**
- `packages/shared-hello-ui/package.json` - add @universal/shared-a11y dependency
- `packages/shared-hello-ui/src/HelloUniversal.tsx` - add accessibilityLabel, accessibilityRole, accessibilityHint

### Task 3.4: Create accessibility testing utilities
**Files to create:**
- `packages/shared-a11y/src/testing/a11yMatchers.ts` - Custom Jest matchers for a11y
- `packages/shared-a11y/src/testing/index.ts`

### Task 3.5: Update build configuration
**Files to modify:**
- `turbo.json` - add shared-a11y to pipeline

---

## Phase 4: Internationalization (i18n)

Implement internationalization with a lightweight, universal approach that works across web and mobile.

**i18n namespace rules:**
- Host apps own the root namespace (e.g., `common.*`, `navigation.*`)
- Each MFE owns its own namespace (e.g., `hello.*` for HelloRemote)
- Namespaces prevent translation key collisions between independently deployed MFEs

### Task 4.1: Create shared-i18n package
**Files to create:**
- `packages/shared-i18n/package.json`
- `packages/shared-i18n/tsconfig.json`
- `packages/shared-i18n/src/types.ts` - Translation types, locale types
- `packages/shared-i18n/src/I18nProvider.tsx` - Context provider for translations
- `packages/shared-i18n/src/useTranslation.ts` - Hook to access translations
- `packages/shared-i18n/src/useLocale.ts` - Hook to get/set current locale
- `packages/shared-i18n/src/pluralize.ts` - Pluralization rules
- `packages/shared-i18n/src/formatters.ts` - Date, number, currency formatters (uses Intl API)
- `packages/shared-i18n/src/index.ts`

**No external dependencies** - Pure TypeScript using browser/RN Intl API

### Task 4.2: Create translation file structure
**Files to create:**
- `packages/shared-i18n/src/locales/en.ts` - English translations
- `packages/shared-i18n/src/locales/es.ts` - Spanish translations (example)
- `packages/shared-i18n/src/locales/index.ts` - Locale registry

### Task 4.3: Create translation utilities
**Files to create:**
- `packages/shared-i18n/src/utils/interpolate.ts` - Variable interpolation in strings
- `packages/shared-i18n/src/utils/detectLocale.ts` - Platform-aware locale detection
- `packages/shared-i18n/src/utils/persistLocale.ts` - Save locale preference to storage

### Task 4.4: Integrate i18n into host applications
**Files to modify:**
- `packages/web-shell/package.json` - add @universal/shared-i18n dependency
- `packages/web-shell/src/App.tsx` - wrap with I18nProvider
- `packages/mobile-host/package.json` - add @universal/shared-i18n dependency
- `packages/mobile-host/src/App.tsx` - wrap with I18nProvider

### Task 4.5: Add i18n to shared-hello-ui (example)
**Files to modify:**
- `packages/shared-hello-ui/package.json` - add @universal/shared-i18n dependency
- `packages/shared-hello-ui/src/HelloUniversal.tsx` - use useTranslation hook

### Task 4.6: Update build configuration
**Files to modify:**
- `turbo.json` - add shared-i18n to pipeline

---

## Phase 5: Event Bus (Inter-MFE Communication)

Implement a lightweight, type-safe event bus for communication between microfrontends without tight coupling.

### Task 5.1: Create shared-event-bus package
**Files to create:**
- `packages/shared-event-bus/package.json`
- `packages/shared-event-bus/tsconfig.json`
- `packages/shared-event-bus/src/types.ts` - Event types, payload types
- `packages/shared-event-bus/src/EventBus.ts` - Core pub/sub implementation
- `packages/shared-event-bus/src/index.ts`

**No external dependencies** - Pure TypeScript implementation

### Task 5.2: Create React integration hooks
**Files to create:**
- `packages/shared-event-bus/src/hooks/useEventBus.ts` - Access event bus instance
- `packages/shared-event-bus/src/hooks/useEventListener.ts` - Subscribe to events with auto-cleanup
- `packages/shared-event-bus/src/hooks/useEventEmitter.ts` - Emit events
- `packages/shared-event-bus/src/EventBusProvider.tsx` - Context provider

### Task 5.3: Define standard event types with versioning
**Files to create:**
- `packages/shared-event-bus/src/events/navigation.ts` - Navigation events (NAVIGATE_TO, BACK, etc.)
- `packages/shared-event-bus/src/events/auth.ts` - Auth events (LOGIN, LOGOUT, SESSION_EXPIRED)
- `packages/shared-event-bus/src/events/theme.ts` - Theme events (THEME_CHANGED)
- `packages/shared-event-bus/src/events/remote.ts` - Remote module events (REMOTE_LOADED, REMOTE_ERROR)
- `packages/shared-event-bus/src/events/index.ts` - Event registry with version metadata

**Event governance rules:**
- All events include a `version` field (e.g., `{ type: 'NAVIGATE_TO', version: 1, payload: {...} }`)
- Event evolution is **append-only**: new fields can be added, existing fields cannot be removed or changed
- Breaking changes require a new event type (e.g., `NAVIGATE_TO_V2`)
- Host is responsible for handling multiple event versions during migration periods

### Task 5.4: Add debugging and devtools support
**Files to create:**
- `packages/shared-event-bus/src/devtools/EventLogger.ts` - Console logging for dev mode
- `packages/shared-event-bus/src/devtools/EventHistory.ts` - Event history for debugging

### Task 5.5: Integrate event bus into host applications
**Files to modify:**
- `packages/web-shell/package.json` - add @universal/shared-event-bus dependency
- `packages/web-shell/src/App.tsx` - wrap with EventBusProvider
- `packages/mobile-host/package.json` - add @universal/shared-event-bus dependency
- `packages/mobile-host/src/App.tsx` - wrap with EventBusProvider

### Task 5.6: Create example inter-MFE communication
**Files to modify:**
- `packages/web-remote-hello/src/HelloRemote.tsx` - emit event on button click
- `packages/mobile-remote-hello/src/HelloRemote.tsx` - emit event on button click
- `packages/web-shell/src/App.tsx` - listen for remote events
- `packages/mobile-host/src/App.tsx` - listen for remote events

### Task 5.7: Update build configuration
**Files to modify:**
- `turbo.json` - add shared-event-bus to pipeline

### Task 5.8: Establish MFE local state pattern
**Purpose:** Each MFE maintains its own Zustand store for local state, ensuring loose coupling. Event bus communicates *events*, not state — MFEs react to events by updating their own stores.

**Files to create:**
- `packages/web-remote-hello/src/store/localStore.ts` - Example MFE-local Zustand store
- `packages/mobile-remote-hello/src/store/localStore.ts` - Example MFE-local Zustand store

**Pattern established:**
- MFEs own their state (Zustand store per MFE)
- Host app owns shared/global state (e.g., auth, theme via shared-auth-store)
- Event bus bridges communication without coupling state
- Example flow: Remote emits `USER_ACTION` event → Host receives → Host updates its store → Host emits `STATE_UPDATED` → Remote reacts if needed

### Task 5.9: Implement remote loading failure & degradation strategy
**Purpose:** Define standard behavior when remote MFEs fail to load, ensuring graceful degradation.

**Files to create:**
- `packages/shared-event-bus/src/components/RemoteErrorBoundary.tsx` - Error boundary for remote loading failures
- `packages/shared-event-bus/src/components/RemoteLoadingFallback.tsx` - Loading state component
- `packages/shared-event-bus/src/components/RemoteErrorFallback.tsx` - Error state component with retry

**Files to modify:**
- `packages/web-shell/src/App.tsx` - wrap remote imports with error boundary
- `packages/mobile-host/src/App.tsx` - wrap remote imports with error boundary

**Failure handling strategy:**
- **Timeout**: Remote load times out after configurable duration (default: 10s)
- **Retry**: Automatic retry with exponential backoff (max 3 attempts)
- **Fallback UI**: Show error state with manual retry button
- **Event emission**: Emit `REMOTE_LOAD_FAILED` event for analytics/logging
- **Partial availability**: App remains functional even if some remotes fail

---

## Phase 6: Data Fetching with React Query

### Task 6.1: Create shared-data-layer package
**Files to create:**
- `packages/shared-data-layer/package.json`
- `packages/shared-data-layer/tsconfig.json`
- `packages/shared-data-layer/src/queryClient.ts`
- `packages/shared-data-layer/src/QueryProvider.tsx`
- `packages/shared-data-layer/src/index.ts`

**Dependencies:**
- `@tanstack/react-query` (exact version: 5.62.16)

### Task 6.2: Create example API hooks
**Files to create:**
- `packages/shared-data-layer/src/api/exampleApi.ts`
- `packages/shared-data-layer/src/hooks/useExampleQuery.ts`
- `packages/shared-data-layer/src/hooks/useExampleMutation.ts`

### Task 6.3: Integrate QueryProvider into hosts
**Files to modify:**
- `packages/web-shell/src/App.tsx`
- `packages/mobile-host/src/App.tsx`

### Task 6.4: Update build configuration
**Files to modify:**
- `turbo.json` - add shared-data-layer to pipeline

---

## Phase 7: Routing with React Router 7

**Routing ownership rules (CRITICAL):**
- **Hosts own all routes** - Route definitions live exclusively in host applications
- **MFEs emit navigation intents** - Remotes use event bus to request navigation (e.g., `NAVIGATE_TO` event)
- **MFEs never import routers** - No `useNavigate`, `useLocation`, or router imports in remote packages
- **MFEs never reference URLs** - Remotes are URL-agnostic; hosts map events to routes

### Task 7.1: Create shared-router package
**Files to create:**
- `packages/shared-router/package.json`
- `packages/shared-router/tsconfig.json`
- `packages/shared-router/src/types.ts` - Route types and navigation intent types
- `packages/shared-router/src/routes.ts` - Route constants (NOT route definitions)
- `packages/shared-router/src/index.ts`

**Dependencies:**
- `react-router` (exact version: 7.1.1)

### Task 7.2: Implement web routing
**Files to create:**
- `packages/web-shell/src/pages/Home.tsx`
- `packages/web-shell/src/pages/Remote.tsx`
- `packages/web-shell/src/pages/Settings.tsx`

**Files to modify:**
- `packages/web-shell/package.json` - add `react-router-dom`
- `packages/web-shell/src/App.tsx` - add BrowserRouter and routes

### Task 7.3: Implement mobile routing
**Files to create:**
- `packages/mobile-host/src/pages/Home.tsx`
- `packages/mobile-host/src/pages/Remote.tsx`
- `packages/mobile-host/src/pages/Settings.tsx`

**Files to modify:**
- `packages/mobile-host/package.json` - add `react-router-native`
- `packages/mobile-host/src/App.tsx` - add NativeRouter and routes

### Task 7.4: Update build configuration
**Files to modify:**
- `turbo.json` - add shared-router to pipeline

---

## Phase 8: React Native Component Unit Testing

### Task 8.1: Add testing dependencies
**Files to modify:**
- `package.json` (root) - add:
  - `@testing-library/react-native` (12.9.0)
  - `react-test-renderer` (19.1.0)

**Files to create:**
- `jest.setup.js` (root) - React Native mocks

### Task 8.2: Configure Jest for shared-hello-ui
**Files to create:**
- `packages/shared-hello-ui/jest.config.js`
- `packages/shared-hello-ui/src/__tests__/HelloUniversal.test.tsx`

### Task 8.3: Configure Jest for shared-theme-context
**Files to create:**
- `packages/shared-theme-context/jest.config.js`
- `packages/shared-theme-context/src/__tests__/ThemeProvider.test.tsx`

### Task 8.4: Update root Jest config
**Files to modify:**
- `jest.config.js` (root) - add new projects

### Task 8.5: Update CI workflow
**Files to modify:**
- `.github/workflows/ci.yml`

### Task 8.6: Update testing documentation
**Files to modify:**
- `docs/universal-mfe-all-platforms-testing-guide.md` - add unit test commands and troubleshooting

---

## Phase 9: Integration Testing

Integration tests verify cross-package interactions and Module Federation remote loading without requiring full browser/device automation.

### Task 9.1: Setup integration test infrastructure
**Files to create:**
- `packages/web-shell/src/__integration__/setup.ts` - Test environment setup
- `packages/web-shell/jest.integration.config.js` - Separate Jest config for integration tests

**Files to modify:**
- `packages/web-shell/package.json` - add `test:integration` script
- `package.json` (root) - add `test:integration` script

**Dependencies:**
- `@testing-library/react` (16.1.0) - for web integration tests
- `msw` (2.7.3) - Mock Service Worker for API mocking

### Task 9.2: Create web integration tests
**Files to create:**
- `packages/web-shell/src/__integration__/providers.test.tsx` - Test ThemeProvider + QueryProvider composition
- `packages/web-shell/src/__integration__/routing.test.tsx` - Test route transitions and data loading
- `packages/web-shell/src/__integration__/theme-persistence.test.tsx` - Test theme + storage integration

### Task 9.3: Create mobile integration tests
**Files to create:**
- `packages/mobile-host/src/__integration__/setup.ts`
- `packages/mobile-host/jest.integration.config.js`
- `packages/mobile-host/src/__integration__/providers.test.tsx`
- `packages/mobile-host/src/__integration__/navigation.test.tsx`

**Files to modify:**
- `packages/mobile-host/package.json` - add `test:integration` script

### Task 9.4: Create shared package integration tests
**Files to create:**
- `packages/shared-data-layer/src/__integration__/queryClient.test.ts` - Test QueryClient with mocked APIs
- `packages/shared-auth-store/src/__integration__/persistence.test.ts` - Test Zustand + storage integration

### Task 9.5: Update CI workflow
**Files to modify:**
- `.github/workflows/ci.yml` - add integration test step
- `turbo.json` - add `test:integration` pipeline task

### Task 9.6: Update testing documentation
**Files to modify:**
- `docs/universal-mfe-all-platforms-testing-guide.md` - add integration test commands and troubleshooting

---

## Phase 10: E2E Testing

### Task 10.1: Setup Playwright for web
**Files to create:**
- `packages/web-shell/playwright.config.ts`
- `packages/web-shell/e2e/smoke.spec.ts`
- `packages/web-shell/e2e/remote-loading.spec.ts`
- `packages/web-shell/e2e/routing.spec.ts`
- `packages/web-shell/e2e/theming.spec.ts`

**Files to modify:**
- `packages/web-shell/package.json` - add `@playwright/test`

### Task 10.2: Setup Maestro for mobile
**Files to create:**
- `packages/mobile-host/.maestro/README.md`
- `packages/mobile-host/.maestro/smoke.yaml`
- `packages/mobile-host/.maestro/remote-loading.yaml`
- `packages/mobile-host/.maestro/navigation.yaml`
- `packages/mobile-host/.maestro/theming.yaml`

### Task 10.3: Add E2E CI workflows
**Files to create:**
- `.github/workflows/e2e-web.yml`
- `.github/workflows/e2e-mobile.yml` (optional - runs on tags only)

### Task 10.4: Update testing documentation
**Files to modify:**
- `docs/universal-mfe-all-platforms-testing-guide.md` - add E2E test sections for Playwright and Maestro

---

## Phase 11: Documentation & Patterns

### Task 11.1: Create pattern documentation
**Files to create:**
- `docs/PATTERNS-STATE-MANAGEMENT.md`
- `docs/PATTERNS-DATA-FETCHING.md`
- `docs/PATTERNS-ROUTING.md`
- `docs/PATTERNS-THEMING.md`
- `docs/PATTERNS-ACCESSIBILITY.md`
- `docs/PATTERNS-I18N.md`
- `docs/PATTERNS-EVENT-BUS.md`
- `docs/PATTERNS-TESTING.md`
- `docs/ANTI-PATTERNS.md` - Common mistakes to avoid in MFE architecture

**Anti-patterns document should cover:**
- Direct MFE-to-MFE imports (use event bus instead)
- DOM elements in shared packages
- Router imports in remote MFEs
- Shared mutable state between MFEs
- Primitive token usage in components (use semantic tokens)
- Hardcoded URLs in remotes

### Task 11.2: Create main enhancements document
**Files to create:**
- `docs/ENTERPRISE-ENHANCEMENTS.md`

### Task 11.3: Update existing docs
**Files to modify:**
- `CLAUDE.md`
- `README.md`
- `docs/universal-mfe-all-platforms-testing-guide.md` - final review and consolidation of all testing sections

---

## Dependency Versions (Exact)

| Package | Version |
|---------|---------|
| turbo | TBD (latest stable) |
| prettier | TBD (latest stable) |
| @tanstack/react-query | 5.62.16 |
| react-router | 7.1.1 |
| react-router-dom | 7.1.1 |
| react-router-native | 7.1.1 |
| @testing-library/react-native | 12.9.0 |
| @testing-library/react | 16.1.0 |
| react-test-renderer | 19.1.0 |
| msw | 2.7.3 |
| @playwright/test | 1.49.1 |

---

## Build Order (Final - with Turborepo)

Turborepo will automatically determine build order based on dependencies. The expected order:
```plaintext
1. shared-utils
2. shared-design-tokens
3. shared-theme-context
4. shared-a11y
5. shared-i18n
6. shared-event-bus
7. shared-data-layer
8. shared-router
9. shared-hello-ui
10. shared-auth-store
```

---

## Success Criteria

- [ ] Turborepo caching working locally and in CI
- [ ] Architecture enforcement rules pass in CI (no cross-MFE imports, no DOM in shared)
- [ ] Theming system works on web, iOS, and Android
- [ ] Semantic tokens used by all components (no primitive token usage)
- [ ] Dark mode toggle persists across sessions
- [ ] Accessibility: Screen reader support verified on all platforms
- [ ] Accessibility: WCAG 2.1 AA color contrast compliance
- [ ] i18n: Language switching works on all platforms
- [ ] i18n: Locale persists across sessions
- [ ] i18n: MFE namespaces prevent key collisions
- [ ] Event Bus: Inter-MFE communication works (remote → host)
- [ ] Event Bus: Events logged in dev mode
- [ ] Event Bus: Event versioning implemented
- [ ] Remote loading: Graceful degradation when remote fails
- [ ] Remote loading: Retry mechanism works
- [ ] React Query hooks available and working
- [ ] Routing works on web and mobile
- [ ] Routing: MFEs use navigation events (no direct router imports)
- [ ] RN component tests pass with >50% coverage
- [ ] Integration tests pass in CI
- [ ] Web E2E tests pass in CI
- [ ] Mobile E2E flows work locally
- [ ] All pattern documentation complete
- [ ] Anti-patterns documentation complete

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

### Why Custom Accessibility Package (Not react-native-a11y)?
- React Native has built-in accessibility props (accessibilityLabel, accessibilityRole, etc.)
- No external dependency needed for core a11y features
- Custom hooks provide platform-aware behavior (AccessibilityInfo API)
- Testing utilities tailored to our component patterns

### Why Custom i18n (Not react-i18next/FormatJS)?
- Zero runtime dependencies
- Browser/RN Intl API provides formatting (dates, numbers, currency)
- Simpler mental model: just TypeScript objects + interpolation
- No build-time extraction or compilation step needed
- Easy to migrate to react-i18next later if needed (same translation structure)

### Why Custom Event Bus (Not Redux/RxJS)?
- Minimal footprint (~100 lines of code)
- Type-safe events with TypeScript discriminated unions
- No global store coupling — MFEs remain independent
- Easy debugging with event history
- Can integrate with Redux/Zustand if needed (events → actions)

### Event Bus vs State Management
- **Event Bus**: Pub/sub for inter-MFE communication (fire-and-forget messages)
- **Zustand Stores**: Each MFE owns its local state independently
- Events *trigger* state changes but don't *carry* state
- Host owns shared/global state (auth, theme); remotes own their local state
- This separation ensures MFEs remain independently deployable and testable

### Why React Router 7 (Not React Navigation)?
- React Router 7 works on BOTH web and mobile
- Unified routing API across platforms

### Routing Ownership Model
- **Hosts own routes**: All route definitions live in host applications only
- **MFEs are URL-agnostic**: Remotes never import routers or reference URLs
- **Navigation via events**: MFEs emit `NAVIGATE_TO` events; hosts translate to route changes
- **Benefits**: MFEs can be deployed to any host without URL coupling

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
