# Enterprise Enhancements

This document provides an overview of the enterprise-ready features implemented in the Universal MFE Platform.

## Overview

The Universal MFE Platform is a production-ready seed project that enables a single React Native codebase to run on Web, iOS, and Android with dynamic runtime module loading via Module Federation v2.

### Key Innovation

**React Native primitives as the universal UI API** - Components are written once using React Native primitives (`View`, `Text`, `Pressable`) and rendered via React Native Web on web and natively on mobile.

## Features Summary

| Feature | Package | Description |
|---------|---------|-------------|
| Build Orchestration | Turborepo | Intelligent caching, task orchestration |
| Design Tokens | `@universal/shared-design-tokens` | Two-tier token system (primitive/semantic) |
| Theming | `@universal/shared-theme-context` | Light/dark mode with persistence |
| Accessibility | `@universal/shared-a11y` | WCAG 2.1 AA compliant components |
| Internationalization | `@universal/shared-i18n` | Zero-dependency i18n with namespace isolation |
| Event Bus | `@universal/shared-event-bus` | Type-safe inter-MFE communication |
| Data Fetching | `@universal/shared-data-layer` | React Query with shared/isolated clients |
| Routing | `@universal/shared-router` | Host-owned routing abstraction |
| State Management | `@universal/shared-auth-store` | Zustand stores with persistence |
| Unit Testing | Jest + Testing Library | React Native component testing |
| Integration Testing | Jest | Provider composition, routing |
| E2E Testing | Playwright + Maestro | Web and mobile automation |

## Architecture Principles

### 1. Universal UI First

Write UI components using React Native primitives only:

```typescript
// Correct - works on all platforms
import { View, Text, Pressable } from 'react-native';

export function Button({ label, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <Text>{label}</Text>
    </Pressable>
  );
}
```

### 2. Host-Owned Routing

- Hosts define all routes and URL mappings
- Remote MFEs are URL-agnostic
- Navigation requests via event bus

### 3. Loose Coupling via Event Bus

- MFEs communicate through typed events
- No direct imports between MFE packages
- Independent deployment capability

### 4. State Ownership Model

| State Type | Owner | Sharing |
|------------|-------|---------|
| Auth/User | Host | Via shared store |
| Theme/Locale | Host | Via event bus broadcast |
| Local UI | Each MFE | Not shared |
| Server State | React Query | Shared or isolated client |

## Package Architecture

```
packages/
├── Shared Libraries (Platform-Agnostic)
│   ├── shared-utils/           # Pure TypeScript utilities
│   ├── shared-design-tokens/   # Design system tokens
│   ├── shared-theme-context/   # Theme provider and hooks
│   ├── shared-a11y/            # Accessibility utilities
│   ├── shared-i18n/            # Internationalization
│   ├── shared-event-bus/       # Inter-MFE communication
│   ├── shared-data-layer/      # React Query setup
│   ├── shared-router/          # Routing abstraction
│   ├── shared-hello-ui/        # Universal UI components
│   └── shared-auth-store/      # Authentication state
│
├── Host Applications
│   ├── web-shell/              # Web host (Rspack + MF v2)
│   └── mobile-host/            # Mobile host (Re.Pack + MF v2)
│
└── Remote MFEs
    ├── web-remote-hello/       # Web remote module
    └── mobile-remote-hello/    # Mobile remote module
```

## Feature Details

### Turborepo Integration

Build orchestration with intelligent caching:

```bash
# Build all packages (with dependency ordering)
yarn build

# Build only shared packages
yarn build:shared

# Type check all packages
yarn typecheck

# Run tests
yarn test
```

**Cached Tasks**: `build`, `typecheck`, `lint`, `format:check`, `test`

**Non-Cached Tasks**: `format`, `dev`, `clean`

### Design Tokens & Theming

Two-tier token system:

1. **Primitive Tokens**: Raw values (colors, spacing, typography)
2. **Semantic Tokens**: Contextual meanings (surface, text, interactive)

```typescript
// Use semantic tokens in components
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface.background,
    padding: theme.spacing.layout.screenPadding,
  },
  text: {
    color: theme.colors.text.primary,
  },
});
```

