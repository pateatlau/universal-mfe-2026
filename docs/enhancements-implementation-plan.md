# Enterprise Enhancements Implementation Plan

**Status:** In Progress
**Last Updated:** 2026-01-07
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
| Turborepo Migration | ✅ Complete | 1 |
| Design Tokens & Theming (dark/light mode) | ✅ Complete | 2 |
| Accessibility | ✅ Complete | 3 |
| Internationalization (i18n) | ✅ Complete | 4 |
| Event Bus (Inter-MFE Communication) | ✅ Complete | 5 |
| React Query (TanStack Query) | ✅ Complete | 6 |
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

### Task 1.2: Define pipeline tasks ✅ COMPLETE
**Configured in `turbo.json`:**
- `build` - builds packages with proper dependency ordering (`dependsOn: ["^build"]`)
- `typecheck` - runs TypeScript checks (depends on build for type declarations)
- `lint` - runs ESLint
- `format` - runs Prettier to fix formatting (`cache: false`)
- `format:check` - checks formatting without modifying (for CI)
- `test` - runs Jest tests (depends on build)
- `dev` - development servers (`cache: false`, `persistent: true`)

**Notes:**
- All pipeline tasks were defined in Task 1.1 when creating turbo.json
- Verified: `npx turbo run typecheck` - 6 packages type-checked successfully
- Verified: Caching works correctly ("FULL TURBO" on cached runs)

### Task 1.3: Update package.json scripts ✅ COMPLETE
**Files modified:**
- `package.json` (root) - updated scripts to use `turbo run`
- `turbo.json` - added `clean` task

**Scripts updated:**
- `build` → `turbo run build`
- `build:shared` → `turbo run build --filter=@universal/shared-*`
- `build:web` → `turbo run build --filter=@universal/web-*`
- `typecheck` → `turbo run typecheck`
- `lint` → `turbo run lint`
- `format` → `turbo run format`
- `format:check` → `turbo run format:check` (new)
- `test` → `turbo run test`
- `clean` → `turbo run clean`
- `dev` → `turbo run dev` (new)

**Notes:**
- `build:mobile:android` and `build:mobile:ios` kept as direct yarn workspace commands (require PLATFORM env var)
- Verified: All scripts work with FULL TURBO caching

### Task 1.4: Configure caching ✅ COMPLETE
**Files modified:**
- `turbo.json` - enhanced caching configuration

**Changes:**
- Added `globalDependencies`: `tsconfig.json`, `.nvmrc` (affect all packages)
- Added `$TURBO_DEFAULT$` to all cached task inputs (includes lockfile, package.json)
- Added `*.config.{js,mjs,ts}` to build inputs for bundler configs
- Added root config references for lint (`../../eslint.config.mjs`), format (`../../.prettierrc`), test (`../../jest.config.js`)

**Caching summary:**
| Task | Cached | Notes |
|------|--------|-------|
| build | ✅ | Outputs: `dist/**` |
| typecheck | ✅ | No outputs (validation only) |
| lint | ✅ | References root eslint config |
| format | ❌ | Side effects (modifies files) |
| format:check | ✅ | References root prettier config |
| test | ✅ | Outputs: `coverage/**` |
| dev | ❌ | Persistent process |
| clean | ❌ | Side effects (deletes files) |

**Notes:**
- Remote caching available via `TURBO_TOKEN` and `TURBO_TEAM` env vars (optional)
- Verified: FULL TURBO on subsequent runs for build and typecheck

### Task 1.5: Update CI workflows ✅ COMPLETE
**Files modified:**
- `.github/workflows/ci.yml` - added Turborepo caching to all jobs

**Changes:**
Added Turborepo cache step to all 6 CI jobs:
- `check` - Lint, Typecheck, Test
- `build-web` - Build Web
- `build-android` - Build Android
- `build-standalone-android` - Build Standalone Android
- `build-ios` - Build iOS (Simulator)
- `build-standalone-ios` - Build Standalone iOS (Simulator)

**Cache configuration:**
```yaml
- name: Setup Turborepo cache
  uses: actions/cache@v5
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-turbo-
```

**Notes:**
- Cache key uses `runner.os` (Linux/macOS) and `github.sha` for exact match
- `restore-keys` allows partial match from previous runs
- Jobs on same SHA share cache (check → build-web, etc.)
- YAML syntax validated

### Task 1.6: Add architecture enforcement rules ✅ COMPLETE
**Purpose:** Automatically enforce architectural boundaries to prevent drift over time.

**Files created:**
- `eslint-rules/index.js` - Plugin entry point
- `eslint-rules/no-cross-mfe-imports.js` - Custom ESLint rule to prevent direct MFE-to-MFE imports
- `eslint-rules/no-dom-in-shared.js` - Custom ESLint rule to prevent DOM usage in shared packages

**Files modified:**
- `eslint.config.mjs` - added architecture enforcement rules as `architecture` plugin
- `package.json` (root) - added `lint:architecture` script

**Rules enforced:**
| Rule | Purpose |
|------|---------|
| `architecture/no-cross-mfe-imports` | Prevents `web-remote-*` or `mobile-remote-*` packages from importing each other |
| `architecture/no-dom-in-shared` | Prevents DOM elements (`div`, `span`, etc.) and browser globals (`window`, `document`, `localStorage`) in `shared-*` packages |

**Notes:**
- Rules are automatically applied to all packages via eslint.config.mjs
- `yarn lint:architecture` runs architecture checks independently
- Tested with intentional violations - rules correctly flag errors
- Existing codebase passes with 0 architecture errors

### Task 1.7: Update documentation ✅ COMPLETE
**Files modified:**
- `CLAUDE.md` - Added Turborepo section with commands, caching info, and architecture enforcement
- `README.md` - Added Turborepo to Tech Stack table, added Turborepo section with commands
- `docs/universal-mfe-all-platforms-testing-guide.md` - Added Turborepo commands section

**Documentation updates:**
- Turborepo 2.7.3 added to version tables
- Key commands documented: `build`, `build:shared`, `build:web`, `typecheck`, `lint`, `lint:architecture`, `test`, `clean`
- Caching behavior explained ("FULL TURBO" on cache hits)
- Architecture enforcement rules documented

---

## Phase 1 Complete ✅

All Turborepo migration tasks completed:
- Task 1.1: Turborepo installed and configured
- Task 1.2: Pipeline tasks defined
- Task 1.3: Root scripts updated to use `turbo run`
- Task 1.4: Caching configured with inputs/outputs
- Task 1.5: CI workflows updated with Turborepo cache
- Task 1.6: Architecture enforcement ESLint rules added
- Task 1.7: Documentation updated

---

## Phase 2: Design Tokens & Theming

### Task 2.1: Create shared-design-tokens package ✅ COMPLETE
**Files created:**
- `packages/shared-design-tokens/package.json`
- `packages/shared-design-tokens/tsconfig.json`
- `packages/shared-design-tokens/src/primitives/colors.ts` - Color palette (blue, gray, green, yellow, red) with 50-900 shades
- `packages/shared-design-tokens/src/primitives/spacing.ts` - Spacing scale (0-32 based on 4px unit)
- `packages/shared-design-tokens/src/primitives/typography.ts` - Font sizes, weights, line heights, letter spacing
- `packages/shared-design-tokens/src/primitives/shadows.ts` - Shadow definitions with RN properties and Android elevation
- `packages/shared-design-tokens/src/primitives/index.ts` - Primitives barrel export
- `packages/shared-design-tokens/src/semantic/colors.ts` - Semantic colors (surface.*, text.*, border.*, interactive.*, status.*, icon.*)
- `packages/shared-design-tokens/src/semantic/spacing.ts` - Semantic spacing (layout.*, component.*, element.*, input.*, button.*)
- `packages/shared-design-tokens/src/semantic/index.ts` - Semantic barrel export
- `packages/shared-design-tokens/src/themes.ts` - Light and dark theme compositions
- `packages/shared-design-tokens/src/index.ts` - Main entry point

