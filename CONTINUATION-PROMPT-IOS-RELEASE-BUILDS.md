# Continuation Prompt: iOS Simulator Release Builds Implementation

## 🚀 Quick Start

**Branch**: `feature/updated-full-ios-deploy-flow`
**Base**: `develop`
**Goal**: Implement iOS simulator release builds (Phase 6.7)

```bash
# You should already be on this branch
git status  # Verify: On branch feature/updated-full-ios-deploy-flow
```

---

## Context Summary

We have successfully completed Android release builds for physical devices with Module Federation v2. The next step is to implement iOS simulator release builds to achieve platform parity.

**Important**: All work should be done in the `feature/updated-full-ios-deploy-flow` branch, following Git Flow workflow.

### Recent Accomplishments (2026-01-26)

1. ✅ **Android Host Release Build** - Working on physical devices
2. ✅ **Android Remote Standalone Release Build** - Working on physical devices
3. ✅ **Firebase App Distribution** - Automated deployment via CI/CD
4. ✅ **All 5 Critical Issues Resolved**:
   - Issue #1: Console Global Not Available (PatchMFConsolePlugin)
   - Issue #2: DNS Resolution in Android Emulator
   - Issue #3: Development Mode Remote Bundle
   - Issue #4: Production Chunk ID Resolution
   - Issue #5: Missing React Native Codegen for Re.Pack
5. ✅ **Complete Documentation** - All fixes and processes documented
6. ✅ **CI/CD Tag-based Release** - v2.8.0 successfully deployed

### Current State

**Working:**
- ✅ Web: Shell and Remote (production) on Vercel
- ✅ Android: Host and Standalone (release) on physical devices via Firebase
- ✅ iOS: Host and Standalone (debug) on simulators (requires Metro bundler)

**Next Goal:**
- 🎯 iOS: Host and Standalone (release) on simulators (standalone, no Metro)

---

## Implementation Task: Phase 6.7 - iOS Simulator Release Builds

### Objective

Build iOS release configuration apps for simulator testing, achieving platform parity with Android release builds:
- Standalone operation (no Metro bundler required)
- Production bundles embedded
- PatchMFConsolePlugin verification
- Module Federation v2 with dynamic remote loading

### Why This Matters

- **$0 Cost**: No Apple Developer account required for simulator builds
- **Platform Parity**: iOS matches Android release capabilities
- **Production Testing**: Verify production bundles before investing in Apple account
- **Foundation**: When Apple Developer account is acquired, just add code signing

---

## Implementation Plan (from docs/CI-CD-IMPLEMENTATION-PLAN.md Phase 6.7)

### Task 6.7.1: Update Mobile-Host iOS Release Build for Simulator

**Changes Required:**

1. **Verify `packages/mobile-host/rspack.config.mjs`:**
   - ✅ PatchMFConsolePlugin already configured (same as Android)
   - ✅ Production mode respects `NODE_ENV=production`
   - ✅ Hermes bytecode compilation enabled

2. **Update `.github/workflows/deploy-ios.yml`:**
   - Change `-configuration Debug` to `-configuration Release` (line 68)
   - Add production bundle build step before Xcode build:
     ```yaml
     - name: Build Host iOS Production Bundle
       working-directory: packages/mobile-host
       run: NODE_ENV=production PLATFORM=ios npx rspack build --config ./rspack.config.mjs
     ```
   - Update release notes to indicate Release builds (not Debug)
   - Update installation instructions (no Metro bundler needed)

3. **Local Testing Command:**
   ```bash
   cd packages/mobile-host
   NODE_ENV=production PLATFORM=ios npx rspack build
   cd ios
   xcodebuild -workspace MobileHostTmp.xcworkspace \
     -scheme MobileHostTmp \
     -configuration Release \
     -sdk iphonesimulator \
     -destination 'platform=iOS Simulator,name=iPhone 16' \
     -derivedDataPath ./build \
     build
   ```

4. **Verification:**
   - No Metro bundler required
   - Loads production remote from `https://universal-mfe.web.app`
   - All chunks resolve correctly
   - PatchMFConsolePlugin prevents console crashes
   - Check for: `✓ Prepended console polyfill and patched Module Federation console calls`

### Task 6.7.2: Update Mobile-Remote-Hello iOS Release Build for Simulator

**Changes Required:**

1. **Verify `packages/mobile-remote-hello/rspack.config.mjs`:**
   - Production mode configuration
   - Standalone build works

2. **Update `.github/workflows/deploy-ios.yml`:**
   - Change `-configuration Debug` to `-configuration Release` (line 119)
   - Add production bundle build step:
     ```yaml
     - name: Build Standalone iOS Production Bundle
       working-directory: packages/mobile-remote-hello
       run: NODE_ENV=production PLATFORM=ios yarn build:standalone
     ```

