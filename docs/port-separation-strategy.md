# Port Separation Strategy for Android and iOS

## Overview

To enable simultaneous testing of Android and iOS platforms, separate ports are used for the mobile remote bundle dev servers:

- **Android**: Port 9004
- **iOS**: Port 9005

This allows developers to run both Android and iOS remote bundles simultaneously without port conflicts.

---

## Implementation

### Mobile Remote Configuration

**File:** `packages/mobile-remote-hello/repack.remote.config.mjs`

The dev server port is determined by the `PLATFORM` environment variable:

```javascript
const platform = process.env.PLATFORM || 'android';
// Use separate ports for Android (9004) and iOS (9005) to allow simultaneous testing
const devServerPort = platform === 'ios' ? 9005 : 9004;

export default {
  // ...
  devServer: {
    port: devServerPort,
    // ...
  },
};
```

### Mobile Host Configuration

**File:** `packages/mobile-host/src/App.tsx`

The mobile host automatically selects the correct port based on the platform:

```typescript
// Platform-specific remote host configuration
// Android uses port 9004, iOS uses port 9005 to allow simultaneous testing
const REMOTE_HOST =
  Platform.OS === 'android'
    ? // Android emulator → host machine
      'http://10.0.2.2:9004'
    : // iOS simulator → localhost (uses separate port 9005)
      'http://localhost:9005';
```

---

## Usage

### Building and Serving Remote Bundles

**Android (default):**
```bash
# From project root
PLATFORM=android yarn workspace @universal/mobile-remote-hello build:remote
PLATFORM=android yarn workspace @universal/mobile-remote-hello serve
# Server runs on port 9004
```

**iOS:**
```bash
# From project root
PLATFORM=ios yarn workspace @universal/mobile-remote-hello build:remote
PLATFORM=ios yarn workspace @universal/mobile-remote-hello serve
# Server runs on port 9005
```

**Simultaneous Testing:**
```bash
# Terminal 1: Android remote
PLATFORM=android yarn workspace @universal/mobile-remote-hello serve

# Terminal 2: iOS remote
PLATFORM=ios yarn workspace @universal/mobile-remote-hello serve

# Both can run simultaneously without conflicts
```

---

## Benefits

1. **Simultaneous Testing**: Test Android and iOS remotes at the same time
2. **No Port Conflicts**: Each platform has its own dedicated port
3. **Clear Separation**: Easy to identify which platform is being served
4. **Future-Proof**: Ready for platform-specific features if needed

---

## Port Summary

| Platform | Remote Port | Host Dev Server Port | Notes |
|----------|-------------|---------------------|-------|
| Android  | 9004        | 8080                | Uses `10.0.2.2` for emulator networking |
| iOS      | 9005        | 8081                | Uses `localhost` for simulator networking |

---

## Future Considerations

Currently, there are no platform-specific features in the remote bundles. However, this port separation strategy:

1. **Enables Platform-Specific Features**: If needed in the future, platform-specific code can be conditionally included
2. **Supports Different Build Configurations**: Each platform can have different build settings
3. **Facilitates Independent Testing**: Each platform can be tested and debugged independently

---

## Migration Notes

If you have existing scripts or documentation referencing port 9004 for iOS:

- **Before**: iOS used port 9004 (same as Android)
- **After**: iOS uses port 9005 (separate from Android)

Update any scripts, CI/CD configurations, or documentation that hardcodes port 9004 for iOS.

---

**Document Version:** 1.0  
**Last Updated:** 2026