**Token architecture:**
- **Primitives**: Raw values (colors, spacing, typography) - internal use only
- **Semantic**: Meaningful aliases (surface.*, text.*, border.*) - used by components
- Components should ONLY use semantic tokens, never primitives directly
- This enables rebranding by only changing semantic → primitive mappings

**Notes:**
- Verified: `yarn workspace @universal/shared-design-tokens build` - Success
- Verified: `yarn build:shared` - Turborepo includes new package (3 packages built)

### Task 2.2: Create shared-theme-context package ✅ COMPLETE
**Files created:**
- `packages/shared-theme-context/package.json`
- `packages/shared-theme-context/tsconfig.json`
- `packages/shared-theme-context/src/ThemeProvider.tsx` - Context provider with theme state and toggle
- `packages/shared-theme-context/src/useTheme.ts` - Hooks (useTheme, useThemeTokens, useThemeColors, useThemeSpacing)
- `packages/shared-theme-context/src/index.ts` - Main entry point

**API provided:**
- `ThemeProvider` - Context provider with `defaultTheme` and `onThemeChange` props
- `useTheme()` - Returns `{ theme, themeName, isDark, toggleTheme, setTheme }`
- `useThemeTokens()` - Convenience hook for theme object
- `useThemeColors()` - Convenience hook for color tokens
- `useThemeSpacing()` - Convenience hook for spacing tokens

**Notes:**
- Verified: `yarn build:shared` - 4 packages built (design-tokens → theme-context dependency order correct)

### Task 2.3: Update shared-hello-ui to use theming ✅ COMPLETE
**Files modified:**
- `packages/shared-hello-ui/package.json` - added `@universal/shared-theme-context` dependency
- `packages/shared-hello-ui/src/HelloUniversal.tsx` - updated to use `useTheme()` hook and dynamic themed styles

**Changes:**
- Added `@universal/shared-theme-context` to dependencies
- Replaced static StyleSheet with `createStyles(theme)` function that generates styles from theme tokens
- Component now uses `useMemo` to memoize styles based on theme changes
- All hardcoded colors/spacing replaced with semantic tokens:
  - `theme.colors.surface.card` for container background
  - `theme.colors.text.primary` for text color
  - `theme.colors.interactive.primary` for button background
  - `theme.colors.text.inverse` for button text
  - `theme.spacing.*` for padding, margins, gaps
  - `theme.typography.*` for font sizes and weights

**Notes:**
- Verified: `yarn build:shared` - 4 packages built successfully
- Verified: `yarn workspace @universal/shared-hello-ui typecheck` - passes

### Task 2.4: Integrate theming into host applications ✅ COMPLETE
**Files modified:**

**Semantic tokens enhanced:**
- `packages/shared-design-tokens/src/semantic/colors.ts` - Added `surface.primary`, `surface.secondary`, `surface.tertiary`
- `packages/shared-design-tokens/src/semantic/spacing.ts` - Added `component.borderRadius`, `input.borderRadius`, `button.borderRadius`, `button.paddingHorizontalSmall`, `button.paddingVerticalSmall`

**Host applications:**
- `packages/web-shell/package.json` - Added `@universal/shared-theme-context` dependency
- `packages/web-shell/src/App.tsx` - Wrapped with `ThemeProvider`, added theme toggle button, updated all styles to use theme tokens
- `packages/mobile-host/package.json` - Added `@universal/shared-theme-context` dependency
- `packages/mobile-host/src/App.tsx` - Wrapped with `ThemeProvider`, added theme toggle button, updated all styles to use theme tokens

**Remote modules (ThemeProvider wrapper for MFE independence):**
- `packages/web-remote-hello/package.json` - Added `@universal/shared-theme-context` dependency
- `packages/web-remote-hello/src/HelloRemote.tsx` - Wrapped `HelloUniversal` with `ThemeProvider`
- `packages/mobile-remote-hello/package.json` - Added `@universal/shared-theme-context` dependency
- `packages/mobile-remote-hello/src/HelloRemote.tsx` - Wrapped `HelloUniversal` with `ThemeProvider`

**Standalone mode (theme toggle added):**
- `packages/web-remote-hello/src/standalone.tsx` - Added `ThemeProvider`, theme toggle, themed styles
- `packages/mobile-remote-hello/src/App.tsx` - Added `ThemeProvider`, theme toggle, themed styles

**Notes:**
- Verified: `yarn typecheck` - All 12 tasks pass
- Verified: `yarn lint:architecture` - No architecture rule violations
- Verified: Web shell, web remote standalone, mobile host (iOS/Android), mobile remote standalone all work with theming

**Theme Synchronization via Event Bus: ✅ IMPLEMENTED**
Theme synchronization between host and remote MFEs is now implemented using Event Bus (see Phase 5):
- Host emits `THEME_CHANGED` event when user toggles theme
- Remote MFEs listen for this event and update their internal ThemeProvider
- This approach maintains MFE independence while enabling UI consistency

Implementation details:
- `packages/web-shell/src/App.tsx` - emits THEME_CHANGED on toggle
- `packages/mobile-host/src/App.tsx` - emits THEME_CHANGED on toggle
- `packages/web-remote-hello/src/HelloRemote.tsx` - listens and syncs theme
- `packages/mobile-remote-hello/src/HelloRemote.tsx` - listens and syncs theme

### Task 2.5: Update build scripts ✅ COMPLETE
**Status:** No changes required

**Verification:**
- Turborepo automatically determines correct build order based on package.json dependencies
- `dependsOn: ["^build"]` in turbo.json ensures dependencies are built first
- Verified build order: `shared-utils` → `shared-design-tokens` → `shared-theme-context` → `shared-hello-ui`
- `yarn build:shared` - 4 packages built in correct order
- `yarn build` - All 6 buildable packages compiled successfully

**Notes:**
- The new packages (`shared-design-tokens`, `shared-theme-context`) are automatically discovered by Turborepo
- No manual configuration needed for build order - Turborepo infers from dependency graph

---

## Phase 2 Complete ✅

All Design Tokens & Theming tasks completed:
- Task 2.1: Created shared-design-tokens package with primitives and semantic tokens
- Task 2.2: Created shared-theme-context package with ThemeProvider and hooks
- Task 2.3: Updated shared-hello-ui to use theming
- Task 2.4: Integrated theming into host and remote applications
- Task 2.5: Verified build scripts (no changes needed)

---

## Phase 3: Accessibility

Build accessible components from the ground up, ensuring WCAG 2.1 AA compliance across web and mobile platforms.

### Task 3.1: Create shared-a11y package ✅ COMPLETE
**Files created:**
- `packages/shared-a11y/package.json`
- `packages/shared-a11y/tsconfig.json` - includes DOM lib for web platform a11y APIs
- `packages/shared-a11y/src/hooks/useAccessibilityInfo.ts` - Platform-aware a11y state (screen reader, reduce motion, bold text, grayscale, etc.)
- `packages/shared-a11y/src/hooks/useFocusManagement.ts` - Focus trap, restore, and programmatic focus utilities
- `packages/shared-a11y/src/hooks/useAnnounce.ts` - Screen reader announcements with polite/assertive priority
- `packages/shared-a11y/src/hooks/index.ts` - Hooks barrel export
- `packages/shared-a11y/src/constants.ts` - ARIA roles, states, actions, labels, hints, and WCAG constants
- `packages/shared-a11y/src/index.ts`

**Files modified:**
- `eslint-rules/no-dom-in-shared.js` - Added exception for shared-a11y package (requires DOM APIs for web accessibility)

**API provided:**
- Hooks: `useAccessibilityInfo`, `useScreenReader`, `useReduceMotion`, `useFocusManagement`, `useFocusOnMount`, `useFocusTrap`, `useAnnounce`, `useAnnounceResult`
- Constants: `A11yRoles`, `A11yStates`, `A11yActions`, `A11yLabels`, `A11yHints`, `A11yLiveRegion`, `A11Y_MIN_TOUCH_TARGET`, `A11Y_CONTRAST_RATIOS`

