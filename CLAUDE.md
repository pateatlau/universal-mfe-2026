# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **universal microfrontend platform** that enables a single React Native codebase to run on Web, iOS, and Android with dynamic runtime module loading via Module Federation v2. The key innovation is using React Native primitives as the universal UI API - rendered via React Native Web on web and natively on mobile.

## Critical Technology Constraints

- **Yarn Classic v1.22.22 is REQUIRED** (not pnpm/npm) - React Native autolinking requires hoisted node_modules
- **Hermes is REQUIRED for mobile** - ScriptManager requires Hermes for dynamic bundle execution
- **Exact version matching is CRITICAL** - All core dependencies use exact versions (no `^` or `~`) to prevent runtime errors
- **React Native Web alias required** - Web configurations must alias `"react-native"` to `"react-native-web"`

## Locked Technology Versions

All versions are exact (no `^` or `~`) to ensure reproducibility.

### Runtime & Build Tools
| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 24.11.0 | Locked via `.nvmrc` |
| Yarn Classic | 1.22.22 | Locked via `packageManager` in root `package.json` |
| TypeScript | 5.9.3 | |

### Mobile Packages (React 19.1.0 required by RN 0.80.0)
| Package | Version |
|---------|---------|
| react | 19.1.0 |
| react-native | 0.80.0 |
| @callstack/repack | 5.2.0 |
| @module-federation/enhanced | 0.21.6 |
| @swc/helpers | 0.5.17 |
| @rspack/cli | 1.6.5 |

### Web Packages
| Package | Version |
|---------|---------|
| react | 19.2.0 |
| react-dom | 19.2.0 |
| react-native-web | 0.21.2 |
| @rspack/core | 1.6.5 |
| @rspack/cli | 1.6.5 |

### Native Tooling (for reference - install these versions)
| Tool | Version | Notes |
|------|---------|-------|
| Xcode | 16.2 | macOS only |
| Android Build Tools | 35.0.0 | |
| Android Compile SDK | 35 | |
| Android NDK | 27.1.12297006 | |
| Gradle | 8.14.1 | Locked via `gradle-wrapper.properties` |
| Kotlin | 2.1.20 | |
| CocoaPods | 1.16.2 | macOS only |
| Ruby | 2.6.10+ | For CocoaPods |

### Port Assignments
| Service | Port |
|---------|------|
| Web Shell | 9001 |
| Web Remote | 9003 |
| Mobile Host (Android) | 8081 |
| Mobile Host (iOS) | 8082 |
| Mobile Remote (Android) | 9004 |
| Mobile Remote (iOS) | 9005 |

## Monorepo Structure

```
packages/
├── web-shell/                    # Web host (Rspack + MF v2, port 9001)
├── web-remote-hello/             # Web remote module (Rspack + MF v2, port 9003)
├── mobile-host/                  # Mobile host (Re.Pack + MF v2, port 8081)
├── mobile-remote-hello/          # Mobile remote (Re.Pack + MF v2, ports 9004/9005)
├── shared-utils/                 # Pure TypeScript utilities (platform-agnostic)
├── shared-hello-ui/              # Universal React Native UI components
└── shared-auth-store/            # Shared authentication state
```

## Common Development Commands

### Build Shared Libraries (Required First)
```bash
# Build all shared libraries
yarn build:shared

# Or individually
yarn workspace @universal/shared-utils build
yarn workspace @universal/shared-hello-ui build
```

### Web Development
```bash
# Terminal 1: Web Remote
cd packages/web-remote-hello
yarn dev  # Port 9003

# Terminal 2: Web Shell
cd packages/web-shell
yarn dev  # Port 9001

# Browser: http://localhost:9001
```

### Mobile Development (Android)
```bash
# Terminal 1: Mobile Remote
cd packages/mobile-remote-hello
PLATFORM=android yarn build:remote
PLATFORM=android yarn serve  # Port 9004

# Terminal 2: Mobile Host
cd packages/mobile-host
yarn android  # Port 8081
```

### Mobile Development (iOS)
```bash
# Terminal 1: Mobile Remote
cd packages/mobile-remote-hello
PLATFORM=ios yarn build:remote
PLATFORM=ios yarn serve  # Port 9005

# Terminal 2: Mobile Host
cd packages/mobile-host
yarn ios  # Port 8082
```

**NOTE:** Android uses port 8081, iOS uses port 8082 - they can run simultaneously.

## Architecture & Key Patterns

### Module Federation Configuration

**Web Host** (`packages/web-shell/rspack.config.mjs`):
- Uses `@module-federation/enhanced/rspack`
- Consumes remotes via browser runtime: `hello_remote@http://localhost:9003/remoteEntry.js`
- All shared deps must be `singleton: true` and `eager: true`
- React Native Web is aliased in resolve config

**Mobile Host** (`packages/mobile-host/rspack.config.mjs`):
- Uses `Repack.plugins.ModuleFederationPluginV2`
- Remotes are NOT declared in config - loaded dynamically via ScriptManager
- ScriptManager resolver pattern in `src/App.tsx` handles URL resolution
- Platform-specific URLs: Android uses `10.0.2.2`, iOS uses `localhost`

### ScriptManager Resolver Pattern (Mobile Only)

Location: `packages/mobile-host/src/App.tsx`

```typescript
ScriptManager.shared.addResolver(async (scriptId, caller) => {
  const REMOTE_HOST = Platform.OS === 'android'
    ? 'http://10.0.2.2:9004'
    : 'http://localhost:9005';

  if (scriptId === 'HelloRemote') {
    return { url: `${REMOTE_HOST}/HelloRemote.container.js.bundle` };
  }

  if (scriptId.startsWith('__federation_expose_')) {
    return { url: `${REMOTE_HOST}/${scriptId}.bundle` };
  }

  throw new Error(`Unknown scriptId: ${scriptId}`);
});

// Import remote module
const module = await Federated.importModule('HelloRemote', './HelloRemote', 'default');
```

