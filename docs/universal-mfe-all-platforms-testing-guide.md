# Testing Guide

Run and test the Universal MFE Platform on Web, Android, and iOS.

---

## Prerequisites

```bash
# Install dependencies and build shared packages (run once from root)
yarn install
yarn build:shared
```

---

## Running the Apps

### Web

#### Web Shell App (with Remote)

```bash
# Terminal 1: Start web remote
yarn workspace @universal/web-remote-hello dev

# Terminal 2: Start web shell
yarn workspace @universal/web-shell dev
```

Open <http://localhost:9001> in your browser.

**Manual Testing:**
- Navigate using the header links (Home, Remote Hello, Settings)
- On Remote Hello page: click "Load Remote" and verify component loads
- On Settings page: toggle theme and language

---

### iOS

#### iOS Shell App (with Remote)

##### Step 1: Start an iOS Simulator

```bash
# List available simulators
xcrun simctl list devices available

# Boot a simulator (use an available device name)
xcrun simctl boot "iPhone 16"

# Open the Simulator app (makes it visible)
open -a Simulator
```

##### Step 2: Build and serve the iOS remote

```bash
# Terminal 1: Build and serve iOS remote
yarn workspace @universal/mobile-remote-hello build:ios
yarn workspace @universal/mobile-remote-hello serve:ios
```

Wait until you see "Server listening on port 9005".

##### Step 3: Start the iOS Metro bundler

```bash
# Terminal 2: Start iOS Metro bundler
yarn workspace @universal/mobile-host start:bundler:ios
```

Wait until you see "Welcome to Metro" and the bundler is ready.

##### Step 4: Build and run the iOS app

```bash
# Terminal 3: Build and install iOS app
yarn workspace @universal/mobile-host ios
```

The app will automatically install and launch in the iOS Simulator.

**Manual Testing:**
- Navigate using the header links (Home, Remote Hello, Settings)
- On Remote Hello page: tap "Load Remote" and verify component loads
- On Settings page: toggle theme and language

#### iOS Remote Standalone App

For isolated development of the remote component without the shell app.

##### Step 1: Start an iOS Simulator (if not already running)

```bash
xcrun simctl boot "iPhone 16"
open -a Simulator
```

##### Step 2: Start the standalone bundler

```bash
# Terminal 1: Start standalone bundler for remote
yarn workspace @universal/mobile-remote-hello start:bundler:ios
```

Wait until you see "Welcome to Metro" and the bundler is ready.

##### Step 3: Install CocoaPods (first time only)

```bash
# Install pods for the remote iOS project
cd packages/mobile-remote-hello/ios
pod install
cd ../../..
```

##### Step 4: Build and run the standalone app

```bash
# Terminal 2: Build and install standalone remote app
cd packages/mobile-remote-hello/ios
xcodebuild -workspace MobileRemoteHello.xcworkspace \
  -scheme MobileRemoteHello \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -derivedDataPath build \
  build

# Install the app on the simulator
xcrun simctl install booted build/Build/Products/Debug-iphonesimulator/MobileRemoteHello.app

# Launch the app
xcrun simctl launch booted com.universal.mobileremote
```

---

### Android

#### Android Shell App (with Remote)

##### Step 1: Start an Android Emulator

```bash
# List available emulators
emulator -list-avds

# Start an emulator (replace with your AVD name)
emulator -avd Pixel_7_API_35 &

# Wait for emulator to boot, then verify it's connected
adb wait-for-device
adb devices  # Should show: emulator-5554  device
```

##### Step 2: Build and serve the Android remote

```bash
# Terminal 1: Build and serve Android remote
yarn workspace @universal/mobile-remote-hello build:android
yarn workspace @universal/mobile-remote-hello serve:android
```

Wait until you see "Server listening on port 9004".

##### Step 3: Start the Android Metro bundler

```bash
# Terminal 2: Start Android Metro bundler
yarn workspace @universal/mobile-host start:bundler:android
```