**No external dependencies** - Uses React Native's built-in AccessibilityInfo API

**Notes:**
- Verified: `yarn workspace @universal/shared-a11y build` - Success
- Verified: `yarn typecheck` - 13 tasks pass
- Verified: `yarn lint:architecture` - 0 errors

### Task 3.2: Create accessible primitive components ✅ COMPLETE
**Files created:**
- `packages/shared-a11y/src/components/AccessibleText.tsx` - Text with semantic roles (header, alert, summary) and heading levels
- `packages/shared-a11y/src/components/AccessibleButton.tsx` - Button with 44x44 min touch target, disabled/loading/selected states
- `packages/shared-a11y/src/components/AccessibleInput.tsx` - Input with label, hint, error (auto-announced), required indicator
- `packages/shared-a11y/src/components/SkipLink.tsx` - Skip to main content link (WCAG 2.4.1 compliance)
- `packages/shared-a11y/src/components/VisuallyHidden.tsx` - Screen reader-only content with `visuallyHiddenStyle` export
- `packages/shared-a11y/src/components/index.ts` - Components barrel export

**Files modified:**
- `packages/shared-a11y/src/index.ts` - Added component exports

**Components API:**
- `AccessibleText`: `semanticRole`, `headingLevel`, `announceChanges`, `accessibilityLabel`
- `AccessibleButton`: `label`, `disabled`, `loading`, `loadingLabel`, `selected`, `accessibilityHint`
- `AccessibleInput`: `label`, `labelHidden`, `hint`, `error`, `required`, `disabled`
- `SkipLink`: `label`, `targetRef`, `onSkip`
- `VisuallyHidden`: `as="view"|"text"`, `containerProps`

**Notes:**
- Verified: `yarn workspace @universal/shared-a11y build` - Success
- Verified: `yarn typecheck` - 13 tasks pass
- Verified: `yarn lint:architecture` - 0 errors

### Task 3.3: Add accessibility props to shared-hello-ui ✅ COMPLETE
**Files modified:**
- `packages/shared-hello-ui/package.json` - added `@universal/shared-a11y` dependency
- `packages/shared-hello-ui/src/HelloUniversal.tsx` - added accessibility props and WCAG compliance

**Props added:**
- `buttonAccessibilityLabel` - custom label for the button
- `buttonAccessibilityHint` - hint describing button action

**Accessibility enhancements:**
- Container: `accessible={true}`, `accessibilityLabel` with greeting context
- Text: `accessibilityRole={A11yRoles.TEXT}`
- Button: `accessibilityRole={A11yRoles.BUTTON}`, label, hint
- Button: `minHeight/minWidth` set to `A11Y_MIN_TOUCH_TARGET` (44px) for WCAG 2.1 AA

**Notes:**
- Verified: `yarn turbo run build --filter='@universal/shared-*'` - 5 packages built
- Verified: `yarn typecheck` - 14 tasks pass
- Verified: `yarn lint:architecture` - 0 errors

### Task 3.4: Create accessibility testing utilities ✅ COMPLETE
**Files created:**
- `packages/shared-a11y/src/testing/a11yMatchers.ts` - Custom Jest matchers for a11y
- `packages/shared-a11y/src/testing/index.ts` - Testing utilities barrel export

**Files modified:**
- `packages/shared-a11y/src/index.ts` - Added testing exports

**Custom Jest matchers provided:**
- `toHaveAccessibilityRole(role)` - Verify element has expected role
- `toHaveAccessibilityLabel(label, options?)` - Verify label (supports partial match)
- `toHaveAccessibilityHint(hint)` - Verify element has expected hint
- `toHaveAccessibilityState(state)` - Verify disabled, selected, checked, etc.
- `toHaveAccessibilityValue(value)` - Verify value for sliders, progress bars
- `toBeAccessible()` - Verify basic accessibility requirements
- `toHaveMinimumTouchTarget(minSize?)` - Verify 44x44px touch target

**Usage:**
```ts
import { extendExpectWithA11yMatchers } from '@universal/shared-a11y/testing';
extendExpectWithA11yMatchers();

expect(button).toHaveAccessibilityRole('button');
expect(button).toBeAccessible();
```

**Notes:**
- Verified: `yarn workspace @universal/shared-a11y build` - Success
- Verified: `yarn typecheck` - 14 tasks pass
- Verified: `yarn lint:architecture` - 0 errors

### Task 3.5: Update build configuration ✅ COMPLETE
**Status:** No changes required

**Analysis:**
- `turbo.json` uses generic task definitions that automatically apply to all workspace packages
- `dependsOn: ["^build"]` ensures dependencies are built in correct order
- Turborepo auto-discovers `@universal/shared-a11y` as a workspace package

**Verification:**
- `shared-a11y` appears in `--dry-run` output
- Build order correct: utils → design-tokens → theme-context → a11y → hello-ui
- Caching works ("FULL TURBO" on cached runs)

---

## Phase 3 Complete ✅

All Accessibility tasks completed:
- Task 3.1: Created shared-a11y package with hooks (useAccessibilityInfo, useFocusManagement, useAnnounce)
- Task 3.2: Created accessible primitive components (AccessibleText, AccessibleButton, AccessibleInput, SkipLink, VisuallyHidden)
- Task 3.3: Added accessibility props to shared-hello-ui (WCAG 2.1 AA compliance)
- Task 3.4: Created accessibility testing utilities (7 custom Jest matchers)
- Task 3.5: Verified build configuration (no changes needed)

---

## Phase 4: Internationalization (i18n)

Implement internationalization with a lightweight, universal approach that works across web and mobile.

**i18n namespace rules:**
- Host apps own the root namespace (e.g., `common.*`, `navigation.*`)
- Each MFE owns its own namespace (e.g., `hello.*` for HelloRemote)
- Namespaces prevent translation key collisions between independently deployed MFEs

### Task 4.1: Create shared-i18n package ✅ COMPLETE
**Files created:**
- `packages/shared-i18n/package.json`
- `packages/shared-i18n/tsconfig.json` - includes ES2021 and DOM libs for Intl API support
- `packages/shared-i18n/src/types.ts` - LocaleCode, Translations, TranslateOptions, PluralRules, DateFormatOptions, NumberFormatOptions
- `packages/shared-i18n/src/I18nProvider.tsx` - Context provider with useI18nContext hook, withI18n HOC, mergeTranslations utility
- `packages/shared-i18n/src/useTranslation.ts` - Translation hook with interpolation ({{var}}) and pluralization support
- `packages/shared-i18n/src/useLocale.ts` - Locale management hook with RTL detection, getBestMatchingLocale utility
- `packages/shared-i18n/src/pluralize.ts` - Pluralization using Intl.PluralRules (getPluralCategory, pluralize, formatCount, formatOrdinal)
- `packages/shared-i18n/src/formatters.ts` - Formatting utilities using Intl APIs:
  - `formatDate` - Date formatting with dateStyle/timeStyle/custom options
  - `formatNumber` - Number formatting with notation, grouping
  - `formatCurrency` - Currency formatting with symbol/name display
  - `formatRelativeTime` - Relative time ("2 days ago", "in 3 hours")
  - `formatRelativeTimeAuto` - Auto-select unit based on time difference
  - `formatList` - List formatting ("A, B, and C")
  - `formatBytes` - File size formatting with binary/decimal units
- `packages/shared-i18n/src/index.ts` - Main entry point with all exports

**No external dependencies** - Pure TypeScript using browser/RN Intl API

**Notes:**
- Verified: `yarn workspace @universal/shared-i18n build` - Success
- Verified: `yarn typecheck` - 15 tasks pass
- Verified: `yarn lint:architecture` - 0 errors

