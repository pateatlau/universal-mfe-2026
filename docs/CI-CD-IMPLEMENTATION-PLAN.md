# CI/CD Implementation Plan

**Status:** Phase 6.1 Complete - Android Release Builds Added
**Last Updated:** 2026-01-25
**Target:** POC with minimal costs / free tier options

---

## Overview

This document outlines the CI/CD implementation plan for the Universal Microfrontend Platform. The goal is to automate building, testing, and deploying the web, Android, and iOS applications using GitHub Actions with free/minimal cost deployment options.

---

## Finalized Deployment Decisions

| Platform | Deployment Method | Cost |
|----------|------------------|------|
| **Web** | Vercel (free tier) | $0 |
| **Android** | GitHub Releases (APK artifacts) | $0 |
| **iOS** | GitHub Releases (Simulator .app bundle) | $0 |

---

## Pre-requisites

### CI Pre-requisites

- [x] **GitHub Repository Access** ✅
  - [x] Repository is hosted on GitHub
  - [x] GitHub Actions enabled for the repository
  - [x] Sufficient Actions minutes (free tier: 2,000 mins/month for public repos)

- [x] **Testing Infrastructure Setup** ✅
  - [x] Jest configuration for unit tests
  - [x] ESLint configuration for linting
  - [x] Prettier configuration for formatting
  - [x] TypeScript strict mode already enabled

- [x] **Root Package.json Scripts** ✅
  - [x] Add `build:shared` script
  - [x] Add `lint` script
  - [x] Add `test` script
  - [x] Add `typecheck` script

### CD Pre-requisites

- [x] **Web Deployment (Vercel)** ✅
  - [x] Create Vercel account (free tier)
  - [x] Link GitHub repository to Vercel
  - [x] Add VERCEL_TOKEN to GitHub secrets

- [x] **Android Deployment (GitHub Releases)** ✅
  - [x] Debug keystore available (default Android debug keystore)
  - [x] No external accounts required

- [x] **iOS Deployment (Simulator Build)** ✅
  - [x] macOS runner available (GitHub Actions provides this)
  - [x] Xcode 16.2 available on runner
  - [x] No signing certificates required (simulator-only)

---

## Phase 1: Foundation Setup

### Task 1.1: Root Package.json Scripts ✅ COMPLETE
- [x] Add `build:shared` script to build shared packages in order
- [x] Add `lint` script (after ESLint setup)
- [x] Add `test` script (after Jest setup)
- [x] Add `typecheck` script for TypeScript validation
- [x] Add `build:web` convenience script
- [x] Add `build:mobile:android` convenience script
- [x] Add `build:mobile:ios` convenience script

**Additional changes made:**
- Added `typecheck` script to all 6 workspace packages
- Fixed web package tsconfig.json files to include DOM lib types
- Added Module Federation remote type declarations for web-shell
- Fixed React Native Web style type casting in web-shell

### Task 1.2: ESLint Configuration ✅ COMPLETE
- [x] Create `eslint.config.mjs` in root (using modern flat config)
  - [x] Configure TypeScript parser (`typescript-eslint`)
  - [x] Add React/React Hooks rules
  - [x] Configure Node.js globals for config files and scripts
- [x] Add ESLint dependencies to root package.json
- [x] Configure ignores for build outputs and generated files
- [x] Verify lint passes on all packages (0 errors, warnings only)

**Dependencies added:**
- eslint@9.28.0
- @eslint/js@9.28.0
- typescript-eslint@8.33.1
- eslint-plugin-react@7.37.5
- eslint-plugin-react-hooks@7.0.1 (upgraded from 5.2.0 for ESLint 9 compatibility)
- globals@16.2.0

### Task 1.3: Prettier Configuration ✅ COMPLETE
- [x] Create `.prettierrc` in root
  - [x] Configure consistent formatting rules
  - [x] Single quotes, trailing commas, 100 char width