3. **Local Testing Command:**
   ```bash
   cd packages/mobile-remote-hello
   NODE_ENV=production PLATFORM=ios yarn build:standalone
   cd ios
   xcodebuild -workspace MobileRemoteHello.xcworkspace \
     -scheme MobileRemoteHello \
     -configuration Release \
     -sdk iphonesimulator \
     -destination 'platform=iOS Simulator,name=iPhone 16' \
     -derivedDataPath ./build \
     build
   ```

### Task 6.7.3: Verify PatchMFConsolePlugin on iOS

**Verification Steps:**

1. Review `packages/mobile-host/scripts/PatchMFConsolePlugin.mjs`
2. Confirm it's in iOS Rspack config (same as Android)
3. Test on iOS Simulator with release build:
   - Check build output for console polyfill message
   - Verify no console-related crashes on app launch
   - Monitor Xcode Console for Hermes/console errors
4. Compare with Android behavior

### Task 6.7.4: Update Documentation

**Files to Update:**

1. `docs/CI-CD-IMPLEMENTATION-PLAN.md`:
   - Mark Phase 6.7 tasks as complete
   - Update status summary

2. `docs/MOBILE-RELEASE-BUILD-FIXES.md`:
   - Change "iOS Simulator Release Builds" from PLANNED to COMPLETE
   - Add iOS verification results
   - Document any iOS-specific issues

3. `README.md`:
   - Add iOS simulator release build instructions

4. `.github/workflows/deploy-ios.yml` release notes:
   - Change from "Debug Builds" to "Release Builds"
   - Remove Metro bundler requirement
   - Add standalone operation note

---

## Success Criteria

| Metric | Target |
|--------|--------|
| iOS Host Release Build | ✅ Compiles with `-configuration Release` |
| iOS Standalone Release Build | ✅ Compiles with `-configuration Release` |
| PatchMFConsolePlugin on iOS | ✅ No console crashes, polyfill prepended |
| Standalone Operation | ✅ No Metro bundler required |
| Production Bundles | ✅ Loads from `https://universal-mfe.web.app` |
| Module Federation | ✅ Remote loads correctly |
| Platform Parity | ✅ iOS matches Android behavior |
| CI/CD Automation | ✅ Tag push builds and releases |

---

## Key Files to Modify

1. `.github/workflows/deploy-ios.yml` - Main workflow file
2. `packages/mobile-host/rspack.config.mjs` - Already configured, verify only
3. `packages/mobile-remote-hello/rspack.config.mjs` - Already configured, verify only
4. Documentation files (as listed above)

---

## Important Notes

### PatchMFConsolePlugin
- Already implemented for Android in `packages/mobile-host/scripts/PatchMFConsolePlugin.mjs`
- Same Rspack config used for both Android and iOS
- Should work identically on iOS (Hermes behavior is platform-agnostic)

### Production Remote Bundles
- Already deployed to Firebase Hosting: `https://universal-mfe.web.app`
- Built with `NODE_ENV=production`
- Works for both Android and iOS

### No Apple Developer Account Required
- Simulator builds do NOT require Apple Developer account
- Can build, test, and distribute `.app` bundles via GitHub Releases
- Limitation: Simulator-only (no physical devices)

### Cost
- **$0** for simulator release builds
- **$99/year** only needed for physical device testing (future)

---

## Testing Workflow

### Local Testing (Before CI/CD)

1. **Build Mobile-Host iOS Release:**
   ```bash
   cd packages/mobile-host
   NODE_ENV=production PLATFORM=ios npx rspack build
   cd ios
   xcodebuild -workspace MobileHostTmp.xcworkspace \
     -scheme MobileHostTmp \
     -configuration Release \
     -sdk iphonesimulator \
     -destination 'platform=iOS Simulator,name=iPhone 16' \
     -derivedDataPath ./build \
     build

   # Install and run
   xcrun simctl install booted build/Build/Products/Release-iphonesimulator/MobileHostTmp.app
   xcrun simctl launch booted com.universal.mobilehost
   ```

2. **Build Mobile-Remote-Hello iOS Release:**
   ```bash
   cd packages/mobile-remote-hello
   NODE_ENV=production PLATFORM=ios yarn build:standalone
   cd ios
   xcodebuild -workspace MobileRemoteHello.xcworkspace \
     -scheme MobileRemoteHello \
     -configuration Release \
     -sdk iphonesimulator \
     -destination 'platform=iOS Simulator,name=iPhone 16' \
     -derivedDataPath ./build \
     build

   # Install and run on different simulator
   xcrun simctl boot "iPhone 15"
   xcrun simctl install "iPhone 15" build/Build/Products/Release-iphonesimulator/MobileRemoteHello.app
   xcrun simctl launch "iPhone 15" com.universal.mobileremote
   ```

### CI/CD Testing

1. **Update workflow files**
2. **Commit and push changes**
3. **Create new tag** (e.g., v2.9.0):
   ```bash
   git tag -a v2.9.0 -m "iOS simulator release builds"
   git push origin v2.9.0
   ```