### Task 4.2: Create translation file structure ✅ COMPLETE
**Files created:**
- `packages/shared-i18n/src/locales/en.ts` - English translations with namespaces:
  - `common.*` - Shared strings (loading, error, retry, welcome, items with pluralization)
  - `navigation.*` - Navigation labels (home, settings, profile, menu)
  - `errors.*` - Error messages with interpolation ({{field}}, {{moduleName}})
  - `accessibility.*` - Screen reader announcements
  - `theme.*` - Theme labels (light, dark, system, toggle)
  - `language.*` - Language selector labels
  - `hello.*` - HelloRemote MFE namespace
  - `datetime.*` - Date/time labels with pluralization
- `packages/shared-i18n/src/locales/es.ts` - Spanish translations (complete mirror of English)
- `packages/shared-i18n/src/locales/index.ts` - Locale registry with:
  - `locales` - TranslationResources for all locales
  - `availableLocales` - List of supported locale codes
  - `defaultLocale` - Default locale ('en')
  - `localeDisplayNames` - Native language names
  - `rtlLocales` - RTL locales list
  - Helper functions: `isRTLLocale`, `getLocaleDisplayName`, `isLocaleSupported`, `getTranslations`

**Type updates:**
- Added `it` (Italian) and `ar` (Arabic) to `LocaleCode` type
- Updated `SUPPORTED_LOCALES` constant with all 10 locales

**Notes:**
- Verified: `yarn workspace @universal/shared-i18n build` - Success
- Verified: `yarn typecheck` - 15 tasks pass
- Verified: `yarn lint:architecture` - 0 errors

### Task 4.3: Create translation utilities ✅ COMPLETE
**Files created:**
- `packages/shared-i18n/src/utils/interpolate.ts` - Variable interpolation utilities:
  - `interpolate(template, params)` - Replace `{{var}}` placeholders with values
  - `extractVariables(template)` - Get all variable names from template
  - `hasInterpolation(template)` - Check if template has placeholders
  - `validateInterpolation(template, params)` - Check if all required params provided
  - `createInterpolator<T>(template)` - Create type-safe interpolation function
- `packages/shared-i18n/src/utils/detectLocale.ts` - Platform-aware locale detection:
  - `getDeviceLocale()` - Get device locale (iOS/Android/Web)
  - `getPreferredLocales()` - Get array of preferred locales
  - `findBestLocale(preferred)` - Find best match from available translations
  - `detectLocale()` - Main entry point combining detection + matching
  - `isDeviceRTL()` / `getTextDirection()` - RTL support
  - `getAvailablePreferredLocales()` - Get locales for language selector
- `packages/shared-i18n/src/utils/persistLocale.ts` - Locale persistence:
  - `configureLocaleStorage(storage)` - Configure custom storage (AsyncStorage)
  - `saveLocale(locale)` / `loadLocale()` / `clearLocale()` - CRUD operations
  - `loadOrDetectLocale(detectFn)` - Load persisted or detect from device
  - `hasPersistedLocale()` / `getCachedLocale()` - Query functions
- `packages/shared-i18n/src/utils/index.ts` - Barrel export

**Files modified:**
- `eslint-rules/no-dom-in-shared.js` - Added exception for shared-i18n package (needs navigator/localStorage)
- `packages/shared-i18n/src/index.ts` - Added utility exports

**Notes:**
- Verified: `yarn workspace @universal/shared-i18n build` - Success
- Verified: `yarn typecheck` - 15 tasks pass
- Verified: `yarn lint:architecture` - 0 errors

### Task 4.4: Integrate i18n into host applications ✅ COMPLETE
**Files modified:**
- `packages/web-shell/package.json` - added @universal/shared-i18n dependency
- `packages/web-shell/src/App.tsx` - wrapped with I18nProvider, added language toggle button, used translations
- `packages/mobile-host/package.json` - added @universal/shared-i18n dependency
- `packages/mobile-host/src/App.tsx` - wrapped with I18nProvider, added language toggle button, used translations

**Translation keys used:**
- `common.appName`, `common.subtitle`, `common.subtitleMobile`
- `common.loading`, `common.loadRemote`, `common.error`, `common.retry`
- `common.pressCount` (with pluralization)

**Notes:**
- Language toggle cycles through available locales (en/es)
- Locale is passed to remote components via props (see Task 4.5)

### Task 4.5: Add i18n to shared-hello-ui and remotes ✅ COMPLETE
**Files modified:**
- `packages/shared-hello-ui/package.json` - added @universal/shared-i18n dependency
- `packages/shared-hello-ui/src/HelloUniversal.tsx` - uses `useTranslation('hello')` hook for:
  - `hello.greeting` / `hello.greetingWithName` (with {{name}} interpolation)
  - `hello.buttonLabel`, `hello.buttonHint`
- `packages/web-remote-hello/package.json` - added @universal/shared-i18n dependency
- `packages/web-remote-hello/src/HelloRemote.tsx` - wrapped with I18nProvider, accepts `locale` prop
- `packages/mobile-remote-hello/package.json` - added @universal/shared-i18n dependency
- `packages/mobile-remote-hello/src/HelloRemote.tsx` - wrapped with I18nProvider, accepts `locale` prop

**Locale Synchronization via Event Bus: ✅ IMPLEMENTED**
Locale synchronization between host and remote MFEs is now implemented using Event Bus (see Phase 5):
- Host emits `LOCALE_CHANGED` event when user changes language
- Remote MFEs listen for this event and update their internal I18nProvider
- This approach maintains MFE independence while enabling consistent translations

Implementation details:
- `packages/web-shell/src/App.tsx` - emits LOCALE_CHANGED on language toggle
- `packages/mobile-host/src/App.tsx` - emits LOCALE_CHANGED on language toggle
- `packages/web-remote-hello/src/HelloRemote.tsx` - listens and syncs locale
- `packages/mobile-remote-hello/src/HelloRemote.tsx` - listens and syncs locale

**Notes:**
- Removed `getGreeting` from shared-utils (now handled by i18n)
- Verified: All translations work on web (en/es)
- Verified: Locale changes in host immediately reflect in remote

### Task 4.6: Update build configuration ✅ COMPLETE
**Notes:**
- Turborepo automatically includes shared-i18n in build pipeline via dependency detection
- No manual turbo.json changes required - `dependsOn: ["^build"]` handles it
- Verified: `yarn build:shared` builds shared-i18n correctly
- Verified: `yarn typecheck` passes for all 16 tasks

---

## Phase 5: Event Bus (Inter-MFE Communication)

Implement a lightweight, type-safe event bus for communication between microfrontends without tight coupling.

### Task 5.1: Create shared-event-bus package ✅ COMPLETE
**Files created:**
- `packages/shared-event-bus/package.json`
- `packages/shared-event-bus/tsconfig.json`
- `packages/shared-event-bus/src/types.ts` - Core types:
  - `BaseEvent` - Base interface with type, version, payload, timestamp, source, correlationId
  - `EventHandler`, `Subscription`, `EventFilter` - Handler and subscription types
  - `SubscribeOptions`, `EmitOptions`, `EventBusOptions` - Configuration options
  - `EventBusStats`, `EventHistoryEntry` - Statistics and debugging types
  - `EventDefinition`, `EventType`, `EventPayload`, `EventUnion` - Helper types
- `packages/shared-event-bus/src/EventBus.ts` - Core pub/sub implementation:
  - `createEventBus<Events>()` - Factory function with type-safe events
  - `subscribe()`, `subscribeOnce()` - Subscribe with filter, priority, once options
  - `emit()` - Emit events with version, source, correlationId
  - `waitFor()` - Promise-based event waiting with timeout
  - `getHistory()`, `clearHistory()` - Event history for debugging
  - `getStats()` - Statistics (total events, subscriptions, counts)
  - `WILDCARD_EVENT` - Subscribe to all events with '*'