Wait until you see "Welcome to Metro" and the bundler is ready.

##### Step 4: Build and run the Android app

```bash
# Terminal 3: Build and install Android app
yarn workspace @universal/mobile-host android
```

The app will automatically install and launch in the Android emulator.

**Manual Testing:**
- Navigate using the header links (Home, Remote Hello, Settings)
- On Remote Hello page: tap "Load Remote" and verify component loads
- On Settings page: toggle theme and language

#### Android Remote Standalone App

For isolated development of the remote component without the shell app.

##### Step 1: Start an Android Emulator (if not already running)

```bash
emulator -avd Pixel_7_API_35 &
adb wait-for-device
adb devices
```

##### Step 2: Start the standalone bundler

```bash
# Terminal 1: Start standalone bundler for remote
yarn workspace @universal/mobile-remote-hello start:bundler:android
```

Wait until you see "Welcome to Metro" and the bundler is ready.

##### Step 3: Set up ADB reverse port

```bash
# Forward the bundler port from emulator to host
adb reverse tcp:8083 tcp:8083
```

##### Step 4: Build and run the standalone app

```bash
# Terminal 2: Build and install standalone remote app
cd packages/mobile-remote-hello/android
./gradlew installDebug

# Launch the app
adb shell am start -n com.mobileremotehello/.MainActivity
```

---

## Port Reference

| Service | Port |
|---------|------|
| Web Shell | 9001 |
| Web Remote | 9003 |
| iOS Metro Bundler | 8082 |
| iOS Remote Server | 9005 |
| Android Metro Bundler | 8081 |
| Android Remote Server | 9004 |
| iOS Standalone Remote Bundler | 8084 |
| Android Standalone Remote Bundler | 8083 |

---

## Troubleshooting

### Kill All Servers

```bash
lsof -ti:9001,9003,9004,9005,8081,8082,8083,8084 | xargs kill -9 2>/dev/null
```

### Fresh Start

```bash
# Kill all servers
lsof -ti:9001,9003,9004,9005,8081,8082,8083,8084 | xargs kill -9 2>/dev/null

# Clean and rebuild
yarn clean
yarn build:shared
```

### iOS: "file not found" Errors

```bash
# Run symlink setup from root
yarn workspace @universal/mobile-host postinstall
```

### iOS: Pod Issues

```bash
# Clean and reinstall pods
yarn workspace @universal/mobile-host clean:ios
cd packages/mobile-host/ios
pod install
```

### Android: Build Fails

```bash
yarn workspace @universal/mobile-host clean:android
```

### Android: Emulator Not Detected

```bash
adb kill-server && adb start-server
adb devices
```

### Remote Component Won't Load

1. Verify the remote server is running:
   ```bash
   # iOS
   curl -I http://localhost:9005/HelloRemote.container.js.bundle

   # Android
   curl -I http://localhost:9004/HelloRemote.container.js.bundle
   ```

2. Verify the Metro bundler is running:
   ```bash
   # iOS
   curl http://localhost:8082/status

   # Android
   curl http://localhost:8081/status
   ```

---

## Unit Tests

The platform includes comprehensive unit tests for shared packages using Jest and @testing-library/react.

### Running Tests

```bash
# Run all unit tests via Turborepo (with caching)
yarn test

# Run all tests with coverage
yarn test -- --coverage

# Run tests for a specific package
yarn workspace @universal/shared-utils test
yarn workspace @universal/shared-hello-ui test
yarn workspace @universal/shared-theme-context test
```

### Test Coverage

| Package | Tests | Coverage |
|---------|-------|----------|
| shared-utils | 6 | 100% |
| shared-hello-ui | 16 | 100% |
| shared-theme-context | 24 | 100% |
| **Total** | **46** | **100%** |

### Test Structure

