# CI/CD Workflow Integration - Continuation Prompt

**Date Created**: January 27, 2026
**Current Branch**: `feature/updated-full-ios-deploy-flow`
**Previous Phase Completed**: Phase 6.7 - iOS Simulator Release Builds ✅

---

## Context Summary

The Universal MFE project has successfully completed iOS simulator release build implementation (Phase 6.7). Both the mobile-host and mobile-remote-hello apps now build and run successfully on iOS simulators with Module Federation v2 dynamic loading, achieving full platform parity with Android.

### Recent Achievements (Phase 6.7)

**iOS Release Build Implementation** ✅
- Extended PatchMFConsolePlugin with Platform polyfill to prevent initialization crashes
- Created custom Xcode bundling scripts (`ios/scripts/bundle-repack.sh`) for Re.Pack integration
- Modified Xcode project files to use custom bundling during build phase
- Verified on iPhone 15 (host) and iPhone 15 Pro (standalone remote) simulators
- All 15 verification tests passed

**Technical Solutions**:
1. **Platform Polyfill**: Provides `Platform.constants` and `Platform.isTesting` before React Native runtime initializes
2. **Custom Xcode Scripts**: Integrate `yarn build:standalone` with Xcode build process
3. **Code Signing Integration**: Bundle creation happens during build, before signing

**Documentation**: All documentation updated (8 documents total, including new IOS-RELEASE-BUILD-IMPLEMENTATION.md)

**Latest Commit**: `4f9eaeb` - "docs: complete iOS release build documentation (Phase 6.7)"

---

## Next Task: CI/CD Workflow Integration

### Objective

Integrate iOS release build process into GitHub Actions CI/CD workflows to enable automated builds and deployments.

### Scope

Update the following GitHub Actions workflows to use the new custom bundling approach:

1. **`.github/workflows/deploy-ios.yml`** - iOS deployment workflow
2. **`.github/workflows/test-ios.yml`** (if exists) - iOS testing workflow
3. Any other iOS-related workflows

### Key Implementation Requirements

#### 1. iOS Build Steps to Integrate

**For Mobile Host** (`packages/mobile-host`):
```bash
# Build production bundle with custom script
cd packages/mobile-host
PLATFORM=ios NODE_ENV=production yarn build

# Bundle is automatically created by Xcode build script at:
# ios/scripts/bundle-repack.sh

# Xcode build command (Release configuration)
cd ios
xcodebuild -workspace MobileHostTmp.xcworkspace \
  -scheme MobileHostTmp \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath ./build \
  build
```

**For Mobile Remote** (`packages/mobile-remote-hello`):
```bash
# Build production standalone bundle with custom script
cd packages/mobile-remote-hello
PLATFORM=ios NODE_ENV=production yarn build:standalone

# Bundle is automatically created by Xcode build script at:
# ios/scripts/bundle-repack.sh

# Xcode build command (Release configuration)
cd ios
xcodebuild -project MobileRemoteHello.xcodeproj \
  -scheme MobileRemoteHello \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath ./build \
  build
```

#### 2. Environment Variables Required

```yaml
env:
  NODE_ENV: production
  PLATFORM: ios
  CONFIGURATION: Release
```

#### 3. Custom Bundling Script Locations

- **Mobile Host**: `packages/mobile-host/ios/scripts/bundle-repack.sh`
- **Mobile Remote**: `packages/mobile-remote-hello/ios/scripts/bundle-repack.sh`

Both scripts handle:
- Platform-specific bundle output paths
- Debug vs Release configuration detection
- Asset copying
- Integration with Xcode build process

#### 4. Bundle Output Verification

Verify bundles are created at expected locations:
- Mobile Host: `packages/mobile-host/ios/build/Build/Products/Release-iphonesimulator/MobileHostTmp.app/main.jsbundle`
- Mobile Remote: `packages/mobile-remote-hello/ios/build/Build/Products/Release-iphonesimulator/MobileRemoteHello.app/main.jsbundle`

### Critical Considerations

#### CocoaPods Dependencies
```bash
# May need to run before build
cd packages/mobile-host/ios
pod install

cd packages/mobile-remote-hello/ios
pod install
```

#### Xcode Version
- Current development uses: **Xcode 16.2**
- CI runner should use compatible version

#### Code Signing
- Simulator builds: No code signing required
- Device builds: Will require provisioning profiles and certificates

#### Caching Strategy
Consider caching:
- `node_modules/` (after yarn install)
- `packages/mobile-host/ios/Pods/` (after pod install)
- `packages/mobile-remote-hello/ios/Pods/` (after pod install)
- Derived Data (Xcode build cache)

### Testing Requirements

#### Post-Build Verification
```bash
# Verify bundle files exist and have content
ls -lh packages/mobile-host/ios/build/Build/Products/Release-iphonesimulator/MobileHostTmp.app/main.jsbundle
ls -lh packages/mobile-remote-hello/ios/build/Build/Products/Release-iphonesimulator/MobileRemoteHello.app/main.jsbundle

# Verify app bundles can be installed (requires simulator running)
xcrun simctl install booted packages/mobile-host/ios/build/Build/Products/Release-iphonesimulator/MobileHostTmp.app
xcrun simctl install booted packages/mobile-remote-hello/ios/build/Build/Products/Release-iphonesimulator/MobileRemoteHello.app
```