- `packages/shared-event-bus/src/index.ts` - Exports

**No external dependencies** - Pure TypeScript implementation

**Verified:**
- `yarn workspace @universal/shared-event-bus build` - Success
- `yarn workspace @universal/shared-event-bus typecheck` - Passes
- ESLint architecture rules pass (0 errors)

### Task 5.2: Create React integration hooks ✅ COMPLETE
**Files created:**
- `packages/shared-event-bus/src/EventBusProvider.tsx` - React context provider:
  - `EventBusProvider` - Provides event bus instance to component tree
  - `useEventBusContext` - Access event bus from context (throws if not wrapped)
- `packages/shared-event-bus/src/hooks/useEventBus.ts` - Direct event bus access hook
- `packages/shared-event-bus/src/hooks/useEventListener.ts` - Subscription hooks:
  - `useEventListener` - Subscribe with auto-cleanup on unmount
  - `useEventListenerOnce` - Single event subscription
  - `useEventListenerMultiple` - Subscribe to multiple event types
  - `useEventSubscriber` - Imperative subscription management
- `packages/shared-event-bus/src/hooks/useEventEmitter.ts` - Emission hooks:
  - `useEventEmitter` - Memoized emit function with source/correlationId
  - `useTypedEmitter` - Type-safe emitter for single event type
  - `useEventEmitters` - Multiple typed emitters at once
  - `useEmitOnCondition` - Emit when condition becomes true
- `packages/shared-event-bus/src/hooks/index.ts` - Barrel export
- `packages/shared-event-bus/src/index.ts` - Updated with React exports

**Verified:**
- `yarn workspace @universal/shared-event-bus build` - Success
- `yarn workspace @universal/shared-event-bus typecheck` - Passes
- ESLint architecture rules pass (0 errors)

### Task 5.3: Define standard event types with versioning ✅ COMPLETE
**Files created:**
- `packages/shared-event-bus/src/events/navigation.ts` - Navigation events:
  - `NavigateToEvent` - Request navigation to path with params
  - `NavigateBackEvent` - Request to go back with fallback
  - `NavigationCompletedEvent` - Notification after navigation completes
  - `OpenExternalUrlEvent` - Request to open external URL
- `packages/shared-event-bus/src/events/auth.ts` - Auth events:
  - `UserLoggedInEvent` - User logged in with userId, email, roles
  - `UserLoggedOutEvent` - User logged out with reason
  - `SessionExpiredEvent` - Session expired with redirect
  - `AuthErrorEvent` - Auth error with code, message, retryable
  - `LoginRequiredEvent` - Request to show login UI
  - `UserProfileUpdatedEvent` - Profile changes notification
- `packages/shared-event-bus/src/events/theme.ts` - Theme events:
  - `ThemeChangedEvent` - Theme changed (host → MFEs)
  - `ThemeChangeRequestEvent` - Theme change request (MFE → host)
- `packages/shared-event-bus/src/events/locale.ts` - Locale events:
  - `LocaleChangedEvent` - Locale changed (host → MFEs)
  - `LocaleChangeRequestEvent` - Locale change request (MFE → host)
- `packages/shared-event-bus/src/events/remote.ts` - Remote module events:
  - `RemoteLoadingEvent`, `RemoteLoadedEvent`, `RemoteLoadFailedEvent`
  - `RemoteRetryingEvent`, `RemoteUnloadedEvent`
- `packages/shared-event-bus/src/events/index.ts` - Event registry:
  - `AppEvents` - Union of all standard events
  - `EventTypes` - All event type constants combined
  - `EventVersions` - Version metadata for compatibility checks

**Event governance rules (documented in events/index.ts):**
- All events include a `version` field (currently v1 for all events)
- Event evolution is **append-only**: new fields can be added, existing fields cannot be removed
- Breaking changes require a new event type (e.g., `NAVIGATE_TO_V2`)
- Host is responsible for handling multiple event versions during migration periods

**Verified:**
- `yarn workspace @universal/shared-event-bus build` - Success
- `yarn workspace @universal/shared-event-bus typecheck` - Passes
- ESLint architecture rules pass (0 errors)

### Task 5.4: Add debugging and devtools support ✅ COMPLETE
**Files created:**
- `packages/shared-event-bus/src/devtools/EventLogger.ts` - Console logging:
  - `createEventLogger` - Formatted console output with colors, timestamps, filters
  - `createGroupedEventLogger` - Groups events by correlationId for tracing
  - `createTableLogger` - Batch events into console.table format
- `packages/shared-event-bus/src/devtools/EventHistory.ts` - History viewer:
  - `createHistoryViewer` - Query, filter, and analyze event history
  - `filter()` - Filter by type, source, time range, correlationId, version
  - `search()` - Search payloads by string/regex
  - `getStats()` - Statistics (counts by type/source, events per minute, most frequent)
  - `groupBy()` - Group events by type, source, or custom key
  - `export()` - Export history as JSON for external analysis
  - `print()` - Formatted console output with grouping
- `packages/shared-event-bus/src/devtools/index.ts` - Barrel export

**Files modified:**
- `packages/shared-event-bus/tsconfig.json` - Added DOM lib for TypeScript type definitions
- `packages/shared-event-bus/src/index.ts` - Added devtools exports

**Note on DOM lib in tsconfig:**
The `"DOM"` lib is included for TypeScript type checking only. This is consistent with other shared packages (shared-i18n, shared-a11y) that need platform detection:
- **TypeScript needs DOM lib** to recognize `window`, `document` etc. for `typeof` checks
- **Platform detection patterns** like `typeof window !== 'undefined'` are safe and explicitly allowed
- **ESLint architecture rule** (`no-dom-in-shared.js`) prevents actual runtime usage of browser APIs
- **Devtools gracefully degrade** on non-web platforms (e.g., colored logs only when `window` exists)

This combination (DOM lib for types + ESLint rule for runtime safety) is the correct pattern.

**Note on ESLint exception:**
Unlike shared-a11y and shared-i18n, shared-event-bus does NOT require an ESLint exception because:
- Devtools only use `console` (universal API available in all JS runtimes, not in forbidden list)
- Platform checks use `typeof window !== 'undefined'` (explicitly allowed by the rule)
- No direct usage of forbidden globals (window, document, localStorage, etc.)

**Verified:**
- `yarn workspace @universal/shared-event-bus build` - Success
- `yarn workspace @universal/shared-event-bus typecheck` - Passes
- ESLint architecture rules pass (0 errors)

### Task 5.5: Integrate event bus into host applications ✅ COMPLETE
**Files modified:**
- `packages/web-shell/package.json` - added @universal/shared-event-bus dependency
- `packages/web-shell/src/App.tsx` - wrapped with EventBusProvider, added EventLogger component
- `packages/mobile-host/package.json` - added @universal/shared-event-bus dependency
- `packages/mobile-host/src/App.tsx` - wrapped with EventBusProvider, added EventLogger component

**Implementation:**
- Both hosts wrap the app with `EventBusProvider` with `debug: __DEV__` and named instances
- `EventLogger` component subscribes to all events and logs in development mode
- Web uses colored console output; mobile uses plain text (no CSS colors support)
- Event bus is now available via `useEventBus()` hook in all child components

**Verified:**
- `yarn build:shared` - Success (7 packages)
- `yarn typecheck` - 18 tasks pass
- `yarn lint:architecture` - 0 errors (33 warnings for console statements - expected for debug code)

### Task 5.6: Create example inter-MFE communication ✅ COMPLETE
**Files created:**
- `packages/shared-event-bus/src/events/interaction.ts` - Interaction events:
  - `ButtonPressedEvent` - Button click with buttonId, label, metadata
  - `FormSubmittedEvent` - Form submission with formId, data, validation status
  - `ItemSelectedEvent` - Item selection with itemId, itemType, metadata
  - `CustomActionEvent` - Custom action with actionId, payload

