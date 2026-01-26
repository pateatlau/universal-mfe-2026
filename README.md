# Universal Microfrontend Platform

A production-ready microfrontend architecture enabling code sharing across Web, iOS, and Android using Module Federation V2.

## Live Demos

| Platform | URL |
|----------|-----|
| Web Shell | https://universal-mfe-2026-shell.vercel.app/ |
| Web Remote | https://universal-mfe-2026-remote.vercel.app/ |
| Android APK (Host) | [GitHub Releases](https://github.com/pateatlau/universal-mfe-2026/releases) - `mobile-host-debug.apk` |
| Android APK (Standalone) | [GitHub Releases](https://github.com/pateatlau/universal-mfe-2026/releases) - `mobile-remote-standalone-debug.apk` |
| iOS Simulator (Host) | [GitHub Releases](https://github.com/pateatlau/universal-mfe-2026/releases) - `mobile-host-simulator.zip` |
| iOS Simulator (Standalone) | [GitHub Releases](https://github.com/pateatlau/universal-mfe-2026/releases) - `mobile-remote-standalone-simulator.zip` |

## Platform Status

| Platform | Development | Production Release | Bundler | MF Version |
|----------|-------------|-------------------|---------|------------|
| Web | ✅ Working | ✅ Deployed (Vercel) | Rspack 1.6.5 | MF V2 |
| Android | ✅ Working | ✅ Working (Firebase Hosting) | Re.Pack 5.2.0 | MF V2 |
| iOS | ✅ Working | ✅ Working (Simulator, Firebase Hosting) | Re.Pack 5.2.0 | MF V2 |

**Mobile Release Build Status**: Production release builds fully functional for both Android and iOS with remote module loading from Firebase Hosting. See [Mobile Release Build Fixes](docs/MOBILE-RELEASE-BUILD-FIXES.md) for technical details.

**Platform Parity Achieved**: iOS simulator release builds now match Android release build capabilities (standalone operation, production bundles, Module Federation v2).

## Architecture

```
packages/
├── Host Applications
│   ├── web-shell/              # Web host (port 9001)
│   └── mobile-host/            # Mobile host (Android: 8081, iOS: 8082)
│
├── Remote MFEs
│   ├── web-remote-hello/       # Web remote (port 9003)
│   └── mobile-remote-hello/    # Mobile remote (MF: 9004/9005, Standalone: 8083/8084)
│
└── Shared Libraries
    ├── shared-utils/           # TypeScript utilities
    ├── shared-hello-ui/        # Universal React Native components
    ├── shared-auth-store/      # Zustand state management
    ├── shared-design-tokens/   # Two-tier design token system
    ├── shared-theme-context/   # Theme provider with persistence
    ├── shared-a11y/            # WCAG 2.1 AA accessibility
    ├── shared-i18n/            # Zero-dependency i18n
    ├── shared-event-bus/       # Inter-MFE communication
    ├── shared-data-layer/      # React Query v5 setup
    └── shared-router/          # Host-owned routing
```

**Key Innovation:** React Native primitives as the universal UI API - rendered via React Native Web on web and natively on mobile.

## Quick Start

### Prerequisites

- Node.js 24.x (see `.nvmrc`)
- Yarn Classic 1.22.22
- Xcode 16.2 (for iOS)
- Android Studio with SDK 35 (for Android)

### Setup

```bash
yarn install      # Required: hoists @react-native/gradle-plugin to root node_modules
yarn build:shared
```

### Web

```bash
# Terminal 1
yarn workspace @universal/web-remote-hello dev

# Terminal 2
yarn workspace @universal/web-shell dev

# Open http://localhost:9001
```

### Android

```bash
# Terminal 1
cd packages/mobile-remote-hello
PLATFORM=android yarn build:remote && PLATFORM=android yarn serve

# Terminal 2
yarn workspace @universal/mobile-host android
```

### iOS

```bash
# Terminal 1
cd packages/mobile-remote-hello
PLATFORM=ios yarn build:remote && PLATFORM=ios yarn serve

# Terminal 2
yarn workspace @universal/mobile-host ios
```

### Standalone Mode ("Super App")

The remote module can run independently as a standalone app without the host shell.

**Prerequisites:** Run `yarn install` at the repo root first. This automatically runs `node scripts/setup-symlinks.js` via postinstall to create symlinks for hoisted dependencies.

**Port Assignments:**
- Standalone ports (8083/8084) differ from MF remote ports (9004/9005) because standalone runs as a full React Native app with Metro-compatible bundler, while MF mode serves container bundles for the host
- Android uses `10.0.2.2:PORT` (emulator's loopback), iOS uses `localhost:PORT`—this is handled automatically by `MainApplication.kt` (Android) and native config (iOS)

```bash
# Android Standalone (port 8083)
cd packages/mobile-remote-hello
PLATFORM=android yarn build:standalone    # Builds to dist/standalone/android/
yarn start:bundler:android                 # Starts rspack dev server on 8083
# In another terminal:
yarn android                               # Installs and launches app

# iOS Standalone (port 8084)
cd packages/mobile-remote-hello
PLATFORM=ios yarn build:standalone        # Builds to dist/standalone/ios/
yarn start:bundler:ios                     # Starts rspack dev server on 8084
# In another terminal:
yarn ios                                   # Installs and launches app
```

Host and standalone apps can run simultaneously on different emulators/simulators.

**Key scripts:** `build:standalone`, `start:bundler:android`, `start:bundler:ios`, `yarn android`, `yarn ios` (see `packages/mobile-remote-hello/package.json`). Config: `rspack.standalone.config.mjs`.

## Enterprise Features

| Feature | Package | Description |
|---------|---------|-------------|
| Build Orchestration | Turborepo | Intelligent caching, task orchestration |
| Design Tokens | `shared-design-tokens` | Two-tier token system (primitive/semantic) |
| Theming | `shared-theme-context` | Light/dark mode with persistence |
| Accessibility | `shared-a11y` | WCAG 2.1 AA compliant utilities |
| Internationalization | `shared-i18n` | India-first i18n (English/Hindi) with namespace isolation |
| Event Bus | `shared-event-bus` | Type-safe inter-MFE communication |
| Data Fetching | `shared-data-layer` | React Query with shared/isolated clients |
| Routing | `shared-router` | Host-owned routing abstraction |
| State Management | `shared-auth-store` | Zustand stores with persistence |
| Unit Testing | Jest + Testing Library | React Native component testing |
| Integration Testing | Jest | Provider composition, routing |
| E2E Testing | Playwright + Maestro | Web and mobile automation |

### Localization (India-First)

The platform uses an India-first localization strategy:

| Aspect | Configuration |
|--------|---------------|
| Default Locale | English (`en`) with `en-IN` formatting |
| Second Language | Hindi (`hi`) |
| Currency | INR (₹) with Indian grouping (lakhs/crores) |
| Number Format | Indian system (1,00,000 instead of 100,000) |

Language toggle switches between English and Hindi across all platforms.

## Tech Stack

| Component | Version |
|-----------|---------|
| React (mobile) | 19.1.0 |
| React (web) | 19.2.0 |
| React Native | 0.80.0 |
| React Native Web | 0.21.2 |
| Rspack | 1.6.5 |
| Re.Pack | 5.2.0 |
| Module Federation | 0.21.6 |
| Turborepo | 2.7.3 |
| TypeScript | 5.9.3 |

## CI/CD

| Workflow | Trigger | Action |
|----------|---------|--------|
| CI | Push/PR to main/develop | Lint, typecheck, test, build all platforms (host + standalone) |
| Deploy Web | Push to main | Deploy to Vercel (remote first, then shell) |
| Deploy Android | Tag push (v*) | Build host + standalone APKs, create GitHub Release |
| Deploy iOS | Tag push (v*) | Build host + standalone Simulator apps, create GitHub Release |
| **Deploy Mobile Remote Bundles** | **Push to main** | **Build production bundles, deploy to Firebase Hosting** |

### Mobile Remote Bundle Deployment

Production mobile apps load remote modules from **Firebase Hosting** instead of localhost:

**Production Remote URL**: `https://universal-mfe.web.app`

**Manual Deployment**:
```bash
# Build production remote bundle
cd packages/mobile-remote-hello
NODE_ENV=production PLATFORM=android yarn build:remote

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

**CI/CD**: See [Phase 6.6 in CI/CD Implementation Plan](docs/CI-CD-IMPLEMENTATION-PLAN.md#phase-66-firebase-hosting-for-mobile-remote-bundles--complete) for automated workflow setup.

### Creating a Release

```bash
git checkout main
git pull origin main
git tag v1.0.0
git push --tags
```

### Mobile Build Types

| Build Type | Artifact | Metro Required? | Use Case |
|------------|----------|-----------------|----------|
| **Debug Build** | `mobile-host-debug.apk` | ✅ Yes (port 8081/8082) | Development testing |
| **Release Build** | `mobile-host-release.apk` | ❌ No (loads from Firebase) | Production distribution |
| **Standalone Debug** | `mobile-remote-standalone-debug.apk` | ✅ Yes (port 8083/8084) | Remote testing in isolation |
| **Standalone Release** | `mobile-remote-standalone-release.apk` | ❌ No | Super app deployment |

**Android Release Builds**: Now fully functional with Firebase Hosting remote loading. See [Mobile Release Build Fixes](docs/MOBILE-RELEASE-BUILD-FIXES.md) for critical fixes required.

## Documentation

| Document | Description |
|----------|-------------|
| [Enterprise Enhancements](docs/ENTERPRISE-ENHANCEMENTS.md) | Overview of all enterprise features |
| [Testing Guide](docs/universal-mfe-all-platforms-testing-guide.md) | Running apps and testing guide |
| [**Git Flow Workflow**](docs/GIT-FLOW-WORKFLOW.md) | **Branch strategy, PR process, release workflow** |
| [CI/CD Implementation](docs/CI-CD-IMPLEMENTATION-PLAN.md) | CI/CD workflows and deployment guide |
| [**Mobile Release Build Fixes**](docs/MOBILE-RELEASE-BUILD-FIXES.md) | **Critical fixes for Android production releases** |
| [**PatchMFConsolePlugin Guide**](docs/PATCHMFCONSOLEPLUGIN-GUIDE.md) | **Community guide for Hermes + MF v2 console fix** |
| [Critical Analysis](docs/CRITICAL-ANALYSIS-OF-UNIVERSAL-MFE.md) | Architecture assessment and recommendations |
| [MF V2 Implementation](docs/universal-mfe-mf-v2-implementation.md) | Configuration reference and troubleshooting |
| [Architecture Overview](docs/universal-mfe-architecture-overview.md) | System design and patterns |
| [CLAUDE.md](CLAUDE.md) | Development guidelines and constraints |
| [India-First Localization](docs/INDIA-FIRST-LOCALIZATION-PLAN.md) | Hindi localization implementation plan |

### Pattern Documentation

| Document | Description |
|----------|-------------|
| [State Management](docs/PATTERNS-STATE-MANAGEMENT.md) | Zustand stores, storage abstraction |
| [Data Fetching](docs/PATTERNS-DATA-FETCHING.md) | React Query patterns |
| [Routing](docs/PATTERNS-ROUTING.md) | Host-owned routing model |
| [Theming](docs/PATTERNS-THEMING.md) | Design tokens, theme system |
| [Accessibility](docs/PATTERNS-ACCESSIBILITY.md) | WCAG 2.1 AA utilities |
| [Internationalization](docs/PATTERNS-I18N.md) | i18n patterns |
| [Event Bus](docs/PATTERNS-EVENT-BUS.md) | Inter-MFE communication |
| [Testing](docs/PATTERNS-TESTING.md) | Testing patterns and pyramid |
| [Anti-Patterns](docs/ANTI-PATTERNS.md) | Common mistakes to avoid |

## Key Constraints

- **Yarn Classic Required** - React Native autolinking requires hoisted node_modules
- **Exact Versions** - No `^` or `~` for core dependencies
- **Hermes Required** - Mobile uses Hermes for dynamic bundle execution
- **DTS Disabled** - `dts: false` required in mobile MF configs (incompatible with Hermes)
- **Platform Independence** - Android/iOS use separate build outputs (`dist/android/`, `dist/ios/`)

## Troubleshooting

### Clean Scripts

```bash
# Clear Android caches (fixes autolinking errors)
yarn workspace @universal/mobile-host clean:android

# Clear iOS build
yarn workspace @universal/mobile-host clean:ios

# Clear both platforms
yarn workspace @universal/mobile-host clean
```

### Common Issues

| Issue | Solution |
|-------|----------|
| **Release build crashes on launch** | **See [Mobile Release Build Fixes](docs/MOBILE-RELEASE-BUILD-FIXES.md)** |
| **"Loading chunk 889 failed"** | **ScriptManager resolver needs numeric chunk support** |
| **Android emulator DNS fails** | **Restart emulator with `-dns-server 8.8.8.8,8.8.4.4`** |
| Android path errors | Run `clean:android` to clear stale caches |
| iOS "file not found" | Run `node scripts/setup-symlinks.js` in mobile-host |
| Remote not loading | Verify server running: `curl -I http://localhost:900X/HelloRemote.container.js.bundle` |
| Port in use | Kill process: `lsof -ti:PORT \| xargs kill -9` |

### Mobile Release Build Requirements

**CRITICAL**: Mobile production releases (Android + iOS) require specific fixes to work with Module Federation v2 and Hermes:

1. **PatchMFConsolePlugin** - Prepends console polyfill before webpack runtime (platform-agnostic)
2. **Production remote bundles** - Must be built with `NODE_ENV=production`
3. **ScriptManager resolver** - Must handle numeric chunk IDs (production mode)
4. **HTTPS enforcement** - Production remote URLs must use HTTPS
5. **Release configuration** - iOS/Android must build with Release configuration (not Debug)

See [Mobile Release Build Fixes](docs/MOBILE-RELEASE-BUILD-FIXES.md) for comprehensive documentation.

## Turborepo

The project uses [Turborepo](https://turbo.build/) for fast, cached builds.

```bash
yarn build          # Build all packages
yarn build:shared   # Build shared packages only
yarn build:web      # Build web packages only
yarn typecheck      # Type check all packages
yarn lint           # Run ESLint
yarn lint:architecture  # Check architecture rules
yarn test           # Run tests
yarn clean          # Clean all build outputs
```

Subsequent runs with unchanged inputs show "FULL TURBO" (instant from cache).

## License

MIT
