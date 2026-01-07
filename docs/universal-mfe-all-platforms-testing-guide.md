# All Platforms Testing Guide

Quick reference for running and testing Web, Android, and iOS platforms.

---

## Port Reference

| Service | Port | Notes |
|---------|------|-------|
| Web Shell | 9001 | Host |
| Web Remote | 9003 | Remote |
| Web Remote (standalone) | 9003 | Uses `standalone.tsx` entry |
| Mobile Host (Android) | 8081 | Metro bundler |
| Mobile Host (iOS) | 8082 | Metro bundler (separate from Android) |
| Mobile Remote (Android) | 9004 | Serves MF container from `dist/android/` |
| Mobile Remote (iOS) | 9005 | Serves MF container from `dist/ios/` |
| **Mobile Remote Standalone (Android)** | 8083 | Independent app bundler |
| **Mobile Remote Standalone (iOS)** | 8084 | Independent app bundler |

**Note:** Android and iOS remote builds output to separate directories (`dist/android/`, `dist/ios/`) so both platforms can run simultaneously without interference.

---

## Quick Start

### Kill All Servers

```bash
lsof -ti:9001,9003,9004,9005,8081,8082,8083,8084 | xargs kill -9 2>/dev/null
```

### Build Shared Libraries (Required First)

```bash
yarn build:shared
```

### Turborepo Commands

All commands use Turborepo for caching. Second runs show "FULL TURBO" (instant).

```bash
yarn build           # Build all packages
yarn build:shared    # Build shared packages only
yarn build:web       # Build web packages only
yarn typecheck       # Type check all packages
yarn lint            # Run ESLint
yarn lint:architecture  # Check architecture rules
yarn test            # Run tests
yarn clean           # Clean all build outputs
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
# Kill all servers (including standalone)
lsof -ti:9001,9003,9004,9005,8081,8082,8083,8084 | xargs kill -9 2>/dev/null

# Clean everything
yarn workspace @universal/mobile-host clean
yarn workspace @universal/mobile-remote-hello clean

# Rebuild shared libraries
yarn build:shared

# Rebuild remote bundles for both platforms
cd packages/mobile-remote-hello
PLATFORM=android yarn build:remote
PLATFORM=ios yarn build:remote
```

---

## Standalone Remote Apps ("Super App" Mode)

The mobile remote can also run as an **independent standalone application** - useful for developing the remote module in isolation or demonstrating the "super app" concept where remotes are deployable as their own apps.

**Key Configuration:**
- Android uses `SharedPreferences` to override the dev server port from 8081 to 8083 (see `MainApplication.kt`)
- iOS uses `bundleURL()` override in `AppDelegate.swift` to point to port 8084
- Both platforms can run simultaneously on different emulators/simulators without port conflicts

### Android Standalone Remote

**Terminals needed:** 1

#### Start Standalone Bundler

```bash
# Terminal 1: Standalone bundler (port 8083)
yarn workspace @universal/mobile-remote-hello start:bundler:android
```

#### Verify Bundler

```bash
curl -s http://localhost:8083/status  # Should return: packager-status:running
curl -s -I http://localhost:8083/index.bundle?platform=android | head -1  # 200 OK
```

#### Build & Run Standalone App

```bash
# Ensure emulator is running
adb devices

# Set up port forwarding (required for emulator to reach localhost)
adb reverse tcp:8083 tcp:8083

# Build and install
cd packages/mobile-remote-hello/android
./gradlew installDebug

# Launch the app
adb shell am start -n com.mobileremotehello/.MainActivity
```

#### Test

1. App launches showing the HelloRemote component directly
2. Verify counter button works
3. Same content as when loaded via Module Federation in mobile-host

---

### iOS Standalone Remote

**Terminals needed:** 1

#### Start Standalone Bundler

```bash
# Terminal 1: Standalone bundler (port 8084)
yarn workspace @universal/mobile-remote-hello start:bundler:ios
```

#### Verify Bundler

```bash
curl -s http://localhost:8084/status  # Should return: packager-status:running
curl -s -I http://localhost:8084/index.bundle?platform=ios | head -1  # 200 OK
```

#### Build & Run Standalone App

```bash
# Ensure simulator is running
xcrun simctl list devices | grep "Booted"

# Install pods (if needed)
cd packages/mobile-remote-hello/ios && pod install && cd ../../..

# Build for simulator
cd packages/mobile-remote-hello/ios
xcodebuild -workspace MobileRemoteHello.xcworkspace \
  -scheme MobileRemoteHello \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \
  -derivedDataPath build \
  build

# Install and launch
xcrun simctl install booted build/Build/Products/Debug-iphonesimulator/MobileRemoteHello.app
xcrun simctl launch booted com.universal.mobileremote
```