- [x] Create `.prettierignore` for build outputs
- [x] Add Prettier dependencies to root package.json
- [x] Add `format` script to check formatting
- [x] Add `format:fix` script to auto-fix formatting
- [x] Integrate with ESLint (eslint-config-prettier)
- [x] Verify formatting works on all packages

**Dependencies added:**
- prettier@3.5.3
- eslint-config-prettier@10.1.5

**Scripts added:**
- `yarn format` - Check formatting (exits non-zero if files need formatting)
- `yarn format:fix` - Auto-fix formatting issues

### Task 1.4: Jest Configuration ✅ COMPLETE
- [x] Create `jest.config.js` in root
  - [x] Configure TypeScript transform (ts-jest)
  - [x] Setup workspace projects
  - [x] Configure coverage thresholds (50% minimum)
- [x] Add Jest dependencies to root package.json
- [x] Create sample tests for shared-utils
- [x] Verify tests pass locally (6 tests, 100% coverage)

**Dependencies added:**
- jest@29.7.0
- ts-jest@29.3.4
- @types/jest@29.5.14

**Notes:**
- Only shared-utils has unit tests (pure TypeScript)
- shared-hello-ui requires full RN runtime for testing (deferred to E2E - Task 4.5)

### Task 1.5: TypeScript Validation Script ✅ COMPLETE
- [x] Add `typecheck` script that runs `tsc --noEmit`
- [x] Verify all packages pass type checking

**Notes:**
- Implemented in Task 1.1 as `yarn workspaces run typecheck`
- Each workspace has its own `typecheck` script
- All 6 packages pass type checking

---

## Phase 2: GitHub Actions CI

### Task 2.1: Basic CI Workflow ✅ COMPLETE
- [x] Create `.github/workflows/ci.yml`
  - [x] Trigger on push to main/develop and pull requests
  - [x] Setup Node.js via `.nvmrc` with Yarn caching
  - [x] Install dependencies with Yarn (frozen lockfile)
  - [x] Run type checking
  - [x] Run linting
  - [x] Run unit tests with coverage
  - [x] Build shared packages

**Features:**
- Concurrency control (cancels in-progress runs for same branch)
- Uses `ubuntu-latest` runner (free tier)

### Task 2.2: Web Build Job ✅ COMPLETE
- [x] Add web build job to CI workflow
  - [x] Build web-shell
  - [x] Build web-remote-hello
  - [x] Upload build artifacts (7 day retention)
  - [x] Yarn cache via setup-node action

**Features:**
- Depends on `check` job (runs after lint/test pass)
- Uploads `web-shell-dist` and `web-remote-hello-dist` artifacts

### Task 2.3: Android Build Job ✅ COMPLETE
- [x] Add Android build job to CI workflow
  - [x] Setup Java 17 (Temurin distribution)
  - [x] Setup Android SDK via `android-actions/setup-android@v3`
  - [x] Build mobile-remote-hello for Android
  - [x] Build Android APK (debug)
  - [x] Upload APK as artifact (7 day retention)
  - [x] Cache Gradle dependencies

**Features:**
- Depends on `check` job (runs after lint/test pass)
- Gradle cache for faster builds
- Uploads `android-debug-apk` artifact

### Task 2.4: iOS Build Job ✅ COMPLETE
- [x] Add iOS build job to CI workflow
  - [x] Use macOS-14 runner (Apple Silicon)
  - [x] Setup Xcode 16.2 via `maxim-lobanov/setup-xcode@v1.6.0`
  - [x] Run pod install with CocoaPods cache
  - [x] Build mobile-remote-hello for iOS
  - [x] Build iOS app for Simulator (no signing required)
  - [x] Upload zipped .app bundle as artifact (7 day retention)

**Features:**
- Depends on `check` job (runs after lint/test pass)
- CocoaPods download cache (`~/Library/Caches/CocoaPods`)
- Builds for iPhone 16 Simulator
- Uploads `ios-simulator-app` artifact (zipped .app bundle)