**Files modified:**
- `packages/shared-event-bus/src/events/index.ts` - Added interaction events to registry
- `packages/shared-event-bus/src/index.ts` - Exported interaction event types
- `packages/web-remote-hello/package.json` - Added @universal/shared-event-bus dependency
- `packages/web-remote-hello/src/HelloRemote.tsx` - Emits BUTTON_PRESSED event on click
- `packages/web-remote-hello/src/standalone.tsx` - Added I18nProvider and language toggle
- `packages/mobile-remote-hello/package.json` - Added @universal/shared-event-bus dependency
- `packages/mobile-remote-hello/src/HelloRemote.tsx` - Emits BUTTON_PRESSED event on click
- `packages/mobile-remote-hello/src/App.tsx` - Added I18nProvider and language toggle
- `packages/web-shell/src/App.tsx` - Listens for BUTTON_PRESSED events, updates press count
- `packages/mobile-host/src/App.tsx` - Listens for BUTTON_PRESSED events, updates press count
- `packages/shared-event-bus/package.json` - Fixed React version (peerDependencies only)
- `packages/shared-event-bus/src/EventBusProvider.tsx` - Global singleton pattern via globalThis

**Key implementation details:**
- EventBusProvider uses global singleton (`globalThis.__UNIVERSAL_EVENT_BUS__`) to ensure all MFEs share the same event bus instance
- Remote MFEs emit `BUTTON_PRESSED` events with buttonId, label, and metadata
- Host apps listen for events via `useEventListener<ButtonPressedEvent>` hook
- Press count is updated via event bus instead of prop callbacks (demonstrates decoupled communication)
- Standalone apps have language toggle matching host/shell apps

**Verified:**
- Web shell and remote: Events flow correctly, press count updates
- iOS host and remote: Events flow correctly, press count updates
- Android host and remote: Events flow correctly, press count updates
- Standalone apps: Theme and language toggles work correctly

### Task 5.7: Update build configuration ✅ COMPLETE
**Status:** No changes required

**Analysis:**
- Turborepo automatically discovers `@universal/shared-event-bus` via Yarn workspaces
- Generic task definitions in `turbo.json` apply to all workspace packages
- `dependsOn: ["^build"]` ensures correct build order based on package.json dependencies
- The dependency graph shows shared-event-bus is correctly identified with dependents:
  - `@universal/mobile-host`
  - `@universal/mobile-remote-hello`
  - `@universal/web-remote-hello`
  - `@universal/web-shell`

**Verified:**
- `yarn turbo run build --dry-run` shows shared-event-bus in pipeline
- `yarn build:shared` - 7 packages built successfully with FULL TURBO caching
- Build order is correct: shared-event-bus builds before its dependents

### Task 5.8: Establish MFE local state pattern ✅ COMPLETE
**Purpose:** Each MFE maintains its own Zustand store for local state, ensuring loose coupling. Event bus communicates *events*, not state — MFEs react to events by updating their own stores.

**Files created:**
- `packages/web-remote-hello/src/store/localStore.ts` - MFE-local Zustand store with:
  - `localPressCount` - Button press count local to MFE
  - `lastPressedAt` - Timestamp of last press
  - `preferences` - MFE-local preferences (showAnimations, customGreeting)
  - Selector hooks for optimized re-renders
- `packages/mobile-remote-hello/src/store/localStore.ts` - Same pattern for mobile

**Files modified:**
- `packages/web-remote-hello/package.json` - Added zustand@5.0.5 dependency
- `packages/mobile-remote-hello/package.json` - Added zustand@5.0.5 dependency
- `packages/web-remote-hello/src/HelloRemote.tsx` - Integrated local store:
  - Updates `localPressCount` on button press
  - Includes `localPressCount` in event metadata
  - Demonstrates state → event → callback flow
- `packages/mobile-remote-hello/src/HelloRemote.tsx` - Same integration

**Pattern established:**
- MFEs own their state (Zustand store per MFE)
- Host app owns shared/global state (e.g., auth, theme via shared-auth-store)
- Event bus bridges communication without coupling state
- Example flow:
  1. Button press → Update local state (Zustand)
  2. Then → Emit event (Event Bus) with metadata including local state info
  3. Then → Call legacy callback (backward compatibility)
  4. Host receives event → Updates its own state

**Key principle:** Events carry *information*, not state references. Each MFE maintains its own source of truth.

**Verified:**
- `yarn typecheck` - 18 tasks pass
- `yarn install` - Dependencies installed successfully

### Task 5.9: Implement remote loading failure & degradation strategy ✅ COMPLETE
**Purpose:** Define standard behavior when remote MFEs fail to load, ensuring graceful degradation.

**Files created:**
- `packages/shared-event-bus/src/components/RemoteLoadingFallback.tsx` - Themed loading indicator
- `packages/shared-event-bus/src/components/RemoteErrorFallback.tsx` - Error display with retry button
- `packages/shared-event-bus/src/components/RemoteErrorBoundary.tsx` - React Error Boundary for render errors
- `packages/shared-event-bus/src/components/useRemoteLoader.ts` - Hook with retry logic and event emission
- `packages/shared-event-bus/src/components/index.ts` - Barrel exports

**Files modified:**
- `packages/shared-event-bus/src/index.ts` - Export remote loading components
- `packages/shared-event-bus/src/events/remote.ts` - Added RENDER_ERROR and LOAD_ERROR to errorCode union
- `packages/shared-event-bus/package.json` - Added react-native peer dependency for RN primitives
- `packages/web-shell/rspack.config.mjs` - Fixed react-native alias for transitive dependencies
- `packages/web-shell/src/App.tsx` - User-friendly error messages and proper MF cache handling

**Components provided:**
- **RemoteLoadingFallback**: Accessible loading indicator with customizable message
- **RemoteErrorFallback**: Error display with retry button, shows error details in dev mode
- **RemoteErrorBoundary**: Catches render errors, emits events, supports custom fallbacks
- **useRemoteLoader**: Hook with timeout, exponential backoff retry, event emission

**Failure handling strategy implemented:**
- **Timeout**: Configurable timeout (default: 10s), rejects with descriptive error
- **Retry**: Exponential backoff with jitter (base: 1s, max: 30s), configurable attempts
- **Fallback UI**: RemoteErrorFallback with retry button, shows error details in dev
- **Event emission**: Emits REMOTE_LOADING, REMOTE_LOADED, REMOTE_RETRYING, REMOTE_LOAD_FAILED
- **Error Boundary**: Catches render errors, emits REMOTE_LOAD_FAILED with RENDER_ERROR code
- **Partial availability**: Components designed for graceful degradation

**Web shell improvements:**
- User-friendly error messages (replaced cryptic Module Federation errors)
- Proper handling of MF cached failures (MF caches failed loads as empty objects)
- "Reload Page" button (MF requires page reload to truly retry after failure)
- Validation that loaded component is a valid function before rendering

**Note:** Host apps (web-shell, mobile-host) already have manual loading/error handling.
The new components are exported for use when more sophisticated loading is needed.

### Task 5.10: Implement theme and locale sync via Event Bus ✅ COMPLETE
**Purpose:** Enable host-to-remote synchronization of theme and locale using Event Bus instead of prop drilling.

**Files modified:**
- `packages/web-shell/src/App.tsx` - Emit THEME_CHANGED and LOCALE_CHANGED events
- `packages/mobile-host/src/App.tsx` - Emit THEME_CHANGED and LOCALE_CHANGED events
- `packages/web-remote-hello/src/HelloRemote.tsx` - Listen for events and sync state
- `packages/mobile-remote-hello/src/HelloRemote.tsx` - Listen for events and sync state

**Implementation pattern:**
1. **Host emits events**: When user toggles theme/locale, host emits corresponding event
   - `THEME_CHANGED`: `{ theme: 'dark' | 'light', previousTheme }`
   - `LOCALE_CHANGED`: `{ locale: string, previousLocale }`
