# Universal Microfrontend Platform

A production-ready microfrontend architecture enabling code sharing across Web, iOS, and Android using Module Federation V2.

## Live Demos

| Platform | URL |
|----------|-----|
| Web Shell | https://universal-mfe-2026-shell.vercel.app/ |
| Web Remote | https://universal-mfe-2026-remote.vercel.app/ |
| Android APK | [GitHub Releases](https://github.com/pateatlau/universal-mfe-2026/releases) |
| iOS Simulator | [GitHub Releases](https://github.com/pateatlau/universal-mfe-2026/releases) |

## Platform Status

| Platform | Status | Bundler | MF Version |
|----------|--------|---------|------------|
| Web | Deployed | Rspack 1.6.5 | MF V2 |
| Android | Deployed | Re.Pack 5.2.0 | MF V2 |
| iOS | Deployed | Re.Pack 5.2.0 | MF V2 |

## Architecture

```
packages/
├── web-shell/              # Web host (port 9001)
├── web-remote-hello/       # Web remote (port 9003)
├── mobile-host/            # Mobile host (Android: 8081, iOS: 8082)
├── mobile-remote-hello/    # Mobile remote (Android: 9004, iOS: 9005)
├── shared-utils/           # TypeScript utilities
└── shared-hello-ui/        # Universal React Native components
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
| TypeScript | 5.9.3 |

## CI/CD

| Workflow | Trigger | Action |
|----------|---------|--------|
| CI | Push/PR to main/develop | Lint, typecheck, test, build all platforms |
| Deploy Web | Push to main | Deploy to Vercel (remote first, then shell) |
| Deploy Android | Tag push (v*) | Build APK, create GitHub Release |
| Deploy iOS | Tag push (v*) | Build Simulator app, create GitHub Release |

### Creating a Release

```bash
git checkout main
git pull origin main
git tag v1.0.0
git push --tags
```

### Mobile Build Limitations

Current mobile builds are **debug builds** that require Metro bundler running:

| Platform | Artifact | Limitation |
|----------|----------|------------|
| Android | `app-debug.apk` | Requires Metro on port 8081 |
| iOS | `ios-simulator-app.zip` | Simulator only, requires Metro on port 8082 |

For standalone production builds, see [Phase 5 in CI/CD Implementation Plan](docs/CI-CD-IMPLEMENTATION-PLAN.md#phase-5-production-mobile-builds-future).

## Documentation

| Document | Description |
|----------|-------------|
| [CI/CD Implementation](docs/CI-CD-IMPLEMENTATION-PLAN.md) | CI/CD workflows and deployment guide |
| [MF V2 Implementation](docs/universal-mfe-mf-v2-implementation.md) | Configuration reference and troubleshooting |
| [Testing Guide](docs/universal-mfe-all-platforms-testing-guide.md) | Quick reference for all platforms |
| [Architecture Overview](docs/universal-mfe-architecture-overview.md) | System design and patterns |
| [CLAUDE.md](CLAUDE.md) | Development guidelines and constraints |

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
| Android path errors | Run `clean:android` to clear stale caches |
| iOS "file not found" | Run `node scripts/setup-symlinks.js` in mobile-host |
| Remote not loading | Verify server running: `curl -I http://localhost:900X/HelloRemote.container.js.bundle` |
| Port in use | Kill process: `lsof -ti:PORT \| xargs kill -9` |

## License

MIT