```
packages/
├── shared-utils/
│   └── src/index.test.ts           # Utility function tests
├── shared-hello-ui/
│   ├── src/__mocks__/react-native.ts   # RN mock for JSDOM
│   └── src/__tests__/HelloUniversal.test.tsx
└── shared-theme-context/
    └── src/__tests__/ThemeProvider.test.tsx
```

### Troubleshooting Tests

**Tests fail with "Cannot find module 'react-native'"**
```bash
# The shared-hello-ui package uses a custom mock at src/__mocks__/react-native.ts
# Ensure the package jest.config.js has moduleNameMapper configured
```

**Tests fail with "useTheme must be used within a ThemeProvider"**
```bash
# Wrap components with required providers in tests:
# - ThemeProvider for themed components
# - I18nProvider for i18n components
```

**Coverage not showing for a package**
```bash
# Ensure the package has jest.config.js and is listed in root jest.config.js projects array
```

---

## Integration Tests

Integration tests verify cross-package interactions, provider composition, and routing without full browser/device automation.

### Running Integration Tests

```bash
# Run all integration tests via Turborepo
yarn test:integration

# Run for a specific package
yarn workspace @universal/web-shell test:integration
yarn workspace @universal/mobile-host test:integration
yarn workspace @universal/shared-data-layer test:integration
```

### Integration Test Coverage

| Package | Tests | Description |
|---------|-------|-------------|
| web-shell | 27 | Provider composition, routing, theme persistence |
| mobile-host | 15 | Provider composition, navigation |
| shared-data-layer | 31 | QueryClient config, QueryProvider, cache sharing |
| **Total** | **73** | |

### Test Structure

```
packages/
├── web-shell/
│   ├── jest.integration.config.js
│   └── src/__integration__/
│       ├── setup.ts                    # Window mocks for JSDOM
│       ├── mocks/react-native.ts       # RN component mocks
│       ├── providers.test.tsx          # Provider composition
│       ├── routing.test.tsx            # Route transitions
│       └── theme-persistence.test.tsx  # Theme state management
├── mobile-host/
│   ├── jest.integration.config.js
│   └── src/__integration__/
│       ├── setup.ts                    # RN mocks for JSDOM
│       ├── providers.test.tsx          # Provider composition
│       └── navigation.test.tsx         # Navigation state
└── shared-data-layer/
    ├── jest.integration.config.js
    └── src/__integration__/
        ├── setup.ts                    # Jest-dom setup
        ├── queryClient.test.ts         # QueryClient factory & singleton
        └── QueryProvider.test.tsx      # Provider & cache sharing
```

### Troubleshooting Integration Tests

**Tests fail with "Cannot find module 'react-native'"**
```bash
# Integration tests use custom mocks, not react-native-web
# Ensure jest.integration.config.js has moduleNameMapper for react-native
```

**Tests fail with React version conflicts**
```bash
# Web packages use React 19.2.0, mobile/shared use 19.1.0
# The jest.integration.config.js maps React to workspace versions
```

**Tests fail with "toHaveTextContent is not a function"**
```bash
# Ensure setup.ts imports @testing-library/jest-dom
# And jest.integration.config.js has setupFilesAfterEnv pointing to setup.ts
```

**Tests hang or timeout**
```bash
# Integration tests have 15s timeout (longer than unit tests)
# Run with --verbose to see which test is hanging:
yarn workspace @universal/web-shell test:integration -- --verbose
```

---

## E2E Tests (Web) - Playwright

End-to-end tests for the web platform using Playwright.

### Prerequisites

```bash
# Install Playwright browsers (first time only)
yarn workspace @universal/web-shell exec npx playwright install --with-deps
```

### Running E2E Tests

