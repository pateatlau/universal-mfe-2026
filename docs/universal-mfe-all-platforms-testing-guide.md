# All Platforms Testing Guide

Quick reference for running and testing Web, Android, and iOS platforms.

---

## Port Reference

| Service | Port | Notes |
|---------|------|-------|
| Web Shell | 9001 | Host |
| Web Remote | 9003 | Remote |
| Mobile Host (Android) | 8081 | Metro bundler |
| Mobile Host (iOS) | 8082 | Metro bundler (separate from Android) |
| Mobile Remote (Android) | 9004 | Serves from `dist/android/` |
| Mobile Remote (iOS) | 9005 | Serves from `dist/ios/` |

**Note:** Android and iOS remote builds output to separate directories (`dist/android/`, `dist/ios/`) so both platforms can run simultaneously without interference.

---

## Quick Start

### Kill All Servers

```bash
lsof -ti:9001,9003,9004,9005,8081,8082 | xargs kill -9 2>/dev/null
```

### Build Shared Libraries (Required First)

```bash
yarn build:shared
```

---

## Web Platform

**Terminals needed:** 2

### Start Servers

```bash
# Terminal 1: Web Remote (port 9003)
yarn workspace @universal/web-remote-hello dev

# Terminal 2: Web Shell (port 9001)
yarn workspace @universal/web-shell dev
```

### Verify

```bash
curl -s -I http://localhost:9003/remoteEntry.js | head -1  # 200 OK
curl -s -I http://localhost:9001 | head -1                  # 200 OK
```

### Test

1. Open http://localhost:9001
2. Click "Load Remote Component"
3. Verify remote component loads and button works

---

## Android Platform

**Terminals needed:** 2

### Start Servers

```bash
# Terminal 1: Build and serve Android remote (port 9004)
cd packages/mobile-remote-hello
PLATFORM=android yarn build:remote
yarn serve:android  # Auto-kills stale process on port 9004

# Terminal 2: Android host bundler (port 8081)
yarn workspace @universal/mobile-host start:bundler:android  # Auto-kills stale process
```

### Verify Servers

```bash
curl -s -I http://localhost:9004/HelloRemote.container.js.bundle | head -1  # 200 OK
curl -s -I http://localhost:8081/index.bundle?platform=android | head -1    # 200 OK
```

### Build & Run App

```bash
# Ensure emulator is running
adb devices

# Build, install, and launch (waits for bundler to be ready)
yarn workspace @universal/mobile-host android
```

**Note:** The `android` script automatically starts the Metro bundler, waits for it to be ready, then builds and launches the app.

### Test

1. App launches automatically
2. Tap "Load Remote Component"
3. Verify remote component loads and button works

---

## iOS Platform

**Terminals needed:** 2

### Start Servers

```bash
# Terminal 1: Build and serve iOS remote (port 9005)
cd packages/mobile-remote-hello
PLATFORM=ios yarn build:remote
yarn serve:ios  # Auto-kills stale process on port 9005

# Terminal 2: iOS host bundler (port 8082)
yarn workspace @universal/mobile-host start:bundler:ios  # Auto-kills stale process
```

### Verify Servers

```bash
curl -s -I http://localhost:9005/HelloRemote.container.js.bundle | head -1  # 200 OK
curl -s -I http://localhost:8082/index.bundle?platform=ios | head -1        # 200 OK
```

### Build & Run App

```bash
# Ensure simulator is running
xcrun simctl list devices | grep "Booted"

# Install pods (if needed)
cd packages/mobile-host/ios && pod install && cd ../../..

# Build, install, and launch (waits for bundler to be ready)
yarn workspace @universal/mobile-host ios
```

**Note:** The `ios` script automatically starts the Metro bundler, waits for it to be ready, then builds and launches the app.

### Test

1. App launches automatically
2. Tap "Load Remote Component"
3. Verify remote component loads and button works

---

## Running Both Mobile Platforms Simultaneously

Android and iOS can run at the same time since they use separate ports and output directories.

### Build Both Remotes First

```bash
cd packages/mobile-remote-hello
PLATFORM=android yarn build:remote
PLATFORM=ios yarn build:remote
```

This creates:
- `dist/android/` - Android bundles
- `dist/ios/` - iOS bundles

### Start All Servers (4 terminals)

```bash
# Terminal 1: Android remote (port 9004) - auto-kills stale process
cd packages/mobile-remote-hello
yarn serve:android

# Terminal 2: iOS remote (port 9005) - auto-kills stale process
cd packages/mobile-remote-hello
yarn serve:ios

# Terminal 3: Android Metro (port 8081) - auto-kills stale process
yarn workspace @universal/mobile-host start:bundler:android

# Terminal 4: iOS Metro (port 8082) - auto-kills stale process
yarn workspace @universal/mobile-host start:bundler:ios
```

**Note:** All start scripts now automatically kill any existing process on the target port before starting, preventing stale server issues.

### Launch Apps

```bash
# Android (in separate terminal)
cd packages/mobile-host/android && ./gradlew installDebug && adb shell am start -n com.mobilehosttmp/.MainActivity

# iOS (in separate terminal)
xcrun simctl launch booted com.universal.mobilehost
```

---

## Success Criteria

| Platform | What to Check |
|----------|---------------|
| Web | Shell loads, remote component appears, button increments counter |
| Android | App launches, remote loads, button works |
| iOS | App launches, remote loads, button works |

---

## Troubleshooting

### App Shows Red Error Screen

| Platform | Check |
|----------|-------|
| Android | Verify bundler on port 8081: `curl http://localhost:8081/index.bundle?platform=android` |
| iOS | Verify bundler on port 8082: `curl http://localhost:8082/index.bundle?platform=ios` |

### Remote Won't Load

1. Check remote server is running on correct port
2. Verify the correct platform bundle exists:
   - Android: `curl -I http://localhost:9004/HelloRemote.container.js.bundle`
   - iOS: `curl -I http://localhost:9005/HelloRemote.container.js.bundle`
3. Android uses `10.0.2.2` internally to reach host machine
4. iOS uses `localhost` directly

### Port Already in Use

```bash
lsof -i:PORT_NUMBER        # Find process
kill -9 $(lsof -ti:PORT)   # Kill it
```

### Android Emulator Not Detected

```bash
adb devices                 # Check connection
adb kill-server && adb start-server  # Restart ADB
```

### Android Build Fails with Path Errors

```bash
# Clear stale caches
yarn workspace @universal/mobile-host clean:android
```

### iOS Build Fails with "file not found" Errors

```bash
# Recreate symlinks for hoisted dependencies
cd packages/mobile-host
node scripts/setup-symlinks.js
```

### Fresh Start (Nuclear Option)

```bash
# Kill all servers
lsof -ti:9001,9003,9004,9005,8081,8082 | xargs kill -9 2>/dev/null

# Clean everything
yarn workspace @universal/mobile-host clean

# Rebuild shared libraries
yarn build:shared

# Rebuild remote bundles for both platforms
cd packages/mobile-remote-hello
PLATFORM=android yarn build:remote
PLATFORM=ios yarn build:remote
```

---

## Cleanup

```bash
lsof -ti:9001,9003,9004,9005,8081,8082 | xargs kill -9 2>/dev/null
```
