# Tech Stack Upgrade Recommendations for Production Stability

**Document Version:** 1.0
**Date:** January 28, 2026
**Author:** Development Team
**Status:** Draft - Pending Review
**Project:** Universal MFE Platform

---

## Executive Summary

This document provides actionable recommendations for upgrading the Universal MFE tech stack to improve stability and production viability. Each recommendation includes risk assessment, effort estimation, and clear guidance on tradeoffs.

### Key Findings

| Area | Current State | Recommendation | Priority |
|------|---------------|----------------|----------|
| **Re.Pack** | 5.2.0 | Upgrade to 5.2.3 | 🔴 High |
| **Module Federation** | 0.21.6 | Upgrade to 0.22.0 | 🟡 Medium |
| **React Native** | 0.80.0 | Evaluate 0.82.x | 🟡 Medium |
| **Crash Monitoring** | Not implemented | Add Sentry/Crashlytics | 🔴 High |
| **CI Release Tests** | Manual | Automate | 🔴 High |

### Critical Insight

**The PatchMFConsolePlugin workaround will remain necessary** regardless of version upgrades. No upstream fix exists for the Hermes + Module Federation initialization timing issue. The upgrades below improve stability but do not eliminate the need for this workaround.

---

## Table of Contents

1. [Current Stack Analysis](#1-current-stack-analysis)
2. [Recommended Upgrades](#2-recommended-upgrades)
3. [Infrastructure Improvements](#3-infrastructure-improvements)
4. [Strategic Architecture Options](#4-strategic-architecture-options)
5. [Upgrade Execution Plan](#5-upgrade-execution-plan)
6. [Risk Mitigation](#6-risk-mitigation)
7. [Decision Matrix](#7-decision-matrix)

---

## 1. Current Stack Analysis

### 1.1 Current Version Matrix

| Component | Current | Latest Stable | Gap | Notes |
|-----------|---------|---------------|-----|-------|
| React Native | 0.80.0 | 0.83.1 | 3 minor | New Architecture improvements |
| React (mobile) | 19.1.0 | 19.2.4 | 1 minor + 4 patches | Pinned to 19.1.0 for RN 0.80.0 compatibility |
| Re.Pack | 5.2.0 | 5.2.0 | Current | Up to date |
| Module Federation | 0.21.6 | 0.23.0 | 2 minor | Latest features |
| Rspack | 1.6.5 | 1.6.5 | Current | Up to date |
| React Native Web | 0.21.2 | 0.21.2 | Current | Up to date |

### 1.2 Stability Assessment

| Component | Stability | Risk Level | Workarounds Required |
|-----------|-----------|------------|---------------------|
| **Rspack** | 🟢 Stable | Low | None |
| **React Native Web** | 🟢 Stable | Low | Aliasing only |
| **Re.Pack** | 🟡 Maturing | Medium | Symlinks, config naming |
| **Module Federation** | 🟡 Maturing | Medium | PatchMFConsolePlugin |
| **Hermes + MF combo** | 🔴 Experimental | High | PatchMFConsolePlugin (critical) |

### 1.3 Known Issues in Current Stack

| Issue | Impact | Current Workaround |
|-------|--------|-------------------|
| Console not available in Hermes | App crash on launch | PatchMFConsolePlugin |
| Platform not available in Hermes | iOS crash on launch | PatchMFConsolePlugin |
| PLATFORM env var required | Wrong Platform.OS | Manual env var in scripts |
| Numeric chunk IDs in production | Remote loading fails | ScriptManager resolver |

---

## 2. Recommended Upgrades

### 2.1 Re.Pack: 5.2.0 → 5.2.3

**Priority:** 🔴 High
**Risk:** 🟢 Low (patch update)
**Effort:** ~2 hours

#### What's New in 5.2.3

- Bug fixes and stability improvements
- Dropped dependency on `@react-native/dev-middleware` (dynamic loading)
- Better error handling
- Reanimated 4 support (future-proofing)

#### Changes Required

```json
// packages/mobile-host/package.json
// packages/mobile-remote-hello/package.json
{
  "devDependencies": {
    "@callstack/repack": "5.2.3"  // was 5.2.0
  }
}
```

#### Verification Steps

1. `yarn install`
2. Build shared packages: `yarn build:shared`
3. Test Android Debug: `yarn workspace @universal/mobile-host android`
4. Test iOS Debug: `yarn workspace @universal/mobile-host ios`
5. Test Android Release: Build and install APK on emulator
6. Test iOS Release: Build and install on simulator
7. Verify remote module loading on both platforms

#### Rollback Plan

Revert to 5.2.0 if any issues arise. No breaking changes expected.

---

### 2.2 Module Federation: 0.21.6 → 0.22.0

**Priority:** 🟡 Medium
**Risk:** 🟡 Medium (minor version)
**Effort:** ~4 hours

#### What's New in 0.22.0

- Latest stable release (January 2026)
- Bug fixes and improvements
- Better error handling
- **Note:** Does NOT include Hermes-safe initialization (PatchMFConsolePlugin still required)

#### Changes Required

```json
// packages/mobile-host/package.json
// packages/mobile-remote-hello/package.json
// packages/web-shell/package.json
// packages/web-remote-hello/package.json
{
  "dependencies": {
    "@module-federation/enhanced": "0.22.0"  // was 0.21.6
  }
}
```

#### Verification Steps

1. `yarn install`
2. Build shared packages
3. Test web shell + remote (both dev and build)
4. Test mobile host + remote (both platforms, debug and release)
5. Verify PatchMFConsolePlugin still works correctly
6. Check bundle sizes haven't regressed

#### Rollback Plan

Revert to 0.21.6. Minor version changes may have API changes, so test thoroughly.

#### Caution

Monitor for any changes to:
- `console.warn()` / `console.error()` calls in MF runtime
- Share scope initialization order
- Chunk loading behavior

---

### 2.3 React Native: 0.80.0 → 0.82.x (Evaluation)

**Priority:** 🟡 Medium
**Risk:** 🔴 High (2 minor versions)
**Effort:** ~16-24 hours

#### Why Consider 0.82.x

| Improvement | Benefit |
|-------------|---------|
| **New Architecture only** | Cleaner codebase, no legacy bridge |
| **9% faster bundle load (iOS)** | Better user experience |
| **2.5% faster TTI** | Faster app startup |
| **React 19.1.1** | Full owner stacks for debugging |
| **Suspense fixes** | `useDeferredValue` + `startTransition` work correctly |

#### Why Be Cautious

| Risk | Details |
|------|---------|
| **Re.Pack compatibility** | 5.2.x officially supports 0.80 and 0.81, not 0.82 |
| **PatchMFConsolePlugin** | May need adjustments for new initialization order |
| **Breaking changes** | 2 minor versions = potential API changes |
| **Native dependencies** | May need updates (CocoaPods, Gradle plugins) |

#### Recommendation

**Do NOT upgrade immediately.** Instead:

1. Create a separate branch: `experiment/rn-0.82`
2. Attempt upgrade in isolation
3. Test PatchMFConsolePlugin thoroughly
4. Verify Re.Pack compatibility
5. Report findings before merging

#### Changes Required (If Proceeding)

```json
// All mobile package.json files
{
  "dependencies": {
    "react": "19.1.1",      // was 19.1.0
    "react-native": "0.82.0" // was 0.80.0
  }
}
```

Plus:
- Update `ios/Podfile` if needed
- Run `pod install --repo-update`
- Update Android Gradle plugins if needed
- Test all native modules

#### Verification Steps (Extensive)

1. Clean install: `rm -rf node_modules && yarn install`
2. Rebuild iOS pods: `cd packages/mobile-host/ios && rm -rf Pods && pod install`
3. Clean Android: `yarn workspace @universal/mobile-host clean:android`
4. Test Debug builds (both platforms)
5. Test Release builds (both platforms)
6. Verify PatchMFConsolePlugin output
7. Test remote module loading
8. Benchmark startup time
9. Check for any deprecation warnings

#### Rollback Plan

Revert entire branch. Do not merge until fully verified.

---

### 2.4 React (Mobile): 19.1.0 → 19.1.1

**Priority:** 🟢 Low (optional with RN upgrade)
**Risk:** 🟢 Low (patch update)
**Effort:** Included with RN 0.82 upgrade

#### What's New

- Full owner stacks support (better debugging)
- Bug fixes

#### Note

This upgrade is tied to React Native 0.82.x. Do not upgrade React independently.

---

## 3. Infrastructure Improvements

### 3.1 Add Crash Monitoring

**Priority:** 🔴 High
**Risk:** 🟢 Low
**Effort:** ~8 hours

#### Why This Is Critical

The PatchMFConsolePlugin workaround addresses a crash that would otherwise occur on **every app launch**. If this workaround fails due to:
- RN internal changes
- MF runtime changes
- Build configuration issues

...the app will crash immediately with no visibility unless crash monitoring is in place.

#### Recommended Setup

**Option A: Sentry (Recommended)**

```bash
yarn workspace @universal/mobile-host add @sentry/react-native
yarn workspace @universal/mobile-remote-hello add @sentry/react-native
```

**Configure Alerts For:**
- `ReferenceError: Property 'console' doesn't exist`
- `TypeError: Cannot read property 'constants' of undefined`
- Any crash within first 500ms of app launch
- Crash rate > 0.1%

**Option B: Firebase Crashlytics**

Already have Firebase integration. Add Crashlytics SDK.

#### Implementation Notes

- Initialize Sentry/Crashlytics as early as possible
- But NOT before PatchMFConsolePlugin polyfills (they run at bundle load)
- Add custom breadcrumbs for MF module loading events

---

### 3.2 Add CI Release Build Tests

**Priority:** 🔴 High
**Risk:** 🟢 Low
**Effort:** ~8 hours

#### Why This Is Critical

Currently, Release builds are tested manually. A regression in PatchMFConsolePlugin or build configuration would not be caught until a release is deployed.

#### Recommended CI Addition

Add to `.github/workflows/ci.yml`:

```yaml
  test-android-release:
    name: Test Android Release Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-java@v5
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: android-actions/setup-android@v3
      - uses: actions/setup-node@v6
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'

      - run: yarn install --frozen-lockfile
      - run: yarn build:shared

      - name: Build Android Release
        working-directory: packages/mobile-host/android
        env:
          PLATFORM: android
          NODE_ENV: production
        run: |
          ./gradlew generateCodegenArtifactsFromSchema --no-daemon
          ./gradlew assembleRelease --no-daemon

      - name: Verify APK exists
        run: |
          if [ ! -f packages/mobile-host/android/app/build/outputs/apk/release/app-release.apk ]; then
            echo "Release APK not found!"
            exit 1
          fi
          echo "Release APK built successfully"

  test-ios-release:
    name: Test iOS Release Build
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v6
      - uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: '16.2'
      - uses: actions/setup-node@v6
        with:
          node-version-file: '.nvmrc'
          cache: 'yarn'

      - run: yarn install --frozen-lockfile
      - run: yarn build:shared

      - name: Install CocoaPods
        working-directory: packages/mobile-host/ios
        run: pod install --repo-update

      - name: Build iOS Release
        working-directory: packages/mobile-host/ios
        env:
          PLATFORM: ios
          NODE_ENV: production
        run: |
          xcodebuild -workspace MobileHostTmp.xcworkspace \
            -scheme MobileHostTmp \
            -configuration Release \
            -sdk iphonesimulator \
            -destination 'platform=iOS Simulator,name=iPhone 16' \
            build

      - name: Verify app bundle exists
        run: |
          APP_PATH=$(find packages/mobile-host/ios/build -name "*.app" -type d | head -1)
          if [ -z "$APP_PATH" ]; then
            echo "Release app bundle not found!"
            exit 1
          fi
          echo "Release app built successfully at: $APP_PATH"
```

#### Trigger Configuration

Run on:
- Every PR to `main` or `develop`
- Every push to `main` or `develop`
- Daily scheduled run (catch external dependency issues)

---

### 3.3 Add Ecosystem Monitoring

**Priority:** 🟡 Medium
**Risk:** 🟢 Low
**Effort:** ~2 hours

#### Setup GitHub Watch Notifications

Create RSS/notification alerts for:

1. **Re.Pack Releases:** [GitHub Releases Feed](https://github.com/callstack/repack/releases.atom)
2. **Module Federation Releases:** [GitHub Releases Feed](https://github.com/module-federation/core/releases.atom)
3. **React Native Releases:** [GitHub Releases Feed](https://github.com/facebook/react-native/releases.atom)

#### Keywords to Watch For

When reviewing releases, look for mentions of:
- "Hermes"
- "console"
- "initialization"
- "runtime"
- "polyfill"

Any fix related to these could potentially eliminate the need for PatchMFConsolePlugin.

---

## 4. Strategic Architecture Options

Beyond version upgrades, consider these architectural directions:

### 4.1 Option A: Stay the Course

**Continue with Universal MFE + workarounds**

| Pros | Cons |
|------|------|
| Full MFE capability | PatchMFConsolePlugin maintenance |
| Independent deployments | Version upgrade risk |
| Already working | Bleeding-edge territory |

**Best for:** Teams committed to MFE, with platform engineering capacity

**Estimated ongoing cost:** 15-20% of engineering time on infrastructure

---

### 4.2 Option B: Hybrid Architecture

**MFE on Web + Standard RN on Mobile**

| Pros | Cons |
|------|------|
| Web MFE is mature, stable | No true MFE on mobile |
| Mobile uses battle-tested stack | Different deployment strategies |
| 60% complexity reduction | Less code sharing |

**Migration path:**
1. Keep web MFE (working well)
2. Migrate mobile to standard React Native + Metro
3. Use EAS Update for mobile OTA deployments
4. Keep shared libraries for code reuse

**Best for:** Teams where mobile MFE complexity isn't justified

**Estimated migration effort:** 40-80 hours

---

### 4.3 Option C: Full Expo Migration

**Migrate entire mobile stack to Expo**

| Pros | Cons |
|------|------|
| 10x simpler DX | No MFE on mobile |
| Stable, well-documented | App-level deployments only |
| Large community | Less flexibility |

**Best for:** Teams <15 engineers, prioritizing feature velocity

**Estimated migration effort:** 80-120 hours

---

### 4.4 Recommendation

**For this POC:** Continue with Option A (Stay the Course) while implementing:
1. Immediate upgrades (Re.Pack, MF)
2. Infrastructure improvements (crash monitoring, CI tests)
3. RN 0.82 evaluation in isolated branch

**For production decision:** Re-evaluate after:
1. 3 months of stability data
2. Crash monitoring insights
3. Team feedback on maintenance burden

---

## 5. Upgrade Execution Plan

### Phase 1: Low-Risk Upgrades (Week 1)

| Task | Effort | Risk |
|------|--------|------|
| Upgrade Re.Pack 5.2.0 → 5.2.3 | 2h | Low |
| Test all platforms (debug + release) | 4h | - |
| Document any issues | 1h | - |

### Phase 2: Medium-Risk Upgrades (Week 2)

| Task | Effort | Risk |
|------|--------|------|
| Upgrade MF 0.21.6 → 0.22.0 | 2h | Medium |
| Test all platforms thoroughly | 6h | - |
| Verify PatchMFConsolePlugin | 2h | - |
| Document any issues | 1h | - |

### Phase 3: Infrastructure (Week 3)

| Task | Effort | Risk |
|------|--------|------|
| Add crash monitoring (Sentry) | 8h | Low |
| Add CI Release build tests | 8h | Low |
| Set up ecosystem monitoring | 2h | Low |

### Phase 4: RN 0.82 Evaluation (Week 4+)

| Task | Effort | Risk |
|------|--------|------|
| Create experiment branch | 1h | - |
| Attempt RN 0.82 upgrade | 8h | High |
| Test PatchMFConsolePlugin | 4h | High |
| Document compatibility findings | 4h | - |
| Decision: merge or abandon | - | - |

---

## 6. Risk Mitigation

### 6.1 Before Any Upgrade

1. **Create backup branch:** `git checkout -b backup/pre-upgrade-$(date +%Y%m%d)`
2. **Document current working state:** Verify all builds pass
3. **Have rollback plan ready:** Know exactly which commits to revert

### 6.2 During Upgrades

1. **Upgrade one dependency at a time**
2. **Test thoroughly between each upgrade**
3. **Keep detailed notes of any issues**
4. **Don't proceed to next upgrade if current one has issues**

### 6.3 After Upgrades

1. **Monitor for 1 week before declaring success**
2. **Check crash monitoring for any new patterns**
3. **Get team feedback on any DX changes**

### 6.4 PatchMFConsolePlugin Verification

After any upgrade, verify the plugin still works:

```bash
# Build Android Release
cd packages/mobile-host/android
PLATFORM=android NODE_ENV=production ./gradlew assembleRelease

# Check bundle was patched
grep "globalThis.console" ../android/app/src/main/assets/index.android.bundle
# Should find the polyfill

# Build iOS Release
cd ../..
PLATFORM=ios NODE_ENV=production yarn build:ios

# Check bundle was patched
grep "globalThis.console" ios/main.jsbundle
# Should find the polyfill
```

---

## 7. Decision Matrix

### 7.1 Should We Upgrade Re.Pack?

| Condition | Answer |
|-----------|--------|
| Current version has known bugs affecting us | ✅ Yes, upgrade |
| Patch update with bug fixes available | ✅ Yes, upgrade |
| Risk is low (patch version) | ✅ Yes, upgrade |

**Decision: ✅ Upgrade to 5.2.3**

---

### 7.2 Should We Upgrade Module Federation?

| Condition | Answer |
|-----------|--------|
| Current version is working | ✅ Working |
| New version has Hermes fix | ❌ No |
| New version has useful improvements | ✅ Likely |
| Risk is moderate (minor version) | ⚠️ Test thoroughly |

**Decision: ✅ Upgrade to 0.22.0 with thorough testing**

---

### 7.3 Should We Upgrade React Native?

| Condition | Answer |
|-----------|--------|
| Current version is working | ✅ Working |
| Re.Pack officially supports new version | ❌ Not confirmed for 0.82 |
| Significant benefits in new version | ✅ Yes (performance, debugging) |
| Risk is high (2 minor versions) | ⚠️ High risk |

**Decision: ⚠️ Evaluate in isolated branch, do not merge without full verification**

---

### 7.4 Should We Add Crash Monitoring?

| Condition | Answer |
|-----------|--------|
| We have production-critical workarounds | ✅ Yes (PatchMFConsolePlugin) |
| Workaround failure = app crash | ✅ Yes |
| No current visibility into crashes | ✅ Correct |

**Decision: ✅ Add immediately (Sentry or Crashlytics)**

---

### 7.5 Should We Add CI Release Tests?

| Condition | Answer |
|-----------|--------|
| Release builds are tested manually | ✅ Yes |
| Regression could ship broken app | ✅ Yes |
| CI can build Release configurations | ✅ Yes |

**Decision: ✅ Add immediately**

---

## Appendix A: Version Compatibility Matrix

### Verified Working (Current)

| RN | React | Re.Pack | MF Enhanced | Rspack | Status |
|----|-------|---------|-------------|--------|--------|
| 0.80.0 | 19.1.0 | 5.2.0 | 0.21.6 | 1.6.5 | ✅ Working |

### Recommended Target

| RN | React | Re.Pack | MF Enhanced | Rspack | Status |
|----|-------|---------|-------------|--------|--------|
| 0.80.0 | 19.1.0 | 5.2.3 | 0.22.0 | 1.6.5 | 🎯 Target |

### Future Evaluation

| RN | React | Re.Pack | MF Enhanced | Rspack | Status |
|----|-------|---------|-------------|--------|--------|
| 0.82.0 | 19.1.1 | 5.2.3+ | 0.22.0+ | 1.6.5+ | ⚠️ Evaluate |

---

## Appendix B: Monitoring Checklist

### Daily (Automated)

- [ ] CI builds passing
- [ ] No new crash patterns in monitoring

### Weekly (Manual)

- [ ] Review crash monitoring dashboard
- [ ] Check for new Re.Pack releases
- [ ] Check for new MF releases
- [ ] Review any GitHub issues we're watching

### Monthly

- [ ] Review overall stability metrics
- [ ] Assess if PatchMFConsolePlugin can be removed
- [ ] Evaluate if architecture changes are needed
- [ ] Update this recommendations document

---

## Appendix C: References

### Official Documentation

- [Re.Pack Documentation](https://re-pack.dev/)
- [Module Federation Documentation](https://module-federation.io/)
- [React Native Documentation](https://reactnative.dev/)
- [Rspack Documentation](https://rspack.dev/)

### Release Pages

- [Re.Pack Releases](https://github.com/callstack/repack/releases)
- [Module Federation Releases](https://github.com/module-federation/core/releases)
- [React Native Releases](https://github.com/facebook/react-native/releases)

### Project Documentation

- [CRITICAL-ANALYSIS-OF-UNIVERSAL-MFE.md](./CRITICAL-ANALYSIS-OF-UNIVERSAL-MFE.md)
- [MOBILE-RELEASE-BUILD-FIXES.md](./MOBILE-RELEASE-BUILD-FIXES.md)
- [PATCHMFCONSOLEPLUGIN-GUIDE.md](./PATCHMFCONSOLEPLUGIN-GUIDE.md)

---

**Document End**

*This document should be reviewed and updated after each upgrade cycle or significant ecosystem change.*
