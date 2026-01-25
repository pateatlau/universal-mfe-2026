# India-First Localization Implementation Plan

**Status:** ✅ Complete (All Phases Done)
**Created:** 2026-01-24
**Target:** Make the project India-first with Hindi as the second language (replacing Spanish)
**Branch:** `feature/india-first-localization` (to be created from `develop`)

---

## Overview

This document outlines the implementation plan to:
1. Change the default locale from English (US) to English (India) with `en-IN` formatting
2. Replace Spanish (`es`) with Hindi (`hi`) as the second supported language
3. Update all locale references, tests, and documentation

---

## Scope of Changes

| Category | Files to Modify | Files to Create | Files to Delete |
|----------|-----------------|-----------------|-----------------|
| Core i18n | 7 | 1 | 1 |
| Application Entry Points | 6 | 0 | 0 |
| Unit/Integration Tests | 6 | 0 | 0 |
| E2E Tests (Playwright) | 4 | 0 | 0 |
| E2E Tests (Maestro) | 2 | 0 | 0 |
| Documentation | 4 | 0 | 0 |
| **Total** | **29** | **1** | **1** |

---

## Decision: Default Locale Strategy

### Selected: Option B - English (India) First

- Default locale: `en` with `en-IN` formatting (English - India)
- Available locales: `['en', 'hi']` (English default, Hindi as second option)
- All English locale settings use `en-IN` instead of `en-US`
- Hindi is available as the second language option
- Indian formatting (currency INR, date formats, number grouping) applies to both locales

---

## Phase 1: Core i18n Package Updates

### Task 1.1: Update Type Definitions
**File:** `packages/shared-i18n/src/types.ts`

**Changes:**
- Replace `'es'` with `'hi'` in `LocaleCode` type
- Update `SUPPORTED_LOCALES` to replace Spanish with Hindi
- Keep `DEFAULT_LOCALE` as `'en'` (English - India)
- Add `'en-IN'` locale variant support

**Before:**
```typescript
export type LocaleCode = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'pt' | 'it' | 'ar';
export const DEFAULT_LOCALE: LocaleCode = 'en';
export const SUPPORTED_LOCALES = {
  en: 'English',
  es: 'Español',
  // ...
};
```

**After:**
```typescript
export type LocaleCode = 'en' | 'hi' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'pt' | 'it' | 'ar';
export const DEFAULT_LOCALE: LocaleCode = 'en';  // English (India) - uses en-IN for formatting
export const SUPPORTED_LOCALES = {
  en: 'English',
  hi: 'हिन्दी',
  // ...
};
```

---

### Task 1.2: Create Hindi Translation File
**File:** `packages/shared-i18n/src/locales/hi.ts` (NEW)

**Action:** Create new file with complete Hindi translations mirroring the structure of `en.ts`.

**Key translation categories:**
- `common.*` - Common UI strings (loading, error, welcome, etc.)
- `navigation.*` - Navigation labels (home, settings, profile)
- `errors.*` - Error messages with interpolation
- `accessibility.*` - Screen reader announcements
- `theme.*` - Theme labels (light, dark, toggle)
- `language.*` - Language selector labels
- `hello.*` - HelloRemote MFE namespace
- `datetime.*` - Date/time labels with pluralization
- `settings.*` - Settings page labels

**Hindi Translations to include:**
```typescript
export const hi: Translations = {
  common: {
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    retry: 'पुनः प्रयास करें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    close: 'बंद करें',
    back: 'वापस',
    next: 'अगला',
    previous: 'पिछला',
    submit: 'जमा करें',
    welcome: 'स्वागत है',
    appName: 'यूनिवर्सल MFE',
    subtitle: 'वेब और मोबाइल के लिए माइक्रोफ्रंटेंड',
    // ... (complete translations)
  },
  navigation: {
    home: 'होम',
    settings: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल',
    menu: 'मेनू',
    remoteModule: 'रिमोट मॉड्यूल',
  },
  theme: {
    light: 'लाइट',
    dark: 'डार्क',
    system: 'सिस्टम',
    toggle: 'थीम बदलें',
    current: 'वर्तमान थीम: {{theme}}',
  },
  language: {
    select: 'भाषा चुनें',
    current: 'वर्तमान: {{language}}',
    hindi: 'हिन्दी',
    english: 'अंग्रेज़ी',
  },
  hello: {
    greeting: 'नमस्ते!',
    greetingWithName: 'नमस्ते, {{name}}!',
    buttonLabel: 'क्लिक करें',
    buttonHint: 'इस बटन को दबाएं',
    pressCount_zero: 'कोई क्लिक नहीं',
    pressCount_one: '{{count}} बार क्लिक किया',
    pressCount_other: '{{count}} बार क्लिक किया',
  },
  settings: {
    title: 'सेटिंग्स',
    theme: 'थीम',
    language: 'भाषा',
    notifications: 'सूचनाएं',
    privacy: 'गोपनीयता',
    about: 'के बारे में',
  },
  // ... (complete structure matching en.ts)
};
```