**Features**:
- Light/dark mode with toggle
- Persistence via localStorage/AsyncStorage
- Cross-tab synchronization (web)
- Event bus sync for MFEs

### Accessibility

WCAG 2.1 AA compliant utilities:

**Hooks**:
- `useAccessibilityInfo()` - Screen reader detection
- `useFocusManagement()` - Programmatic focus control
- `useAnnounce()` - Screen reader announcements

**Components**:
- `AccessibleText` - Semantic text with ARIA roles
- `AccessibleButton` - 44x44px touch target minimum
- `AccessibleInput` - Labels, hints, error announcements
- `SkipLink` - Skip to main content
- `VisuallyHidden` - Screen reader only content

**Constants**:
- `A11yRoles` - ARIA role mappings
- `A11yLabels` - Common label patterns
- `A11Y_MIN_TOUCH_TARGET` - 44px minimum

### Internationalization

Zero-dependency i18n with namespace isolation:

```typescript
// In components
const { t } = useTranslation('hello');
return <Text>{t('greeting', { params: { name } })}</Text>;

// Pluralization
t('items', { count: 5 }) // "5 items"
```

**Features**:
- Namespace isolation per MFE
- Interpolation with `{{variable}}` syntax
- CLDR pluralization rules
- RTL language support
- Formatting utilities (dates, numbers, currency)
- Locale persistence and detection

### Event Bus

Type-safe pub/sub for inter-MFE communication:

```typescript
// Emit events
bus.emit(ThemeEventTypes.THEME_CHANGED, {
  theme: 'dark',
  previousTheme: 'light',
});

// Listen for events (auto-cleanup on unmount)
useEventListener(ThemeEventTypes.THEME_CHANGED, (event) => {
  setLocalTheme(event.payload.theme);
});
```

**Event Categories**:
- Navigation: `NAVIGATE_TO`, `NAVIGATE_BACK`
- Theme: `THEME_CHANGED`, `THEME_CHANGE_REQUEST`
- Locale: `LOCALE_CHANGED`, `LOCALE_CHANGE_REQUEST`
- Auth: `USER_LOGGED_IN`, `USER_LOGGED_OUT`, `SESSION_EXPIRED`
- Remote: `REMOTE_LOADED`, `REMOTE_LOAD_FAILED`
- Interaction: `BUTTON_PRESSED`, `FORM_SUBMITTED`

### Data Fetching

React Query v5 with Module Federation support:

```typescript
// Shared client (default) - cache shared across MFEs
<QueryProvider>
  <App />
</QueryProvider>

// Isolated client - independent cache
<QueryProvider useSharedClient={false}>
  <MfeApp />
</QueryProvider>
```

**Features**:
- Query key factories for consistent invalidation
- Optimistic updates with rollback
- Parallel and dependent queries
- Mobile-optimized defaults (no refetch on focus)

### Routing

Host-owned routing with React Router 7:

```typescript
// Host defines routes
<Routes>
  <Route path={`/${Routes.HOME}`} element={<Home />} />
  <Route path={`/${Routes.SETTINGS}`} element={<Settings />} />
  <Route path={`/${Routes.REMOTE_HELLO}`} element={<Remote />} />
</Routes>

// Remotes use event bus for navigation
bus.emit(NavigationEventTypes.NAVIGATE_TO, { path: '/settings' });
```

**Key Rules**:
- Hosts own all route definitions
- MFEs never import router libraries
- MFEs never reference URLs directly
- Navigation via event bus

### Testing

Comprehensive testing pyramid:

| Level | Tool | Location |
|-------|------|----------|
| Unit | Jest + Testing Library | `packages/*/src/**/*.test.tsx` |
| Integration | Jest | `packages/*/src/__integration__/` |
| E2E Web | Playwright | `packages/web-shell/e2e/` |
| E2E Mobile | Maestro | `packages/mobile-host/.maestro/` |

**Commands**:
```bash
yarn test              # Unit tests
yarn test:integration  # Integration tests
yarn test:e2e          # E2E tests (web)
```

## Architecture Enforcement

ESLint rules automatically enforce architectural boundaries:

| Rule | Purpose |
|------|---------|
| `architecture/no-cross-mfe-imports` | Prevents direct MFE-to-MFE imports |
| `architecture/no-dom-in-shared` | Prevents DOM elements in shared packages |

Run `yarn lint:architecture` to check for violations.

## Quick Start

### Prerequisites

- Node.js 24.11.0 (see `.nvmrc`)
- Yarn Classic 1.22.22

### Installation

```bash
# Install dependencies
yarn install

# Build shared packages
yarn build:shared
```

### Development

**Web:**
```bash
# Terminal 1: Remote
cd packages/web-remote-hello && yarn dev

# Terminal 2: Shell
cd packages/web-shell && yarn dev

# Open http://localhost:9001
```

**Mobile (Android):**
```bash
# Terminal 1: Remote
cd packages/mobile-remote-hello
PLATFORM=android yarn build:remote && PLATFORM=android yarn serve

# Terminal 2: Host
cd packages/mobile-host && yarn android
```

**Mobile (iOS):**
```bash
# Terminal 1: Remote
cd packages/mobile-remote-hello
PLATFORM=ios yarn build:remote && PLATFORM=ios yarn serve

# Terminal 2: Host
cd packages/mobile-host && yarn ios
```

## Documentation

| Document | Description |
|----------|-------------|
| [PATTERNS-STATE-MANAGEMENT.md](./PATTERNS-STATE-MANAGEMENT.md) | Zustand stores, storage abstraction |
| [PATTERNS-DATA-FETCHING.md](./PATTERNS-DATA-FETCHING.md) | React Query patterns |
| [PATTERNS-ROUTING.md](./PATTERNS-ROUTING.md) | Host-owned routing model |
| [PATTERNS-THEMING.md](./PATTERNS-THEMING.md) | Design tokens, themes |
| [PATTERNS-ACCESSIBILITY.md](./PATTERNS-ACCESSIBILITY.md) | A11y utilities |
| [PATTERNS-I18N.md](./PATTERNS-I18N.md) | Internationalization |
| [PATTERNS-EVENT-BUS.md](./PATTERNS-EVENT-BUS.md) | Inter-MFE communication |
| [PATTERNS-TESTING.md](./PATTERNS-TESTING.md) | Testing patterns |
| [ANTI-PATTERNS.md](./ANTI-PATTERNS.md) | Common mistakes to avoid |

## Technology Versions

All versions are exact (no `^` or `~`) to ensure reproducibility.

| Package | Version |
|---------|---------|
| React (Mobile) | 19.1.0 |
| React (Web) | 19.2.0 |
| React Native | 0.80.0 |
| TypeScript | 5.9.3 |
| Turborepo | 2.7.3 |
| @tanstack/react-query | 5.90.16 |
| react-router | 6.30.3 |
| @callstack/repack | 5.2.0 |
| @module-federation/enhanced | 0.21.6 |
| @rspack/core | 1.6.5 |
| @playwright/test | 1.49.1 |

## Port Assignments

| Service | Port |
|---------|------|
| Web Shell | 9001 |
| Web Remote | 9003 |
| Mobile Host (Android) | 8081 |
| Mobile Host (iOS) | 8082 |
| Mobile Remote (Android) | 9004 |
| Mobile Remote (iOS) | 9005 |

## CI/CD

GitHub Actions workflows:

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `ci.yml` | Push/PR | Typecheck, lint, test, build |
| `e2e-web.yml` | Push to main/develop | Playwright tests |
| `e2e-mobile.yml` | Manual/Tags | Maestro tests |
| `deploy-web.yml` | Push to main | Vercel deployment |
| `deploy-android.yml` | Tags (v*) | Android APK release |
| `deploy-ios.yml` | Tags (v*) | iOS Simulator release |
| `codeql.yml` | Push/PR/Weekly | Security scanning |

## Contributing

1. Follow the patterns documented in `docs/PATTERNS-*.md`
2. Avoid anti-patterns listed in `docs/ANTI-PATTERNS.md`
3. Run `yarn lint:architecture` before committing
4. Ensure all tests pass: `yarn test && yarn typecheck`
5. Use exact versions for new dependencies
