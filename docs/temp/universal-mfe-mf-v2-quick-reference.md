# Module Federation v2 Quick Reference

**Date:** 2026-01-XX  
**Context:** Universal MFE Platform - MF v2 Configuration Examples

---

## Overview

This document provides quick reference examples for Module Federation v2 configuration in the Universal MFE Platform.

**Current Status:** ✅ Both web and mobile platforms use MF v2

**Runtime Plugins:** ✅ Logging plugin implemented (development mode)

---

## Web Platform (Rspack + MF v2)

### Web Shell Configuration

**File:** `packages/web-shell/rspack.config.mjs`

```javascript
import rspack from "@rspack/core";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import { createLoggingPlugin } from "./src/plugins/mf-logging.ts";
const { HtmlRspackPlugin } = rspack;

// Enable logging plugin only in development mode
const isDevelopment = process.env.NODE_ENV === "development";
const enableLogging = process.env.ENABLE_MF_LOGGING !== "false" && isDevelopment;

export default {
  // ... other config
  plugins: [
    new ModuleFederationPlugin({
      name: "web_shell",
      remotes: {
        hello_remote: "hello_remote@http://localhost:9003/remoteEntry.js",
        // Add more remotes as needed
        // another_remote: "another_remote@http://localhost:9005/remoteEntry.js",
      },
      // Runtime plugins (optional - logging plugin enabled in dev)
      runtimePlugins: enableLogging
        ? [
            [
              createLoggingPlugin,
              {
                enabled: true,
                logLevel: "debug",
                includeTimestamps: true,
              },
            ],
          ]
        : [],
      shared: {
        react: {
          singleton: true,
          requiredVersion: "19.2.0",
          eager: true,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "19.2.0",
          eager: true,
        },
        "react-native-web": {
          singleton: true,
          requiredVersion: "0.21.2",
          eager: true,
        },
      },
    }),
    // ... other plugins
  ],
};
```

### Web Remote Configuration

**File:** `packages/web-remote-hello/rspack.config.mjs`

```javascript
import rspack from "@rspack/core";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
const { HtmlRspackPlugin } = rspack;

export default {
  // ... other config
  plugins: [
    new ModuleFederationPlugin({
      name: "hello_remote",
      filename: "remoteEntry.js",
      exposes: {
        "./HelloRemote": "./src/HelloRemote.tsx",
        // Expose multiple modules:
        // "./AnotherComponent": "./src/AnotherComponent.tsx",
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "19.2.0",
          eager: true,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "19.2.0",
          eager: true,
        },
        "react-native-web": {
          singleton: true,
          requiredVersion: "0.21.2",
          eager: true,
        },
        "@universal/shared-utils": {
          singleton: true,
          eager: true,
        },
        "@universal/shared-hello-ui": {
          singleton: true,
          eager: true,
        },
      },
    }),
    // ... other plugins
  ],
};
```

### Web Runtime Usage

**File:** `packages/web-shell/src/App.tsx`

```typescript
import React, { Suspense } from 'react';
import { View, Text } from 'react-native';

// Dynamic import of remote - NO static imports allowed
const HelloRemote = React.lazy(() => import('hello_remote/HelloRemote'));

function App() {
  return (
    <View>
      <Suspense fallback={<Text>Loading remote...</Text>}>
        <HelloRemote name="Web User" />
      </Suspense>
    </View>
  );
}
```

---

## Mobile Platform (Re.Pack + MF v2)

### Mobile Host Configuration

**File:** `packages/mobile-host/rspack.config.mjs`

```javascript
import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';

export default {
  // ... other config
  plugins: [
    new Repack.RepackPlugin({
      platform: platform,
      hermes: true,
    }),
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'MobileHost',
      remotes: {},
      shared: {
        react: {
          singleton: true,
          requiredVersion: '19.2.0',
          eager: true,
        },
        'react-native': {
          singleton: true,
          eager: true,
        },
        '@universal/shared-utils': {
          singleton: true,
          eager: true,
        },
        '@universal/shared-hello-ui': {
          singleton: true,
          eager: true,
        },
      },
      dts: false,
    }),
  ],
};
```

### Mobile Remote Configuration

**File:** `packages/mobile-remote-hello/repack.remote.config.mjs`

```javascript
import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';

export default {
  // ... other config
  plugins: [
    new Repack.RepackPlugin({
      platform,
      hermes: true,
    }),
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'HelloRemote',
      filename: 'HelloRemote.container.js.bundle',
      exposes: {
        './HelloRemote': './src/HelloRemote.tsx',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-native': { singleton: true, eager: true },
        '@universal/shared-utils': { singleton: true, eager: true },
        '@universal/shared-hello-ui': { singleton: true, eager: true },
      },
      dts: false,
    }),
  ],
};
```

### Mobile Runtime Usage

**File:** `packages/mobile-host/src/App.tsx`

```typescript
import { ScriptManager, Federated } from '@callstack/repack/client';
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// Initialize ScriptManager resolver
ScriptManager.shared.addResolver(async (scriptId) => {
  return {
    url: `http://localhost:9004/${scriptId}.container.js.bundle`,
  };
});