#### Test

1. App launches showing the HelloRemote component directly
2. Verify counter button works
3. Same content as when loaded via Module Federation in mobile-host

---

### Running Host and Standalone Remote Simultaneously

You can run both the host app AND the standalone remote app at the same time on different emulators/simulators to demonstrate the "super app" concept.

#### Android: Host + Standalone Remote

**Requirements:** Two Android emulators

```bash
# Start first emulator for host
emulator -avd Pixel_8_API_35 &

# Start second emulator for standalone remote
emulator -avd Pixel_8_API_35_2 &

# Wait for both to boot
adb devices  # Should show two devices
```

**Terminal 1:** Host bundler + remote server
```bash
# Build and serve remote for host consumption
cd packages/mobile-remote-hello
PLATFORM=android yarn build:remote
yarn serve:android  # Port 9004

# In another terminal
yarn workspace @universal/mobile-host start:bundler:android  # Port 8081
```

**Terminal 2:** Standalone bundler
```bash
yarn workspace @universal/mobile-remote-hello start:bundler:android  # Port 8083
```

**Deploy apps:**
```bash
# Get device IDs
adb devices
# Example output:
# emulator-5554  device
# emulator-5556  device

# Set up port forwarding for both
adb -s emulator-5554 reverse tcp:8081 tcp:8081  # Host bundler
adb -s emulator-5554 reverse tcp:9004 tcp:9004  # Remote server
adb -s emulator-5556 reverse tcp:8083 tcp:8083  # Standalone bundler

# Install host on first emulator
cd packages/mobile-host/android
./gradlew installDebug
adb -s emulator-5554 shell am start -n com.mobilehosttmp/.MainActivity

# Install standalone remote on second emulator
cd packages/mobile-remote-hello/android
./gradlew installDebug
adb -s emulator-5556 shell am start -n com.mobileremotehello/.MainActivity
```

#### iOS: Host + Standalone Remote

**Requirements:** Two iOS simulators

```bash
# Boot two simulators
xcrun simctl boot "iPhone 16 Pro"
xcrun simctl boot "iPhone 16"

# List booted simulators
xcrun simctl list devices | grep "Booted"
```

**Terminal 1:** Host bundler + remote server
```bash
# Build and serve remote for host consumption
cd packages/mobile-remote-hello
PLATFORM=ios yarn build:remote
yarn serve:ios  # Port 9005

# In another terminal
yarn workspace @universal/mobile-host start:bundler:ios  # Port 8082
```

**Terminal 2:** Standalone bundler
```bash
yarn workspace @universal/mobile-remote-hello start:bundler:ios  # Port 8084
```

**Deploy apps:**
```bash
# Install host on first simulator
cd packages/mobile-host/ios
xcodebuild -workspace MobileHostTmp.xcworkspace \
  -scheme MobileHostTmp \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \
  -derivedDataPath build \
  build
xcrun simctl install "iPhone 16 Pro" build/Build/Products/Debug-iphonesimulator/MobileHostTmp.app
xcrun simctl launch "iPhone 16 Pro" com.universal.mobilehost

# Install standalone remote on second simulator
cd packages/mobile-remote-hello/ios
xcodebuild -workspace MobileRemoteHello.xcworkspace \
  -scheme MobileRemoteHello \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -derivedDataPath build \
  build
xcrun simctl install "iPhone 16" build/Build/Products/Debug-iphonesimulator/MobileRemoteHello.app
xcrun simctl launch "iPhone 16" com.universal.mobileremote
```

---

### Standalone Troubleshooting

#### App Shows Red Error Screen Mentioning Wrong Port

The standalone app should connect to port 8083 (Android) or 8084 (iOS), not 8081/8082.

```bash
# Verify the standalone bundler is running on correct port
curl http://localhost:8083/status  # Android
curl http://localhost:8084/status  # iOS
```

If the bundler responds but the app still fails, ensure `adb reverse` is set up:
```bash
adb reverse tcp:8083 tcp:8083
```

#### "MobileRemoteHello" has not been registered

The app is loading a bundle from the wrong server. Check:
1. Standalone bundler is running on correct port (8083/8084)
2. Port forwarding is set up (`adb reverse`)
3. No other Metro/bundler process is running on port 8081

#### Build Fails with Missing Dependencies

Run the symlinks setup script:
```bash
cd packages/mobile-remote-hello
node scripts/setup-symlinks.js
```

---

## Cleanup

```bash
# Kill all servers including standalone
lsof -ti:9001,9003,9004,9005,8081,8082,8083,8084 | xargs kill -9 2>/dev/null
```
