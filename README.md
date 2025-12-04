# Universal Web + Mobile Microfrontend Platform

A universal microfrontend platform that runs on both Web and Mobile using:
- **Web**: Rspack + Module Federation v2
- **Mobile**: Re.Pack + Module Federation v2 + ScriptManager
- **Universal UI**: React Native primitives shared across platforms

## Project Status

### ✅ POC-0: Foundation & Basic MFE (COMPLETE)

- Root workspace configuration with Yarn v1
- Shared utilities library (`@universal/shared-utils`)
- Shared UI library (`@universal/shared-hello-ui`)
- Web shell with Rspack + Module Federation v2
- Web remote with dynamic loading
- Mobile host with Re.Pack + Module Federation v2 + ScriptManager
- Mobile remote with dynamic loading
- Runtime plugins infrastructure (logging plugin)

### 🚧 POC-1: Payments System Foundation (IN PROGRESS)

**Phase 1: Foundation & Infrastructure Setup** 🚧 **IN PROGRESS**
- ✅ POC-0 bug fixes and refactoring
- ✅ Testing infrastructure (Jest unified - 31 tests passing)
- ✅ Core dependencies installed (React Router 7, Zustand, Tailwind CSS v4, Uniwind, AsyncStorage)
- ✅ Version verification (all exact versions)
- ✅ Cross-platform storage abstraction
- ✅ Shared auth store package (`@universal/shared-auth-store`) - 54 tests, 94.28% coverage
- ⚠️ Tailwind CSS v4 styling on web (known issue - parked)
- ❌ Shared header UI package (Phase 1.5 - next)

**Phase 2: Authentication MFE** (Next)
- Authentication system with mock auth and RBAC
- Web and mobile auth remotes

## Architecture

See `/docs` for complete architecture documentation:
- `architecture-overview.md` - System architecture
- `constraints.md` - Architectural constraints
- `project-structure.md` - Package structure and boundaries
- `tech-stack-and-version-constraints.md` - Technology versions

## Getting Started

### Prerequisites

- Node.js 24.11.x (LTS)
- Yarn Classic v1.22.22

### Installation

```bash
yarn install
```

### Build Shared Libraries

```bash
# Build shared-utils
yarn workspace @universal/shared-utils build

# Build shared-hello-ui
yarn workspace @universal/shared-hello-ui build
```

## Project Structure

```
packages/
├── shared-utils/          # Pure TypeScript utilities
├── shared-hello-ui/       # Universal React Native components
├── shared-auth-store/      # Auth Zustand store with RBAC (Phase 1.5 ✅)
├── web-shell/             # Web host
├── web-remote-hello/      # Web remote
├── mobile-host/           # Mobile host
└── mobile-remote-hello/   # Mobile remote
```

## Constraints

This project follows strict architectural constraints. See `/docs/constraints.md` for details.

Key rules:
- ✅ Yarn Classic v1 workspaces only
- ✅ Rspack for web, Re.Pack for mobile
- ✅ Universal UI uses React Native primitives only
- ✅ No static imports of remotes
- ✅ Strict package boundaries