**Note:** Hindi uses Devanagari script. Ensure proper UTF-8 encoding.

---

### Task 1.3: Update Locale Registry
**File:** `packages/shared-i18n/src/locales/index.ts`

**Changes:**
- Import `hi` instead of `es`
- Update `availableLocales` array from `['en', 'es']` to `['en', 'hi']`
- Keep `defaultLocale` as `'en'` (English - India with `en-IN` formatting)
- Update `localeDisplayNames` to include Hindi instead of Spanish
- Update `locales` object to include `hi` instead of `es`

**Before:**
```typescript
import { en } from './en';
import { es } from './es';

export const locales = { en, es };
export const availableLocales: LocaleCode[] = ['en', 'es'];
export const defaultLocale: LocaleCode = 'en';
export const localeDisplayNames = {
  en: 'English',
  es: 'Español',
};
```

**After:**
```typescript
import { en } from './en';
import { hi } from './hi';

export const locales = { en, hi };
export const availableLocales: LocaleCode[] = ['en', 'hi'];
export const defaultLocale: LocaleCode = 'en';  // English (India)
export const localeDisplayNames = {
  en: 'English',
  hi: 'हिन्दी',
};
```

---

### Task 1.4: Delete Spanish Translation File
**File:** `packages/shared-i18n/src/locales/es.ts`

**Action:** Delete this file (no longer needed).

---

### Task 1.5: Update English Translation File
**File:** `packages/shared-i18n/src/locales/en.ts`

**Changes:**
- Replace `language.spanish: 'Spanish'` with `language.hindi: 'Hindi'`
- Update any references to Spanish language selection

**Before:**
```typescript
language: {
  spanish: 'Spanish',
  english: 'English',
}
```

**After:**
```typescript
language: {
  hindi: 'Hindi',
  english: 'English',
}
```

---

### Task 1.6: Update Formatter Defaults
**File:** `packages/shared-i18n/src/formatters.ts`

**Changes:**
- Update default locale parameter from `'en'` to `'en-IN'` for Indian formatting
- Update default currency from `'USD'` to `'INR'`
- Add INR (Indian Rupee) examples in comments

**Example:**
```typescript
// Before
export function formatCurrency(value: number, currency = 'USD', locale = 'en'): string

// After
export function formatCurrency(value: number, currency = 'INR', locale = 'en-IN'): string
```

**Note:** The Intl API handles Indian numbering system (lakhs/crores) automatically when `locale='en-IN'` or `locale='hi-IN'` is used.

---

### Task 1.7: Update Locale Detection Utilities
**Files:**
- `packages/shared-i18n/src/utils/detectLocale.ts`
- `packages/shared-i18n/src/utils/persistLocale.ts`
- `packages/shared-i18n/src/useLocale.ts`

**Changes:**
- Keep `DEFAULT_LOCALE` fallback as `'en'` (English - India)
- Update formatting locale to use `'en-IN'` for Indian number/date/currency formatting
- Ensure `getBestMatchingLocale` returns `'en'` when no match found

---

### Task 1.8: Update i18n Package Index
**File:** `packages/shared-i18n/src/index.ts`

**Changes:**
- Update exports to include `hi` instead of `es`

---

## Phase 2: Application Entry Point Updates

### Task 2.1: Update Web Shell
**File:** `packages/web-shell/src/App.tsx`

**Changes:**
- Keep `initialLocale="en"` (English - India) in I18nProvider
- Update language toggle to switch between English and Hindi (instead of Spanish)
- Ensure formatting uses `en-IN` locale

---

### Task 2.2: Update Mobile Host
**File:** `packages/mobile-host/src/App.tsx`

**Changes:**
- Keep `initialLocale="en"` (English - India) in I18nProvider
- Update language toggle to switch between English and Hindi (instead of Spanish)
- Ensure formatting uses `en-IN` locale

---

### Task 2.3: Update Web Remote Standalone
**File:** `packages/web-remote-hello/src/standalone.tsx`

**Changes:**
- Keep `initialLocale="en"` (English - India) in I18nProvider
- Update language toggle for Hindi instead of Spanish

---

### Task 2.4: Update Mobile Remote Standalone
**File:** `packages/mobile-remote-hello/src/App.tsx`

**Changes:**
- Keep `initialLocale="en"` (English - India) in I18nProvider
- Update language toggle for Hindi instead of Spanish

