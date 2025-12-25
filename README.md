# Universal Web + Mobile Microfrontend Platform

A unified microfrontend architecture that enables sharing code, UI components, and business logic across web and mobile platforms. This monorepo implements Module Federation (MF) for dynamic runtime module loading on both web (Rspack + MF) and mobile (Re.Pack + MF) using React and React Native.

## Overview

This project demonstrates a production-ready pattern for building scalable, independently deployable micro-applications that share code and UI across multiple platforms. Key features include:

- **Universal Code Sharing**: Shared utilities and business logic across web and mobile
- **Independent Deployments**: Each application can be deployed independently
- **Runtime Module Loading**: Modules loaded dynamically at runtime via Module Federation
- **Platform-Optimized Builds**: Web uses Rspack, Mobile uses Re.Pack
- **Type Safety**: Full TypeScript support across all packages

## Project Status

### Completed Foundations

The project has successfully established a robust foundation for universal microfrontend development:

- **Monorepo Infrastructure**: Yarn Classic v1 workspace fully configured with proper dependency management and cross-package linking
- **Shared Utilities**: Core utility library (`@universal/shared-utils`) providing TypeScript-first utilities for both platforms
- **Universal UI Components**: React Native-based component library (`@universal/shared-hello-ui`) designed to work across web and mobile
- **Build Pipeline**: Integrated TypeScript compilation and module building across all packages
- **State Management**: Shared authentication store (`@universal/shared-auth-store`) for consistent state across applications

### Current Implementation Status

The project is actively being developed with production-ready infrastructure for both web and mobile platforms:

**Web Platform**

- Rspack-based bundler configuration with Module Federation support
- Web shell host application ready for module loading
- Web remote module architecture established

**Mobile Platform**

- Re.Pack integration with Module Federation and ScriptManager support
- Mobile host application with dynamic module loading capability
- Mobile remote module framework in place

**Development & Testing**

- Full TypeScript support with proper type checking
- Configured testing infrastructure for all platforms
- Documentation and architecture guidelines established

### Ongoing Work

Active development areas include:

- Refinement of module federation patterns and runtime loading strategies
- Cross-platform component testing and validation
- Performance optimization for module loading on both platforms
- Deployment pipeline configuration

## Tech Stack

| Layer                 | Technology               | Version  | Purpose                     |
| --------------------- | ------------------------ | -------- | --------------------------- |
| **Monorepo**          | Yarn Workspaces          | v1.22.22 | Workspace management        |
| **Language**          | TypeScript               | 5.x      | Type-safe code              |
| **Web Framework**     | React                    | 19.x     | Web UI library              |
| **Mobile Framework**  | React Native             | 0.76.x   | Mobile UI library           |
| **Web Build**         | Rspack                   | 0.x      | Web bundler with MF support |
| **Mobile Build**      | Re.Pack                  | 2.x      | React Native bundler        |
| **Module Federation** | MF v2                    | -        | Dynamic module loading      |
| **Styling**           | TailwindCSS / NativeWind | Latest   | Cross-platform styling      |

## Project Structure

```
packages/
├── shared-utils/              # TypeScript utilities (web + mobile)
├── shared-hello-ui/           # React Native UI components (web + mobile)
├── shared-auth-store/         # State management (web + mobile)
├── web-shell/                 # Web host application (Rspack + MF)
├── web-remote-hello/          # Web remote module (Rspack + MF)
├── mobile-host/               # Mobile host application (Re.Pack + MF)
└── mobile-remote-hello/       # Mobile remote module (Re.Pack + MF)
```

Each package is independently buildable and deployable while sharing common code through the shared libraries.

## Documentation References

Key documentation files to understand this project:

- [Architecture Overview](docs/universal-mfe-architecture-overview.md) - Complete system design and patterns
- [Architecture Diagrams](docs/universal-mfe-architecture-diagram.md) - Visual representation of the system
- [Module Federation v2 Migration](docs/universal-mfe-mf-v2-migration-analysis.md) - Mobile-specific MF v2 implementation
- [All Platforms Testing Guide](docs/universal-mfe-all-platforms-testing-guide.md) - Testing strategy
- [Tech Stack Details](docs/temp/tech-stack-and-version-constraints.md) - Detailed technology constraints
- [Implementation Summary](docs/temp/universal-mfe-mf-v2-implementation-summary.md) - Current implementation status

## Quick Start

### Prerequisites

- **Node.js**: 24.11.x (LTS)
- **Yarn**: Classic v1.22.22
- **Git**: For cloning the repository

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd universal-mfe-yarn-seed

# Install dependencies
yarn install

# Build shared libraries
yarn build:shared
```

### Development

```bash
# Build all packages
yarn build

# Watch mode for development (shared libraries)
yarn workspace @universal/shared-utils dev
yarn workspace @universal/shared-hello-ui dev

# Run web applications
yarn workspace web-shell dev
yarn workspace web-remote-hello dev

# Run mobile applications (requires React Native setup)
yarn workspace mobile-host start
yarn workspace mobile-remote-hello start
```

### Build Shared Libraries

```bash
# Build shared-utils
yarn workspace @universal/shared-utils build

# Build shared-hello-ui
yarn workspace @universal/shared-hello-ui build

# Build all shared libraries
yarn build:shared
```

## Key Architectural Principles

This project follows strict architectural constraints to ensure scalability and maintainability:

- **Yarn Classic Workspaces**: Use Yarn workspaces for monorepo management
- **Platform-Specific Builders**: Rspack for web, Re.Pack for mobile
- **Universal UI Primitives**: React Native components shared across web and mobile
- **Dynamic Module Loading**: No static imports of remote modules—all loaded dynamically at runtime
- **Clear Package Boundaries**: Each package has a specific responsibility with no circular dependencies
- **Independent Deployments**: Each application can be built and deployed independently
- **Shared Code Only in Shared Libs**: Business logic, utilities, and reusable components in dedicated shared packages

## Contributing

For development guidelines and best practices, see the architecture documentation referenced above.

## License

MIT © 2025 Universal MFE Project Contributors

## Support & Questions

For questions or issues, please refer to the documentation in `/docs` or create an issue in the repository.
