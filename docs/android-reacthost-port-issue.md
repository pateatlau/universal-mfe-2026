# Android ReactHost Port 8081 Issue

## Problem

React Native 0.80's new architecture uses `ReactHost` which **hardcodes port 8081** as the default dev server port. This conflicts with our setup where:
- Android host bundler runs on **port 8080**
- iOS host bundler runs on **port 8081**

The `getJSBundleFile()` override in `ReactNativeHost` only works for the old architecture, not for `ReactHost` (new architecture).

## Current Status

- ✅ `getJSBundleFile()` override is in place for `ReactNativeHost` (old architecture fallback)
- ❌ `ReactHost` (new architecture) ignores this and uses port 8081 by default
- ❌ Cannot easily extend `DefaultReactHost` (it's an object, not a class)

## Attempted Solutions

1. **Override `getJSBundleFile()` in `ReactNativeHost`** - ✅ Works for old architecture, ❌ Ignored by `ReactHost`
2. **Extend `DefaultReactHost`** - ❌ Cannot extend an object
3. **System property `react_native_dev_server_port`** - ⚠️ Unknown if React Native reads this
4. **Custom `ReactHost` implementation** - ⚠️ Complex, requires implementing full interface

## Possible Workarounds

### Option 1: Run Android Bundler on Port 8081 (Simplest)

Change Android bundler to use port 8081 to match React Native's default:

**Pros:**
- Simple, no code changes needed
- Works immediately

**Cons:**
- Cannot run Android and iOS host bundlers simultaneously
- Defeats the purpose of port separation

### Option 2: Disable New Architecture (Temporary)

Set `newArchEnabled=false` in `gradle.properties`:

**Pros:**
- `getJSBundleFile()` override will work
- Can use port 8080 for Android

**Cons:**
- Loses new architecture benefits
- Not a long-term solution

### Option 3: Create Custom ReactHost (Complex)

Implement a custom `ReactHost` that overrides the source URL:

**Pros:**
- Full control over bundle URL
- Works with new architecture

**Cons:**
- Complex implementation
- Requires maintaining custom code
- May break with React Native updates

### Option 4: Use adb reverse for Port 8081

Forward port 8081 from emulator to host's port 8080:

```bash
adb reverse tcp:8081 tcp:8080
```

**Pros:**
- No code changes
- Works with ReactHost's default port 8081

**Cons:**
- Requires manual setup
- Port forwarding can be unreliable

## Recommended Solution

**Use Option 4 (adb reverse) + Option 1 (run bundler on 8081 for now):**

1. Run Android bundler on port 8081 (matching React Native default)
2. Use `adb reverse tcp:8081 tcp:8081` if needed
3. Document this limitation
4. Consider implementing Option 3 (custom ReactHost) if port separation is critical

## Next Steps

1. Test if `adb reverse tcp:8081 tcp:8080` works (forward emulator's 8081 to host's 8080)
2. If not, temporarily run Android bundler on 8081
3. File an issue with React Native or Re.Pack about this limitation
4. Consider implementing custom ReactHost if needed

**Last Updated:** 2026-01-XX

