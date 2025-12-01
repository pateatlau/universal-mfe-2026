# iOS Implementation Action Plan

**Goal:** Make everything that works on Android also work on iOS.

**Status:** ✅ **COMPLETE** - All phases successfully implemented and tested. See `ios-phase4-final-success.md` for final summary.

**Prerequisites:**
- ✅ Xcode is installed
- ✅ iOS folder exists in `packages/mobile-host/ios/`
- ✅ Basic iOS project structure (Podfile, AppDelegate.swift, Xcode project)

---

## Phase 1: Configuration & Setup (Foundation)

### 1.1 Fix Module Name Mismatch

**Issue:** 
- `app.json` has `name: "MobileHost"`
- `AppDelegate.swift` uses `"MobileHostTmp"` as module name
- `index.js` imports from `app.json`, so it will register as "MobileHost"
- This mismatch will cause app registration failure

**Action:**
1. Update `AppDelegate.swift` to use `"MobileHost"` instead of `"MobileHostTmp"`
2. Verify `app.json` has correct name: `"MobileHost"`
3. Update Xcode project target name if needed (or keep as MobileHostTmp but ensure module name matches)

**Files to modify:**
- `packages/mobile-host/ios/MobileHostTmp/AppDelegate.swift` (line 27)
- Verify `packages/mobile-host/app.json`

**Expected Result:** Module name consistency across all files.

---

### 1.2 Fix Package.json iOS Scripts

**Issue:**
- Current iOS script: `"ios": "rspack serve --config ./repack.config.mjs --env PLATFORM=ios"`
- Config file should be `rspack.config.mjs` (not `repack.config.mjs`)

**Action:**
1. Update `package.json` iOS scripts to use correct config file
2. Add proper iOS build and run scripts

**Files to modify:**
- `packages/mobile-host/package.json`

**Expected Result:**
```json
{
  "scripts": {
    "start:bundler:ios": "rspack serve --config ./rspack.config.mjs --env PLATFORM=ios",
    "ios:app": "cd ios && xcodebuild -workspace MobileHostTmp.xcworkspace -scheme MobileHostTmp -configuration Debug -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 15'",
    "ios": "yarn start:bundler:ios & yarn ios:app",
    "ios:simulator": "react-native run-ios --simulator=\"iPhone 15\"",
    "build:ios": "rspack build --config ./rspack.config.mjs --env PLATFORM=ios"
  }
}
```

---

### 1.3 Install CocoaPods Dependencies

**Action:**
1. Navigate to iOS directory: `cd packages/mobile-host/ios`
2. Install pods: `pod install`
3. Verify `MobileHostTmp.xcworkspace` is created (not just `.xcodeproj`)

**Expected Result:** 
- Pods installed successfully
- `MobileHostTmp.xcworkspace` exists
- All React Native dependencies linked

**Note:** If pod install fails, may need to:
- Update CocoaPods: `sudo gem install cocoapods`
- Clear pod cache: `pod cache clean --all`
- Update repo: `pod repo update`

---

### 1.4 Verify Re.Pack Configuration for iOS

**Action:**
1. Verify `rspack.config.mjs` correctly handles `PLATFORM=ios`:
   - Platform variable: `const platform = process.env.PLATFORM || 'android';`
   - Dev server port: `port: platform === 'ios' ? 8081 : 8080`
   - RepackPlugin platform: `platform: platform`
   - Resolve options: `Repack.getResolveOptions({ platform, ... })`

2. Verify Hermes is enabled (should be same as Android):
   ```javascript
   new Repack.RepackPlugin({
     platform: platform,
     hermes: true, // REQUIRED for ScriptManager
   })
   ```

**Files to verify:**
- `packages/mobile-host/rspack.config.mjs`

**Expected Result:** Configuration supports iOS platform correctly.

---

### 1.5 Verify ScriptManager Resolver for iOS

**Action:**
1. Verify `App.tsx` has correct iOS networking:
   ```typescript
   const REMOTE_HOST =
     Platform.OS === 'android'
       ? 'http://10.0.2.2:9004' // Android emulator
       : 'http://localhost:9004'; // iOS simulator
   ```

2. Verify ScriptManager resolver handles all scriptIds correctly (should be same as Android)

**Files to verify:**
- `packages/mobile-host/src/App.tsx`

**Expected Result:** iOS simulator uses `localhost` for remote bundle URLs.

---

## Phase 2: Xcode Project Configuration

### 2.1 Configure Xcode Project Settings

**Action:**
1. Open `packages/mobile-host/ios/MobileHostTmp.xcworkspace` in Xcode
2. Verify/Set:
   - **Bundle Identifier**: Set to unique identifier (e.g., `com.universal.mobilehost`)
   - **Deployment Target**: iOS 16+ (as per tech stack requirements)
   - **Signing & Capabilities**: Configure development team for simulator
   - **Build Configuration**: Ensure Debug configuration is set correctly

3. Verify Hermes is enabled:
   - Check build settings for `USE_HERMES = YES`
   - Verify in Podfile that Hermes is included

