# Android Port Forwarding Explanation

## Why Port Forwarding is Needed

### The Problem

1. **Android bundler runs on port 8080** (configured in `package.json`)
2. **React Native 0.80's ReactHost (new architecture) hardcodes port 8081** as the default
3. **ReactHost ignores `getJSBundleFile()` override** from `ReactNativeHost`
4. **Result:** ReactHost tries to connect to `localhost:8081`, but bundler is on `localhost:8080`

### Why 8081→8080 Port Forwarding?

ReactHost constructs its own bundle URL using `localhost:8081` (hardcoded). Since our bundler runs on port 8080, we need to forward the emulator's port 8081 to the host's port 8080:

```bash
adb reverse tcp:8081 tcp:8080
```

This means: "When the emulator tries to connect to `localhost:8081`, forward it to the host's `localhost:8080`"

### Why Not 8080→8080?

If we used `adb reverse tcp:8080 tcp:8080`, ReactHost would still try to connect to port 8081 (its hardcoded default), which wouldn't be forwarded, causing a 404 error.

## Why This Wasn't Needed Before iOS

Before iOS implementation:
- Android was likely using the old architecture (ReactNativeHost), which respects `getJSBundleFile()` override
- The override uses `10.0.2.2:8080`, which works without port forwarding
- New architecture (ReactHost) was either not enabled or not being used

## Current Status

- ✅ **ReactNativeHost (old architecture):** Uses `10.0.2.2:8080` from `getJSBundleFile()` - **No port forwarding needed**
- ❌ **ReactHost (new architecture):** Ignores `getJSBundleFile()` and uses `localhost:8081` - **Requires port forwarding 8081→8080**

## Solutions

### Option 1: Keep Port Forwarding (Current)

**Pros:**
- Works with new architecture
- No code changes needed

**Cons:**
- Confusing (8081→8080 mapping)
- Requires manual setup
- Must be re-run if emulator restarts

### Option 2: Disable New Architecture (Temporary)

Set `newArchEnabled=false` in `gradle.properties`:

**Pros:**
- `getJSBundleFile()` override will work
- No port forwarding needed
- Uses `10.0.2.2:8080` directly

**Cons:**
- Loses new architecture benefits
- Not a long-term solution

### Option 3: Run Android Bundler on Port 8081

Change Android bundler to use port 8081:

**Pros:**
- No port forwarding needed
- Matches ReactHost's default

**Cons:**
- Cannot run Android and iOS host bundlers simultaneously (both would use 8081)
- Defeats the purpose of port separation

### Option 4: Create Custom ReactHost (Complex)

Implement a full custom ReactHost that respects the bundle URL from ReactNativeHost.

**Pros:**
- Full control
- No port forwarding needed
- Works with new architecture

**Cons:**
- Complex implementation
- Requires maintaining custom code
- May break with React Native updates

## Recommendation

**For now:** Keep using port forwarding `adb reverse tcp:8081 tcp:8080` because:
1. It works with the new architecture
2. Allows simultaneous Android and iOS testing
3. No code changes needed

**Future:** Consider Option 4 (custom ReactHost) if port forwarding becomes a maintenance burden, or wait for React Native to provide a way to configure ReactHost's default port.

## Port Forwarding Commands

```bash
# Required: Forward ReactHost's port 8081 to bundler's port 8080
adb reverse tcp:8081 tcp:8080

# Optional: Forward remote bundler port (for direct access)
adb reverse tcp:9004 tcp:9004

# Verify
adb reverse --list
```

**Last Updated:** 2026-01-XX