#### Smoke Tests
Consider adding basic smoke tests:
1. App launches without crashes
2. Bundle size is reasonable (host: ~5-8MB, remote: ~2-5MB)
3. No missing assets warnings

### Deployment Integration

If deploying iOS app bundles to Firebase Hosting or other CDN:

1. **Build artifacts to upload**:
   - `packages/mobile-host/ios/build/Build/Products/Release-iphonesimulator/MobileHostTmp.app/`
   - `packages/mobile-remote-hello/ios/build/Build/Products/Release-iphonesimulator/MobileRemoteHello.app/`

2. **Remote bundle deployment** (mobile-remote-hello):
   - Bundle files from `dist/standalone/ios/*.bundle`
   - Upload to Firebase Hosting for runtime loading by mobile-host

### Reference Documentation

**Implementation Details**:
- `docs/IOS-RELEASE-BUILD-IMPLEMENTATION.md` - Complete iOS implementation summary
- `docs/MOBILE-RELEASE-BUILD-FIXES.md` - Platform polyfill and bundling script details
- `docs/CI-CD-IMPLEMENTATION-PLAN.md` - Overall CI/CD plan (Phase 6.7 marked complete)

**Testing Guide**:
- `docs/universal-mfe-all-platforms-testing-guide.md` - Manual testing procedures

**Technical Details**:
- `docs/PATCHMFCONSOLEPLUGIN-GUIDE.md` - Platform and console polyfill explanation
- `packages/mobile-host/rspack.config.mjs` - Build configuration
- `packages/mobile-remote-hello/repack.remote.config.mjs` - Remote build configuration

### Success Criteria

CI/CD integration is complete when:

- [ ] `.github/workflows/deploy-ios.yml` updated with custom bundling steps
- [ ] Workflow successfully builds both mobile-host and mobile-remote-hello for iOS
- [ ] Bundle files created and verified in CI environment
- [ ] Apps installable on simulator in CI environment
- [ ] No hardcoded paths or developer-specific configurations
- [ ] Caching configured for optimal build times
- [ ] Error handling for build failures implemented
- [ ] Deployment of remote bundles to Firebase Hosting working (if applicable)
- [ ] Documentation updated with CI/CD usage examples

---

## Current Repository State

**Branch**: `feature/updated-full-ios-deploy-flow`

**Recent Commits**:
```
4f9eaeb docs: complete iOS release build documentation (Phase 6.7)
1075e70 fix: implement iOS release build workaround for Re.Pack
730a6d2 feat: implement iOS simulator release builds (Phase 6.7)
```

**Key Files Modified in Phase 6.7**:
- `packages/mobile-host/ios/scripts/bundle-repack.sh` (new)
- `packages/mobile-remote-hello/ios/scripts/bundle-repack.sh` (new)
- `packages/mobile-host/ios/MobileHostTmp.xcodeproj/project.pbxproj`
- `packages/mobile-remote-hello/ios/MobileRemoteHello.xcodeproj/project.pbxproj`
- `packages/mobile-host/scripts/PatchMFConsolePlugin.mjs`
- `packages/mobile-host/rspack.config.mjs`
- Multiple documentation files

**Verified Working**:
- iOS simulator release builds (both host and standalone remote)
- Module Federation v2 dynamic loading on iOS
- Platform polyfill preventing initialization crashes
- Custom Xcode bundling integration

---

## Commands to Start

```bash
# Verify current state
git status
git log -3 --oneline

# Check existing CI/CD workflows
ls -la .github/workflows/

# Read existing iOS workflow (if exists)
cat .github/workflows/deploy-ios.yml

# Test local build to verify commands
cd packages/mobile-host
PLATFORM=ios NODE_ENV=production yarn build
```

---

## Important Notes

1. **No Breaking Changes**: The custom bundling scripts are already integrated and working locally - CI just needs to replicate the same steps.

2. **Simulator vs Device**: Current implementation is for simulator builds. Device builds will require additional code signing setup.

3. **Monorepo Context**: Ensure CI workflows run from repo root and use proper workspace commands: `yarn workspace @universal/mobile-host build`

4. **Platform Polyfill**: The PatchMFConsolePlugin with Platform polyfill is critical - ensure it runs during CI builds.

5. **Hermes Binaries**: The `ios/Pods/` directory is committed to ensure reproducible builds - CI should use these committed binaries.

---

## Questions to Clarify Before Starting

1. Does `.github/workflows/deploy-ios.yml` already exist? If so, review its current structure.
2. What CI runner type is used for iOS builds? (macOS runner required for Xcode)
3. Are there existing Firebase Hosting deployment steps for Android that can be mirrored for iOS?
4. What is the target deployment environment? (Simulator-only or also device builds?)
5. Are there code signing credentials configured in GitHub Secrets for device builds?

---

**Ready to Proceed**: This continuation prompt provides all context needed to implement CI/CD workflow integration for iOS release builds. Start by examining existing workflows and adapting them to use the custom bundling approach.