2. **Remotes listen**: Remotes use `useEventListener` hook to receive events
3. **Remotes update providers**: On event, remotes update their internal state which triggers provider re-render

**Benefits over prop drilling:**
- Decoupled communication (no need to pass props through multiple layers)
- Works even when remote is loaded after theme/locale change
- Consistent with event bus pattern for all inter-MFE communication
- Backwards compatible (initial props still work for first render)

**Standalone mode support:**
HelloRemote components also support direct prop changes for standalone mode (where no event bus events are emitted). This is implemented via `useEffect` hooks that sync internal state when `theme` or `locale` props change:
- `packages/web-remote-hello/src/standalone.tsx` - passes `theme={themeName}` prop
- `packages/mobile-remote-hello/src/App.tsx` - passes `theme={themeName}` prop
- HelloRemote uses `useEffect` to sync state when props change

**Verified:**
- Web shell and remote: Theme and locale sync correctly
- Mobile host and remote: Theme and locale sync correctly
- Web remote standalone: Theme and locale sync correctly
- Mobile remote standalone: Theme and locale sync correctly
- Events logged in console in development mode

---

## Phase 5 Complete ✅

All Event Bus tasks completed:
- Task 5.1: Created shared-event-bus package with core pub/sub
- Task 5.2: Created React hooks (useEventBus, useEventListener, useEventEmitter)
- Task 5.3: Defined standard event types with versioning
- Task 5.4: Added debugging and devtools support
- Task 5.5: Integrated event bus into host applications
- Task 5.6: Created example inter-MFE communication (BUTTON_PRESSED)
- Task 5.7: Verified build configuration
- Task 5.8: Established MFE local state pattern with Zustand
- Task 5.9: Implemented remote loading failure & degradation strategy
- Task 5.10: Implemented theme and locale sync via Event Bus

---

## Phase 6: Data Fetching with React Query

### Task 6.1: Create shared-data-layer package ✅ COMPLETE
**Files created:**
- `packages/shared-data-layer/package.json`
- `packages/shared-data-layer/tsconfig.json`
- `packages/shared-data-layer/src/queryClient.ts` - QueryClient factory with sensible defaults
- `packages/shared-data-layer/src/QueryProvider.tsx` - React provider with shared/isolated client options
- `packages/shared-data-layer/src/index.ts` - Exports + re-exported React Query hooks

**Dependencies:**
- `@tanstack/react-query` (exact version: 5.90.16)

**API provided:**
- `createQueryClient(config?)` - Create new QueryClient with optional overrides
- `getSharedQueryClient()` - Get/create singleton instance for cache sharing
- `resetSharedQueryClient()` - Reset singleton (for testing)
- `defaultQueryClientConfig` - Default configuration object
- `QueryProvider` - React provider with `useSharedClient`, `config`, `client` props
- Re-exported hooks: `useQuery`, `useMutation`, `useQueryClient`, `useInfiniteQuery`, etc.

**Default configuration:**
- `staleTime`: 30 seconds
- `gcTime`: 5 minutes
- `retry`: 3 for queries, 1 for mutations
- `refetchOnWindowFocus`: false (less noisy on mobile)
- `refetchOnReconnect`: true

**Verified:**
- `yarn workspace @universal/shared-data-layer build` - Success
- `yarn typecheck` - 19 tasks pass
- `yarn lint:architecture` - 0 errors
- `yarn build:shared` - 8 packages built

### Task 6.2: Create example API hooks ✅ COMPLETE
**Files created:**
- `packages/shared-data-layer/src/api/exampleApi.ts` - Typed API functions using JSONPlaceholder
- `packages/shared-data-layer/src/api/index.ts` - API barrel exports
- `packages/shared-data-layer/src/hooks/useExampleQuery.ts` - Query hooks with key factories
- `packages/shared-data-layer/src/hooks/useExampleMutation.ts` - Mutation hooks with optimistic updates
- `packages/shared-data-layer/src/hooks/index.ts` - Hooks barrel exports

**Files modified:**
- `packages/shared-data-layer/src/index.ts` - Added API and hooks exports
- `eslint-rules/no-dom-in-shared.js` - Added exception for shared-data-layer (fetch is universal)

**API functions provided:**
- Posts: `fetchPosts`, `fetchPost`, `fetchPostsByUser`, `createPost`, `updatePost`, `deletePost`
- Users: `fetchUsers`, `fetchUser`
- Comments: `fetchComments`
- Types: `Post`, `User`, `Comment`, `CreatePostParams`, `UpdatePostParams`, `ApiError`

**Query hooks provided:**
- `usePosts()`, `usePost(id)`, `usePostsByUser(userId)` - Posts queries
- `useUsers()`, `useUser(id)` - Users queries
- `useComments(postId)` - Comments query
- `usePostWithDetails(postId)` - Parallel fetch: post + author + comments
- Query key factories: `postKeys`, `userKeys`, `commentKeys`

**Mutation hooks provided (with optimistic updates):**
- `useCreatePost()` - Create post with cache invalidation
- `useUpdatePost()` - Update with optimistic update + rollback
- `useDeletePost()` - Delete with optimistic removal + rollback
- `useBulkDeletePosts()` - Bulk delete multiple posts

**Verified:**
- `yarn workspace @universal/shared-data-layer build` - Success
- `yarn typecheck` - 19 tasks pass
- `yarn lint:architecture` - 0 errors

### Task 6.3: Integrate QueryProvider into hosts ✅ COMPLETE
**Files modified:**
- `packages/web-shell/package.json` - Added `@universal/shared-data-layer` dependency
- `packages/web-shell/src/App.tsx` - Added `QueryProvider` import, wrapped app with provider
- `packages/mobile-host/package.json` - Added `@universal/shared-data-layer` dependency
- `packages/mobile-host/src/App.tsx` - Added `QueryProvider` import, wrapped app with provider

**Provider order (outermost to innermost):**
1. QueryProvider - Data fetching (React Query)
2. EventBusProvider - Event bus for inter-MFE communication
3. I18nProvider - Internationalization
4. ThemeProvider - Theming

**Verified:**
- `yarn typecheck` - 20 tasks pass
- `yarn lint:architecture` - 0 errors
- `yarn build:shared` - 8 packages built

### Task 6.4: Update build configuration ✅ COMPLETE
**Status:** No changes required

**Analysis:**
Turborepo automatically discovers workspace packages via Yarn workspaces configuration.
The generic task definitions in `turbo.json` apply to all packages, including `@universal/shared-data-layer`.

**Verified:**
- `yarn turbo run build --dry-run` - shared-data-layer appears in pipeline
- `yarn build` - 10 tasks successful
- `yarn typecheck` - 20 tasks pass (FULL TURBO)
- Build order correct: shared-data-layer builds after its dependencies

---

## Phase 6 Complete ✅

All React Query / Data Fetching tasks completed:
- Task 6.1: Created shared-data-layer package with QueryClient and QueryProvider
- Task 6.2: Created example API hooks (queries and mutations with optimistic updates)
- Task 6.3: Integrated QueryProvider into host applications
- Task 6.4: Verified build configuration (no changes needed)

---

## Phase 7: Routing with React Router 7

**Routing ownership rules (CRITICAL):**
- **Hosts own all routes** - Route definitions live exclusively in host applications
- **MFEs emit navigation intents** - Remotes use event bus to request navigation (e.g., `NAVIGATE_TO` event)
- **MFEs never import routers** - No `useNavigate`, `useLocation`, or router imports in remote packages
- **MFEs never reference URLs** - Remotes are URL-agnostic; hosts map events to routes

### Task 7.1: Create shared-router package ✅ COMPLETE
**Files created:**
- `packages/shared-router/package.json`
- `packages/shared-router/tsconfig.json`
- `packages/shared-router/src/types.ts` - Navigation intent types, route params, guards
- `packages/shared-router/src/routes.ts` - Route ID constants and metadata registry
- `packages/shared-router/src/index.ts` - Exports

