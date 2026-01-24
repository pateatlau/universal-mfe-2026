# Maestro E2E Tests for Mobile Host

This directory contains Maestro E2E test flows for the Universal MFE mobile host application.

## Prerequisites

1. **Install Maestro CLI** (requires Java 17+):
   ```bash
   # macOS
   curl -fsSL "https://get.maestro.mobile.dev" | bash

   # Verify installation
   maestro --version
   ```

2. **Start the app and bundler**:
   - Android: `yarn android` (starts bundler on port 8081)
   - iOS: `yarn ios` (starts bundler on port 8082)

3. **Start the remote server** (for remote module tests):
   - Android: `cd ../mobile-remote-hello && PLATFORM=android yarn serve`
   - iOS: `cd ../mobile-remote-hello && PLATFORM=ios yarn serve`

## Running Tests

Tests use an environment variable `MAESTRO_APP_ID` to support both platforms:

### Android:
```bash
cd packages/mobile-host
MAESTRO_APP_ID=com.mobilehosttmp maestro test .maestro/
```

### iOS:
```bash
cd packages/mobile-host
MAESTRO_APP_ID=com.universal.mobilehost maestro test .maestro/
```

### Using yarn scripts (recommended):
```bash
# Android
yarn test:e2e:android

# iOS
yarn test:e2e:ios

# Run specific flow
yarn test:e2e:android --flow smoke
yarn test:e2e:ios --flow navigation
```

### Run a specific flow manually:
```bash
MAESTRO_APP_ID=com.mobilehosttmp maestro test .maestro/smoke.yaml
MAESTRO_APP_ID=com.mobilehosttmp maestro test .maestro/navigation.yaml
MAESTRO_APP_ID=com.mobilehosttmp maestro test .maestro/theming.yaml
MAESTRO_APP_ID=com.mobilehosttmp maestro test .maestro/remote-loading.yaml
MAESTRO_APP_ID=com.mobilehosttmp maestro test .maestro/i18n.yaml
```

### Run with verbose output:
```bash
MAESTRO_APP_ID=com.mobilehosttmp maestro test .maestro/smoke.yaml --debug-output ./maestro-debug
```

## Test Flows

| Flow | Description | Tags |
|------|-------------|------|
| `smoke.yaml` | Basic app launch and visibility checks | smoke, core |
| `navigation.yaml` | Navigation between pages | navigation, core |
| `theming.yaml` | Theme toggle functionality | theming, core |
| `i18n.yaml` | Language switching (English/Hindi) | i18n, core |
| `remote-loading.yaml` | Remote module loading (requires remote server) | remote, federation |

## App Identifiers

- **Android**: `com.mobilehosttmp`
- **iOS**: `com.universal.mobilehost`

## Notes

- Tests use `MAESTRO_APP_ID` environment variable to support both platforms
- Remote loading tests require the remote server to be running
- Maestro auto-detects the connected device/simulator
- Tests are designed to be deterministic with proper wait conditions
