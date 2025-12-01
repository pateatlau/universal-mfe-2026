# Android Bundle URL Fix - 404 Error Resolution

## Problem

Android emulator shows 404 error when trying to load the bundle from the development server, even though `http://localhost:8080/index.bundle?platform=android` is accessible.

**Root Cause:**
- React Native 0.80 uses `ReactHost` (new architecture) which may ignore `getJSBundleFile()` override
- The app was trying to use port 8081 (iOS port) instead of 8080 (Android port)
- React Native defaults to port 8081 if not explicitly configured

## Solution

### 1. Configure Port Forwarding (adb reverse)

Set up port forwarding so the emulator can access the host machine's localhost:

```bash
adb reverse tcp:8080 tcp:8080
```

This allows the emulator to use `localhost:8080` which forwards to the host's `localhost:8080`.

### 2. Override Bundle URL in MainApplication.kt

Override `getJSBundleFile()` in `MainApplication.kt` to use the correct port:

```kotlin
override fun getJSBundleFile(): String? {
  return if (BuildConfig.DEBUG) {
    // Use localhost:8080 with adb reverse port forwarding
    "http://localhost:8080/index.bundle?platform=android"
  } else {
    super.getJSBundleFile()
  }
}
```

### 3. Ensure Bundler is Running on Correct Port

Make sure the Android bundler is running on port 8080:

```bash
PLATFORM=android npx yarn workspace @universal/mobile-host start:bundler:android
```

This should start the bundler on port 8080 (configured in `package.json`).

## Alternative: Use 10.0.2.2 Directly

If `adb reverse` doesn't work, you can use `10.0.2.2` directly (Android emulator's special IP for host machine):

```kotlin
override fun getJSBundleFile(): String? {
  return if (BuildConfig.DEBUG) {
    "http://10.0.2.2:8080/index.bundle?platform=android"
  } else {
    super.getJSBundleFile()
  }
}
```

## Verification

1. **Check bundler is running:**
   ```bash
   lsof -i:8080 | grep LISTEN
   ```

2. **Test bundle accessibility:**
   ```bash
   curl http://localhost:8080/index.bundle?platform=android
   ```

3. **Check adb reverse:**
   ```bash
   adb reverse --list
   # Should show: host-16 tcp:8080 tcp:8080
   ```

4. **Check app logs:**
   ```bash
   adb logcat | grep -i "bundle\|404\|error"
   ```

## Current Implementation

**File:** `packages/mobile-host/android/app/src/main/java/com/mobilehosttmp/MainApplication.kt`

- Uses `localhost:8080` with `adb reverse` port forwarding
- Requires `adb reverse tcp:8080 tcp:8080` to be set up
- Includes `platform=android` query parameter (required by Re.Pack)

## Troubleshooting

### Still Getting 404?

1. **Verify bundler is running on port 8080:**
   ```bash
   lsof -i:8080
   ```

2. **Check if ReactHost is using a different mechanism:**
   - React Native 0.80's new architecture might need additional configuration
   - Check logs to see what URL the app is actually trying to use

3. **Try using 10.0.2.2 directly:**
   - Change bundle URL to `http://10.0.2.2:8080/index.bundle?platform=android`
   - This doesn't require `adb reverse`

4. **Restart everything:**
   - Kill bundler
   - Restart emulator
   - Re-run `adb reverse tcp:8080 tcp:8080`
   - Start bundler again
   - Rebuild and install app

## Notes

- Port 8080 is for Android host bundler
- Port 8081 is for iOS host bundler
- Port 9004 is for Android remote bundler
- Port 9005 is for iOS remote bundler

**Last Updated:** 2026-01-XX

