# Module Federation V2 Implementation Guide

**Status:** Production Ready
**Last Updated:** 2026-01-04

---

## Overview

This project uses Module Federation V2 across all platforms:

| Platform | Bundler | MF Plugin | Port(s) |
|----------|---------|-----------|---------|
| Web | Rspack | `@module-federation/enhanced/rspack` | 9001, 9003 |
| Android | Re.Pack (Rspack) | `ModuleFederationPluginV2` | 8081, 9004 |
| iOS | Re.Pack (Rspack) | `ModuleFederationPluginV2` | 8082, 9005 |

---

## Configuration Reference

### Web Host (`packages/web-shell/rspack.config.mjs`)

```javascript
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

new ModuleFederationPlugin({
  name: 'web_shell',
  remotes: {
    hello_remote: 'hello_remote@http://localhost:9003/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, eager: true, requiredVersion: '19.2.0' },
    'react-dom': { singleton: true, eager: true, requiredVersion: '19.2.0' },
    'react-native-web': { singleton: true, eager: true, requiredVersion: '0.21.2' },
  },
});
```

### Web Remote (`packages/web-remote-hello/rspack.config.mjs`)

```javascript
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

new ModuleFederationPlugin({
  name: 'hello_remote',
  filename: 'remoteEntry.js',
  exposes: {
    './HelloRemote': './src/HelloRemote.tsx',
  },
  shared: {
    react: { singleton: true, eager: false, requiredVersion: '19.2.0' },
    'react-dom': { singleton: true, eager: false, requiredVersion: '19.2.0' },
    'react-native-web': { singleton: true, eager: false, requiredVersion: '0.21.2' },
  },
});
```

**Key:** Web remote uses `'react-native$': path.resolve(__dirname, 'node_modules/react-native-web')` alias for shared-hello-ui compatibility.

### Mobile Host (`packages/mobile-host/rspack.config.mjs`)

```javascript
import * as Repack from '@callstack/repack';

new Repack.plugins.ModuleFederationPluginV2({
  name: 'MobileHost',
  remotes: {}, // Empty - loaded dynamically via ScriptManager
  dts: false,  // CRITICAL: Disable DTS plugin (incompatible with Hermes)
  shared: {
    react: { singleton: true, eager: true, requiredVersion: '19.1.0' },
    'react-native': { singleton: true, eager: true, requiredVersion: '0.80.0' },
    '@universal/shared-utils': { singleton: true, eager: true },
    '@universal/shared-hello-ui': { singleton: true, eager: true },
  },
});
```

### Mobile Remote (`packages/mobile-remote-hello/repack.remote.config.mjs`)

```javascript
import * as Repack from '@callstack/repack';
import path from 'node:path';

const platform = process.env.PLATFORM || 'android';
const devServerPort = platform === 'ios' ? 9005 : 9004;
// CRITICAL: Separate output directories per platform
const outputDir = path.join(dirname, 'dist', platform);

export default {
  output: {
    path: outputDir,  // dist/android/ or dist/ios/
  },
  devServer: {
    port: devServerPort,
    static: { directory: outputDir },
  },
  plugins: [
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'HelloRemote',
      filename: 'HelloRemote.container.js.bundle',
      dts: false,  // CRITICAL: Disable DTS plugin (incompatible with Hermes)
      exposes: {
        './HelloRemote': './src/HelloRemote.tsx',
      },
      shared: {
        react: { singleton: true, eager: false, requiredVersion: '19.1.0' },
        'react-native': { singleton: true, eager: false, requiredVersion: '0.80.0' },
        '@universal/shared-utils': { singleton: true, eager: false },
        '@universal/shared-hello-ui': { singleton: true, eager: false },
      },
    }),
  ],
};
```

**CRITICAL:** Android and iOS builds use separate output directories (`dist/android/`, `dist/ios/`) to prevent platform builds from overwriting each other.

---

## Critical Configuration Details

### 1. DTS Plugin Must Be Disabled

The `@module-federation/dts-plugin` is incompatible with React Native/Hermes:

```javascript
// REQUIRED for mobile configs
dts: false,
```

Without this, you'll see: `TypeError: Cannot read property 'prototype' of undefined`

### 2. MF V2 Chunk Naming Pattern

MF V2 outputs chunks with `.index.bundle` suffix:
- Container: `HelloRemote.container.js.bundle`
- Expose chunks: `__federation_expose_HelloRemote.index.bundle`

### 3. ScriptManager Resolver Pattern

The ScriptManager resolver must handle MF V2 chunk patterns:

```typescript
// packages/mobile-host/src/App.tsx
ScriptManager.shared.addResolver(async (scriptId, caller) => {
  const REMOTE_HOST = Platform.OS === 'android'
    ? 'http://10.0.2.2:9004'  // Android port
    : 'http://localhost:9005'; // iOS port

  // Container bundle
  if (scriptId === 'HelloRemote') {
    return { url: `${REMOTE_HOST}/HelloRemote.container.js.bundle` };
  }

  // MF V2 expose chunks
  if (scriptId.startsWith('__federation_expose_')) {
    return { url: `${REMOTE_HOST}/${scriptId}.index.bundle` };
  }

  // Other chunks from HelloRemote
  if (caller === 'HelloRemote') {
    return { url: `${REMOTE_HOST}/${scriptId}.index.bundle` };
  }

  throw new Error(`Unknown scriptId: ${scriptId}`);
});
```