**Expected Result:** Xcode project configured correctly for development.

---

### 2.2 Configure Info.plist for Network Access

**Action:**
1. Verify `Info.plist` has network security settings:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSAllowsLocalNetworking</key>
     <true/>
   </dict>
   ```

2. This is already present in the current Info.plist (line 32-33), but verify it's correct.

**Files to verify:**
- `packages/mobile-host/ios/MobileHostTmp/Info.plist`

**Expected Result:** App can access localhost for dev server.

---

### 2.3 Verify AppDelegate Bundle URL Configuration

**Action:**
1. Verify `AppDelegate.swift` bundle URL configuration:
   - Debug mode: Should use `RCTBundleURLProvider` for dev server
   - Release mode: Should use bundled `main.jsbundle`

2. Current implementation looks correct, but verify:
   ```swift
   override func bundleURL() -> URL? {
   #if DEBUG
     RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
   #else
     Bundle.main.url(forResource: "main", withExtension: "jsbundle")
   #endif
   }
   ```

**Files to verify:**
- `packages/mobile-host/ios/MobileHostTmp/AppDelegate.swift`

**Expected Result:** App loads bundle from Re.Pack dev server in debug mode.

---

## Phase 3: Build & Test iOS Remote Bundle

### 3.1 Build iOS Remote Bundle

**Action:**
1. Navigate to mobile-remote-hello: `cd packages/mobile-remote-hello`
2. Build remote bundle for iOS:
   ```bash
   PLATFORM=ios yarn build:remote
   # or
   rspack build --config ./repack.remote.config.mjs --env PLATFORM=ios
   ```

3. Verify output:
   - `HelloRemote.container.js.bundle` exists
   - `__federation_expose_HelloRemote.bundle` exists
   - `mf-manifest.json` exists

**Expected Result:** iOS remote bundle built successfully.

---

### 3.2 Serve iOS Remote Bundle

**Action:**
1. Start dev server for remote:
   ```bash
   cd packages/mobile-remote-hello
   yarn serve  # Port 9004
   ```

2. Verify bundles are accessible:
   ```bash
   curl http://localhost:9004/HelloRemote.container.js.bundle
   curl http://localhost:9004/__federation_expose_HelloRemote.bundle
   ```

**Expected Result:** Remote bundles accessible via localhost:9004.

---

## Phase 4: Build & Run iOS Host

### 4.1 Build iOS Host Bundle

**Action:**
1. Navigate to mobile-host: `cd packages/mobile-host`
2. Start Re.Pack dev server for iOS:
   ```bash
   yarn start:bundler:ios
   # or
   rspack serve --config ./rspack.config.mjs --env PLATFORM=ios
   ```

3. Verify dev server starts on port 8081
4. Verify bundle is accessible:
   ```bash
   curl http://localhost:8081/index.bundle
   ```

**Expected Result:** iOS host dev server running on port 8081.

---

### 4.2 Run iOS App in Simulator

**Action:**
1. Ensure iOS simulator is running (or start one):
   ```bash
   xcrun simctl list devices
   xcrun simctl boot "iPhone 15"  # or your preferred simulator
   ```

2. Build and run iOS app:
   ```bash
   cd packages/mobile-host/ios
   xcodebuild -workspace MobileHostTmp.xcworkspace \
     -scheme MobileHostTmp \
     -configuration Debug \
     -sdk iphonesimulator \
     -destination 'platform=iOS Simulator,name=iPhone 15' \
     build
   ```

3. Or use React Native CLI (if configured):
   ```bash
   cd packages/mobile-host
   react-native run-ios --simulator="iPhone 15"
   ```

**Expected Result:** iOS app launches in simulator.

---

## Phase 5: Test Remote Loading

### 5.1 Verify App Registration

**Action:**
1. Check console logs for app registration:
   - Should see: `AppRegistry.registerComponent("MobileHost", ...)`
   - No errors about module name mismatch

**Expected Result:** App registers successfully.

---

### 5.2 Test ScriptManager Resolver

**Action:**
1. Tap "Load Remote Component" button
2. Check console logs for ScriptManager resolver:
   - Should see: `[ScriptManager resolver] { scriptId: 'HelloRemote', ... }`
   - Should see resolved URL: `http://localhost:9004/HelloRemote.container.js.bundle`

**Expected Result:** ScriptManager resolver works correctly for iOS.

---

### 5.3 Test Remote Bundle Loading

**Action:**
1. Verify network requests in Xcode console:
   - Request to: `http://localhost:9004/HelloRemote.container.js.bundle`
   - Request to: `http://localhost:9004/__federation_expose_HelloRemote.bundle`