```bash
# Run all E2E tests (headless)
yarn workspace @universal/web-shell test:e2e

# Run with UI mode for debugging
yarn workspace @universal/web-shell exec npx playwright test --ui

# Run specific test file
yarn workspace @universal/web-shell exec npx playwright test e2e/smoke.spec.ts

# Run tests in headed mode (visible browser)
yarn workspace @universal/web-shell exec npx playwright test --headed

# Run tests for specific browser
yarn workspace @universal/web-shell exec npx playwright test --project=chromium
yarn workspace @universal/web-shell exec npx playwright test --project=firefox
yarn workspace @universal/web-shell exec npx playwright test --project=webkit
```

### Test Suites

| Suite | File | Description |
|-------|------|-------------|
| Smoke | `e2e/smoke.spec.ts` | Basic app launch, header visibility |
| Routing | `e2e/routing.spec.ts` | SPA navigation, URL handling |
| Theming | `e2e/theming.spec.ts` | Theme toggle, persistence |
| Remote Loading | `e2e/remote-loading.spec.ts` | Module Federation remote loading |

### Browser Coverage

Tests run across 5 browser configurations:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit (Desktop)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Running Remote Loading Tests

Remote loading tests require the web remote server to be running:

```bash
# Terminal 1: Start remote server
yarn workspace @universal/web-remote-hello dev

# Terminal 2: Run E2E tests (all tests including remote)
yarn workspace @universal/web-shell test:e2e
```

### CI Integration

Playwright tests run automatically on merge to main/develop via `.github/workflows/e2e-web.yml`.

---

## Release Builds (Mobile)

Production-ready builds for mobile platforms that run standalone without Metro bundler.

### Prerequisites

```bash
# Install dependencies and build shared packages (run once from root)
yarn install
yarn build:shared
```

### Android Release Builds

#### Host App (MobileHostTmp)

##### Step 1: Build the Release APK

```bash
cd packages/mobile-host

# Build production bundle
NODE_ENV=production PLATFORM=android yarn build:android

# Generate React Native codegen (required for release builds)
cd android
./gradlew generateCodegenArtifactsFromSchema --no-daemon

# Build release APK
./gradlew assembleRelease --no-daemon --stacktrace
```

##### Step 2: Install on Emulator or Device

```bash
# For emulator (ensure one is running)
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Launch the app
adb shell am start -n com.mobilehosttmp/.MainActivity
```

**Expected Behavior:**
- ✅ App launches without Metro bundler
- ✅ Production bundles embedded
- ✅ Loads remote from `https://universal-mfe.web.app`
- ✅ Standalone operation confirmed

**APK Location:** `android/app/build/outputs/apk/release/app-release.apk`

#### Standalone Remote App (MobileRemoteHello)

```bash
cd packages/mobile-remote-hello

# Build production standalone bundle
NODE_ENV=production PLATFORM=android yarn build:standalone

# Generate codegen and build APK
cd android
./gradlew generateCodegenArtifactsFromSchema --no-daemon
./gradlew assembleRelease --no-daemon --stacktrace

# Install on device/emulator
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

**APK Location:** `android/app/build/outputs/apk/release/app-release.apk`

### iOS Release Builds

#### Host App (MobileHostTmp)

##### Step 1: Build Production Bundle

```bash
cd packages/mobile-host

# Build iOS production bundle
NODE_ENV=production yarn build:ios
```

##### Step 2: Build Release Configuration in Xcode

```bash
cd ios

# Build for simulator (Release configuration)
xcodebuild -workspace MobileHostTmp.xcworkspace \
  -scheme MobileHostTmp \
  -configuration Release \
  -sdk iphonesimulator \
  clean build

# Or build via CLI with custom script (automatic bundle integration)
xcodebuild -workspace MobileHostTmp.xcworkspace \
  -scheme MobileHostTmp \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath ./build \
  build
```

##### Step 3: Install on Simulator

```bash
# Get app bundle path (from DerivedData)
APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData/MobileHostTmp-*/Build/Products/Release-iphonesimulator -name "MobileHostTmp.app" | head -1)

# Boot simulator if needed
xcrun simctl boot "iPhone 15"