**CI Fixes Applied:**
- Removed `.xcode.env.local` from git (contained hardcoded local Node.js path)
- Added `.xcode.env.local` to `.gitignore` (machine-specific, should not be versioned)
- Clean pod install in CI: `rm -rf Pods Podfile.lock && pod install --repo-update`
- Dynamic .app bundle path detection in zip step

**GitHub Actions Updated to Latest Versions:**
- actions/checkout: v6.0.1
- actions/setup-node: v6.1.0
- actions/upload-artifact: v6
- actions/cache: v5
- actions/setup-java: v5.1.0
- maxim-lobanov/setup-xcode: v1.6.0

---

## Phase 3: Deployment (CD)

### Task 3.1: Web Deployment (Vercel) ✅ COMPLETE
- [x] Create Vercel project for web-shell
- [x] Create Vercel project for web-remote-hello
- [x] Configure build settings in Vercel dashboard
  - [x] Set "Ignored Build Step" to "Don't build anything" (GitHub Actions handles builds)
  - [x] Output directory: `dist`
- [x] Add VERCEL_TOKEN to GitHub secrets
- [x] Add VERCEL_ORG_ID to GitHub secrets
- [x] Add VERCEL_PROJECT_ID_WEB_SHELL to GitHub secrets
- [x] Add VERCEL_PROJECT_ID_WEB_REMOTE to GitHub secrets
- [x] Create `.github/workflows/deploy-web.yml`
  - [x] Trigger on push to main
  - [x] Deploy web-remote-hello first (remote before host)
  - [x] Deploy web-shell after remote is deployed
  - [x] Pass REMOTE_HELLO_URL env var to inject remote URL at build time
- [x] Update web-shell rspack.config.mjs to support REMOTE_HELLO_URL env var