2. Check for errors:
   - No CORS errors (iOS doesn't have CORS like web)
   - No network errors
   - Bundles load successfully

**Expected Result:** Remote bundles load successfully.

---

### 5.4 Test Hermes Execution

**Action:**
1. Verify bundle executes in Hermes:
   - Check console for Hermes-related logs
   - No errors about `exports` or `require` globals
   - Module Federation runtime initializes

**Expected Result:** Bundles execute correctly in Hermes.

---

### 5.5 Test Remote Component Rendering

**Action:**
1. Verify `HelloRemote` component renders:
   - Should see "Hello, Mobile User!" text
   - Should see "Press Me" button

2. Test interaction:
   - Tap "Press Me" button
   - Verify counter increments
   - Verify state updates work

**Expected Result:** Remote component renders and functions correctly.

---

## Phase 6: Validation & Documentation

### 6.1 End-to-End Validation

**Action:**
1. Verify complete workflow:
   - ✅ Build iOS remote bundle
   - ✅ Serve remote bundle
   - ✅ Start iOS host dev server
   - ✅ Launch iOS app in simulator
   - ✅ Load remote component dynamically
   - ✅ Render remote component
   - ✅ Test interactions (button press, state updates)

2. Compare with Android:
   - Same functionality works
   - Same remote component renders
   - Same ScriptManager workflow
   - Same Module Federation behavior

**Expected Result:** iOS implementation matches Android functionality.

---

### 6.2 Update Documentation

**Action:**
1. Update `universal-mfe-implementation-analysis.md`:
   - Change iOS status from "Coming Soon" to "Complete"
   - Add iOS-specific notes if any differences found

2. Update `POC-0-Implementation-Summary.md`:
   - Add iOS completion status

3. Update `README.md` in mobile-host:
   - Add iOS development instructions
   - Add iOS-specific commands

**Files to update:**
- `docs/universal-mfe-implementation-analysis.md`
- `docs/POC-0-Implementation-Summary.md`
- `packages/mobile-host/README.md`

---

## Phase 7: Troubleshooting (If Needed)

### Common Issues & Solutions

#### Issue 1: Module Name Mismatch
**Symptom:** App doesn't register, white screen
**Solution:** Ensure `AppDelegate.swift`, `app.json`, and `index.js` all use same module name

#### Issue 2: Pod Install Fails
**Symptom:** `pod install` errors
**Solution:** 
- Update CocoaPods: `sudo gem install cocoapods`
- Clear cache: `pod cache clean --all`
- Delete `Podfile.lock` and `Pods/` folder, reinstall

#### Issue 3: Dev Server Not Accessible
**Symptom:** Network errors, can't load bundle
**Solution:**
- Verify dev server is running on correct port (8081 for iOS)
- Check `Info.plist` has `NSAllowsLocalNetworking = true`
- Verify firewall allows localhost connections

#### Issue 4: Bundle Format Errors
**Symptom:** Hermes evaluation fails
**Solution:**
- Verify bundles are `.bundle` format (not `.js`)
- Verify `publicPath: ""` in config
- Verify Hermes is enabled in Re.Pack config

#### Issue 5: Xcode Build Errors
**Symptom:** Build fails in Xcode
**Solution:**
- Clean build folder: `Product > Clean Build Folder`
- Delete derived data
- Verify all pods are installed
- Check signing & capabilities

---

## Implementation Checklist

### Configuration
- [ ] Fix module name mismatch (AppDelegate vs app.json)
- [ ] Fix package.json iOS scripts (config file name)
- [ ] Install CocoaPods dependencies
- [ ] Verify Re.Pack config supports iOS
- [ ] Verify ScriptManager resolver for iOS

### Xcode Setup
- [ ] Configure Xcode project settings
- [ ] Verify Info.plist network settings
- [ ] Verify AppDelegate bundle URL config
- [ ] Verify Hermes is enabled

### Build & Test
- [ ] Build iOS remote bundle
- [ ] Serve iOS remote bundle
- [ ] Build iOS host bundle
- [ ] Run iOS app in simulator
- [ ] Test app registration
- [ ] Test ScriptManager resolver
- [ ] Test remote bundle loading
- [ ] Test Hermes execution
- [ ] Test remote component rendering
- [ ] Test interactions (button press)

### Validation
- [ ] End-to-end validation complete
- [ ] Compare with Android functionality
- [ ] Update documentation

---

## Success Criteria

✅ **iOS implementation is complete when:**

1. iOS app launches successfully in simulator
2. Remote component loads dynamically via ScriptManager
3. Remote component renders correctly
4. Interactions work (button press, state updates)
5. All functionality matches Android implementation
6. Documentation is updated

---

## Estimated Timeline

- **Phase 1 (Configuration)**: 1-2 hours
- **Phase 2 (Xcode Setup)**: 1 hour
- **Phase 3 (Build Remote)**: 30 minutes
- **Phase 4 (Build Host)**: 30 minutes
- **Phase 5 (Testing)**: 1-2 hours
- **Phase 6 (Documentation)**: 30 minutes
- **Phase 7 (Troubleshooting)**: Variable

**Total Estimated Time:** 4-7 hours (excluding troubleshooting)

---

## Next Steps After Completion

1. Test on physical iOS device
2. Verify production build process
3. Add iOS-specific optimizations if needed
4. Update CI/CD for iOS builds
5. Document iOS deployment process

---

**Document Version:** 1.0  
**Created:** 2026  
**Status:** Ready for Implementation