### 4. Dynamic Remote Loading

Mobile uses `Federated.importModule()` for dynamic loading:

```typescript
import { ScriptManager, Federated } from '@callstack/repack/client';

// Prefetch container (optional)
await ScriptManager.shared.prefetchScript('HelloRemote');

// Load remote module
const module = await Federated.importModule('HelloRemote', './HelloRemote', 'default');
const HelloRemote = module.default || module;
```

**Note:** `Federated.importModule()` is marked deprecated but remains the correct API for React Native with ScriptManager dynamic loading.

---

## Shared Dependencies Rules

| Config Option | Host | Remote | Purpose |
|---------------|------|--------|---------|
| `singleton` | `true` | `true` | Single instance across containers |
| `eager` | `true` | `false` | Host loads immediately; remote defers to host |
| `requiredVersion` | exact | exact | Version matching |

---

## Bundle Output Formats

| Platform | Container | Chunks |
|----------|-----------|--------|
| Web | `remoteEntry.js` | `*.js` |
| Mobile | `*.container.js.bundle` | `*.index.bundle` |

---

## Network Configuration

| Platform | Host Address | Notes |
|----------|--------------|-------|
| Web | `localhost` | Direct access |
| iOS Simulator | `localhost` | Direct access |
| Android Emulator | `10.0.2.2` | Special alias for host machine |

---

## Troubleshooting

### "factory is undefined" Error
- **Cause:** Share scope not initialized or DTS plugin issue
- **Fix:** Ensure `dts: false` in both host and remote configs

### "Cannot read property 'prototype' of undefined"
- **Cause:** DTS plugin incompatible with Hermes
- **Fix:** Add `dts: false` to ModuleFederationPluginV2 config

### Remote module not loading
1. Verify remote server is running on correct port
2. Check ScriptManager resolver handles all chunk patterns
3. Verify network connectivity (use `10.0.2.2` for Android emulator)
4. **Check platform-specific dist directory:** Ensure you built for the correct platform
   - Android: `dist/android/HelloRemote.container.js.bundle`
   - iOS: `dist/ios/HelloRemote.container.js.bundle`

### Web "react-native" module not found
- **Fix:** Use absolute path alias in web remote config:
  ```javascript
  alias: {
    'react-native$': path.resolve(__dirname, 'node_modules/react-native-web'),
  }
  ```

### Android build fails with "ReactAndroid/gradle.properties not found"
- **Cause:** Yarn workspace hoisting moves react-native to root node_modules
- **Fix:** Configure explicit paths in `android/app/build.gradle`:
  ```groovy
  react {
      root = file("../../")
      reactNativeDir = file("../../../../node_modules/react-native")
      codegenDir = file("../../../../node_modules/@react-native/codegen")
      cliFile = file("../../../../node_modules/react-native/cli.js")
  }
  ```

### Android autolinking errors (wrong paths to dependencies)
- **Cause:** Stale autolinking cache with old paths
- **Fix:** Clear the caches:
  ```bash
  yarn workspace @universal/mobile-host clean:android
  ```

### iOS build fails with "with-environment.sh not found"
- **Cause:** Symlinks not created for hoisted dependencies
- **Fix:** Run the symlink setup script:
  ```bash
  cd packages/mobile-host
  node scripts/setup-symlinks.js
  ```

### Building for one platform breaks the other
- **Cause:** Both platforms were writing to the same `dist/` directory
- **Fix:** This is now fixed - Android builds to `dist/android/`, iOS to `dist/ios/`
- **Note:** You must start separate remote servers for each platform on their respective ports

---

## Yarn Workspace Hoisting

Yarn Classic hoists shared dependencies to the root `node_modules/`. This requires special configuration for React Native builds.

### Symlinks

The `setup-symlinks.js` script creates symlinks from the package's `node_modules/` to the hoisted dependencies:

```
packages/mobile-host/node_modules/
├── react-native -> ../../../node_modules/react-native
├── @react-native -> ../../../node_modules/@react-native
└── @callstack -> ../../../node_modules/@callstack
```

Symlinks are created automatically via `postinstall`. If builds fail, run manually:

```bash
cd packages/mobile-host
node scripts/setup-symlinks.js
```

### Android Gradle Configuration

The `android/app/build.gradle` must explicitly point to hoisted dependencies:

```groovy
react {
    root = file("../../")
    reactNativeDir = file("../../../../node_modules/react-native")
    codegenDir = file("../../../../node_modules/@react-native/codegen")
    cliFile = file("../../../../node_modules/react-native/cli.js")
}
```

### Clean Scripts

Available in `packages/mobile-host/package.json`:

| Script | Purpose |
|--------|---------|
| `clean:android` | Clear Android build caches and autolinking data |
| `clean:ios` | Clear iOS build directory |
| `clean:ios:full` | Clear iOS build, Pods, and Podfile.lock |
| `clean` | Clean both platforms |

---

## Version Matrix

| Package | Version | Notes |
|---------|---------|-------|
| `@module-federation/enhanced` | 0.21.6 | MF V2 core |
| `@callstack/repack` | 5.2.0 | React Native bundler |
| `@rspack/core` | 1.6.5 | Web bundler |
| `react` (mobile) | 19.1.0 | Required by RN 0.80.0 |
| `react` (web) | 19.2.0 | Web version |
| `react-native` | 0.80.0 | Mobile |
| `react-native-web` | 0.21.2 | Web |
