# All Platforms Testing Guide

Quick reference for running and testing Web, Android, and iOS platforms.

---

## Port Reference

| Service | Port | Notes |
|---------|------|-------|
| Web Shell | 9001 | Host |
| Web Remote | 9003 | Remote |
| Mobile Host (Android) | 8081 | |
| Mobile Host (iOS) | 8082 | Separate port from Android |
| Mobile Remote (Android) | 9004 | |
| Mobile Remote (iOS) | 9005 | |

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
PLATFORM=android yarn serve

# Terminal 2: Android host bundler (port 8081)
yarn workspace @universal/mobile-host start:bundler:android
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

# Build, install, and launch
yarn workspace @universal/mobile-host android
```

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
PLATFORM=ios yarn serve

# Terminal 2: iOS host bundler (port 8082)
yarn workspace @universal/mobile-host start:bundler:ios
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

# Build, install, and launch
yarn workspace @universal/mobile-host ios
```

### Test

1. App launches automatically
2. Tap "Load Remote Component"
3. Verify remote component loads and button works

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
2. Android uses `10.0.2.2` internally to reach host machine
3. iOS uses `localhost` directly

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

---

## Cleanup

```bash
lsof -ti:9001,9003,9004,9005,8081,8082 | xargs kill -9 2>/dev/null
```
