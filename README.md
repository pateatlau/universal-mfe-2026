# Universal Web + Mobile Microfrontend Platform

A universal microfrontend platform that runs on both Web and Mobile using:
- **Web**: Rspack + Module Federation v1
- **Mobile**: Re.Pack + Module Federation v2 + ScriptManager
- **Universal UI**: React Native primitives shared across platforms

## Project Status

### ✅ Phase 1: Foundation Setup (COMPLETE)

- Root workspace configuration with Yarn v1
- Shared utilities library (`@universal/shared-utils`)
- Shared UI library (`@universal/shared-hello-ui`)

### 🚧 Phase 2: Web MFE (TODO)

- Web shell with Rspack + Module Federation
- Web remote with dynamic loading

### 🚧 Phase 3: Mobile MFE (TODO)

- Mobile host with Re.Pack + Module Federation v2 + ScriptManager
- Mobile remote with dynamic loading

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
├── web-shell/             # (Phase 2) Web host
├── web-remote-hello/      # (Phase 2) Web remote
├── mobile-host/           # (Phase 3) Mobile host
└── mobile-remote-hello/   # (Phase 3) Mobile remote
```

## Constraints

This project follows strict architectural constraints. See `/docs/constraints.md` for details.

Key rules:
- ✅ Yarn Classic v1 workspaces only
- ✅ Rspack for web, Re.Pack for mobile
- ✅ Universal UI uses React Native primitives only
- ✅ No static imports of remotes
- ✅ Strict package boundaries

