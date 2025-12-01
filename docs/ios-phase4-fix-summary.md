# iOS Phase 4 - Build/Install/Launch Fix

**Issue:** `xcodebuild build` only builds the app, it doesn't install or launch it in the simulator.

**Solution:** Updated `ios:app` script to include build, install, and launch steps.

---

## Problem

The original script only ran `xcodebuild build`, which:
- ✅ Builds the app successfully
- ❌ Does NOT install it on the simulator
- ❌ Does NOT launch it

**Result:** Build succeeded but app didn't appear in simulator.

---

## Solution

Updated the `ios:app` script to perform three steps:

1. **Build** the app using `xcodebuild`
2. **Install** the app on simulator using `xcrun simctl install`
3. **Launch** the app using `xcrun simctl launch`

### Updated Script

**Before:**
```json
"ios:app": "cd ios && xcodebuild -workspace MobileHostTmp.xcworkspace -scheme MobileHostTmp -configuration Debug -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.5'"
```

**After:**
```json
"ios:app": "cd ios && xcodebuild -workspace MobileHostTmp.xcworkspace -scheme MobileHostTmp -configuration Debug -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.5' -derivedDataPath ./build build && xcrun simctl install 'iPhone 15' ./build/Build/Products/Debug-iphonesimulator/MobileHostTmp.app && xcrun simctl launch 'iPhone 15' com.universal.mobilehost"
```

---

## How It Works

### Step 1: Build
```bash
xcodebuild -workspace MobileHostTmp.xcworkspace \
  -scheme MobileHostTmp \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15,OS=17.5' \
  -derivedDataPath ./build \
  build
```

**Output:** `./build/Build/Products/Debug-iphonesimulator/MobileHostTmp.app`

### Step 2: Install
```bash
xcrun simctl install "iPhone 15" \
  ./build/Build/Products/Debug-iphonesimulator/MobileHostTmp.app
```

**Result:** App installed on simulator at:
`/Users/[user]/Library/Developer/CoreSimulator/Devices/[device-id]/data/Containers/Bundle/Application/[app-id]/MobileHostTmp.app`

### Step 3: Launch
```bash
xcrun simctl launch "iPhone 15" com.universal.mobilehost
```

**Result:** App launches and process ID is returned (e.g., `com.universal.mobilehost: 14055`)

---

## Verification

### Check App is Installed
```bash
xcrun simctl get_app_container "iPhone 15" com.universal.mobilehost
# Returns: Path to installed app
```

### Check App is Running
```bash
ps aux | grep com.universal.mobilehost
# Shows running process
```

### Check Simulator Status
```bash
xcrun simctl list devices | grep "Booted"
# Shows: iPhone 15 (Booted)
```

---

## Usage

**From project root:**
```bash
PLATFORM=ios npx yarn workspace @universal/mobile-host ios:app
```

**This will:**
1. ✅ Build the app
2. ✅ Install it on iPhone 15 simulator
3. ✅ Launch it automatically

**Expected:** App appears in simulator and is running.

---

## Troubleshooting

### Issue: Simulator Not Found

**Error:** `Unable to find device: iPhone 15`

**Solution:**
1. List available simulators:
   ```bash
   xcrun simctl list devices available
   ```

2. Boot the simulator:
   ```bash
   xcrun simctl boot "iPhone 15"
   ```

3. Or update the script with correct simulator name

### Issue: App Path Not Found

**Error:** `xcrun simctl install: No such file or directory`

**Solution:**
1. Verify build succeeded:
   ```bash
   ls -la ./build/Build/Products/Debug-iphonesimulator/MobileHostTmp.app
   ```

2. Check `-derivedDataPath` is set correctly
3. Rebuild if app not found

### Issue: Bundle ID Mismatch

**Error:** `xcrun simctl launch: No such app`

**Solution:**
1. Verify bundle ID in Xcode project settings
2. Check `Info.plist` has correct `CFBundleIdentifier`
3. Should be: `com.universal.mobilehost`

### Issue: App Installs But Doesn't Launch

**Solution:**
1. Manually launch:
   ```bash
   xcrun simctl launch "iPhone 15" com.universal.mobilehost
   ```

2. Or open Simulator and tap the app icon

---

## Alternative: Using Xcode GUI

If command-line approach has issues, use Xcode:

1. Open `packages/mobile-host/ios/MobileHostTmp.xcworkspace` in Xcode
2. Select "iPhone 15" as the target device
3. Click "Run" button (▶️)
4. Xcode handles build, install, and launch automatically

---

## Summary

**Problem:** Build succeeded but app didn't launch  
**Root Cause:** `xcodebuild build` only builds, doesn't install/launch  
**Solution:** Added `xcrun simctl install` and `xcrun simctl launch` steps  
**Status:** ✅ Fixed - App now builds, installs, and launches automatically

---

**Document Version:** 1.0  
**Fixed:** 2026