### Universal Component Rules

When creating universal components in `packages/shared-hello-ui/`:

**MUST use:**
- React Native primitives only: `View`, `Text`, `Pressable`, `Image`, `ScrollView`, etc.
- `Platform.select()` for platform-specific logic if needed
- `@universal/shared-utils` for business logic

**FORBIDDEN:**
- DOM elements: `<div>`, `<span>`, `<button>`, `<img>`
- Browser APIs: `window`, `document`, `localStorage`
- Native modules or platform-specific imports
- React Native Web imports (RNW is only for web bundler config)

### Shared Utilities Rules

Location: `packages/shared-utils/src/`

**Constraints:**
- Pure TypeScript only
- NO React Native imports
- NO React Native Web imports
- NO platform-specific code
- NO bundler-specific code

### Bundle Output Formats

- **Web remotes:** `.js` files (standard JavaScript)
- **Mobile remotes:** `.bundle` files (Hermes bytecode)
  - Container: `HelloRemote.container.js.bundle`
  - Expose chunks: `__federation_expose_*.bundle`

### Network Configuration

- **Android emulator:** Use `http://10.0.2.2:PORT` (not localhost)
- **iOS simulator:** Use `http://localhost:PORT`
- **Web:** Use `http://localhost:PORT`

### Port Assignments

- Web Shell: 9001
- Web Remote: 9003
- Mobile Remote (Android): 9004
- Mobile Remote (iOS): 9005
- Mobile Host: 8081 (both iOS and Android)

## Stub Files Pattern

The codebase uses stub files to replace incompatible dependencies:

**Web Stubs:**
- `packages/web-remote-hello/src/stubs/AsyncStorage.js` - No-op for web builds
- Applied via `NormalModuleReplacementPlugin` in Rspack config

**Mobile Stubs:**
- `packages/mobile-host/src/stubs/ReactDevToolsSettingsManager.js`
- `packages/mobile-host/src/stubs/NativeReactDevToolsRuntimeSettingsModule.js`
- Multiple `@swc/helpers` replacements in mobile-remote-hello config

## Key Architectural Principles

1. **Universal UI First** - Write UI components using React Native primitives only
2. **Independent Deployments** - Each remote can be deployed independently without host redeployment
3. **Platform Separation** - Web uses Rspack + browser runtime, Mobile uses Re.Pack + Hermes + ScriptManager
4. **Shared Code Constraints** - Shared libraries must be platform-agnostic (pure TS or RN primitives)
5. **Version Exactness** - Use exact versions for all core dependencies to ensure Module Federation compatibility

## Critical Development Rules

**CRITICAL: Scope Discipline**
- Only modify files directly related to the task at hand
- Do not refactor, clean up, or "improve" unrelated code
- Do not delete or modify files/packages not involved in the current task
- If encountering errors, investigate the specific issue first before taking broad actions
- When in doubt, ask for clarification rather than making assumptions

## Important File Locations

**Configuration Files:**
- `packages/web-shell/rspack.config.mjs` - Web host MF config
- `packages/web-remote-hello/rspack.config.mjs` - Web remote MF config
- `packages/mobile-host/rspack.config.mjs` - Mobile host Re.Pack + MF config
- `packages/mobile-remote-hello/repack.remote.config.mjs` - Mobile remote Re.Pack + MF config
- `tsconfig.json` - Root TypeScript config
- `.cursorrules` - Complete development rules and constraints

**Documentation:**
- `docs/universal-mfe-architecture-overview.md` - Complete system design
- `docs/universal-mfe-all-platforms-testing-guide.md` - Testing strategy
- `docs/universal-mfe-mf-v2-migration-analysis.md` - MF v2 implementation details

## Common Pitfalls to Avoid

1. **Version mismatches** - Never use version ranges (`^` or `~`) for core dependencies
2. **Platform-specific code in shared libraries** - Don't use DOM APIs or native modules in shared code
3. **Bundle format confusion** - Web outputs `.js`, mobile outputs `.bundle`
4. **Module Federation misconfiguration** - Shared deps must be singletons with eager loading
5. **Network configuration errors** - Android needs `10.0.2.2`, iOS uses `localhost`
6. **Missing React Native Web alias** - Web configs must alias react-native to react-native-web
7. **Port conflicts** - Mobile host cannot run iOS and Android simultaneously (both use 8081)

## Quick Reference for Common Tasks

**Add a shared utility:**
1. Edit `packages/shared-utils/src/index.ts`
2. Run `yarn workspace @universal/shared-utils build`

**Add a universal UI component:**
1. Edit `packages/shared-hello-ui/src/`
2. Export from `packages/shared-hello-ui/src/index.ts`
3. Run `yarn workspace @universal/shared-hello-ui build`
4. Test on both web and mobile platforms

**Modify web shell:**
1. Edit `packages/web-shell/src/App.tsx`
2. Changes hot-reload automatically in dev mode

**Modify mobile host:**
1. Edit `packages/mobile-host/src/App.tsx`
2. Changes hot-reload automatically in dev mode

**Add a new web remote:**
1. Follow the pattern in `packages/web-remote-hello/`
2. Update `rspack.config.mjs` with MF configuration
3. Add stub files for incompatible dependencies
4. Update web-shell's remotes config to consume it

**Add a new mobile remote:**
1. Follow the pattern in `packages/mobile-remote-hello/`
2. Update `repack.remote.config.mjs` with MF configuration
3. Add ScriptManager resolver entry in mobile-host's `App.tsx`
4. Use platform-specific ports (9004 Android, 9005 iOS)