# Install app
xcrun simctl install booted "$APP_PATH"

# Launch app
xcrun simctl launch booted com.universal.mobilehost
```

**Expected Behavior:**
- ✅ App launches without Metro bundler
- ✅ Production bundles embedded via custom Xcode script
- ✅ No blank white screen
- ✅ "Load Remote Component" button works
- ✅ Loads remote from `https://universal-mfe.web.app`
- ✅ Module Federation v2 verified working
- ✅ Theme switching functional

**App Location:** `~/Library/Developer/Xcode/DerivedData/MobileHostTmp-.../Build/Products/Release-iphonesimulator/MobileHostTmp.app`

#### Standalone Remote App (MobileRemoteHello)

```bash
cd packages/mobile-remote-hello

# Build iOS production standalone bundle
PLATFORM=ios NODE_ENV=production yarn build:standalone

# Build Release configuration
cd ios
xcodebuild -workspace MobileRemoteHello.xcworkspace \
  -scheme MobileRemoteHello \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath ./build \
  build

# Install on simulator (use different device than host)
APP_PATH=$(find ~/Library/Developer/Xcode/DerivedData/MobileRemoteHello-*/Build/Products/Release-iphonesimulator -name "MobileRemoteHello.app" | head -1)
xcrun simctl boot "iPhone 15 Pro"
xcrun simctl install booted "$APP_PATH"
xcrun simctl launch booted com.universal.mobileremote
```

**Testing Configuration:**
- Host app: iPhone 15 simulator
- Remote app: iPhone 15 Pro simulator (separate device)
- Both apps run standalone simultaneously

### Release Build Verification Checklist

#### Android
- [ ] Host APK builds successfully
- [ ] Host app launches without Metro
- [ ] Host app loads UI correctly
- [ ] "Load Remote" button works
- [ ] Remote loads from Firebase Hosting
- [ ] Theme switching works
- [ ] Standalone remote APK builds successfully
- [ ] Standalone remote app launches

#### iOS
- [ ] Host bundle builds (1.2MB production bundle)
- [ ] Xcode build succeeds (Release configuration)
- [ ] Host app installs on simulator
- [ ] Host app launches without Metro
- [ ] Host app displays UI (no blank white screen)
- [ ] "Load Remote Component" button works
- [ ] Remote loads from Firebase Hosting
- [ ] Module Federation v2 loading works
- [ ] Theme switching functional
- [ ] Standalone remote app builds successfully
- [ ] Standalone remote app launches on separate simulator

### Key Implementation Details

#### Platform Polyfill (iOS-Critical)
iOS Release builds require extended polyfills in `PatchMFConsolePlugin.mjs`:
- Console polyfill (Android + iOS)
- Platform polyfill (iOS-critical, handles `Platform.constants`, `.isTesting`, `.OS`, `.Version`, `.select()`)
- Prevents crashes during React Native initialization

#### Custom Xcode Bundling Script
Both iOS apps use custom bundling scripts:
- Location: `ios/scripts/bundle-repack.sh`
- Integrates with Xcode build process
- Handles Debug vs Release configurations
- Properly manages code signing

#### Build Mode Strategy
Both platforms use **Option B approach**:
- Rspack `mode: 'development'` (preserves React Native runtime)
- Dev support disabled at native level:
  - Android: `BuildConfig.DEBUG` flag
  - iOS: Absence of `DEBUG` preprocessor flag (automatically sets `RCT_DEV=0`)

### Troubleshooting Release Builds

**Android: DNS Resolution Issues (Emulators Only)**
```bash
# Restart emulator with explicit DNS
adb devices | grep emulator | cut -f1 | xargs -I {} adb -s {} emu kill
emulator -avd Pixel_8_Pro_API_35 -dns-server 8.8.8.8,8.8.4.4 -wipe-data
```

