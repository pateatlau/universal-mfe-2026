# iOS Phase 4 - Manual Testing & Verification Guide

**Phase:** 4 - Build & Run iOS Host  
**Purpose:** Build iOS host bundle, start dev server, and launch app in iOS simulator

---

## Prerequisites

Before starting, ensure:

- ✅ Phase 3 complete: iOS remote bundle built and served on port 9005
- ✅ Xcode installed and command-line tools configured
- ✅ CocoaPods dependencies installed (`cd ios && pod install`)
- ✅ iOS simulator available (iPhone 16 or similar)
- ✅ Node.js and npm installed
- ✅ All dependencies installed (`yarn install` from root)

---

## Quick Reference (From Project Root)

**Start iOS remote bundle server:**

```bash
PLATFORM=ios npx yarn workspace @universal/mobile-remote-hello serve
# Server runs on port 9005
```

**Start iOS host dev server:**

```bash
PLATFORM=ios npx yarn workspace @universal/mobile-host start:bundler:ios
# Server runs on port 8081
```

**Launch iOS app in simulator:**

```bash
# Option 1: Using workspace command
PLATFORM=ios npx yarn workspace @universal/mobile-host ios:app

# Option 2: Using xcodebuild directly
cd packages/mobile-host/ios
xcodebuild -workspace MobileHostTmp.xcworkspace \
  -scheme MobileHostTmp \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build
```

---

## Step 1: Start iOS Remote Bundle Server

### 1.1 Start Remote Server

**From project root:**

```bash
PLATFORM=ios npx yarn workspace @universal/mobile-remote-hello serve
```

**Expected Output:**

- Server starts on port 9005
- Console shows: `Server running at http://0.0.0.0:9005`
- No errors

**Keep this terminal running** - you'll need the remote server for Step 4.

### 1.2 Verify Remote Server

**From a new terminal:**

```bash
# Verify container bundle is accessible
curl -I http://localhost:9005/HelloRemote.container.js.bundle

# Should return: HTTP/1.1 200 OK
```

---

## Step 2: Start iOS Host Dev Server

### 2.1 Start Host Dev Server

**From project root:**

```bash
PLATFORM=ios npx yarn workspace @universal/mobile-host start:bundler:ios
```

**Expected Output:**

- Server starts on port 8081
- Console shows dev server running
- No errors

**Keep this terminal running** - the app needs this server to load the bundle.

### 2.2 Verify Host Dev Server

**From a new terminal:**

```bash
# Verify host bundle is accessible
curl -I http://localhost:8081/index.bundle

# Should return: HTTP/1.1 200 OK
```

**Note:** The exact endpoint may vary. Check the dev server logs for the correct path.

---

## Step 3: Launch iOS Simulator

### 3.1 Check Available Simulators

```bash
xcrun simctl list devices available | grep -i "iphone"
```

**Expected:** List of available iPhone simulators (e.g., iPhone 16, iPhone 15 Pro, etc.)

### 3.2 Boot Simulator

**Option A: Boot specific simulator**

```bash
xcrun simctl boot "iPhone 16"
```

**Option B: Open Simulator app (will boot default)**

```bash
open -a Simulator
```

**Option C: Boot and open**

```bash
xcrun simctl boot "iPhone 16" && open -a Simulator
```

**Expected:** Simulator window opens and boots iOS.

### 3.3 Verify Simulator is Running

```bash
xcrun simctl list devices | grep "Booted"
```

**Expected:** Shows booted simulator (e.g., `iPhone 16 (Booted)`)

---

## Step 4: Build and Launch iOS App

### 4.1 Build and Run Using Workspace Command

**From project root:**

```bash
PLATFORM=ios npx yarn workspace @universal/mobile-host ios:app
```

**This will:**

1. Build the iOS app using Xcode
2. Install the app on the simulator (`xcrun simctl install`)
3. Launch the app (`xcrun simctl launch`)

**Expected:** App appears in iOS simulator and launches automatically.

### 4.2 Alternative: Build and Run Separately

