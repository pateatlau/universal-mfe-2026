# CI/CD Testing Guide

This guide provides step-by-step instructions for testing the complete CI/CD pipeline for the Universal MFE platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Workflow Overview](#workflow-overview)
3. [Testing Mobile Remote Bundle Deployment](#testing-mobile-remote-bundle-deployment)
4. [Testing Android Release Deployment](#testing-android-release-deployment)
5. [Testing on Physical Devices](#testing-on-physical-devices)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### GitHub Secrets Configuration

Ensure the following secrets are configured in GitHub repository settings:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON | Firebase Console → Project Settings → Service Accounts → Generate new private key |
| `FIREBASE_APP_ID_ANDROID_HOST` | App ID for mobile-host | Firebase Console → Project Settings → Your apps → Android app |
| `FIREBASE_APP_ID_ANDROID_REMOTE` | App ID for mobile-remote-hello | Firebase Console → Project Settings → Your apps → Android app |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded Android keystore | `base64 -i your-keystore.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password | From your keystore configuration |
| `ANDROID_KEY_ALIAS` | Key alias | From your keystore configuration |
| `ANDROID_KEY_PASSWORD` | Key password | From your keystore configuration |

**Verify secrets**:
```
https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
```

### Local Testing Tools

```bash
# Firebase CLI
npm install -g firebase-tools

# Verify installation
firebase --version
```

---

## Workflow Overview

### Complete Deployment Flow

```
1. Feature Development (feature/*)
   ↓
2. Merge to develop (CI runs)
   ↓
3. PR develop → main (CI runs on PR)
   ↓
4. Merge to main
   ├─→ Deploy Web (Vercel)
   ├─→ Deploy Mobile Remote Bundles (Firebase Hosting)
   └─→ E2E Tests (optional)
   ↓
5. Create Release Tag (v*)
   ├─→ Build Release APKs
   ├─→ Upload to Firebase App Distribution
   └─→ Create GitHub Release
   ↓
6. Testers receive email → Test on physical devices
```

### Workflow Files

| Workflow | File | Trigger |
|----------|------|---------|
| CI | `.github/workflows/ci.yml` | Push/PR to main/develop |
| Deploy Web | `.github/workflows/deploy-web.yml` | Push to main |
| **Deploy Mobile Bundles** | `.github/workflows/deploy-mobile-remote-bundles.yml` | **Push to main** |
| **Deploy Android** | `.github/workflows/deploy-android.yml` | **Tag push (v*)** |
| Deploy iOS | `.github/workflows/deploy-ios.yml` | Tag push (v*) |

---

## Testing Mobile Remote Bundle Deployment

### Workflow: `deploy-mobile-remote-bundles.yml`

**Triggers**:
- Push to `main` branch (paths: `packages/mobile-remote-hello/**`, `packages/shared-*/**`)
- Manual trigger via GitHub Actions UI

### Step 1: Test Automatic Deployment

**Scenario**: Push changes to mobile-remote-hello or shared packages

```bash
# Make a minor change to test deployment
cd packages/mobile-remote-hello
echo "// Test deployment" >> src/HelloRemote.tsx

# Commit and push (assuming already on main or via PR)
git add .
git commit -m "test: trigger remote bundle deployment"
git push origin main
```

**Expected Results**:
1. Workflow runs automatically
2. Builds production bundle with `NODE_ENV=production`
3. Deploys to Firebase Hosting
4. Verifies deployment with HTTP 200 check

**Verify Deployment**:
```bash
# Check bundle is accessible
curl -I https://universal-mfe.web.app/HelloRemote.container.js.bundle

# Expected response:
# HTTP/2 200
# content-type: application/javascript
# access-control-allow-origin: *

# Check bundle size
curl -sI https://universal-mfe.web.app/HelloRemote.container.js.bundle | grep content-length
```

### Step 2: Test Manual Deployment

**Scenario**: Manually trigger deployment for specific platform

```
1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy-mobile-remote-bundles.yml
2. Click "Run workflow"
3. Select branch: main
4. Choose platform: android (or ios, or both)
5. Click "Run workflow"
```

**Monitor Progress**:
- Workflow appears in Actions tab
- Click on workflow run to see live logs
- Each step shows real-time progress

### Step 3: Verify in Mobile App

**Test on Emulator** (after bundle deployment):

```bash
# Start Android emulator
emulator -avd Pixel_8_Pro_API_35 -dns-server 8.8.8.8,8.8.4.4

# Install release APK (if available)
adb install -r packages/mobile-host/android/app/build/outputs/apk/release/app-release.apk

# Or build and install
cd packages/mobile-host
./android/gradlew -p android assembleRelease
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Launch app
adb shell am start -n com.mobilehosttmp/.MainActivity

# In the app:
# 1. Navigate to "Remote Hello" page
# 2. Click "Load Remote" button
# 3. Verify remote loads without errors
```

**Expected Results**:
- ✅ App launches successfully
- ✅ Remote loads from Firebase Hosting
- ✅ All chunks load (container + numeric chunks)
- ✅ Remote component renders correctly

---

## Testing Android Release Deployment

### Workflow: `deploy-android.yml`

**Triggers**:
- Push tag starting with `v*` (e.g., `v1.0.0`, `v1.0.0-beta.1`)

### Step 1: Prepare for Release

**Ensure bundles are deployed first**:
```bash
# Verify latest bundles are on Firebase
curl -sI https://universal-mfe.web.app/HelloRemote.container.js.bundle | grep last-modified

# Compare with local build time
ls -lh packages/mobile-remote-hello/dist/android/HelloRemote.container.js.bundle
```

**Ensure main branch is clean**:
```bash
git checkout main
git pull origin main
git status  # Should be clean
```

### Step 2: Create and Push Release Tag

```bash
# Create annotated tag
git tag -a v1.0.0-test -m "Test release for CI/CD validation

This is a test release to verify:
- Release APK builds successfully
- Firebase App Distribution upload works
- Release bundles load correctly from Firebase Hosting
- Physical device installation and testing

Built with:
- Production remote bundles from Firebase Hosting
- Release mode (Hermes + ProGuard)
- PatchMFConsolePlugin for console initialization"

# Push tag
git push origin v1.0.0-test
```

**Alternative (lightweight tag)**:
```bash
git tag v1.0.0-test
git push origin v1.0.0-test
```

### Step 3: Monitor Workflow Execution

**GitHub Actions**:
```
1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
2. Find "Deploy Android" workflow
3. Click on the running workflow
4. Monitor each step:
   ✓ Checkout repository
   ✓ Validate required secrets
   ✓ Setup Java 17
   ✓ Setup Android SDK
   ✓ Install dependencies
   ✓ Build shared packages
   ✓ Build release APKs (host + standalone)
   ✓ Authenticate to Google Cloud
   ✓ Upload to Firebase App Distribution
   ✓ Create GitHub Release
```

**Expected Duration**: ~3-5 minutes

### Step 4: Verify Build Artifacts

**GitHub Release**:
```
1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/releases
2. Find release: v1.0.0-test
3. Verify artifacts:
   - mobile-host-release.apk (~45 MB)
   - mobile-remote-standalone-release.apk (~25 MB)
```

**Firebase App Distribution**:
```
1. Go to: https://console.firebase.google.com/project/universal-mfe/appdistribution
2. Find latest release
3. Verify:
   - Release notes
   - App version
   - Build number
   - Invited testers
```

---

## Testing on Physical Devices

### Prerequisites

**Add Testers to Firebase**:
```
1. Firebase Console → App Distribution → Testers & Groups
2. Add testers by email
3. Organize into groups (e.g., "internal-testers", "beta-testers")
```

### Step 1: Tester Receives Email

**Email contains**:
- App name and version
- Release notes
- "Download" button
- Instructions for installation

### Step 2: Install on Physical Device

**Android Installation**:
```
1. Open email on Android device
2. Click "Download" (opens Firebase App Distribution app or browser)
3. Follow prompts to install
4. Grant "Install from Unknown Sources" permission if needed
5. App installs as "MobileHost" (or your configured app name)
```

**Alternative (Manual APK Installation)**:
```bash
# Download APK from GitHub Release
wget https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v1.0.0-test/mobile-host-release.apk

# Connect device via USB
adb devices

# Install APK
adb install mobile-host-release.apk
```

### Step 3: Test on Physical Device

**Launch App**:
```
1. Open "MobileHost" app from device home screen
2. Observe startup (should be fast, no "Bundling..." message)
3. App should display main screen
```

**Test Remote Loading**:
```
1. Navigate to "Remote Hello" page
2. Click "Load Remote" button
3. Observe:
   - Loading indicator appears
   - Remote loads from Firebase (no DNS issues on physical devices)
   - Remote component renders
   - Theme switching works
   - Locale switching works
   - Event bus communication works
```

**Test Functionality**:
```
✅ App launches without crash
✅ No "runtime not ready" errors
✅ Remote loads successfully
✅ All chunks load (no "Loading chunk 889 failed")
✅ UI renders correctly
✅ Theme switching works
✅ Language switching works
✅ Navigation works
✅ Button interactions work
✅ Event bus communication works
```

### Step 4: Report Issues

**If issues found**:
```
1. Take screenshots
2. Collect logcat (if device is connected):
   adb logcat -d > logcat.txt
3. Note:
   - Device model
   - Android version
   - Steps to reproduce
   - Expected vs actual behavior
4. Create GitHub issue with details
```

---

## Troubleshooting

### Issue: Workflow Doesn't Trigger

**Symptom**: Pushed to main but workflow doesn't run

**Solutions**:
```bash
# Check workflow paths
# Workflow only triggers if these paths change:
# - packages/mobile-remote-hello/**
# - packages/shared-*/**
# - .github/workflows/deploy-mobile-remote-bundles.yml

# Verify workflow file syntax
# Use GitHub Actions validator or yamllint
yamllint .github/workflows/deploy-mobile-remote-bundles.yml

# Check GitHub Actions tab for disabled workflows
# Settings → Actions → Enable workflows
```

### Issue: Firebase Authentication Fails

**Symptom**: `Error: Unable to authorize request`

**Solutions**:
```bash
# Verify secret is configured
# GitHub → Settings → Secrets → Actions → FIREBASE_SERVICE_ACCOUNT

# Test secret locally (DO NOT commit the JSON file)
firebase login
firebase projects:list

# Regenerate service account key if needed
# Firebase Console → Project Settings → Service Accounts → Generate new key
```

### Issue: Bundle Deployment Succeeds but Not Accessible

**Symptom**: Workflow passes, but `curl` returns 404

**Solutions**:
```bash
# Check Firebase Hosting configuration
cat firebase.json

# Verify public directory matches build output
ls -la packages/mobile-remote-hello/dist/android/

# Manually deploy to test
cd packages/mobile-remote-hello
NODE_ENV=production PLATFORM=android yarn build:remote
cd ../..
firebase deploy --only hosting

# Check Firebase Console
# Firebase → Hosting → Dashboard → Recent deploys
```

### Issue: APK Build Fails in CI

**Symptom**: `BUILD FAILED` during assembleRelease

**Solutions**:
```bash
# Check Gradle logs in workflow output
# Look for specific error message

# Common issues:
# 1. Missing codegen artifacts
#    Solution: Ensure generateCodegenArtifactsFromSchema runs first

# 2. Keystore secrets incorrect
#    Solution: Verify all 4 Android keystore secrets are correct

# 3. Out of memory
#    Solution: Increase Gradle memory in gradle.properties

# 4. Dependency resolution
#    Solution: Clear caches, ensure yarn install --frozen-lockfile
```

### Issue: Firebase App Distribution Upload Fails

**Symptom**: APK builds but upload fails

**Solutions**:
```bash
# Verify Firebase App IDs are correct
# Firebase Console → Project Settings → Your apps → App ID

# Check APK exists
ls -lh android/app/build/outputs/apk/release/app-release.apk

# Verify Firebase CLI version
firebase --version  # Should be 15.4.0+

# Test manual upload
firebase appdistribution:distribute \
  android/app/build/outputs/apk/release/app-release.apk \
  --app YOUR_APP_ID \
  --groups "testers"
```

### Issue: Remote Doesn't Load on Physical Device

**Symptom**: App installs but remote fails to load

**Solutions**:
```bash
# Verify bundle is accessible from device
# On device browser, visit:
# https://universal-mfe.web.app/HelloRemote.container.js.bundle

# Check app has INTERNET permission
# Should be in AndroidManifest.xml

# Verify production URL is correct
# packages/mobile-host/src/config/remoteConfig.ts
# PRODUCTION_REMOTE_URL = 'https://universal-mfe.web.app'

# Check logcat for errors
adb logcat | grep -E "ScriptManager|ReactNativeJS"
```

---

## Success Checklist

### Before Creating Release Tag

- [ ] All Firebase secrets configured in GitHub
- [ ] Remote bundles deployed to Firebase Hosting
- [ ] Bundles verified accessible via `curl`
- [ ] Release APK tested on emulator
- [ ] Remote loading works from Firebase

### After Creating Release Tag

- [ ] Workflow completes successfully
- [ ] Release APKs available on GitHub Releases
- [ ] Release APKs uploaded to Firebase App Distribution
- [ ] Testers receive email notification
- [ ] APK installs on physical device
- [ ] Remote loads successfully on physical device
- [ ] All functionality tested on physical device

---

## CI/CD Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Developer makes changes                                 │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ Push to develop → CI runs (lint, test, build)          │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ PR develop → main → CI runs on PR                      │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ Merge to main → CI + Deploy workflows run              │
│   ├─ Deploy Web (Vercel)                               │
│   └─ Deploy Mobile Remote Bundles (Firebase Hosting)   │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ Test deployed bundles on emulator                      │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ Create and push release tag (v*)                       │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ Deploy Android workflow runs                           │
│   ├─ Build release APKs                                │
│   ├─ Upload to Firebase App Distribution               │
│   └─ Create GitHub Release                             │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ Testers receive email → Install on physical devices    │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ Test on physical devices → Report feedback             │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

After successful CI/CD testing:

1. **Update Documentation**: Update `README.md` with tested deployment instructions
2. **Add Monitoring**: Set up error tracking (Sentry, Firebase Crashlytics)
3. **Automate More**: Add automated E2E tests in CI
4. **iOS Release**: Apply same process for iOS release builds
5. **Production Release**: Remove `-test` suffix, deploy to production testers

---

**Document Version**: 1.0
**Last Updated**: 2026-01-26
**Status**: Ready for Testing