4. **Monitor GitHub Actions**: https://github.com/pateatlau/universal-mfe-2026/actions
5. **Download builds from GitHub Release**
6. **Test on local simulators**

---

## Expected Outcomes

After successful implementation:

1. ✅ iOS release builds compile successfully
2. ✅ Apps work standalone (no Metro bundler)
3. ✅ Production bundles embedded and functional
4. ✅ PatchMFConsolePlugin verified on iOS
5. ✅ Module Federation v2 works on iOS release builds
6. ✅ Platform parity achieved (iOS = Android)
7. ✅ Complete documentation
8. ✅ CI/CD automation working

---

## Repository Information

- **Repo**: https://github.com/pateatlau/universal-mfe-2026
- **Current Branch**: `feature/updated-full-ios-deploy-flow` (created from `develop`)
- **Base Branch**: `develop`
- **Merge Target**: `develop` (after implementation complete)
- **Latest Production Tag**: v2.8.0 (Android release builds)
- **Next Tag**: v2.9.0 (iOS simulator release builds - after merge to main)

---

## Documentation References

- **Implementation Plan**: `docs/CI-CD-IMPLEMENTATION-PLAN.md` Phase 6.7
- **Mobile Release Fixes**: `docs/MOBILE-RELEASE-BUILD-FIXES.md`
- **PatchMFConsolePlugin Guide**: `docs/PATCHMFCONSOLEPLUGIN-GUIDE.md`
- **Git Flow**: `docs/GIT-FLOW-WORKFLOW.md`

---

## Commands Cheat Sheet

### Build Commands
```bash
# iOS Host Release
cd packages/mobile-host
NODE_ENV=production PLATFORM=ios npx rspack build
cd ios && xcodebuild -workspace MobileHostTmp.xcworkspace -scheme MobileHostTmp -configuration Release -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 16' -derivedDataPath ./build build

# iOS Standalone Release
cd packages/mobile-remote-hello
NODE_ENV=production PLATFORM=ios yarn build:standalone
cd ios && xcodebuild -workspace MobileRemoteHello.xcworkspace -scheme MobileRemoteHello -configuration Release -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 16' -derivedDataPath ./build build
```

### Install & Run
```bash
# Install on simulator
xcrun simctl install booted path/to/App.app
xcrun simctl launch booted com.bundle.identifier

# List simulators
xcrun simctl list devices available | grep iPhone
```

### Git & Release
```bash
# Create and push tag
git tag -a v2.9.0 -m "iOS simulator release builds"
git push origin v2.9.0

# Monitor workflow
open https://github.com/pateatlau/universal-mfe-2026/actions
```

---

## Start Here

When you begin the next session:

### 1. Verify Branch Setup
```bash
git status  # Should show: On branch feature/updated-full-ios-deploy-flow
git branch -vv  # Verify tracking origin/feature/updated-full-ios-deploy-flow
```

### 2. Review Documentation
- **This file** - Complete implementation guide
- `docs/CI-CD-IMPLEMENTATION-PLAN.md` Phase 6.7 - Detailed steps
- `docs/MOBILE-RELEASE-BUILD-FIXES.md` - Context on Android fixes

### 3. Implementation Order
1. ✅ **Verify branch** (feature/updated-full-ios-deploy-flow)
2. 🔧 **Task 6.7.1** - Mobile-Host iOS release build
3. 🔧 **Task 6.7.2** - Mobile-Remote-Hello iOS release build
4. ✅ **Task 6.7.3** - Verify PatchMFConsolePlugin on iOS
5. 📝 **Task 6.7.4** - Update documentation
6. 🧪 **Test locally** before updating CI/CD
7. 🔄 **Update workflow** `.github/workflows/deploy-ios.yml`
8. ✅ **Commit and push** to feature branch
9. 🔀 **Create PR** to merge to develop
10. 🏷️ **Create tag** after merge to main (v2.9.0)

### 4. Git Flow Workflow
```bash
# Work on feature branch
git checkout feature/updated-full-ios-deploy-flow
# ... make changes, test ...
git add .
git commit -m "feat: implement iOS simulator release builds"
git push origin feature/updated-full-ios-deploy-flow

# After all work is done and tested
# Create PR: feature/updated-full-ios-deploy-flow → develop
# After review and merge to develop
# Merge develop → main
# Then create release tag v2.9.0 on main
```

### 5. Success Checklist
- [ ] iOS host builds with `-configuration Release`
- [ ] iOS standalone builds with `-configuration Release`
- [ ] Production bundles embedded (no Metro needed)
- [ ] PatchMFConsolePlugin verified on iOS
- [ ] Module Federation loads remote correctly
- [ ] Documentation updated
- [ ] CI/CD workflow updated
- [ ] Changes committed to feature branch
- [ ] PR created and merged
- [ ] Tag v2.9.0 created (triggers deployment)

Let's implement iOS simulator release builds and achieve complete platform parity! 🚀