---

### Task 2.5: Update Web Remote HelloRemote
**File:** `packages/web-remote-hello/src/HelloRemote.tsx`

**Changes:**
- Keep `locale: initialLocale = 'en'` (English - India)

---

### Task 2.6: Update Mobile Remote HelloRemote
**File:** `packages/mobile-remote-hello/src/HelloRemote.tsx`

**Changes:**
- Keep `locale: initialLocale = 'en'` (English - India)

---

## Phase 3: Unit and Integration Test Updates

### Task 3.1: Update shared-hello-ui Tests
**File:** `packages/shared-hello-ui/src/__tests__/HelloUniversal.test.tsx`

**Changes:**
- Replace `locale: 'es'` with `locale: 'hi'` in test cases
- Update Spanish text assertions to Hindi text assertions

---

### Task 3.2: Update web-shell Integration Tests
**Files:**
- `packages/web-shell/src/__integration__/routing.test.tsx`
- `packages/web-shell/src/__integration__/providers.test.tsx`
- `packages/web-shell/src/__integration__/theme-persistence.test.tsx`

**Changes:**
- Replace all `'es'` locale references with `'hi'`
- Update Spanish button/text assertions to Hindi

---

### Task 3.3: Update mobile-host Integration Tests
**Files:**
- `packages/mobile-host/src/__integration__/providers.test.tsx`
- `packages/mobile-host/src/__integration__/navigation.test.tsx`

**Changes:**
- Replace all `'es'` locale references with `'hi'`
- Update Spanish button/text assertions to Hindi

---

## Phase 4: E2E Test Updates

### Task 4.1: Update Playwright Tests (Web)
**Files:**
- `packages/web-shell/e2e/smoke.spec.ts`
- `packages/web-shell/e2e/routing.spec.ts`
- `packages/web-shell/e2e/theming.spec.ts`
- `packages/web-shell/e2e/remote-loading.spec.ts`

**Changes:**
- Update comments referencing Spanish translations
- Update locale switching tests from `'es'` to `'hi'`
- Update text assertions from Spanish to Hindi

---

### Task 4.2: Update Maestro Tests (Mobile)
**Files:**
- `packages/mobile-host/.maestro/i18n.yaml`
- `packages/mobile-host/.maestro/remote-loading.yaml`

**Changes:**
- Replace all Spanish text assertions with Hindi:
  - `"Bienvenido"` → `"स्वागत है"`
  - `"Inicio"` → `"होम"`
  - `"Configuración"` → `"सेटिंग्स"`
  - `"Tema"` → `"थीम"`
  - `"Español"` → `"हिन्दी"`
- Update language selection assertions

---

## Phase 5: Documentation Updates

### Task 5.1: Update i18n Pattern Documentation
**File:** `docs/PATTERNS-I18N.md`

**Changes:**
- Replace all `'es'` examples with `'hi'`
- Update Spanish references to Hindi
- Update code examples to show Hindi translations

---

### Task 5.2: Update Enhancement Plan Documentation
**File:** `docs/enhancements-implementation-plan.md`

**Changes:**
- Update references from `es.ts` to `hi.ts`
- Update Spanish translation examples to Hindi

---

### Task 5.3: Update Testing Guide
**File:** `docs/universal-mfe-all-platforms-testing-guide.md`

**Changes:**
- Update EN/ES language switching references to EN/HI
- Update test verification steps for Hindi

---

### Task 5.4: Update Testing Patterns Documentation
**File:** `docs/PATTERNS-TESTING.md`

**Changes:**
- Update `locale: 'es'` examples to `locale: 'hi'`

---

## Phase 6: Verification and Cleanup

### Task 6.1: Run All Tests
**Commands:**
```bash
# Unit tests
yarn test

# Integration tests
yarn turbo run test:integration

# Typecheck
yarn typecheck

# Lint
yarn lint
```

### Task 6.2: Manual Verification
**Checklist:**
- [x] Web shell displays English by default (with `en-IN` formatting)
- [x] Language toggle switches between English and Hindi
- [x] All Hindi translations display correctly (no missing keys)
- [x] Mobile host displays English by default (with `en-IN` formatting)
- [x] Theme labels are translated correctly (Light/Dark ↔ लाइट/डार्क)
- [x] Navigation labels are translated correctly (Home/Settings ↔ होम/सेटिंग्स)
- [x] Remote module loads with Hindi translations when Hindi is selected
- [x] Currency/date formatting uses Indian formats (₹, lakhs/crores)

### Task 6.3: Build Verification
**Commands:**
```bash
# Build shared packages
yarn build:shared

# Build web packages
yarn build:web

# Build mobile (if testing on device)
yarn build:mobile:ios
yarn build:mobile:android
```