**Dependencies:**
- `react-router` (exact version: 6.30.3)

**Route ID Constants (NOT URLs):**
- `Routes.HOME`, `Routes.SETTINGS`, `Routes.PROFILE`, `Routes.REMOTE_HELLO`, `Routes.REMOTE_DETAIL`
- MFEs use these to emit navigation intents via event bus
- Hosts map these to actual URLs

**Navigation Intent Types:**
- `NavigationIntent<R>` - Type-safe navigation requests with params
- `BackNavigationIntent` - Go back with optional fallback
- `NavigationResult` - Result from navigation
- `NavigationGuard` - Route guards for auth/access control

**Route Metadata:**
- `RouteMetadata` - Label keys, icons, auth requirements
- `getNavigationRoutes()` - Routes for nav menus
- `isProtectedRoute()` - Auth checks

**Verified:**
- `yarn workspace @universal/shared-router build` - Success
- `yarn typecheck` - 21 tasks pass
- `yarn lint:architecture` - 0 errors

### Task 7.2: Implement web routing ✅ COMPLETE
**Files created:**
- `packages/web-shell/src/pages/Home.tsx` - Welcome page with navigation links
- `packages/web-shell/src/pages/Remote.tsx` - Remote MFE loading page
- `packages/web-shell/src/pages/Settings.tsx` - Theme and language settings

**Files modified:**
- `packages/web-shell/package.json` - added `react-router-dom@6.30.0`
- `packages/web-shell/src/App.tsx` - added BrowserRouter, Header, and routes
- `packages/web-shell/rspack.config.mjs` - added `historyApiFallback: true` for SPA routing, added react-router aliases
- `packages/shared-router/package.json` - updated to `react-router@6.30.0`

**Routes implemented:**
- `/` and `/home` - Home page
- `/remote-hello` - Remote module page
- `/settings` - Settings page

**Note on react-router version:**
React Router v7.11.0 has a known incompatibility with Module Federation (`@module-federation/enhanced@0.21.6`).
The error "resolving fallback for shared module react-dom" occurs due to v7's internal ESM structure
(`dist/development/dom-export.mjs`). Downgraded to v6.30.0 which works correctly with Module Federation.
See: https://github.com/module-federation/core/issues/3267

**Verified:**
- `yarn typecheck` - 22 tasks pass
- `yarn turbo run build --filter='@universal/web-*'` - 11 tasks pass
- Manual verification: Navigation works between all pages

### Task 7.3: Implement mobile routing ✅ COMPLETE
**Files created:**
- `packages/mobile-host/src/pages/Home.tsx` - Welcome page with navigation links
- `packages/mobile-host/src/pages/Remote.tsx` - Remote MFE loading page
- `packages/mobile-host/src/pages/Settings.tsx` - Theme and language settings

**Files modified:**
- `packages/mobile-host/package.json` - added `react-router-native@6.30.0` and `@universal/shared-router`
- `packages/mobile-host/src/App.tsx` - added NativeRouter, Header, and routes

**Routes implemented:**
- `/` and `/home` - Home page
- `/remote-hello` - Remote module page
- `/settings` - Settings page

**Note on react-router-native version:**
Using v6.30.0 to match web routing (v7 has Module Federation incompatibility).

**Verified:**
- `yarn typecheck` - 22 tasks pass
- `yarn lint:architecture` - 0 errors
- iOS: Host app works with routing (verified manually)

### Task 7.4: Update build configuration ✅ COMPLETE
**Status:** No changes required - Turborepo automatically includes shared-router in the build pipeline via `^build` dependency resolution from package.json dependencies.

**Verified:**
- `yarn turbo run build --filter=@universal/web-shell --dry-run` shows shared-router in dependency chain
- `yarn turbo run build --filter=@universal/mobile-host --dry-run` shows shared-router in dependency chain
- All builds pass with shared-router included

---

## Phase 8: React Native Component Unit Testing

### Task 8.1: Add testing dependencies ✅ COMPLETE
**Files modified:**
- `package.json` (root) - added:
  - `@testing-library/react-native` (12.9.0)
  - `react-test-renderer` (19.1.0)
- `packages/shared-utils/package.json` - added `test` script

**Files created:**
- `jest.setup.js` (root) - React Native mocks including:
  - Mock for `react-native` module (NativeModules, AccessibilityInfo, Animated)
  - Mock for NativeEventEmitter
  - Mock for RCTDeviceEventEmitter
  - Global mocks for `requestAnimationFrame`/`cancelAnimationFrame`
  - Console filtering for known React Native warnings

**Verified:**
- `yarn install` - Success
- `yarn test` - 6 tests pass (shared-utils)
- `yarn typecheck` - All packages pass

### Task 8.2: Configure Jest for shared-hello-ui ✅ COMPLETE
**Files created:**
- `packages/shared-hello-ui/jest.config.js` - Jest configuration with:
  - JSDOM test environment
  - Custom react-native mock mapping
  - Workspace dependency mapping (@universal/shared-*)
  - Coverage thresholds (50%)
- `packages/shared-hello-ui/src/__mocks__/react-native.ts` - Comprehensive RN mock:
  - View, Text, Pressable, Image, TextInput, ScrollView, etc.
  - StyleSheet, Platform, Dimensions, Animated, etc.
  - Proper accessibility attribute passthrough
- `packages/shared-hello-ui/src/__tests__/HelloUniversal.test.tsx` - 16 unit tests:
  - Rendering (4 tests)
  - Button interaction (2 tests)
  - Accessibility (4 tests)
  - i18n integration (3 tests)
  - Theme integration (3 tests)

**Files modified:**
- `packages/shared-hello-ui/package.json` - added `test` script
- `packages/shared-hello-ui/tsconfig.json` - exclude `__tests__` and `__mocks__` from build
- `package.json` (root) - added testing dependencies:
  - `@testing-library/dom` (10.4.0)
  - `@testing-library/react` (16.1.0)
  - `react` (19.1.0) and `react-dom` (19.1.0) for root devDependencies
  - `jest-environment-jsdom` (29.7.0)
- `jest.setup.js` (root) - added `@testing-library/jest-dom` import and `accessible` prop warning filter

**Verified:**
- `yarn turbo run build --filter=@universal/shared-hello-ui` - Success
- `yarn workspace @universal/shared-hello-ui test` - 16/16 tests pass
- `yarn workspace @universal/shared-utils test` - 6/6 tests pass (regression check)

### Task 8.3: Configure Jest for shared-theme-context ✅ COMPLETE
**Files created:**
- `packages/shared-theme-context/jest.config.js` - Jest configuration with:
  - JSDOM test environment
  - Workspace dependency mapping (@universal/shared-design-tokens)
  - ts-jest transformer
- `packages/shared-theme-context/src/__tests__/ThemeProvider.test.tsx` - 24 unit tests:
  - ThemeProvider initialization (3 tests)
  - toggleTheme (3 tests)
  - setTheme (2 tests)
  - onThemeChange callback (3 tests)
  - Theme object (3 tests)
  - useTheme hook (3 tests)
  - useThemeTokens (2 tests)
  - useThemeColors (3 tests)
  - useThemeSpacing (2 tests)

**Files modified:**
- `packages/shared-theme-context/package.json` - added `test` script
- `packages/shared-theme-context/tsconfig.json` - exclude `src/__tests__` from build

**Verified:**
- `yarn workspace @universal/shared-theme-context test` - 24/24 tests pass
- `yarn workspace @universal/shared-theme-context typecheck` - passes
- `yarn workspace @universal/shared-theme-context build` - passes
- `yarn test` - 46/46 tests pass (shared-utils: 6, shared-hello-ui: 16, shared-theme-context: 24)

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
| react-router | 6.30.3 |
| react-router-dom | 6.30.3 |
| react-router-native | 6.30.3 |
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