**Step 1: Build the app**

```bash
cd packages/mobile-host/ios
xcodebuild -workspace MobileHostTmp.xcworkspace \
  -scheme MobileHostTmp \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build
```

**Step 2: Install and launch**

```bash
# Install the built app
xcrun simctl install "iPhone 15" ./build/Build/Products/Debug-iphonesimulator/MobileHostTmp.app

# Launch the app
xcrun simctl launch "iPhone 15" com.universal.mobilehost
```

**Or use Xcode GUI:**

1. Open `packages/mobile-host/ios/MobileHostTmp.xcworkspace` in Xcode
2. Select "iPhone 15" (or your preferred simulator) as the target
3. Click the "Run" button (▶️)

---

## Step 5: Verify App Launch

### 5.1 Visual Verification

**Expected in Simulator:**

- ✅ App icon appears on home screen
- ✅ App launches without crashes
- ✅ App shows "Universal MFE - Mobile Host" title
- ✅ App shows "Dynamically loading remote via ScriptManager + MFv2" subtitle
- ✅ "Load Remote Component" button is visible

### 5.2 Console Verification

**Check Xcode console or terminal logs for:**

- ✅ No red error messages
- ✅ App registration: `AppRegistry.registerComponent("MobileHost", ...)`
- ✅ Dev server connection: Should connect to `http://localhost:8081`

**If you see errors:**

- Check that dev server is running on port 8081
- Verify simulator can access localhost (iOS simulators can by default)
- Check network security settings in Info.plist

---

## Step 6: Test Remote Component Loading

### 6.1 Load Remote Component

**In the iOS Simulator:**

1. Tap the "Load Remote Component" button
2. Watch for loading indicator
3. Wait for remote component to appear

**Expected:**

- ✅ Loading indicator appears
- ✅ Remote component loads successfully
- ✅ "Hello Mobile User" greeting appears
- ✅ "Press Me" button appears in remote component

### 6.2 Verify ScriptManager Resolver

**Check console logs for:**

```
[ScriptManager resolver] { scriptId: 'HelloRemote', caller: ... }
[ScriptManager resolver] resolved URL for HelloRemote: http://localhost:9005/HelloRemote.container.js.bundle
```

**Expected:**

- ✅ ScriptManager resolver is called
- ✅ URL resolves to `http://localhost:9005/...` (iOS uses port 9005)
- ✅ No errors in resolver

### 6.3 Verify Bundle Loading

**Check console logs for:**

- ✅ Bundle download starts
- ✅ Bundle loads successfully
- ✅ Module Federation exposes module correctly
- ✅ Component renders without errors

### 6.4 Test Interaction

**In the iOS Simulator:**

1. Tap the "Press Me" button in the remote component
2. Verify counter increments
3. Check that "Remote button pressed X times" message appears

**Expected:**

- ✅ Button responds to taps
- ✅ Counter increments correctly
- ✅ Message updates dynamically

---

## Troubleshooting

### Issue: Port 8081 Already in Use

**Symptoms:**

- Error: `Port 8081 is already in use`
- Dev server won't start

**Solutions:**

1. Find and kill the process:

   ```bash
   lsof -ti:8081 | xargs kill
   ```

2. Or use a different port:

   ```bash
   PORT=8082 PLATFORM=ios npx yarn workspace @universal/mobile-host start:bundler:ios
   ```

3. Update AppDelegate if using different port (not recommended for first run)

### Issue: Simulator Not Found

**Symptoms:**

- Error: `Unable to find a destination matching the provided destination specifier`
- Build fails

**Solutions:**

1. List available simulators:

   ```bash
   xcrun simctl list devices available
   ```

2. Update simulator name in `package.json`:

   ```json
   "ios:app": "... -destination 'platform=iOS Simulator,name=iPhone 16'"
   ```

3. Or boot the simulator first:
   ```bash
   xcrun simctl boot "iPhone 16"
   ```

### Issue: App Crashes on Launch

**Symptoms:**

