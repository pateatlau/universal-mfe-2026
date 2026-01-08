# Testing Guide

Run and test the Universal MFE Platform on Web, Android, and iOS.

---

## Prerequisites

```bash
# Install dependencies and build shared packages (run once)
yarn install
yarn build:shared
```

---

## Unit Tests

The platform includes comprehensive unit tests for shared packages using Jest and @testing-library/react.

### Running Tests

```bash
# Run all tests from root (recommended)
npx jest

# Run all tests with coverage
npx jest --coverage

# Run tests via Turborepo (with caching)
yarn test

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
# Run all integration tests from root (recommended)
yarn test:integration

# Run via Turborepo with caching
yarn turbo run test:integration

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
# Example in web-shell:
moduleNameMapper: {
  '^react$': '<rootDir>/node_modules/react',
  '^react-dom$': '<rootDir>/node_modules/react-dom',
}
```

**Tests fail with "toHaveTextContent is not a function"**
```bash
# Ensure setup.ts imports @testing-library/jest-dom
# And jest.integration.config.js has setupFilesAfterEnv pointing to setup.ts
```

**Tests hang or timeout**
```bash
# Integration tests have 15s timeout (longer than unit tests)
# If still timing out, check for unresolved promises or async issues
# Run with --verbose to see which test is hanging:
yarn workspace @universal/web-shell test:integration --verbose
```

**Cache-related tests fail intermittently**
```bash
# React Query cache tests need proper cleanup
# Ensure beforeEach/afterEach call resetSharedQueryClient()
# Use useLayoutEffect for synchronous cache updates in test components
```

---

## Web

### Run Web App

```bash
# Terminal 1: Start web remote
yarn workspace @universal/web-remote-hello dev

# Terminal 2: Start web shell
yarn workspace @universal/web-shell dev
```

### Test

Open http://localhost:9001 in your browser.

- Navigate using the header links (Home, Remote Hello, Settings)
- On Remote Hello page: verify remote component loads
- On Settings page: toggle theme and language

---

## iOS

### Run iOS App

```bash
# Terminal 1: Build and serve iOS remote
cd packages/mobile-remote-hello
PLATFORM=ios yarn build:remote
PLATFORM=ios yarn serve

# Terminal 2: Start iOS Metro bundler
yarn workspace @universal/mobile-host start:bundler:ios

# Terminal 3: Build and run iOS app (after bundler is ready)
yarn workspace @universal/mobile-host ios
```

### Test

The app launches automatically in the iOS Simulator.

- Navigate using the header links (Home, Remote Hello, Settings)
- On Remote Hello page: tap "Load Remote" and verify it loads
- On Settings page: toggle theme and language

---

## Android

### Run Android App

First, start an Android emulator:

```bash
# List available emulators
emulator -list-avds

# Start an emulator (replace with your AVD name)
emulator -avd Pixel_7_API_35 &

# Wait for emulator to boot, then verify
adb devices  # Should show: emulator-5554  device
```

Then run the app:

```bash
# Terminal 1: Build and serve Android remote
cd packages/mobile-remote-hello
PLATFORM=android yarn build:remote
PLATFORM=android yarn serve

# Terminal 2: Start Android Metro bundler
yarn workspace @universal/mobile-host start:bundler:android

# Terminal 3: Build and run Android app (after bundler is ready)
yarn workspace @universal/mobile-host android
```

### Test

The app launches automatically in the Android emulator.

- Navigate using the header links (Home, Remote Hello, Settings)
- On Remote Hello page: tap "Load Remote" and verify it loads
- On Settings page: toggle theme and language

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

---

## Troubleshooting

### Kill All Servers

```bash
lsof -ti:9001,9003,9004,9005,8081,8082 | xargs kill -9 2>/dev/null
```

### Fresh Start

```bash
# Kill all servers
lsof -ti:9001,9003,9004,9005,8081,8082 | xargs kill -9 2>/dev/null

# Clean and rebuild
yarn clean
yarn build:shared
```

### iOS: "file not found" Errors

```bash
cd packages/mobile-host
node scripts/setup-symlinks.js
```

### iOS: Pod Issues

```bash
cd packages/mobile-host/ios
rm -rf Pods Podfile.lock
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

## Standalone Remote Apps (Optional)

The mobile remote can run as an independent app for isolated development.

### iOS Standalone

```bash
# Terminal 1: Start standalone bundler
yarn workspace @universal/mobile-remote-hello start:bundler:ios

# Terminal 2: Build and run
cd packages/mobile-remote-hello/ios
pod install
xcodebuild -workspace MobileRemoteHello.xcworkspace \
  -scheme MobileRemoteHello \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -derivedDataPath build \
  build
xcrun simctl install booted build/Build/Products/Debug-iphonesimulator/MobileRemoteHello.app
xcrun simctl launch booted com.universal.mobileremote
```

### Android Standalone

```bash
# Terminal 1: Start standalone bundler
yarn workspace @universal/mobile-remote-hello start:bundler:android

# Terminal 2: Build and run
adb reverse tcp:8083 tcp:8083
cd packages/mobile-remote-hello/android
./gradlew installDebug
adb shell am start -n com.mobileremotehello/.MainActivity
```
