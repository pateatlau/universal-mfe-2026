# ADR-012: PatchMFConsolePlugin Workaround

**Status**: Accepted
**Date**: 2026-01
**Decision Makers**: Platform Architecture Team

## Context

Module Federation v2 with Hermes on React Native has a critical initialization order issue:

### The Problem

1. **Bundle execution starts**: JavaScript begins executing
2. **Webpack runtime loads**: MF v2's webpack runtime initializes
3. **Console calls made**: Webpack runtime calls `console.warn()` / `console.error()`
4. **CRASH**: `ReferenceError: Property 'console' doesn't exist`

### Why This Happens

- Hermes doesn't provide `console` as a global by default
- React Native's `InitializeCore.js` sets up `console`, `Platform`, etc.
- But `InitializeCore` runs AFTER the bundle's webpack runtime
- In development mode, Metro ensures correct load order
- In release builds with MF v2, webpack runtime executes first

### Scope

This affects **release builds only**:
- Development builds: Metro handles ordering correctly
- Release builds: Hermes executes bundle immediately
- Both Android and iOS affected

## Decision

**Implement PatchMFConsolePlugin** - a custom Rspack plugin that prepends polyfills before webpack runtime code.

Location: `packages/mobile-host/scripts/PatchMFConsolePlugin.mjs`

### What It Does

1. Hooks into Rspack's `afterProcessAssets` stage
2. Finds the main bundle asset
3. Prepends console and Platform polyfills
4. Polyfills are immediately available when bundle executes

### Polyfill Code

```javascript
// Console polyfill
var console = console || {
  log: function() {},
  info: function() {},
  warn: function() {},
  error: function() {},
  debug: function() {},
  trace: function() {},
  assert: function() {},
  // ... other methods
};

// Platform polyfill
var Platform = Platform || {
  OS: '${platform}',  // 'android' or 'ios'
  constants: {},
  select: function(obj) {
    return obj['${platform}'] || obj.default;
  },
};
```

### Configuration

**Requires PLATFORM environment variable**:

```bash
# Build commands MUST specify platform
PLATFORM=android yarn build:release
PLATFORM=ios yarn build:release
```

```javascript
// rspack.config.mjs
import { PatchMFConsolePlugin } from './scripts/PatchMFConsolePlugin.mjs';

export default {
  plugins: [
    new PatchMFConsolePlugin({
      platform: process.env.PLATFORM, // Required!
    }),
  ],
};
```

## Consequences

### Positive

1. **Release builds work**: MF v2 + Hermes combination is viable
2. **No app changes**: Fix is in build tooling, not runtime code
3. **Minimal overhead**: Polyfill is tiny (~500 bytes)
4. **Platform-aware**: Generates correct Platform.OS value

### Negative

1. **Fragile**: Depends on React Native/Hermes internals
2. **Maintenance burden**: May break on RN upgrades
3. **Build complexity**: Additional plugin to maintain
4. **CI requirements**: PLATFORM env var must be set

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RN upgrade breaks plugin | Medium | High | Pin RN version; test upgrades thoroughly |
| Polyfill conflicts with real console | Low | Medium | Polyfill checks for existing console |
| PLATFORM env var forgotten | Medium | High | CI enforces; build fails with clear error |
| Plugin logic changes in Rspack | Low | Medium | Pin Rspack version; monitor changelog |

## Alternatives Considered

### Alternative 1: Wait for Upstream Fix

**Description**: Wait for Module Federation or Re.Pack to fix this.

**Rejected because**:
- No fix on roadmap
- Unclear ownership (MF vs Re.Pack vs Hermes)
- Blocks all production mobile development
- Could wait indefinitely

### Alternative 2: Avoid Module Federation

**Description**: Use different code splitting approach.

**Rejected because**:
- MF is core architecture requirement
- No viable alternative for runtime remote loading
- Would require complete architecture redesign

### Alternative 3: Custom InitializeCore

**Description**: Modify React Native's InitializeCore to load earlier.

**Rejected because**:
- Requires forking React Native
- Maintenance nightmare
- Upgrade path becomes complex
- Plugin approach is less invasive

### Alternative 4: Babel Transform

**Description**: Transform console calls in MF runtime to safe versions.

**Rejected because**:
- Complex AST transformations
- Must track all console call sites
- Breaks if MF changes internal code
- Plugin approach is simpler

## Production Readiness

### Stability Assessment: Medium

The workaround is:
- ✅ Tested in production-like builds
- ✅ Works on both platforms
- ⚠️ Depends on RN internals
- ⚠️ Must be validated on RN upgrades

### Recommended Safeguards

1. **Pin versions exactly**: RN, Hermes, Re.Pack
2. **CI validation**: Always run release builds in CI
3. **Crash monitoring**: Add Sentry/Crashlytics early
4. **Smoke tests**: Automated release build verification
5. **Document clearly**: Team must understand the workaround

## CI Configuration

```yaml
# .github/workflows/deploy-android.yml
- name: Build Release APK
  run: |
    cd packages/mobile-host
    PLATFORM=android NODE_ENV=production ./android/gradlew assembleRelease
  env:
    PLATFORM: android
```

## References

- [Full Plugin Guide](../PATCHMFCONSOLEPLUGIN-GUIDE.md)
- [Mobile Release Build Fixes](../MOBILE-RELEASE-BUILD-FIXES.md)
- [Hermes Engine](https://hermesengine.dev/)
- [Re.Pack GitHub Issues](https://github.com/callstack/repack/issues)