- App launches then immediately crashes
- Red screen or blank screen

**Solutions:**

1. Check dev server is running on port 8081
2. Verify bundle is accessible:

   ```bash
   curl http://localhost:8081/index.bundle
   ```

3. Check Xcode console for error messages
4. Verify Info.plist has correct network settings:

   ```xml
   <key>NSAllowsLocalNetworking</key>
   <true/>
   ```

5. Verify AppDelegate bundle URL configuration

### Issue: Remote Component Won't Load

**Symptoms:**

- "Load Remote Component" button doesn't work
- Loading indicator appears but component never loads
- Error messages in console

**Solutions:**

1. Verify iOS remote server is running on port 9005:

   ```bash
   curl -I http://localhost:9005/HelloRemote.container.js.bundle
   ```

2. Check ScriptManager resolver logs
3. Verify REMOTE_HOST in App.tsx uses port 9005 for iOS:

   ```typescript
   const REMOTE_HOST =
     Platform.OS === 'ios' ? 'http://localhost:9005' : 'http://10.0.2.2:9004';
   ```

4. Check network security settings in Info.plist
5. Verify remote bundle was built for iOS:
   ```bash
   PLATFORM=ios yarn workspace @universal/mobile-remote-hello build:remote
   ```

### Issue: Build Errors

**Symptoms:**

- Xcode build fails
- Missing dependencies
- Code signing errors

**Solutions:**

1. Install CocoaPods dependencies:

   ```bash
   cd packages/mobile-host/ios
   pod install
   ```

2. Clean build folder in Xcode: `Product > Clean Build Folder`
3. Verify Xcode project settings:

   - Deployment target: iOS 16.0
   - Bundle identifier: `com.universal.mobilehost`
   - Hermes enabled: `USE_HERMES = true`

4. Check for missing native dependencies

---

## Verification Checklist

### Server Setup

- [ ] iOS remote server running on port 9005
- [ ] iOS host dev server running on port 8081
- [ ] Both servers accessible via HTTP

### Simulator Setup

- [ ] iOS simulator booted and running
- [ ] Simulator name matches package.json configuration
- [ ] Simulator can access localhost

### App Launch

- [ ] App builds successfully
- [ ] App installs on simulator
- [ ] App launches without crashes
- [ ] App UI displays correctly

### Remote Loading

- [ ] "Load Remote Component" button visible
- [ ] Button tap triggers loading
- [ ] ScriptManager resolver works
- [ ] Remote bundle loads successfully
- [ ] Remote component renders
- [ ] Interactions work (button taps, counter)

---

## Success Criteria

Phase 4 is **complete** when:

1. ✅ iOS host dev server runs on port 8081
2. ✅ iOS app builds and launches in simulator
3. ✅ App UI displays correctly
4. ✅ Remote component can be loaded
5. ✅ Remote component renders and interacts correctly

---

## Next Steps

After completing Phase 4 verification:

**Phase 5:** Test Remote Loading (Detailed)

- Comprehensive remote loading tests
- Error handling verification
- Performance testing
- Edge case testing

---

## Additional Notes

### Simulator Selection

The default simulator is "iPhone 16". To use a different simulator:

1. List available simulators:

   ```bash
   xcrun simctl list devices available
   ```

2. Update `package.json` scripts with the desired simulator name

3. Or specify at runtime:
   ```bash
   xcrun simctl boot "iPhone 15 Pro"
   # Then use that simulator in xcodebuild
   ```

### Running Multiple Terminals

For optimal workflow, use separate terminals:

- **Terminal 1**: iOS remote server (port 9005)
- **Terminal 2**: iOS host dev server (port 8081)
- **Terminal 3**: Build/run commands and testing

### Xcode Integration

You can also use Xcode directly:

1. Open `packages/mobile-host/ios/MobileHostTmp.xcworkspace`
2. Select simulator in Xcode
3. Click Run (▶️)
4. View logs in Xcode console

---

**Document Version:** 1.0  
**Last Updated:** 2026
