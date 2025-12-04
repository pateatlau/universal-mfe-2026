# Module Federation Shared Packages Version Fix

**Date:** 2025-12-04  
**Issue:** Module Federation version mismatch warning for workspace packages  
**Status:** ✅ **FIXED**

---

## Problem

Module Federation was showing warnings:
```
[ Federation Runtime ] Version 0 from hello_remote of shared singleton module @universal/shared-utils does not satisfy the requirement of hello_remote which needs *)
```

## Root Cause

1. **Missing shared packages in host**: The `web-shell` (host) was not sharing `@universal/shared-utils` and `@universal/shared-hello-ui` in its Module Federation config, while the `web-remote-hello` (remote) was sharing them.

2. **Incorrect alias paths**: The alias was pointing to `dist` directory instead of package root, preventing Module Federation from reading `package.json` to determine the version.

3. **Version detection failure**: When using `import` with direct paths to `dist`, Module Federation couldn't read `package.json` and defaulted to version `0`.

## Solution

### 1. Add Shared Packages to Host Configuration

**File:** `packages/web-shell/rspack.config.mjs`

Added shared packages to the host's Module Federation config:

```javascript
shared: {
  // ... existing shared packages ...
  '@universal/shared-utils': {
    singleton: true,
    eager: true,
    requiredVersion: '0.1.0', // Match package.json version
  },
  '@universal/shared-hello-ui': {
    singleton: true,
    eager: true,
    requiredVersion: '0.1.0', // Match package.json version
  },
}
```

### 2. Fix Alias Paths to Point to Package Root

**Changed from:**
```javascript
alias: {
  '@universal/shared-utils': path.resolve(__dirname, '../shared-utils/dist'),
  '@universal/shared-hello-ui': path.resolve(__dirname, '../shared-hello-ui/dist'),
}
```

**Changed to:**
```javascript
alias: {
  '@universal/shared-utils': path.resolve(__dirname, '../shared-utils'),
  '@universal/shared-hello-ui': path.resolve(__dirname, '../shared-hello-ui'),
}
```

**Why:** Module Federation needs to read `package.json` to determine the version. By pointing to the package root, it can:
- Read `package.json` to get the version
- Resolve to `dist/index.js` via the `main` field in `package.json`

### 3. Set Explicit Required Version

Set `requiredVersion: '0.1.0'` to match the version in `package.json` files.

### 4. Remove `import` Property

Removed the `import` property from shared config to let Module Federation resolve via alias, which allows it to read `package.json`.

## Files Modified

1. `packages/web-shell/rspack.config.mjs`
   - Added shared packages to `shared` configuration
   - Changed alias paths to package root
   - Set `requiredVersion: '0.1.0'`

2. `packages/web-remote-hello/rspack.config.mjs`
   - Changed alias paths to package root
   - Set `requiredVersion: '0.1.0'`
   - Removed `import` property

## Key Learnings

1. **Host and remote must share the same packages**: If a remote shares a package, the host must also share it in its configuration.

2. **Alias should point to package root**: For Module Federation to read `package.json` and determine versions, aliases should point to the package root, not the `dist` directory.

3. **Version matching is critical**: Both host and remote must have matching `requiredVersion` values that match the actual package version in `package.json`.

4. **Early detection matters**: Addressing version warnings early prevents bigger issues as the codebase grows.

## Verification

- ✅ Builds successful for both packages
- ✅ No Module Federation warnings in browser console
- ✅ Shared packages load correctly
- ✅ Version matching works properly

---

## Best Practices for Workspace Packages in Module Federation

1. **Always share workspace packages in both host and remote**
2. **Point aliases to package root** (not `dist`) so Module Federation can read `package.json`
3. **Set explicit `requiredVersion`** matching the version in `package.json`
4. **Use `singleton: true`** for shared packages to ensure single instance
5. **Use `eager: true`** for critical shared packages to load them immediately

