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
});
```

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

### Web "react-native" module not found
- **Fix:** Use absolute path alias in web remote config:
  ```javascript
  alias: {
    'react-native$': path.resolve(__dirname, 'node_modules/react-native-web'),
  }
  ```

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
