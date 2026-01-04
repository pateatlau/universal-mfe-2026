# Universal Microfrontend Platform

A production-ready microfrontend architecture enabling code sharing across Web, iOS, and Android using Module Federation V2.

## Platform Status

| Platform | Status | Bundler | MF Version |
|----------|--------|---------|------------|
| Web | Working | Rspack 1.6.5 | MF V2 |
| Android | Working | Re.Pack 5.2.0 | MF V2 |
| iOS | Working | Re.Pack 5.2.0 | MF V2 |

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

## Documentation

| Document | Description |
|----------|-------------|
| [MF V2 Implementation](docs/universal-mfe-mf-v2-implementation.md) | Configuration reference and troubleshooting |
| [Testing Guide](docs/universal-mfe-all-platforms-testing-guide.md) | Quick reference for all platforms |
| [Architecture Overview](docs/universal-mfe-architecture-overview.md) | System design and patterns |
| [CLAUDE.md](CLAUDE.md) | Development guidelines and constraints |

## Key Constraints

- **Yarn Classic Required** - React Native autolinking requires hoisted node_modules
- **Exact Versions** - No `^` or `~` for core dependencies
- **Hermes Required** - Mobile uses Hermes for dynamic bundle execution
- **DTS Disabled** - `dts: false` required in mobile MF configs (incompatible with Hermes)

## License

MIT