**Android: Codegen Missing**
```bash
cd packages/mobile-host/android
./gradlew generateCodegenArtifactsFromSchema --no-daemon
```

**iOS: Blank White Screen**
- Verify Platform polyfill is in PatchMFConsolePlugin.mjs
- Check Xcode build logs for custom script output
- Ensure bundle exists: `ls -lh ios/main.jsbundle`

**iOS: Code Signing Invalid**
```bash
# Verify signature
codesign -vv path/to/MobileHostTmp.app

# If invalid, rebuild completely
cd ios
xcodebuild -workspace MobileHostTmp.xcworkspace -scheme MobileHostTmp -configuration Release -sdk iphonesimulator clean build
```

---

## E2E Tests (Mobile) - Maestro

End-to-end tests for mobile platforms using Maestro.

### Prerequisites

```bash
# Install Maestro CLI (requires Java 17+)
curl -fsSL "https://get.maestro.mobile.dev" | bash

# Add to PATH and verify installation
export PATH="$PATH:$HOME/.maestro/bin"
maestro --version
```

### Running E2E Tests

**Android:**

```bash
# Ensure emulator is running and app is installed (see "Running the Apps" section)
# Then run tests:
yarn workspace @universal/mobile-host test:e2e:android

# Run specific flow
yarn workspace @universal/mobile-host exec maestro test .maestro/smoke.yaml
```

**iOS:**

```bash
# Ensure simulator is running and app is installed (see "Running the Apps" section)
# Then run tests:
yarn workspace @universal/mobile-host test:e2e:ios

# Run specific flow
yarn workspace @universal/mobile-host exec maestro test .maestro/smoke.yaml
```

### Test Flows

| Flow | File | Description | Tags |
|------|------|-------------|------|
| Smoke | `smoke.yaml` | App launch, header, navigation links | smoke, core |
| Navigation | `navigation.yaml` | Page transitions, header nav | navigation, core |
| Theming | `theming.yaml` | Theme toggle from header and settings | theming, core |
| i18n | `i18n.yaml` | Language switching (EN/HI) | i18n, core |
| Remote Loading | `remote-loading.yaml` | Module Federation loading | remote, federation |

### App Identifiers

| Platform | App ID |
|----------|--------|
| Android | `com.mobilehosttmp` |
| iOS | `com.universal.mobilehost` |

### Running Remote Loading Tests

Remote loading tests require the mobile remote server.

**Android:**

```bash
# Terminal 1: Build and serve Android remote
yarn workspace @universal/mobile-remote-hello build:android
yarn workspace @universal/mobile-remote-hello serve:android

# Terminal 2: Run all Maestro tests (including remote)
yarn workspace @universal/mobile-host test:e2e:android
```

**iOS:**

```bash
# Terminal 1: Build and serve iOS remote
yarn workspace @universal/mobile-remote-hello build:ios
yarn workspace @universal/mobile-remote-hello serve:ios

# Terminal 2: Run all Maestro tests (including remote)
yarn workspace @universal/mobile-host test:e2e:ios
```

### CI Integration

Maestro tests can be triggered via `.github/workflows/e2e-mobile.yml`:
- **Manual trigger**: Use workflow_dispatch with platform selector (android/ios/both)
- **Automatic on tags**: Runs on release tags (v*)
- Excludes remote loading tests by default (requires remote server)

### Troubleshooting Maestro

**"Unable to launch app"**
```bash
# Ensure app is installed on device/emulator
adb shell pm list packages | grep mobilehosttmp  # Android
xcrun simctl listapps booted | grep mobilehost   # iOS
```

**Tests timeout**
```bash
# Increase timeout in YAML
- extendedWaitUntil:
    visible: "Universal MFE - Mobile"
    timeout: 15000  # 15 seconds
```

**Element not found**
```bash
# Use regex patterns for flexible matching
- assertVisible: ".*Welcome.*"
- tapOn: ".*Settings.*"
```