function App() {
  const [RemoteComponent, setRemoteComponent] = useState(null);

  useEffect(() => {
    // Load remote dynamically
    Federated.importModule('HelloRemote', './HelloRemote', 'default')
      .then((module) => {
        setRemoteComponent(() => module);
      })
      .catch((error) => {
        console.error('Failed to load remote:', error);
      });
  }, []);

  return (
    <View>
      {RemoteComponent ? (
        <RemoteComponent name="Mobile User" />
      ) : (
        <Text>Loading remote...</Text>
      )}
    </View>
  );
}
```

---

## Key Differences: Web vs Mobile

| Aspect | Web (Rspack) | Mobile (Re.Pack) |
|--------|--------------|------------------|
| **Plugin Import** | `@module-federation/enhanced/rspack` | `Repack.plugins.ModuleFederationPluginV2` |
| **Remote Format** | `.js` files | `.bundle` files (Hermes bytecode) |
| **Runtime Loader** | Browser `import()` | ScriptManager + Hermes |
| **Remote Entry** | `remoteEntry.js` | `*.container.js.bundle` |
| **Dynamic Import** | `React.lazy(() => import('remote/Module'))` | `Federated.importModule('Remote', './Module', 'default')` |

---

## Shared Dependencies Best Practices

### Required Configuration

All shared dependencies **MUST** use:

```javascript
shared: {
  dependencyName: {
    singleton: true,      // Required: prevents duplicate instances
    eager: true,          // Required: loads immediately
    requiredVersion: "x.y.z",  // Optional: version constraint
  },
}
```

### Critical Shared Dependencies

**Web:**
- `react` (singleton, eager)
- `react-dom` (singleton, eager)
- `react-native-web` (singleton, eager)

**Mobile:**
- `react` (singleton, eager)
- `react-native` (singleton, eager)

**Both:**
- `@universal/shared-utils` (singleton, eager)
- `@universal/shared-hello-ui` (singleton, eager)

---

## Environment-Specific Configuration

### Development

```javascript
remotes: {
  hello_remote: "hello_remote@http://localhost:9003/remoteEntry.js",
}
```

### Production

```javascript
const REMOTE_URL = process.env.REMOTE_URL || 
  'https://cdn.example.com/remotes/hello-remote/remoteEntry.js';

remotes: {
  hello_remote: `hello_remote@${REMOTE_URL}`,
}
```

---

## Common Patterns

### Multiple Remotes

```javascript
remotes: {
  hello_remote: "hello_remote@http://localhost:9003/remoteEntry.js",
  dashboard_remote: "dashboard_remote@http://localhost:9005/remoteEntry.js",
  settings_remote: "settings_remote@http://localhost:9007/remoteEntry.js",
}
```

### Multiple Exposes

```javascript
exposes: {
  "./HelloRemote": "./src/HelloRemote.tsx",
  "./HelloButton": "./src/HelloButton.tsx",
  "./HelloForm": "./src/HelloForm.tsx",
}
```

### Conditional Remote Loading

```typescript
// Web example
const loadRemote = async (remoteName: string) => {
  try {
    const module = await import(`${remoteName}/Component`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load ${remoteName}:`, error);
    return null;
  }
};
```

---

## Troubleshooting

### Build Errors

**Error:** `Cannot find module '@module-federation/enhanced/rspack'`

**Solution:** Ensure `@module-federation/enhanced@0.21.6` is in `devDependencies`

### Runtime Errors

**Error:** `Failed to load remote`

**Check:**
- Remote URL is correct
- Remote server is running
- CORS headers are configured
- Shared dependencies match versions

### Version Mismatches

**Error:** Multiple React instances

**Solution:** Ensure all shared dependencies use `singleton: true` and `eager: true`

---

## Runtime Plugins

### Logging Plugin (Implemented)

**Status:** ✅ Active in development mode

**Configuration:**
```javascript
import { createLoggingPlugin } from "./src/plugins/mf-logging.ts";

const enableLogging = process.env.NODE_ENV === "development" && 
  process.env.ENABLE_MF_LOGGING !== "false";

new ModuleFederationPlugin({
  name: "web_shell",
  runtimePlugins: enableLogging
    ? [[createLoggingPlugin, { logLevel: "debug", includeTimestamps: true }]]
    : [],
  // ... rest of config
});
```

**Features:**
- Logs MF lifecycle events (init, request, load, error)
- Configurable log levels (debug, info, warn, error)
- Timestamp support
- Safe - only logs, doesn't modify behavior

**Disable:**
```bash
ENABLE_MF_LOGGING=false yarn dev
```

**See Also:**
- Implementation Guide: `docs/temp/universal-mfe-mf-v2-runtime-plugins-implementation-guide.md`
- Implementation Status: `docs/temp/universal-mfe-mf-v2-runtime-plugins-implementation-status.md`

---

## Related Documentation

- **Architecture Overview:** `docs/universal-mfe-architecture-overview.md`
- **Migration Guide:** `docs/temp/universal-mfe-mf-v2-migration-complete.md`
- **Deployment Guide:** `docs/temp/how-to-deploy-remotes.md`
- **Developer Checklist:** `docs/temp/developer-checklist.md`

---

**Last Updated:** 2026-01-XX  
**Status:** Active Reference Guide

