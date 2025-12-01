# Re.Pack vs Rspack - Architecture Clarification

## Summary

**✅ Current Implementation is CORRECT**

- **Mobile Hosts**: Use `react-native start` (uses Re.Pack via React Native CLI)
- **Mobile Remotes**: Use `rspack build/serve` with Re.Pack config (Re.Pack uses Rspack internally)
- **Web**: Use `rspack build/serve` directly (correct for web)

---

## Architecture Overview

### Re.Pack 5.x Architecture

**Re.Pack** is a React Native bundler that:
- Uses **Rspack** internally as the underlying bundler (since Re.Pack 5.x)
- Provides React Native-specific configuration and plugins
- Replaces Metro bundler for React Native projects
- Supports Module Federation v2 for microfrontends

**Key Point:** Re.Pack 5.x uses Rspack internally, but provides a React Native-specific interface.

---

## Current Implementation (Verified Correct)

### ✅ Mobile Host (Android & iOS)

**Command:**
```json
"start:bundler:android": "react-native start --platform android --port 8081",
"start:bundler:ios": "react-native start --platform ios --port 8081"
```

**How it works:**
1. `react-native start` → React Native CLI
2. React Native CLI reads `react-native.config.js`
3. `react-native.config.js` uses `@callstack/repack/commands/rspack`
4. Re.Pack handles bundling using Rspack internally
5. Re.Pack applies React Native-specific transformations

**Config File:** `rspack.config.mjs` (Re.Pack config that uses Rspack internally)

**Status:** ✅ **CORRECT** - Uses Re.Pack via React Native CLI

---

### ✅ Mobile Remote (Android & iOS - Same Approach)

**Command:**
```json
"build:remote": "rspack build --config ./repack.remote.config.mjs",
"serve": "rspack serve --config ./repack.remote.config.mjs"
```

**How it works:**
1. `rspack build/serve` → Rspack CLI
2. Rspack CLI reads `repack.remote.config.mjs`
3. Config uses Re.Pack plugins (`Repack.RepackPlugin`, `Repack.plugins.ModuleFederationPluginV2`)
4. Re.Pack plugins handle React Native-specific transformations
5. Rspack (used by Re.Pack internally) performs the bundling

**Config File:** `repack.remote.config.mjs` (Re.Pack config using Re.Pack plugins)

**Status:** ✅ **CORRECT** - Uses Rspack CLI with Re.Pack config (same for Android and iOS)

**Why this is correct:**
- Mobile remotes are NOT React Native apps (no `react-native.config.js`)
- They're standalone bundles that will be loaded by the host
- They use Re.Pack plugins in the config
- Re.Pack 5.x uses Rspack internally, so using `rspack` CLI with Re.Pack config is valid
- This is the same approach for both Android and iOS

---

### ✅ Web (Rspack Directly)

**Command:**
```json
"dev": "npx rspack serve --config ./rspack.config.mjs",
"build": "npx rspack build --config ./rspack.config.mjs"
```

**Status:** ✅ **CORRECT** - Web uses Rspack directly (no Re.Pack needed)

---

## Key Distinctions

### Mobile Host vs Mobile Remote

| Aspect | Mobile Host | Mobile Remote |
|--------|-------------|---------------|
| **Type** | React Native app | Standalone bundle |
| **Has `react-native.config.js`** | ✅ Yes | ❌ No |
| **Command** | `react-native start` | `rspack build/serve` |
| **Config** | Re.Pack config | Re.Pack config |
| **Uses Re.Pack** | ✅ Via React Native CLI | ✅ Via Re.Pack plugins in config |
| **Uses Rspack** | ✅ Internally (via Re.Pack) | ✅ Internally (via Re.Pack) |

### Why Mobile Remote Uses `rspack` CLI

1. **Not a React Native App**: Mobile remotes don't have `react-native.config.js`, so they can't use `react-native start`
2. **Re.Pack Config**: The config file uses Re.Pack plugins (`Repack.RepackPlugin`, `Repack.plugins.ModuleFederationPluginV2`)
3. **Re.Pack Uses Rspack**: Re.Pack 5.x uses Rspack internally, so using `rspack` CLI with Re.Pack config is the correct approach
4. **Consistent**: Same approach for both Android and iOS

---

## Configuration Files

### Mobile Host Config (`rspack.config.mjs`)
```javascript
import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';  // Re.Pack uses Rspack internally

export default {
  // ... config
  plugins: [
    new Repack.RepackPlugin({ ... }),  // Re.Pack plugin
    new Repack.plugins.ModuleFederationPluginV2({ ... }),  // Re.Pack MFv2 plugin
  ],
};
```

**Note:** Even though we import `rspack` and the file is named `rspack.config.mjs`, this is a **Re.Pack configuration** that uses Rspack internally.

### Mobile Remote Config (`repack.remote.config.mjs`)
```javascript
import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';  // Re.Pack uses Rspack internally

export default {
  // ... config
  plugins: [
    new Repack.RepackPlugin({ ... }),  // Re.Pack plugin
    new Repack.plugins.ModuleFederationPluginV2({ ... }),  // Re.Pack MFv2 plugin
  ],
};
```

**Note:** Same structure - Re.Pack config using Re.Pack plugins, but accessed via `rspack` CLI since it's not a React Native app.

---

## Verification

### ✅ Android Mobile Remote
- Uses: `rspack build --config ./repack.remote.config.mjs`
- Config uses: Re.Pack plugins
- Status: ✅ Correct

### ✅ iOS Mobile Remote
- Uses: `rspack build --config ./repack.remote.config.mjs`
- Config uses: Re.Pack plugins
- Status: ✅ Correct (same as Android)

### ✅ Android Mobile Host
- Uses: `react-native start --platform android`
- Config uses: Re.Pack via `react-native.config.js`
- Status: ✅ Correct

### ✅ iOS Mobile Host
- Uses: `react-native start --platform ios`
- Config uses: Re.Pack via `react-native.config.js`
- Status: ✅ Correct (same as Android)

---

## Conclusion

**The current implementation is correct and consistent:**

1. ✅ **Mobile Hosts** (Android & iOS): Use `react-native start` → Re.Pack via React Native CLI
2. ✅ **Mobile Remotes** (Android & iOS): Use `rspack build/serve` → Re.Pack config with Re.Pack plugins
3. ✅ **Web**: Use `rspack build/serve` directly

**Key Insight:** 
- Re.Pack 5.x uses Rspack internally
- Mobile hosts use Re.Pack via React Native CLI (they're React Native apps)
- Mobile remotes use Rspack CLI with Re.Pack config (they're not React Native apps, but use Re.Pack plugins)
- Both approaches are correct and use Re.Pack

**No changes needed** - the implementation follows the correct architecture.

---

**Document Version:** 1.0  
**Last Updated:** 2026
