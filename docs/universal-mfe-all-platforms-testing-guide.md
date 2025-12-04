# All Platforms Testing Guide

**Purpose:** Test Web, Android, and iOS platforms with all remotes and hosts running. Note: Android and iOS host bundlers cannot run simultaneously (both use port 8081).

**Date:** 2026-01-XX  
**Status:** Complete Testing Guide

---

## Overview

This guide provides step-by-step instructions for testing the Universal MFE architecture:

1. **Unit Testing (Jest):** Run unit tests for all packages (web, mobile, shared) - See [Unit Testing (Jest)](#unit-testing-jest) section
2. **Integration/E2E Testing:** Run and test all three platforms simultaneously:
   - **Web**: Web shell (port 9001) + Web remote standalone (port 9003)
   - **Android**: Mobile host (port 8081) + Mobile remote (port 9004)
   - **iOS**: Mobile host (port 8081) + Mobile remote (port 9005)

---

## Unit Testing (Jest)

**Purpose:** Run unit tests for all packages (web, mobile, shared) using Jest.

**Framework:** Jest 29.7.0 (unified across all platforms)

**Test Coverage:**

- ✅ Shared utilities (`@universal/shared-utils`)
- ✅ Shared UI components (`@universal/shared-hello-ui`)
- ✅ Web shell (`@universal/web-shell`)
- ✅ Web remote (`@universal/web-remote-hello`)
- ✅ Mobile host (`@universal/mobile-host`)
- ✅ Mobile remote (`@universal/mobile-remote-hello`)

---

### Running All Tests from Root

**Run all tests for all packages:**

```bash
yarn test
```

**Expected output:**

```
> @universal/mobile-host
$ jest
PASS mobile-host src/App.test.tsx
  App
    ✓ should render mobile host title
    ✓ should render subtitle
    ✓ should render load button initially

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total

> @universal/mobile-remote-hello
$ jest
PASS mobile-remote-hello src/HelloRemote.test.tsx
  HelloRemote
    ✓ should render with provided name
    ✓ should render without name
    ✓ should pass onPress handler

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total

> @universal/shared-hello-ui
$ jest
PASS shared-hello-ui src/HelloUniversal.test.tsx
  HelloUniversal
    ✓ should render greeting with provided name
    ✓ should render default greeting when no name provided
    ✓ should render button when onPress provided
    ✓ should not render button when onPress not provided
    ✓ should call onPress when button is pressed

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total

> @universal/shared-utils
$ jest
PASS shared-utils src/index.test.ts
  shared-utils
    getGreeting
      ✓ should return greeting with provided name
      ✓ should return default greeting when no name provided
      ✓ should handle empty string
    formatMessage
      ✓ should format message with prefix
      ✓ should return message without prefix when prefix not provided
      ✓ should handle empty message

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total

> @universal/web-remote-hello
$ jest
PASS web-remote-hello src/HelloRemote.test.tsx
  HelloRemote
    ✓ should render with provided name
    ✓ should render without name
    ✓ should pass onPress handler

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total

> @universal/web-shell
$ jest
PASS web-shell src/App.test.tsx
  App
    ✓ should render web shell title
    ✓ should render subtitle
    ✓ should render remote component

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total

Done in 8.21s.
```

**✅ Success Criteria:**

- All 6 test suites pass
- All 23 tests pass
- No errors or warnings

---

### Running Tests in Watch Mode

**Run all tests in watch mode (auto-rerun on file changes):**

```bash
yarn test:watch
```

**Note:** Watch mode runs tests for all packages. For faster feedback, run watch mode for a specific package (see below).

---

### Running Tests with Coverage

**Generate coverage reports for all packages:**

```bash
yarn test:coverage
```

**Coverage reports are generated in:**

- `packages/<package-name>/coverage/` - HTML reports
- `packages/<package-name>/coverage/lcov-report/index.html` - View in browser

---

### Running Tests for Specific Packages

#### Web Packages

**Web Shell:**

```bash
yarn workspace @universal/web-shell test
```

**Web Remote:**

```bash
yarn workspace @universal/web-remote-hello test
```

**Web packages in watch mode:**

```bash
# Web Shell
yarn workspace @universal/web-shell test:watch

# Web Remote
yarn workspace @universal/web-remote-hello test:watch
```

#### Mobile Packages

**Mobile Host:**

```bash
yarn workspace @universal/mobile-host test
```

**Mobile Remote:**

```bash
yarn workspace @universal/mobile-remote-hello test
```

**Mobile packages in watch mode:**

```bash
# Mobile Host
yarn workspace @universal/mobile-host test:watch

# Mobile Remote
yarn workspace @universal/mobile-remote-hello test:watch
```

#### Shared Packages

**Shared Utils:**

```bash
yarn workspace @universal/shared-utils test
```

**Shared Hello UI:**

```bash
yarn workspace @universal/shared-hello-ui test
```

**Shared packages in watch mode:**

```bash
# Shared Utils
yarn workspace @universal/shared-utils test:watch

# Shared Hello UI
yarn workspace @universal/shared-hello-ui test:watch
```

---

### Running Tests from Package Directory

**You can also run tests directly from each package directory (though using `yarn workspace` from root is recommended):**

```bash
# From package directory (e.g., packages/web-shell)
yarn test
yarn test:watch
yarn test:coverage
```

**Note:** All commands in this guide assume execution from the project root. Use `yarn workspace @universal/<package-name> <command>` from root instead of navigating to package directories.

**Available commands in each package:**

- `yarn test` - Run tests once
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage report

---

### Test File Locations

**Test files follow naming convention:**

- `*.test.ts` - TypeScript utility tests
- `*.test.tsx` - React/React Native component tests

**Test files:**

- `packages/shared-utils/src/index.test.ts`
- `packages/shared-hello-ui/src/HelloUniversal.test.tsx`
- `packages/web-shell/src/App.test.tsx`
- `packages/web-remote-hello/src/HelloRemote.test.tsx`
- `packages/mobile-host/src/App.test.tsx`
- `packages/mobile-remote-hello/src/HelloRemote.test.tsx`

---

### Platform-Specific Test Information

#### Web Platform Tests

**Test Environment:** `jsdom` (browser-like environment)

**Testing Libraries:**

- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/dom` - DOM utilities

**Special Features:**

- Module Federation remotes are mocked for testing
- React Native Web components tested in browser-like environment

**Example:**

```bash
# Run web shell tests
yarn workspace @universal/web-shell test
```

#### Mobile Platform Tests

**Test Environment:** `jsdom` (with React Native mocks)

**Testing Libraries:**

- `@testing-library/react` - React component testing (using React Native mocks)
- `@testing-library/jest-dom` - DOM matchers
- `react-test-renderer` - React Native component rendering

**Special Features:**

- React Native components mocked with DOM equivalents
- Re.Pack/ScriptManager mocked for testing
- Module Federation remotes mocked for testing

**Example:**

```bash
# Run mobile host tests
yarn workspace @universal/mobile-host test
```

#### Shared Package Tests

**Shared Utils:**

- **Test Environment:** `node` (pure TypeScript, no DOM/React)
- **Testing Libraries:** Jest only (no React testing libraries)

**Shared Hello UI:**

- **Test Environment:** `jsdom` (React Native components mocked)
- **Testing Libraries:** `@testing-library/react`, `react-test-renderer`

**Example:**

```bash
# Run shared utils tests
yarn workspace @universal/shared-utils test

# Run shared UI tests
yarn workspace @universal/shared-hello-ui test
```

---

### Troubleshooting Unit Tests

#### Tests Not Found

**Issue:** Jest reports "No tests found"

**Solution:**

1. Verify test files follow naming convention: `*.test.ts` or `*.test.tsx`
2. Check test files are in `src/` directory
3. Verify `jest.config.js` exists in package directory
4. Check `testMatch` pattern in `jest.config.base.js`

#### TypeScript Errors

**Issue:** TypeScript compilation errors in tests

**Solution:**

1. Verify `tsconfig.json` exists in package directory
2. Check `tsconfig.json` extends root config
3. Ensure `@types/jest` is installed: `yarn workspace <package> add -D @types/jest`
4. Run TypeScript check: `yarn workspace <package> tsc --noEmit`

#### Module Resolution Errors

**Issue:** Cannot find module `@universal/*` or other imports

**Solution:**

1. Verify `moduleNameMapper` in `jest.config.js` includes `@universal/*` mapping
2. Check package dependencies are installed: `yarn install`
3. Verify workspace dependencies in `package.json`

#### React Native Mock Errors

**Issue:** Errors related to React Native imports in tests

**Solution:**

1. Verify mock files exist: `packages/<package>/src/__mocks__/react-native.tsx`
2. Check `moduleNameMapper` in `jest.config.js` maps `react-native` to mock
3. Ensure `transformIgnorePatterns` is configured correctly

#### Module Federation Remote Errors

**Issue:** Cannot find Module Federation remote in tests

**Solution:**

1. Verify mock exists: `packages/web-shell/src/__mocks__/hello_remote.tsx`
2. Check `moduleNameMapper` in `jest.config.js` maps remote to mock
3. Verify type declaration exists: `packages/web-shell/src/types/hello_remote.d.ts`

---

### Quick Reference: Unit Test Commands

**All packages:**

```bash
# Run all tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:coverage
```

**Specific package:**

```bash
# Run tests
yarn workspace @universal/<package-name> test

# Watch mode
yarn workspace @universal/<package-name> test:watch

# Coverage
yarn workspace @universal/<package-name> test:coverage
```

**From package directory (not recommended - use `yarn workspace` from root instead):**

```bash
# Navigate to package directory first (e.g., packages/web-shell)
cd packages/<package-name>
yarn test
yarn test:watch
yarn test:coverage
```

**Note:** All commands in this guide assume execution from project root. Use `yarn workspace @universal/<package-name> <command>` from root instead of navigating to package directories.

---

## Prerequisites

**⚠️ Important:** All commands in this guide assume execution from the project root directory. Do not navigate to subdirectories unless explicitly mentioned.

1. ✅ All dependencies installed (`yarn install` from root)
2. ✅ Android emulator running
3. ✅ iOS Simulator running (iPhone 15)
4. ✅ Terminal access (you'll need **6 separate terminals**)

---

## Step 1: Kill All Running Servers

**Single command to kill everything:**

```bash
lsof -ti:9001,9003,9004,9005,8080,8081 | xargs kill -9 2>/dev/null; pkill -f "react-native start" 2>/dev/null; pkill -f "rspack serve" 2>/dev/null; echo "✅ All servers killed"
```

**Or with better formatting (same result):**

```bash
lsof -ti:9001,9003,9004,9005,8080,8081 | xargs kill -9 2>/dev/null && \
pkill -f "react-native start" 2>/dev/null && \
pkill -f "rspack serve" 2>/dev/null && \
echo "✅ All servers killed"
```

**Verify ports are free:**

```bash
lsof -i:9001,9003,9004,9005,8080,8081 | grep LISTEN
# Should return nothing if all ports are free
```

---

## Step 2: Start All Services and Test Each Platform

**You can test platforms independently or all together.** Each platform section below contains the complete flow from starting servers to testing.

---

## Section 1: Web Platform (Complete Flow)

**Terminals needed:** 2 terminals

### Terminal 1: Web Remote (Standalone Mode)

**Purpose:** Serve web remote on port 9003 for standalone testing

```bash
yarn workspace @universal/web-remote-hello dev
```

**Expected output:**

```
✓ Compiled successfully
  Local:   http://localhost:9003/
```

**✅ Verification:**

```bash
curl -I http://localhost:9003/remoteEntry.js
# Should return 200 OK
```

**Or open in browser:** http://localhost:9003/ — should show HelloRemote component

---

### Terminal 2: Web Shell (Host)

**Purpose:** Serve web shell on port 9001, consuming web remote

```bash
yarn workspace @universal/web-shell dev
```

**Expected output:**

```
✓ Compiled successfully
  Local:   http://localhost:9001/
```

**✅ Verification:**

```bash
curl -I http://localhost:9001/
# Should return 200 OK
```

**Or open in browser:** http://localhost:9001/ — should show web shell with remote loading

**✅ Web Testing Complete:** See Step 3 for detailed testing checklist.

---

## Section 2: iOS Platform (Complete Flow)

**Terminals needed:** 2 terminals

### Terminal 3: iOS Mobile Remote

**Purpose:** Serve iOS mobile remote bundle on port 9005

```bash
PLATFORM=ios yarn workspace @universal/mobile-remote-hello serve
```

**Expected output:**

```
✓ Compiled successfully
  Local:   http://localhost:9005/
```

**✅ Verification:**

```bash
curl -I http://localhost:9005/HelloRemote.container.js.bundle
# Should return 200 OK
```

---

### Terminal 4: iOS Mobile Host

**Purpose:** Serve iOS mobile host bundle on port 8081

```bash
PLATFORM=ios yarn workspace @universal/mobile-host start:bundler:ios
```

**Expected output:**

```
React Native packager is running
```

**✅ Verification:**

```bash
curl -I "http://localhost:8081/index.bundle?platform=ios"
# Should return 200 OK
```

---

### Start iOS Simulator

**Check if simulator is already running:**

```bash
xcrun simctl list devices | grep "iPhone 15" | grep "Booted"
# Should show the device with "(Booted)" status
```

**If no simulator is running, start one:**

```bash
# Open iOS Simulator with iPhone 15
open -a Simulator

# Or start specific simulator via command line
xcrun simctl boot "iPhone 15" 2>/dev/null || echo "Simulator already booted or not found"
```

**Wait for simulator to boot:**

```bash
# Wait a few seconds for simulator to fully boot
sleep 5
xcrun simctl list devices | grep "iPhone 15" | grep "Booted"
echo "✅ iOS Simulator is ready"
```

**✅ Verification:**

```bash
xcrun simctl list devices | grep "iPhone 15"
# Should show device with "(Booted)" status
```

---

### Build & Install iOS App

**Prerequisites:**

- iOS Simulator is running (see above)
- iOS Mobile Remote server is running (Terminal 3)
- iOS Mobile Host bundler is running (Terminal 4)

**Build and install:**

```bash
PLATFORM=ios yarn workspace @universal/mobile-host ios:app
```

**Expected output:**

```
** BUILD SUCCEEDED **
```

**✅ Verification:**

- App should automatically appear on the iOS Simulator screen
- You should see "Universal MFE - Mobile Host" title
- No red error screen should appear

**✅ iOS Testing Complete:** See Step 3 for detailed testing checklist.

---

## Section 3: Android Platform (Complete Flow)

**Terminals needed:** 2 terminals

### Terminal 5: Android Mobile Remote

**Purpose:** Serve Android mobile remote bundle on port 9004

```bash
PLATFORM=android yarn workspace @universal/mobile-remote-hello serve
```

**Expected output:**

```
✓ Compiled successfully
  Local:   http://localhost:9004/
```

**✅ Verification:**

```bash
curl -I http://localhost:9004/HelloRemote.container.js.bundle
# Should return 200 OK
```

---

### Terminal 6: Android Mobile Host

**Purpose:** Serve Android mobile host bundle on port 8081

**⚠️ IMPORTANT:** Android and iOS host bundlers both use port 8081. You **cannot run them simultaneously**. Stop the iOS bundler before starting the Android bundler, and vice versa.

```bash
PLATFORM=android yarn workspace @universal/mobile-host start:bundler:android
```

**Expected output:**

```
React Native packager is running
```

**✅ Verification:**

```bash
curl -I "http://localhost:8081/index.bundle?platform=android"
# Should return 200 OK
```

---

### Start Android Emulator

**Check if emulator is already running:**

```bash
adb devices
# Should show a device listed (not just "List of devices attached" with nothing)
```

**If no emulator is running, start one:**

```bash
# List available AVDs
emulator -list-avds

# Start an emulator (replace with your AVD name)
emulator -avd Pixel_9_Pro_API_35 &
```

**Wait for emulator to boot:**

```bash
# Wait for device to be ready
adb wait-for-device
echo "✅ Android emulator is ready"
```

**✅ Verification:**

```bash
adb devices
# Should show: "emulator-XXXX    device"
```

---

### Set Up Android Port Forwarding (Optional)

**Note:** Port forwarding is only needed for the remote bundler. The host bundler uses port 8081, which matches ReactHost's hardcoded default, so no port forwarding is needed for the host bundler.

**Set up port forwarding for remote bundler:**

```bash
# Forward emulator's port 9004 to host's port 9004 (for remote bundler)
adb reverse tcp:9004 tcp:9004

# Verify port forwarding is active
adb reverse --list
# Should show:
# host-16 tcp:9004 tcp:9004
```

**⚠️ Important:**

- Port forwarding must be set up AFTER the emulator is running
- You may need to re-run these commands if you restart the emulator

---

### Build & Install Android App

**Prerequisites:**

- Android emulator is running (see above)
- Port forwarding is set up (see above) - optional, only for remote bundler
- Android Mobile Remote server is running (Terminal 5)
- Android Mobile Host bundler is running (Terminal 6) on port 8081
- **⚠️ iOS host bundler must be stopped** (both use port 8081)

**Build, install, and launch:**

```bash
PLATFORM=android yarn workspace @universal/mobile-host android:app
```

**Expected output:**

```
BUILD SUCCESSFUL
> Task :app:installDebug
Installing APK 'app-debug.apk' on 'Pixel_9_Pro_API_35(AVD) - 15' for :app:debug
Installed on 1 device.
Starting: Intent { cmp=com.mobilehosttmp/.MainActivity }
```

**✅ Verification:**

- App should automatically appear and launch on the Android emulator screen
- You should see "Universal MFE - Mobile Host" title
- No red error screen should appear
- The app should be running and ready to use

**✅ Android Testing Complete:** See Step 3 for detailed testing checklist.

---

## Step 3: Testing Checklist

### ✅ Web Platform Testing

**Prerequisites:**

- Terminal 1: Web Remote server running on port 9003
- Terminal 2: Web Shell server running on port 9001

**Step 1: Test Web Remote Standalone**

1. Open your web browser
2. Navigate to: `http://localhost:9003/`
3. **Expected Result:**
   - [ ] Page loads without errors
   - [ ] You see "Hello, World!" text displayed
   - [ ] A button is visible and clickable
   - [ ] No errors in browser console (press F12 to open DevTools)
   - [ ] Button interactions work correctly

**Step 2: Test Web Shell (Host with Remote Loading)**

1. Open a new browser tab (or window)
2. Navigate to: `http://localhost:9001/`
3. **Expected Result:**
   - [ ] Page loads without errors
   - [ ] You see "Universal MFE - Web Shell" title at the top
   - [ ] Initially, you see "Loading remote component..." message
   - [ ] After a few seconds, the remote component loads and displays
   - [ ] You see "Hello, World!" text from the remote component
   - [ ] Button in the remote component is visible and clickable
   - [ ] When you click the button, a counter increments
   - [ ] No errors in browser console
   - [ ] Network tab (in DevTools) shows successful requests to `http://localhost:9003/remoteEntry.js`

**Troubleshooting Web:**

- If remote doesn't load, check Terminal 1 (Web Remote) for errors
- Check browser console for CORS or network errors
- Verify both servers are running: `lsof -i:9001,9003 | grep LISTEN`

---

### ✅ Android Platform Testing

**Prerequisites:**

- Terminal 5: Android Mobile Remote server running on port 9004
- Terminal 6: Android Mobile Host bundler running on port 8081
- Android emulator must be running and ready
- **⚠️ iOS host bundler must be stopped** (both use port 8081)

**Step 1: Set Up Port Forwarding (Optional)**

**Note:** Port forwarding is only needed for the remote bundler. The host bundler uses port 8081, which matches ReactHost's hardcoded default, so no port forwarding is needed for the host bundler.

1. **Check if emulator is connected:**

   ```bash
   adb devices
   # Should show: "emulator-XXXX    device"
   ```

2. **Set up port forwarding for remote bundler (optional):**

   ```bash
   adb reverse tcp:9004 tcp:9004
   ```

3. **Verify port forwarding is active:**
   ```bash
   adb reverse --list
   # Should show:
   # host-16 tcp:9004 tcp:9004
   ```

**Step 2: Verify Servers Are Running**

1. **Check Android host bundler (Terminal 6):**

   ```bash
   curl -I "http://localhost:8081/index.bundle?platform=android"
   # Should return: HTTP/1.1 200 OK
   ```

2. **Check Android remote server (Terminal 5):**
   ```bash
   curl -I "http://localhost:9004/HelloRemote.container.js.bundle"
   # Should return: HTTP/1.1 200 OK
   ```

**Step 3: Build and Install the Android App**

1. **Make sure emulator is running:**

   ```bash
   adb devices
   # Should show a device listed
   ```

2. **Build, install, and launch the app:**

   ```bash
   PLATFORM=android yarn workspace @universal/mobile-host android:app
   ```

3. **Wait for build and launch to complete:**
   - Look for: `BUILD SUCCESSFUL`
   - Look for: `> Task :app:installDebug`
   - Look for: `Installed on 1 device.`
   - Look for: `Starting: Intent { cmp=com.mobilehosttmp/.MainActivity }`
   - The app should automatically launch on the emulator

**Step 4: Verify App Launch**

1. **Check the emulator screen:**

   - [ ] App appears on the emulator (should launch automatically)
   - [ ] You see "Universal MFE - Mobile Host" title at the top
   - [ ] You see "Load Remote Component" button
   - [ ] No red error screen
   - [ ] App UI is visible and responsive

2. **If you see a red error screen:**
   - Check that Terminal 6 (Android host bundler) is running on port 8081
   - Verify bundle URL is accessible: `curl http://localhost:8081/index.bundle?platform=android`
   - **⚠️ Make sure iOS bundler is stopped** (both use port 8081)
   - Check emulator logs: `adb logcat | grep -i "error\|404"`
   - Restart the app (close and reopen, or shake device → Reload)

**Step 5: Test Remote Component Loading**

1. **Tap the "Load Remote Component" button** in the app

2. **Expected Result:**

   - [ ] You see a loading indicator (spinner or "Loading..." text)
   - [ ] After a few seconds, the remote component loads
   - [ ] You see "Hello, Mobile User!" text displayed
   - [ ] A button is visible in the remote component
   - [ ] No red error screen appears

3. **Test Remote Component Interaction:**
   - [ ] Tap the button in the remote component
   - [ ] Counter increments (you should see "Remote button pressed X time(s)")
   - [ ] Button remains responsive to multiple taps

**Step 6: Network Verification**

1. **Check Terminal 5 (Android Remote) logs:**

   - [ ] You should see HTTP requests for `HelloRemote.container.js.bundle`
   - [ ] Requests should return 200 OK status

2. **Check Terminal 6 (Android Host) logs:**
   - [ ] You should see requests for `index.bundle?platform=android`
   - [ ] Requests should return 200 OK status

**Troubleshooting Android:**

- **404 Error:** Check that Terminal 6 (host bundler) is running on port 8081
- **App won't load:** Verify bundle URL is accessible: `curl http://localhost:8081/index.bundle?platform=android`
- **Remote won't load:** Check that Terminal 5 (remote server) is running on port 9004
- **Port conflict:** **⚠️ Make sure the iOS bundler is stopped** (both use port 8081)
- **Red screen:** Check `adb logcat` for detailed error messages

---

### ✅ iOS Platform Testing

**Prerequisites:**

- Terminal 3: iOS Mobile Remote server running on port 9005
- Terminal 4: iOS Mobile Host bundler running on port 8081
- iOS Simulator must be running (iPhone 15)

**Step 1: Verify Servers Are Running**

1. **Check iOS host bundler (Terminal 4):**

   ```bash
   curl -I "http://localhost:8081/index.bundle?platform=ios"
   # Should return: HTTP/1.1 200 OK
   ```

2. **Check iOS remote server (Terminal 3):**
   ```bash
   curl -I "http://localhost:9005/HelloRemote.container.js.bundle"
   # Should return: HTTP/1.1 200 OK
   ```

**Step 2: Build and Install the iOS App**

1. **Make sure simulator is running:**

   ```bash
   xcrun simctl list devices | grep "iPhone 15" | grep "Booted"
   # Should show device with "(Booted)" status
   ```

2. **Build and install the app:**

   ```bash
   PLATFORM=ios yarn workspace @universal/mobile-host ios:app
   ```

3. **Wait for build to complete:**
   - Look for: `** BUILD SUCCEEDED **`
   - The app should automatically launch in the simulator

**Step 3: Verify App Launch**

1. **Check the simulator screen:**

   - [ ] App appears in the simulator (should launch automatically)
   - [ ] You see "Universal MFE - Mobile Host" title at the top
   - [ ] You see "Load Remote Component" button
   - [ ] No red error screen
   - [ ] App UI is visible and responsive

2. **If you see a red error screen:**
   - Check that Terminal 4 (iOS host bundler) is running
   - Verify bundle is accessible: `curl http://localhost:8081/index.bundle?platform=ios`
   - Check simulator logs in Xcode or via `xcrun simctl spawn booted log stream`
   - Restart the app (close and reopen)

**Step 4: Test Remote Component Loading**

1. **Tap the "Load Remote Component" button** in the app

2. **Expected Result:**

   - [ ] You see a loading indicator (spinner or "Loading..." text)
   - [ ] After a few seconds, the remote component loads
   - [ ] You see "Hello, Mobile User!" text displayed
   - [ ] A button is visible in the remote component
   - [ ] No red error screen appears

3. **Test Remote Component Interaction:**
   - [ ] Tap the button in the remote component
   - [ ] Counter increments (you should see "Remote button pressed X time(s)")
   - [ ] Button remains responsive to multiple taps

**Step 5: Network Verification**

1. **Check Terminal 3 (iOS Remote) logs:**

   - [ ] You should see HTTP requests for `HelloRemote.container.js.bundle`
   - [ ] Requests should return 200 OK status

2. **Check Terminal 4 (iOS Host) logs:**
   - [ ] You should see requests for `index.bundle?platform=ios`
   - [ ] Requests should return 200 OK status

**Troubleshooting iOS:**

- **404 Error:** Check that Terminal 4 (host bundler) is running on port 8081
- **App won't load:** Verify bundle URL: `curl http://localhost:8081/index.bundle?platform=ios`
- **Remote won't load:** Check that Terminal 3 (remote server) is running on port 9005
- **Port conflict:** **⚠️ Make sure the Android bundler is stopped** (both use port 8081)
- **Red screen:** Check simulator logs or Xcode console for detailed error messages

---

## Quick Reference: All Commands in One Place

### Unit Tests (Quick Reference)

**Run all unit tests:**

```bash
yarn test
```

**Run specific package tests:**

```bash
# Web Shell
yarn workspace @universal/web-shell test

# Web Remote
yarn workspace @universal/web-remote-hello test

# Mobile Host
yarn workspace @universal/mobile-host test

# Mobile Remote
yarn workspace @universal/mobile-remote-hello test

# Shared Utils
yarn workspace @universal/shared-utils test

# Shared Hello UI
yarn workspace @universal/shared-hello-ui test
```

**For more details, see [Unit Testing (Jest)](#unit-testing-jest) section above.**

---

### Kill All Servers (Single Command)

```bash
lsof -ti:9001,9003,9004,9005,8080,8081 | xargs kill -9 2>/dev/null; pkill -f "react-native start" 2>/dev/null; pkill -f "rspack serve" 2>/dev/null; echo "✅ All servers killed"
```

### Start All Servers (6 Terminals)

**Terminal 1 - Web Remote:**

```bash
yarn workspace @universal/web-remote-hello dev
```

**Terminal 2 - Web Shell:**

```bash
yarn workspace @universal/web-shell dev
```

**Terminal 5 - Android Mobile Remote:**

```bash
PLATFORM=android yarn workspace @universal/mobile-remote-hello serve
```

**Terminal 3 - iOS Mobile Remote:**

```bash
PLATFORM=ios yarn workspace @universal/mobile-remote-hello serve
```

**Terminal 6 - Android Mobile Host:**

```bash
PLATFORM=android yarn workspace @universal/mobile-host start:bundler:android
```

**Terminal 4 - iOS Mobile Host:**

```bash
PLATFORM=ios yarn workspace @universal/mobile-host start:bundler:ios
```

**Quick Reference - Web Platform:**

```bash
# Terminal 1: Web Remote
yarn workspace @universal/web-remote-hello dev

# Terminal 2: Web Shell
yarn workspace @universal/web-shell dev
```

**Quick Reference - iOS Platform:**

```bash
# Terminal 3: iOS Mobile Remote
PLATFORM=ios yarn workspace @universal/mobile-remote-hello serve

# Terminal 4: iOS Mobile Host
PLATFORM=ios yarn workspace @universal/mobile-host start:bundler:ios

# Start iOS Simulator
open -a Simulator
sleep 5

# Build & Install iOS App
PLATFORM=ios yarn workspace @universal/mobile-host ios:app
```

**Quick Reference - Android Platform:**

```bash
# Terminal 5: Android Mobile Remote
PLATFORM=android yarn workspace @universal/mobile-remote-hello serve

# Terminal 6: Android Mobile Host
# ⚠️ Stop iOS bundler first (both use port 8081)
PLATFORM=android yarn workspace @universal/mobile-host start:bundler:android

# Start Android Emulator
emulator -avd Pixel_9_Pro_API_35 &
adb wait-for-device

# Set Up Port Forwarding (Optional - only for remote bundler)
# Note: Host bundler uses port 8081, which matches ReactHost's hardcoded default
# Port forwarding is only needed for remote bundler access
adb reverse tcp:9004 tcp:9004

# Build, Install & Launch Android App
PLATFORM=android yarn workspace @universal/mobile-host android:app
# The app will automatically launch after installation
```

---

## Port Reference

| Service               | Port | Platform |
| --------------------- | ---- | -------- |
| Web Shell             | 9001 | Web      |
| Web Remote            | 9003 | Web      |
| Android Mobile Remote | 9004 | Android  |
| iOS Mobile Remote     | 9005 | iOS      |
| Android Mobile Host   | 8081 | Android  |
| iOS Mobile Host       | 8081 | iOS      |

---

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i:PORT_NUMBER

# Kill it
kill -9 $(lsof -ti:PORT_NUMBER)
```

### App Not Loading (Mobile)

**Android:**

- Check dev server is running (Terminal 6 on port 8081)
- Verify bundle URL is accessible: `curl http://localhost:8081/index.bundle?platform=android`
- Check emulator is connected: `adb devices`
- **⚠️ Make sure iOS bundler is stopped** (both use port 8081)
- Restart the app or reload: Shake device → Reload

**iOS:**

- Check dev server is running (Terminal 4 on port 8081)
- Verify bundle URL is accessible: `curl http://localhost:8081/index.bundle?platform=ios`
- Check simulator is running: `xcrun simctl list devices | grep "iPhone 15" | grep "Booted"`
- Restart the app

### Remote Not Loading

- Check remote server is running (Terminal 3 or 5)
- Verify remote bundle is accessible: `curl http://localhost:PORT/HelloRemote.container.js.bundle`
- Check ScriptManager resolver logs in app console
- Verify platform-specific port (9004 for Android, 9005 for iOS)

### Web Remote Not Loading

- Check web remote is running (Terminal 1)
- Verify remoteEntry.js is accessible: `curl http://localhost:9003/remoteEntry.js`
- Check browser console for errors
- Verify CORS headers are set correctly

---

## Expected Behavior

### Web

- **Web Shell:** Loads remote component dynamically via Module Federation v2
- **Web Remote Standalone:** Shows component independently

### Android

- **Mobile Host:** Loads remote component dynamically via ScriptManager + MFv2
- **Network:**
  - Host bundler: Uses port 8081 (matches ReactHost's hardcoded default), accessible via `10.0.2.2:8081` from emulator
  - Remote bundler: Uses `http://10.0.2.2:9004` to reach host machine from emulator
- **Port Conflict:** Android and iOS host bundlers both use port 8081 and cannot run simultaneously

### iOS

- **Mobile Host:** Loads remote component dynamically via ScriptManager + MFv2
- **Network:** Uses `http://localhost:9005` (simulator can access localhost directly)

---

## Success Criteria

✅ **All platforms working:**

- Web shell loads and displays remote component
- Web remote standalone works independently
- Android app loads and displays remote component
- iOS app loads and displays remote component
- All remotes can be accessed simultaneously
- **Note:** Android and iOS host bundlers cannot run simultaneously (both use port 8081)
- No network errors

---

## Cleanup

When done testing, kill all servers with a single command:

```bash
lsof -ti:9001,9003,9004,9005,8080,8081 | xargs kill -9 2>/dev/null; pkill -f "react-native start" 2>/dev/null; pkill -f "rspack serve" 2>/dev/null; echo "✅ All servers stopped"
```

---

**Last Updated:** 2026-01-XX  
**Status:** Complete Testing Guide