**Notes:**
- Vercel auto-deployments disabled ("Don't build anything") - GitHub Actions handles all builds
- web-shell uses `REMOTE_HELLO_URL` env var (defaults to localhost:9003 for dev)
- Deployment summary outputs URLs to GitHub Actions job summary
- Vercel CLI output URL extraction includes validation (non-empty, well-formed https://) with error handling

### Task 3.2: Android Deployment (GitHub Releases) ✅ COMPLETE
- [x] Create `.github/workflows/deploy-android.yml`
  - [x] Trigger on tag push (v*)
  - [x] Build shared packages
  - [x] Build mobile-remote-hello for Android
  - [x] Build Android APK (debug for POC)
  - [x] Create GitHub Release via softprops/action-gh-release@v2
  - [x] Upload APK as release asset

**Usage:**
```bash
git tag v1.0.0
git push --tags
```

**Notes:**
- Uses default Android debug keystore (no signing setup required)
- APK is attached as a downloadable asset on the GitHub Release page

### Task 3.3: iOS Deployment (Simulator Build) ✅ COMPLETE
- [x] Create `.github/workflows/deploy-ios.yml`
  - [x] Trigger on tag push (v*)
  - [x] Use macOS-14 runner (Apple Silicon)
  - [x] Build shared packages
  - [x] Build mobile-remote-hello for iOS
  - [x] Build iOS app for Simulator
  - [x] Zip .app bundle
  - [x] Create GitHub Release via softprops/action-gh-release@v2
  - [x] Upload zipped .app as release asset

**Usage:**
```bash
git tag v1.0.0
git push --tags
```

**Notes:**
- Simulator-only build (cannot run on physical iOS devices)
- No Apple Developer account or code signing required
- Users can drag .app to Simulator or use `xcrun simctl install`

---

## Phase 4: Workflow Enhancements

### Task 4.1: Caching Strategy ✅ COMPLETE
- [x] Cache node_modules with yarn.lock hash (via `actions/setup-node` with `cache: 'yarn'`)
- [x] Cache Gradle dependencies (~/.gradle/caches and ~/.gradle/wrapper)
- [x] Cache CocoaPods download cache (~/Library/Caches/CocoaPods)
- [x] Rspack build outputs - Not cached (marginal benefit, builds are fast ~5s)
- [x] Add build timing annotations (`::group::` / `::endgroup::` for collapsible logs)

**Caching summary:**
| Workflow | Yarn | Gradle | CocoaPods |
|----------|------|--------|-----------|
| ci.yml | ✅ | ✅ | ✅ |
| deploy-web.yml | ✅ | N/A | N/A |
| deploy-android.yml | ✅ | ✅ | N/A |
| deploy-ios.yml | ✅ | N/A | ✅ |

**Notes:**
- Rspack persistent caching not added - builds complete in ~5s without it
- Build timing groups added to ci.yml for better GitHub Actions log visibility

### Task 4.2: PR Checks ✅ COMPLETE
- [x] Add required status checks for PRs (manual GitHub UI configuration)
- [x] Configure branch protection rules on main (manual GitHub UI configuration)
- [x] Add PR comment with build status/artifact links (automated via `pr-summary` job)

**Automated (ci.yml):**
- Added `pr-summary` job that runs after all builds complete on PRs
- Posts a comment with build status table and link to download artifacts
- Updates existing comment on subsequent pushes (doesn't spam)

**Manual GitHub Configuration Required:**
To enable branch protection, go to **Settings → Branches → Add branch protection rule**:
1. Branch name pattern: `main`
2. Enable: "Require a pull request before merging"
3. Enable: "Require status checks to pass before merging"
4. Required status checks:
   - `Lint, Typecheck, Test`
   - `Build Web`
   - `Build Android`
   - `Build iOS (Simulator)`
5. Enable: "Require branches to be up to date before merging" (optional)
6. Enable: "Do not allow bypassing the above settings" (recommended)

### Task 4.3: Version Management ✅ COMPLETE
- [x] Add version validation check
  - [x] Verify no `^` or `~` in dependencies
  - [x] Verify Node.js version matches .nvmrc
  - [x] Verify Yarn version matches packageManager

**Implementation:**
- Created `scripts/validate-versions.js` - validates:
  - All dependencies use exact versions (no `^`, `~`, `>=`, `*`)
  - Internal workspace deps (`@universal/*`) are allowed to use `*`
  - Node.js version matches `.nvmrc`
  - Yarn version matches `packageManager` field in package.json
- Added `yarn validate:versions` script to root package.json
- Added validation step to CI workflow (runs after install, before build)

### Task 4.4: Security Scanning ✅ COMPLETE
- [x] Add dependency vulnerability scanning (yarn audit)
- [x] Add CodeQL analysis for JavaScript/TypeScript
- [x] Enable GitHub secret scanning alerts

**Implementation:**
- Added `yarn audit` step to CI workflow (informational, doesn't fail builds)
- Created `.github/workflows/codeql.yml` for CodeQL security analysis:
  - Runs on push/PR to main/develop
  - Weekly scheduled scan (Sundays 00:00 UTC)
  - Uses `security-extended` query suite
- GitHub secret scanning is enabled by default for public repositories
  - To verify: Settings → Code security and analysis → Secret scanning

### Task 4.5: E2E Testing (Future)
- [ ] Evaluate E2E testing frameworks
  - [ ] Mobile: Detox vs Maestro
  - [ ] Web: Playwright vs Cypress
- [ ] Configure E2E test workflow
  - [ ] Trigger on merge to develop/main branches only
  - [ ] Optional: Manual trigger to control costs
  - [ ] Separate workflow file for E2E tests
- [ ] Web E2E setup
  - [ ] Install and configure chosen framework
  - [ ] Create basic smoke tests for web-shell
  - [ ] Test remote module loading
- [ ] Mobile E2E setup (higher cost - macOS runners)
  - [ ] Install and configure chosen framework
  - [ ] Create basic smoke tests for Android
  - [ ] Create basic smoke tests for iOS Simulator
  - [ ] Consider running only on release tags to minimize costs
- [ ] NOTE: This task may increase GitHub Actions costs beyond $0/month due to macOS runner usage for mobile E2E tests

---

## Phase 5: Standalone Mode CI/CD

Standalone mode allows mobile-remote-hello to run as an independent "Super App" without the host shell. This is useful for testing remotes in isolation and demonstrating the Module Federation concept.

### Task 5.1: Add Standalone Build Scripts ✅ COMPLETE
- [x] `build:standalone` script in mobile-remote-hello package.json
- [x] `rspack.standalone.config.mjs` configuration
- [x] Platform-specific dist outputs: `dist/standalone/android/`, `dist/standalone/ios/`
- [x] Port configuration: Android 8083, iOS 8084
- [x] Kill scripts for standalone bundlers

**Note:** This task was completed prior to CI/CD implementation.

### Task 5.2: Add Standalone Android Build to CI ✅ COMPLETE
- [x] Add `build-standalone-android` job to `.github/workflows/ci.yml`
  - [x] Build standalone bundle for Android
  - [x] Build standalone Android APK (debug)
  - [x] Upload APK as artifact (`standalone-android-debug-apk`)
- [x] Depends on `check` job
- [x] Uses existing Java 17, Android SDK, Gradle caching setup

### Task 5.3: Add Standalone iOS Build to CI ✅ COMPLETE
- [x] Add `build-standalone-ios` job to `.github/workflows/ci.yml`
  - [x] Use macOS-14 runner with Xcode 16.2
  - [x] Build standalone bundle for iOS
  - [x] Run pod install with clean slate
  - [x] Build standalone iOS app for Simulator
  - [x] Zip and upload .app bundle as artifact (`standalone-ios-simulator-app`)
- [x] Depends on `check` job
- [x] Uses existing CocoaPods caching setup

### Task 5.4: Update Deploy Android Workflow ✅ COMPLETE
- [x] Update `.github/workflows/deploy-android.yml` to include standalone APK
  - [x] Build both host and standalone APKs
  - [x] Rename APKs: `mobile-host-debug.apk`, `mobile-remote-standalone-debug.apk`
  - [x] Add both APKs to GitHub Release
  - [x] Update release body with standalone instructions

### Task 5.5: Update Deploy iOS Workflow ✅ COMPLETE
- [x] Update `.github/workflows/deploy-ios.yml` to include standalone app
  - [x] Build both host and standalone iOS apps
  - [x] Rename zips: `mobile-host-simulator.zip`, `mobile-remote-standalone-simulator.zip`
  - [x] Add both zips to GitHub Release
  - [x] Update release body with standalone instructions

### Task 5.6: Update PR Summary Comment ✅ COMPLETE
- [x] Update `pr-summary` job in ci.yml
  - [x] Add standalone build status rows to table
  - [x] Add standalone artifacts to artifacts table
  - [x] Add `build-standalone-android` and `build-standalone-ios` to needs array

### Task 5.7: Update Documentation ✅ COMPLETE
- [x] Update `docs/CI-CD-IMPLEMENTATION-PLAN.md` with Phase 5
- [x] Update Workflow Files Summary table
- [x] Update Success Criteria section

---

## Phase 6: Production Mobile Builds (Future)

These tasks are required for fully standalone mobile apps that work without a dev server (Metro bundler). Release builds embed the JavaScript bundle directly in the app binary.

### Debug vs Release Builds

| Aspect | Debug Build (Current) | Release Build (Phase 6) |
|--------|----------------------|-------------------------|
| **JS Bundle** | Loaded from Metro dev server | Embedded in app binary |
| **Metro Required** | Yes (must be running) | No (fully standalone) |
| **Performance** | Slower (development mode) | Optimized, minified |
| **Debugging** | Enabled (React DevTools, etc.) | Disabled |
| **Signing** | Debug keystore / Dev cert | Release keystore / Distribution cert |
| **Distribution** | Developer testing only | Can distribute to testers/users |
| **Developer Account** | Not required | Android: No, iOS: Yes ($99/year) |

### Task 6.1: Android Release Build ✅ COMPLETE
- [x] Create release signing keystore (free, self-signed)
  ```bash
  keytool -genkeypair -v -storetype PKCS12 \
    -keystore my-release-key.keystore \
    -alias my-key-alias \
    -keyalg RSA -keysize 2048 -validity 10000
  ```
- [x] Configure `android/app/build.gradle` for release signing:
  - Updated both `packages/mobile-host/android/app/build.gradle` and `packages/mobile-remote-hello/android/app/build.gradle`
  - Uses environment variables: `ANDROID_KEYSTORE_FILE`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
  - Falls back to debug signing for local development when env vars not set
- [x] Add GitHub Secrets for signing:
  - `ANDROID_KEYSTORE_BASE64` - Base64-encoded keystore file
  - `ANDROID_KEYSTORE_PASSWORD` - Keystore password
  - `ANDROID_KEY_ALIAS` - Key alias
  - `ANDROID_KEY_PASSWORD` - Key password
- [x] Update `deploy-android.yml` workflow:
  - Decodes keystore from `ANDROID_KEYSTORE_BASE64` secret
  - Builds `assembleRelease` instead of `assembleDebug`
  - Outputs `mobile-host-release.apk` and `mobile-remote-standalone-release.apk`
  - Cleans up keystore file after build for security
- [x] ProGuard/R8 minification configured (controlled by `enableProguardInReleaseBuilds` flag)
- [ ] Test release APK on physical device (pending first tag push)

**Cost:** $0 (Android release builds require no developer account)

### Task 6.2: Android Distribution Options
| Method | Cost | Pros | Cons |
|--------|------|------|------|
| **Direct APK** | $0 | Simple, no accounts | Manual install, no auto-updates |
| **Firebase App Distribution** | $0 | CI/CD integration, tester management | Requires Firebase project |
| **Diawi** | $0 (limited) | Very easy | Links expire, limits on free tier |
| **Google Play Internal Testing** | $25 one-time | Uses Play Store, auto-updates | Requires Play Console account |

**Recommended for testing:** Firebase App Distribution (free, integrates with GitHub Actions)

### Task 6.3: iOS Release Build
- [ ] Create Apple Developer account ($99/year) - **Required**
- [ ] Generate distribution certificate:
  - Keychain Access → Certificate Assistant → Request Certificate from CA
  - Apple Developer Portal → Certificates → Create Distribution Certificate
- [ ] Create provisioning profile:
  - **Ad Hoc:** For testing on specific devices (up to 100 UDIDs)
  - **App Store:** For TestFlight and App Store
- [ ] Configure Xcode project for release signing:
  - Set Bundle Identifier
  - Configure signing team and provisioning profile
- [ ] Export signing credentials for CI:
  - Export certificate as .p12 file with password
  - Download provisioning profile (.mobileprovision)
- [ ] Add GitHub Secrets for signing:
  - `IOS_CERTIFICATE_BASE64` - Base64-encoded .p12 file
  - `IOS_CERTIFICATE_PASSWORD` - Certificate password
  - `IOS_PROVISIONING_PROFILE_BASE64` - Base64-encoded provisioning profile
  - `APPLE_TEAM_ID` - Apple Developer Team ID
- [ ] Update `deploy-ios.yml` workflow:
  ```yaml
  - name: Install signing certificate
    run: |
      echo "${{ secrets.IOS_CERTIFICATE_BASE64 }}" | base64 -d > cert.p12
      security create-keychain -p "" build.keychain
      security import cert.p12 -k build.keychain -P "${{ secrets.IOS_CERTIFICATE_PASSWORD }}" -T /usr/bin/codesign
      security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain
      
  - name: Install provisioning profile
    run: |
      mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
      echo "${{ secrets.IOS_PROVISIONING_PROFILE_BASE64 }}" | base64 -d > ~/Library/MobileDevice/Provisioning\ Profiles/profile.mobileprovision
      
  - name: Build release archive
    run: |
      xcodebuild -workspace MobileHostTmp.xcworkspace \
        -scheme MobileHostTmp \
        -configuration Release \
        -archivePath build/MobileHostTmp.xcarchive \
        archive
        
  - name: Export IPA
    run: |
      xcodebuild -exportArchive \
        -archivePath build/MobileHostTmp.xcarchive \
        -exportPath build/ipa \
        -exportOptionsPlist ExportOptions.plist
  ```
- [ ] Create `ExportOptions.plist` for export configuration
- [ ] Test IPA on physical device

**Cost:** $99/year (Apple Developer Program required)

### Task 6.4: iOS Distribution Options
| Method | Cost | Pros | Cons |
|--------|------|------|------|
| **TestFlight** | $99/year (included) | Up to 10,000 testers, OTA install | Requires App Store review for external testers |
| **Ad Hoc** | $99/year (included) | Direct install, no review | Limited to 100 devices/year, requires UDIDs |
| **Firebase App Distribution** | $99/year (for cert) | Free service, CI integration | Still requires Apple cert, UDID registration |
| **Enterprise** | $299/year | Unlimited devices, no UDID | Strict eligibility, audit requirements |

**Recommended for testing:** TestFlight (internal testers don't require review)

### Task 6.5: Firebase App Distribution Setup (Optional)
- [ ] Create Firebase project
- [ ] Enable App Distribution in Firebase Console
- [ ] Generate Firebase service account key for CI
- [ ] Add `FIREBASE_SERVICE_ACCOUNT` to GitHub Secrets
- [ ] Add Firebase CLI to workflows:
  ```yaml
  - name: Install Firebase CLI
    run: npm install -g firebase-tools
    
  - name: Upload to Firebase App Distribution
    run: |
      firebase appdistribution:distribute app-release.apk \
        --app ${{ secrets.FIREBASE_APP_ID_ANDROID }} \
        --groups "testers" \
        --release-notes "Build ${{ github.run_number }}"
  ```

### Cost Summary for Phase 6

| Item | Cost | Required For |
|------|------|--------------|
| Android Release Keystore | $0 (self-signed) | Android release builds |
| Apple Developer Account | $99/year | iOS release builds (required) |
| Google Play Console | $25 one-time | Play Store distribution only |
| Firebase App Distribution | $0 | OTA distribution (optional) |
| **Minimum for Android** | **$0** | Release APK for testing |
| **Minimum for iOS** | **$99/year** | Release IPA for testing |
| **Full distribution** | **$124 first year** | Both platforms, Play Store |

---

## Workflow Files Summary

| File | Purpose | Trigger |
|------|---------|---------|
| `.github/workflows/ci.yml` | Build, lint, test, audit (host + standalone) | Push, PR |
| `.github/workflows/codeql.yml` | CodeQL security analysis | Push, PR, Weekly |
| `.github/workflows/deploy-web.yml` | Deploy to Vercel | Push to main |
| `.github/workflows/deploy-android.yml` | Build host + standalone APKs & release | Tag v* |
| `.github/workflows/deploy-ios.yml` | Build host + standalone Simulator apps & release | Tag v* |

---

## Cost Estimation (Monthly)

| Service | Free Tier | Estimated Usage | Cost |
|---------|-----------|-----------------|------|
| GitHub Actions (Linux) | 2,000 mins | ~500 mins | $0 |
| GitHub Actions (macOS) | 200 mins | ~50 mins (iOS on tags only) | $0 |
| Vercel | 100 GB bandwidth | ~5 GB | $0 |
| GitHub Releases | Unlimited | ~10 releases | $0 |
| **Total** | | | **$0/month** |

---

## Success Criteria

- [x] All PRs automatically run lint, typecheck, and tests ✅
- [x] Main branch automatically deploys web apps to Vercel ✅
  - Remote: https://universal-mfe-2026-remote.vercel.app/
  - Shell: https://universal-mfe-2026-shell.vercel.app/
- [x] Tagged releases automatically build and publish Android APK ✅
  - Host: `mobile-host-release.apk` (release build, standalone - no Metro needed)
  - Standalone: `mobile-remote-standalone-release.apk` (release build, standalone - no Metro needed)
- [x] Tagged releases automatically build and publish iOS Simulator app ✅
  - Host: `mobile-host-simulator.zip`
  - Standalone: `mobile-remote-standalone-simulator.zip`
- [x] Build times under 10 minutes for full CI ✅
- [x] Zero cost for CI/CD ($0/month) ✅
- [x] Standalone mode builds included in CI and deploy workflows ✅

---

## Notes

### Current Mobile Build Limitations

**Both Android and iOS builds are DEBUG builds** that require a Metro bundler running to load the JavaScript bundle. They are NOT standalone production builds.

**Android APK (`app-debug.apk`):**
- Requires Metro dev server running on `http://10.0.2.2:8081` (emulator) or `http://localhost:8081` (device via USB)
- Will crash with "Could not open file" error without Metro running
- Useful for: Development testing with Metro, CI/CD pipeline validation

**iOS Simulator App (`ios-simulator-app.zip`):**
- Can only run in Xcode iOS Simulator (not on physical devices)
- Requires Metro dev server running on `http://localhost:8082`
- No code signing required (Simulator-only)
- Useful for: Development testing, CI/CD pipeline validation

### React Native Specific Considerations
- Symlinks must be setup after yarn install (`postinstall` hook handles this)
- Android SDK and Java 17 required for Android builds
- Hermes bytecode compilation is automatic
- Platform-specific output directories (`dist/android/`, `dist/ios/`)

### Module Federation Deployment Order
- Remote modules must be deployed before or with host
- Web: Deploy web-remote-hello → web-shell
- Mobile: Remote bundles are loaded at runtime from configured URLs

---

## Summary

**Phase 1-3: COMPLETE** - Full CI/CD pipeline for all platforms
- Web: Automated deployment to Vercel on push to main
- Android: Debug APK published to GitHub Releases on tag
- iOS: Simulator app published to GitHub Releases on tag

**Phase 4: COMPLETE** - Workflow enhancements
- Task 4.1: Caching strategy (Yarn, Gradle, CocoaPods) ✅
- Task 4.2: PR checks (automated comments, branch protection documented) ✅
- Task 4.3: Version management (validation script) ✅
- Task 4.4: Security scanning (yarn audit, CodeQL) ✅
- Task 4.5: E2E Testing - Future

**Phase 5: COMPLETE** - Standalone mode CI/CD
- Task 5.1: Standalone build scripts (already implemented) ✅
- Task 5.2: Standalone Android CI build ✅
- Task 5.3: Standalone iOS CI build ✅
- Task 5.4: Update deploy-android workflow (host + standalone) ✅
- Task 5.5: Update deploy-ios workflow (host + standalone) ✅
- Task 5.6: Update PR summary comment ✅
- Task 5.7: Update documentation ✅

**Phase 6: IN PROGRESS** - Production mobile builds
- Task 6.1: Android release build (keystore signing) ✅ COMPLETE - $0
- Task 6.2: Android distribution options (APK, Firebase, Play Store) - documented
- Task 6.3: iOS release build (requires Apple Developer $99/year) - future
- Task 6.4: iOS distribution options (TestFlight, Ad Hoc, Firebase) - documented
- Task 6.5: Firebase App Distribution setup (optional, free) - future