---

## Implementation Checklist

### Phase 1: Core i18n Package
- [x] Task 1.1: Update type definitions
- [x] Task 1.2: Create Hindi translation file (`hi.ts`)
- [x] Task 1.3: Update locale registry
- [x] Task 1.4: Delete Spanish translation file (`es.ts`)
- [x] Task 1.5: Update English translation file
- [x] Task 1.6: Update formatter defaults
- [x] Task 1.7: Update locale detection utilities
- [x] Task 1.8: Update i18n package index

### Phase 2: Application Entry Points
- [x] Task 2.1: Update web-shell App.tsx (no changes needed - uses shared-i18n)
- [x] Task 2.2: Update mobile-host App.tsx (no changes needed - uses shared-i18n)
- [x] Task 2.3: Update web-remote-hello standalone.tsx (no changes needed - uses shared-i18n)
- [x] Task 2.4: Update mobile-remote-hello App.tsx (no changes needed - uses shared-i18n)
- [x] Task 2.5: Update web-remote-hello HelloRemote.tsx (no changes needed - uses shared-i18n)
- [x] Task 2.6: Update mobile-remote-hello HelloRemote.tsx (no changes needed - uses shared-i18n)

### Phase 3: Unit/Integration Tests
- [x] Task 3.1: Update shared-hello-ui tests (already updated in Phase 1)
- [x] Task 3.2: Update web-shell integration tests (already updated in Phase 1)
- [x] Task 3.3: Update mobile-host integration tests (already updated in Phase 1)

### Phase 4: E2E Tests
- [x] Task 4.1: Update Playwright tests (smoke, theming, routing, remote-loading)
- [x] Task 4.2: Update Maestro tests (i18n, remote-loading, README)

### Phase 5: Documentation
- [x] Task 5.1: Update PATTERNS-I18N.md
- [x] Task 5.2: Update enhancements-implementation-plan.md
- [x] Task 5.3: Update testing guide
- [x] Task 5.4: Update PATTERNS-TESTING.md

### Phase 6: Verification
- [x] Task 6.1: Run all tests (88 unit/integration tests pass, Playwright E2E pass, Maestro iOS pass)
- [x] Task 6.2: Manual verification (CI passed; all verification checklist items complete)
- [x] Task 6.3: Build verification (all packages build successfully)

**Post-merge:** Deployed to Vercel after merging to main.

---

## Technical Notes

### Hindi Pluralization Rules
Hindi uses the following plural categories (via Intl.PluralRules):
- `one`: 0, 1
- `other`: 2, 3, 4, ... (everything else)

This differs from English (`one` = 1 only) and Spanish (similar to English).

### Indian Number Formatting
When using `locale='hi-IN'`, the Intl API formats numbers using the Indian numbering system:
- 1,00,000 (one lakh) instead of 100,000
- 1,00,00,000 (one crore) instead of 10,000,000

### Currency Formatting
- Default currency should be `INR` (Indian Rupee)
- Symbol: ₹
- Format: ₹1,00,000 (with Indian grouping)

### Font Considerations
- Hindi uses Devanagari script
- Ensure system fonts support Devanagari (iOS and Android have built-in support)
- Web may need `font-family` fallbacks for Devanagari

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing Hindi translations | High | Use English as fallback for any missing keys |
| Pluralization errors | Medium | Thoroughly test pluralized strings |
| Layout issues (longer Hindi text) | Medium | Test UI with Hindi text for overflow |
| Test failures during migration | Low | Update tests systematically per phase |
| Maestro test flakiness with Hindi text | Medium | Use data-testid attributes where possible |

---

## Rollback Plan

If issues are discovered after implementation:
1. Revert to the commit before the feature branch merge
2. Or, change `defaultLocale` back to `'en'` while keeping Hindi available

---

## Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | 8 tasks | 2-3 hours |
| Phase 2 | 6 tasks | 30 minutes |
| Phase 3 | 3 tasks | 1 hour |
| Phase 4 | 2 tasks | 1 hour |
| Phase 5 | 4 tasks | 1 hour |
| Phase 6 | 3 tasks | 1-2 hours |
| **Total** | **26 tasks** | **6-8 hours** |

---

## Success Criteria

- [x] Default locale is English - India (`en` with `en-IN` formatting)
- [x] Language toggle switches between English and Hindi
- [x] All UI elements display correct translations (English default, Hindi when selected)
- [x] All tests pass (unit, integration, E2E)
- [x] No console errors related to missing translation keys
- [x] Currency defaults to INR (₹) with Indian formatting (lakhs/crores)
- [x] Date/number formatting uses Indian conventions
- [x] Documentation reflects Hindi as second language (replacing Spanish)
