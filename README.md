# Universal Microfrontend Platform

A production-ready microfrontend architecture enabling a **single React Native codebase** to run on **Web, iOS, and Android** with dynamic runtime module loading via [Module Federation v2](https://module-federation.io/).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UNIVERSAL CODEBASE                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     Shared Packages (10 libraries)                    │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │  │
│  │  │ shared-     │ │ shared-     │ │ shared-     │ │ shared-         │  │  │
│  │  │ hello-ui    │ │ auth-store  │ │ theme-ctx   │ │ design-tokens   │  │  │
│  │  │ (RN UI)     │ │ (Zustand)   │ │ (Provider)  │ │ (Two-tier)      │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘  │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │  │
│  │  │ shared-     │ │ shared-     │ │ shared-     │ │ shared-         │  │  │
│  │  │ i18n        │ │ a11y        │ │ event-bus   │ │ data-layer      │  │  │
│  │  │ (EN/HI)     │ │ (WCAG 2.1)  │ │ (MFE comm)  │ │ (React Query)   │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘  │  │
│  │  ┌─────────────┐ ┌─────────────┐                                      │  │
│  │  │ shared-     │ │ shared-     │                                      │  │
│  │  │ router      │ │ utils       │                                      │  │
│  │  │ (Host-own)  │ │ (Storage)   │                                      │  │
│  │  └─────────────┘ └─────────────┘                                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
   ┌─────────────┐             ┌─────────────┐             ┌─────────────┐
   │     WEB     │             │   ANDROID   │             │     iOS     │
   │             │             │             │             │             │
   │ ┌─────────┐ │             │ ┌─────────┐ │             │ ┌─────────┐ │
   │ │web-shell│ │             │ │ mobile- │ │             │ │ mobile- │ │
   │ │ (Host)  │ │             │ │  host   │ │             │ │  host   │ │
   │ │ Rspack  │ │             │ │ Re.Pack │ │             │ │ Re.Pack │ │
   │ │ :9001   │ │             │ │ :8081   │ │             │ │ :8082   │ │
   │ └────┬────┘ │             │ └────┬────┘ │             │ └────┬────┘ │
   │      │ MF   │             │      │ MF   │             │      │ MF   │
   │      ▼      │             │      ▼      │             │      ▼      │
   │ ┌─────────┐ │             │ ┌─────────┐ │             │ ┌─────────┐ │
   │ │  web-   │ │             │ │ mobile- │ │             │ │ mobile- │ │
   │ │ remote  │ │             │ │ remote  │ │             │ │ remote  │ │
   │ │ :9003   │ │             │ │ :9004   │ │             │ │ :9005   │ │
   │ └─────────┘ │             │ └─────────┘ │             │ └─────────┘ │
   │             │             │             │             │             │
   │ RN Web      │             │ Hermes      │             │ Hermes      │
   │ Browser     │             │ Native      │             │ Native      │
   └─────────────┘             └─────────────┘             └─────────────┘
```

**Key Innovation**: Write UI once using React Native primitives (`View`, `Text`, `Pressable`) → renders via React Native Web on browsers, natively on mobile.

## Tech Stack

| Layer | Web | Mobile | Shared |
|-------|-----|--------|--------|
| **UI Framework** | React 19.2.0 | React Native 0.80.0 / React 19.1.0 | React Native primitives |
| **Bundler** | [Rspack](https://rspack.dev/) 1.6.5 | [Re.Pack](https://re-pack.dev/) 5.2.0 | - |
| **Module Federation** | [@module-federation/enhanced](https://module-federation.io/) 0.21.6 | Re.Pack MF v2 Plugin | - |
| **JS Engine** | V8/SpiderMonkey | [Hermes](https://hermesengine.dev/) | - |
| **State** | - | - | [Zustand](https://zustand-demo.pmnd.rs/) 5.0.5 |
| **Data Fetching** | - | - | [TanStack Query](https://tanstack.com/query) 5.x |
| **Build Orchestration** | - | - | [Turborepo](https://turbo.build/) 2.7.3 |
| **Language** | - | - | TypeScript 5.9.3 |

## Features

| Category | Features |
|----------|----------|
| **Universal UI** | React Native components render on all platforms |
| **Module Federation** | Runtime remote loading without redeployment |
| **Authentication** | Firebase Auth (Email, Google, GitHub) |
| **Theming** | Light/dark mode, two-tier design tokens |
| **i18n** | English + Hindi, zero-dependency |
| **Accessibility** | WCAG 2.1 AA compliant utilities |
| **State Management** | Zustand stores with storage abstraction |
| **Inter-MFE Comms** | Type-safe event bus |
| **Testing** | Jest, Playwright (web), Maestro (mobile) |
| **CI/CD** | Trunk-based, Vercel + Firebase deployment |

## Quick Start

```bash
# Prerequisites: Node.js 24.x, Yarn 1.22.22

# Install & build
yarn install
yarn build:shared

# Web development (http://localhost:9001)
yarn workspace @universal/web-remote-hello dev   # Terminal 1
yarn workspace @universal/web-shell dev          # Terminal 2

# Mobile (requires Xcode/Android Studio)
# See docs/universal-mfe-all-platforms-testing-guide.md
```

## Project Structure

```
packages/
├── web-shell/              # Web host application
├── web-remote-hello/       # Web remote MFE
├── mobile-host/            # iOS & Android host
├── mobile-remote-hello/    # Mobile remote MFE
├── shared-hello-ui/        # Universal React Native components
├── shared-auth-store/      # Authentication state
├── shared-design-tokens/   # Primitive & semantic tokens
├── shared-theme-context/   # Theme provider
├── shared-a11y/            # Accessibility utilities
├── shared-i18n/            # Internationalization
├── shared-event-bus/       # Inter-MFE communication
├── shared-data-layer/      # React Query setup
├── shared-router/          # Routing abstraction
└── shared-utils/           # Pure TypeScript utilities
```

## Documentation

### Getting Started

| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) | Development guidelines (read first) |
| [Testing Guide](docs/universal-mfe-all-platforms-testing-guide.md) | How to run and test |
| [Documentation Index](docs/DOCUMENTATION-STATUS.md) | All docs status |

### Requirements & Architecture

| Document | Description |
|----------|-------------|
| [PRD](docs/PRD.md) | Product Requirements Document |
| [NFR](docs/NFR.md) | Non-Functional Requirements |
| [ADRs](docs/adr/README.md) | Architecture Decision Records (15 decisions) |
| [Architecture Overview](docs/universal-mfe-architecture-overview.md) | System design |

### Operations

| Document | Description |
|----------|-------------|
| [CI/CD Plan](docs/CI-CD-IMPLEMENTATION-PLAN.md) | Deployment workflows |
| [Mobile Release Fixes](docs/MOBILE-RELEASE-BUILD-FIXES.md) | Production build guide |
| [Enterprise Enhancements](docs/ENTERPRISE-ENHANCEMENTS.md) | All features overview |

### Pattern Documentation

- [State Management](docs/PATTERNS-STATE-MANAGEMENT.md) | [Data Fetching](docs/PATTERNS-DATA-FETCHING.md) | [Routing](docs/PATTERNS-ROUTING.md)
- [Theming](docs/PATTERNS-THEMING.md) | [Accessibility](docs/PATTERNS-ACCESSIBILITY.md) | [i18n](docs/PATTERNS-I18N.md)
- [Event Bus](docs/PATTERNS-EVENT-BUS.md) | [Testing](docs/PATTERNS-TESTING.md) | [Anti-Patterns](docs/ANTI-PATTERNS.md)

## External Resources

| Resource | Link |
|----------|------|
| Module Federation | https://module-federation.io/ |
| Re.Pack | https://re-pack.dev/ |
| React Native | https://reactnative.dev/ |
| React Native Web | https://necolas.github.io/react-native-web/ |
| Rspack | https://rspack.dev/ |
| Turborepo | https://turbo.build/ |
| Firebase | https://firebase.google.com/ |

## Deployment

| Platform | Target | Trigger |
|----------|--------|---------|
| Web | [Vercel](https://vercel.com/) | Push to `main` |
| Android | Firebase App Distribution | Tag `v*` |
| iOS Sim | Firebase App Distribution | Tag `v*` |

## License

MIT
