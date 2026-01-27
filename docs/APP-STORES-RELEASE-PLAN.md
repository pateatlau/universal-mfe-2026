# App Stores Release Plan

**Status:** Phase 0 Complete - CI/CD Infrastructure Ready
**Last Updated:** 2026-01-27
**Target:** Production-ready apps published to Google Play Store and Apple App Store

---

## Overview

This document outlines the step-by-step plan for publishing the Universal Microfrontend Platform mobile applications to the Google Play Store and Apple App Store. This plan builds on the completed CI/CD infrastructure (Phase 6.7) which delivers production-ready Android release APKs and iOS simulator release builds.

---

## Current State (After CI/CD Phase 6.7)

| Platform | Current State | Next Step |
|----------|--------------|-----------|
| **Android** | ✅ Release APK builds with production bundles | Configure Play Store listing |
| **iOS** | ✅ Simulator release builds (no signing) | Add Apple Developer account + code signing |

**What We Have:**
- Android: Fully signed release APKs that work on physical devices
- iOS: Release builds for simulator testing (no physical device support)
- Production remote bundles hosted on Firebase Hosting
- Firebase App Distribution configured for Android OTA testing
- GitHub Actions workflows for automated builds and releases

**What We Need:**
- Android: Play Store developer account, app listing, store assets
- iOS: Apple Developer account ($99/year), code signing, TestFlight setup, App Store listing

---

## Recommended Approach

**Strategy: Android First, Then iOS**

1. **Phase 1 (Android)** - ~10-15 hours, $25 one-time
   - Lower barrier to entry (no annual fees beyond initial $25)
   - Simpler approval process (typically 1-3 days)
   - Already have signed release APKs ready
   - Can iterate quickly based on user feedback

2. **Phase 2 (iOS)** - ~20-30 hours, $99/year
   - Requires Apple Developer account enrollment
   - More complex code signing setup
   - Stricter app review process (typically 1-7 days)
   - TestFlight beta testing before production release

---

## Pre-requisites

### Android Pre-requisites

| Requirement | Cost | Timeline | Notes |
|-------------|------|----------|-------|
| **Google Play Console Account** | $25 one-time | Immediate | Required to publish apps |
| **Privacy Policy URL** | $0 (or hosting cost) | 1-2 hours | Required by Google Play |
| **App Icons & Screenshots** | $0 (DIY) | 2-4 hours | Multiple sizes required |
| **Feature Graphic** | $0 (DIY) | 1 hour | 1024x500px banner image |
| **Release APK** | $0 | ✅ Complete | Already built via CI/CD |

### iOS Pre-requisites

| Requirement | Cost | Timeline | Notes |
|-------------|------|----------|-------|
| **Apple Developer Account** | $99/year | 1-2 days approval | Individual or Organization |
| **Distribution Certificate** | Included | 30 mins | Created via Apple Developer Portal |
| **Provisioning Profiles** | Included | 30 mins | App Store + Ad Hoc (optional) |
| **Privacy Policy URL** | $0 (or hosting cost) | 1-2 hours | Required by App Store |
| **App Icons & Screenshots** | $0 (DIY) | 2-4 hours | Multiple sizes/devices required |
| **App Store Connect Setup** | Included | 1 hour | App listing, pricing, availability |
| **Code Signing Configuration** | Included | 2-3 hours | Xcode + CI/CD integration |

---

## Phase 1: Android - Google Play Store

**Total Estimated Effort:** 10-15 hours
**Total Estimated Cost:** $25 one-time

### Task 1.1: Google Play Console Account Setup

**Objective:** Create and configure Google Play Console developer account.

**Steps:**
- [ ] Go to [Google Play Console](https://play.google.com/console/)
- [ ] Click "Create account" → "Individual" or "Organization"
- [ ] Pay $25 one-time registration fee (credit card or PayPal)
- [ ] Complete identity verification (if required)
- [ ] Accept Google Play Developer Distribution Agreement
- [ ] Complete account details (developer name, email, website)

**Timeline:** 30 minutes (account approval may take 24-48 hours)

**Cost:** $25 one-time

**Notes:**
- Use organization account if publishing for a company
- Developer name is publicly visible on Play Store
- Cannot change developer name easily after creation

---

### Task 1.2: Privacy Policy

**Objective:** Create and host a privacy policy (required by Google Play).

**Steps:**
- [ ] Write privacy policy covering:
  - What data the app collects (if any)
  - How data is used
  - Third-party services used (Firebase, etc.)
  - User rights (access, deletion, etc.)
- [ ] Host privacy policy publicly:
  - Option 1: GitHub Pages (`docs/PRIVACY-POLICY.md`)
  - Option 2: Vercel static page
  - Option 3: Firebase Hosting
- [ ] Verify URL is publicly accessible via HTTPS

**Timeline:** 1-2 hours

**Cost:** $0 (use existing hosting)

**Template Resources:**
- [App Privacy Policy Generator](https://app-privacy-policy-generator.nisrulz.com/)
- [Firebase Privacy Policy Template](https://firebase.google.com/support/privacy)

---

### Task 1.3: Store Assets (Android)

**Objective:** Create all required graphics for Play Store listing.

**Required Assets:**

| Asset | Size | Format | Quantity | Notes |
|-------|------|--------|----------|-------|
| App Icon | 512x512px | PNG (32-bit) | 1 | No transparency allowed |
| Feature Graphic | 1024x500px | PNG or JPG | 1 | Banner image for store listing |
| Phone Screenshots | Min 320px shortest side, max 3840px longest side | PNG or JPG | 2-8 | At least 2 required |
| 7-inch Tablet Screenshots | Same as phone | PNG or JPG | 0-8 | Optional but recommended |
| 10-inch Tablet Screenshots | Same as phone | PNG or JPG | 0-8 | Optional but recommended |

**Steps:**
- [ ] Create app icon (512x512px, 32-bit PNG, no transparency)
  - Consistent with existing app icon in `android/app/src/main/res/`
  - Follow [Material Design icon guidelines](https://m3.material.io/styles/icons/overview)
- [ ] Create feature graphic (1024x500px)
  - Showcase key app features
  - No text that duplicates store listing title
- [ ] Capture phone screenshots:
  - Use Android emulator or physical device
  - Show key features: home screen, remote loading, theme switching
  - Multiple screen sizes recommended (e.g., Pixel 5, Pixel 8 Pro)
- [ ] Capture tablet screenshots (optional but recommended):
  - Use 7" and 10" tablet emulators
  - Show responsive layout

**Timeline:** 2-4 hours

**Cost:** $0 (DIY using Figma, Canva, or similar tools)

**Tools:**
- Android Studio Device Frame Generator
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [Figma](https://figma.com) (free tier)
- [Canva](https://canva.com) (free tier)

---

### Task 1.4: Create App Listing (Android)

**Objective:** Create the Play Store app listing with all metadata.

**Steps:**
- [ ] Log into [Google Play Console](https://play.google.com/console/)
- [ ] Click "Create app"
- [ ] Fill in basic details:
  - App name: "Universal MFE Host" (or your chosen name)
  - Default language: English (United States)
  - App type: App
  - Free or paid: Free
- [ ] Complete Store listing:
  - **Short description** (80 chars max):
    ```
    Modular micro-frontend app with dynamic remote module loading and theming
    ```
  - **Full description** (4000 chars max):
    ```
    Universal MFE Host demonstrates a production-ready micro-frontend architecture
    for React Native, featuring:

    • Dynamic remote module loading via Module Federation v2
    • Theme switching (light/dark mode)
    • Internationalization (English, Hindi)
    • Offline-capable with production bundles
    • Modern React Native 0.80 architecture

    This app showcases best practices for building modular, scalable mobile applications
    with independently deployable features.
    ```
  - **App icon**: Upload 512x512px icon
  - **Feature graphic**: Upload 1024x500px graphic
  - **Phone screenshots**: Upload 2-8 screenshots
  - **Tablet screenshots**: Upload optional tablet screenshots
- [ ] Complete Store settings:
  - App category: Developer Tools (or appropriate category)
  - Tags: Optional
  - Contact details: Support email (required)
  - Privacy policy: Add URL
- [ ] Complete Data safety form:
  - Does your app collect or share user data? (Select based on your app)
  - If using Firebase Analytics, declare analytics data collection
  - Complete all required questions
- [ ] Complete App content:
  - Select target age range
  - Complete content ratings questionnaire (IARC)
  - Declare ads presence (Yes/No)
  - Select app category
  - Provide news app declaration (if applicable)
  - COVID-19 contact tracing declaration (if applicable)
  - Data deletion instructions (if collecting user data)

**Timeline:** 2-3 hours

**Cost:** $0

**Notes:**
- All fields marked "Required" must be completed
- Content ratings are generated via IARC questionnaire
- Privacy policy URL is mandatory for all apps

---

### Task 1.5: Build and Upload Android App Bundle (Android)

**Objective:** Build and upload the signed release Android App Bundle (AAB) to Play Console for production release.

**Note:** Google Play requires new apps to use Android App Bundle (AAB) format, not APK. AABs enable Google Play to generate optimized APKs for each device configuration, reducing download sizes.

**Prerequisites:**
- [ ] Update version information in `packages/mobile-host/android/app/build.gradle`:
  ```groovy
  versionCode 1          // Increment for each release
  versionName "1.0.0"    // Update to match semantic versioning
  ```

**Steps:**

#### Step 1: Build Android App Bundle (AAB)

**Option A: Via CI/CD (Recommended)**
- [ ] Update `.github/workflows/deploy-android.yml` to build AAB:
  ```yaml
  - name: Build Android App Bundle (Release)
    working-directory: packages/mobile-host/android
    env:
      ANDROID_KEYSTORE_FILE: ${{ github.workspace }}/release.keystore
      ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
      ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
      ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
    run: ./gradlew bundleRelease

  - name: Upload AAB artifact
    uses: actions/upload-artifact@v6
    with:
      name: android-release-aab
      path: packages/mobile-host/android/app/build/outputs/bundle/release/app-release.aab
      retention-days: 90
  ```
- [ ] Push tag to trigger workflow: `git tag v1.0.0 && git push --tags`
- [ ] Download AAB from GitHub Actions artifacts

**Option B: Build Locally**
```bash
cd packages/mobile-host/android
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

#### Step 2: Upload AAB to Play Console

- [ ] In Play Console, go to: Release → Production → Create new release
- [ ] Upload AAB:
  - Click "Upload" and select `app-release.aab`
  - Wait for upload and processing to complete
  - Google Play will analyze the bundle and generate optimized APKs
- [ ] Add release notes:
  ```
  Initial release v1.0.0

  Features:
  • Dynamic micro-frontend architecture
  • Remote module loading
  • Light and dark theme support
  • Multi-language support (English, Hindi)
  • Offline-capable with embedded bundles
  ```
- [ ] Review release details:
  - **App version:** Should match `versionName` in `build.gradle` (e.g., 1.0.0)
  - **Version code:** Should match `versionCode` in `build.gradle` (e.g., 1)
  - **Minimum SDK:** API 24 (Android 7.0) - matches `minSdkVersion` in `android/build.gradle`
  - **Target SDK:** API 35 (Android 15) - matches `targetSdkVersion` in `android/build.gradle`
  - **Supported architectures:** arm64-v8a, armeabi-v7a, x86, x86_64 (optimized per device)
- [ ] Review app size savings (AAB enables ~15-35% smaller downloads)
- [ ] Select rollout percentage:
  - Start with 20% rollout for cautious release
  - Or 100% for full release
- [ ] Save release (don't publish yet)

**Timeline:** 30 minutes

**Cost:** $0

**Notes:**
- AAB must be signed with release keystore (already configured in CI/CD)
- Version code must increment with each release
- Cannot upload same version code twice
- AAB is not installable directly on devices (only via Play Store or `bundletool`)
- To test locally, generate APKs from AAB using `bundletool`:
  ```bash
  bundletool build-apks --bundle=app-release.aab --output=app.apks --mode=universal
  ```

---

### Task 1.6: Pre-Launch Testing (Android)

**Objective:** Run automated tests via Play Console's pre-launch report.

**Steps:**
- [ ] In Play Console, go to: Release → Testing → Pre-launch report
- [ ] Configure test settings:
  - Select test devices (automatically tests on ~20 devices)
  - Choose test types: Robo test (automatic UI exploration)
- [ ] Wait for tests to complete (typically 30-60 minutes)
- [ ] Review test results:
  - Check for crashes
  - Review screenshots from test devices
  - Check performance metrics
  - Review security vulnerabilities report
- [ ] Fix any critical issues found
  - Update code in repository
  - Rebuild via CI/CD (push new tag)
  - Upload new APK
  - Re-run pre-launch tests

**Timeline:** 1-2 hours (including wait time)

**Cost:** $0 (included with Play Console)

**Notes:**
- Pre-launch testing is automatic but not mandatory
- Tests on variety of device configurations, Android versions, locales
- Highly recommended to catch device-specific issues

---

### Task 1.7: Submit for Review (Android)

**Objective:** Submit app for Google Play review and publication.

**Steps:**
- [ ] Review all sections in Play Console dashboard:
  - Store listing: ✅ Complete
  - Store settings: ✅ Complete
  - Data safety: ✅ Complete
  - App content: ✅ Complete
  - Production release: ✅ APK uploaded
- [ ] Resolve any warnings or errors shown in dashboard
- [ ] In Production release, click "Review release"
- [ ] Review rollout summary
- [ ] Click "Start rollout to Production"
- [ ] Confirm submission

**Timeline:** 15 minutes

**Cost:** $0

**Review Timeline:**
- Typical review time: 1-3 days
- May take up to 7 days for first submission
- Expedited reviews not available

**Post-Submission:**
- Monitor email for review status updates
- Check Play Console for review status
- If rejected, address issues and resubmit

---

### Task 1.8: Monitor Release (Android)

**Objective:** Monitor app performance and user feedback after publication.

**Steps:**
- [ ] Monitor Play Console dashboards:
  - Overview: Install stats, rating, crashes
  - Android vitals: Crash rate, ANR rate, excessive wakeups
  - User reviews: Read and respond to reviews
  - Pre-launch reports: Monitor ongoing automated tests
- [ ] Set up alerts:
  - Play Console → Alerts → Configure email alerts for crashes, ANRs
- [ ] Plan updates:
  - Fix crashes reported via Firebase Crashlytics
  - Address user feedback from reviews
  - Release updates regularly (monthly or as needed)

**Timeline:** Ongoing

**Cost:** $0

---

### Task 1.9: CI/CD Integration for Play Store (Optional)

**Objective:** Automate Play Store uploads via GitHub Actions.

**Prerequisites:**
- Task 1.1-1.7 completed (app published at least once manually)
- Google Play Service Account with API access

**Steps:**
- [ ] Create Google Play Service Account:
  - Play Console → Setup → API access → Create service account
  - Follow link to Google Cloud Console
  - Create service account: `github-actions-play-store`
  - Grant role: "Service Account User"
  - Create JSON key and download
- [ ] Grant Play Console access:
  - Play Console → Users and permissions → Invite new users
  - Add service account email
  - Grant permissions: Release manager (or Admin)
  - Save changes
- [ ] Add GitHub Secret:
  - Repository → Settings → Secrets and variables → Actions
  - New repository secret: `PLAY_STORE_SERVICE_ACCOUNT_JSON`
  - Paste full contents of JSON key file
- [ ] Update `.github/workflows/deploy-android.yml`:
  ```yaml
  # IMPORTANT: Pin to a specific commit SHA to prevent supply chain attacks
  # Update the SHA when you consciously decide to upgrade the action
  # Current version: v1.0.19 (commit SHA: 39074761b0a3ec9a5c9e0ad16b8e8c3c1c39d80d)
  - name: Upload to Play Store (Internal Testing)
    uses: r0adkll/upload-google-play@39074761b0a3ec9a5c9e0ad16b8e8c3c1c39d80d
    with:
      serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT_JSON }}
      packageName: com.mobilehosttmp
      releaseFiles: packages/mobile-host/android/app/build/outputs/bundle/release/app-release.aab
      track: internal
      status: completed
      inAppUpdatePriority: 2
      whatsNewDirectory: whatsnew/
  ```

  **Security Note:** The action is pinned to a specific commit SHA (not a mutable tag like `v1`) to prevent supply chain attacks. If the action repository is compromised, your workflows won't automatically use the malicious code. Verify the SHA corresponds to the intended version:
  ```bash
  # Check the commit for r0adkll/upload-google-play v1.0.19:
  # https://github.com/r0adkll/upload-google-play/commit/39074761b0a3ec9a5c9e0ad16b8e8c3c1c39d80d
  ```

  Update the SHA only when you consciously decide to upgrade the action after reviewing the changes.
- [ ] Test workflow by pushing a tag

**Timeline:** 2-3 hours

**Cost:** $0

**Benefits:**
- Automatic upload to Internal Testing track on tag push
- Faster iteration cycles
- Consistent release process

**Notes:**
- Upload to Internal Testing track first (for alpha/beta testers)
- Promote to Production track manually via Play Console after validation
- Requires one successful manual submission first

---

## Phase 2: iOS - Apple App Store

**Total Estimated Effort:** 20-30 hours
**Total Estimated Cost:** $99/year

### Task 2.1: Apple Developer Account Enrollment

**Objective:** Create and verify Apple Developer account.

**Steps:**
- [ ] Go to [Apple Developer Program](https://developer.apple.com/programs/)
- [ ] Click "Enroll"
- [ ] Choose account type:
  - **Individual:** For personal projects, freelancers ($99/year)
  - **Organization:** For companies, requires D-U-N-S number ($99/year)
- [ ] Sign in with Apple ID (or create new Apple ID)
- [ ] Complete enrollment form:
  - Legal entity information
  - Contact information
  - Billing information
- [ ] Pay $99 annual fee (credit card or PayPal)
- [ ] Submit enrollment application
- [ ] Wait for Apple verification:
  - **Individual:** Typically 24-48 hours
  - **Organization:** May take 7-14 days (requires D-U-N-S verification)
- [ ] Receive enrollment confirmation email
- [ ] Accept Apple Developer Program License Agreement

**Timeline:** 1-14 days (depending on account type and verification)

**Cost:** $99/year (auto-renews annually)

**Notes:**
- Use personal Apple ID for Individual account
- Organization accounts require D-U-N-S number (free from Dun & Bradstreet)
- Payment is annual, not one-time like Google Play
- Must maintain active subscription to keep apps on App Store

---

### Task 2.2: Certificates and Identifiers

**Objective:** Create App ID, distribution certificate, and provisioning profiles.

**Prerequisites:**
- Task 2.1 complete (Apple Developer account active)

#### Step 1: Create App ID

- [ ] Log into [Apple Developer Portal](https://developer.apple.com/account/)
- [ ] Go to: Certificates, Identifiers & Profiles → Identifiers
- [ ] Click "+" to register new identifier
- [ ] Select "App IDs" → Continue
- [ ] Configure App ID:
  - **Type:** App
  - **Description:** Universal MFE Host
  - **Bundle ID:** Explicit - `com.universal.mobilehost` (must match current Xcode project)
  - **Capabilities:** (select as needed)
    - Push Notifications (if using Firebase Cloud Messaging)
    - Sign in with Apple (if implementing Apple Sign-In)
    - Associated Domains (if using universal links)
- [ ] Click "Continue" → "Register"
- [ ] Repeat for standalone app (optional):
  - Description: Universal MFE Remote Standalone
  - Bundle ID: `com.universal.mobileremote`

**Note:** The current iOS projects use these bundle identifiers:
- Host: `com.universal.mobilehost` (see `packages/mobile-host/ios/MobileHostTmp.xcodeproj/project.pbxproj`)
- Remote: `com.universal.mobileremote` (see `packages/mobile-remote-hello/ios/MobileRemoteHello.xcodeproj/project.pbxproj`)

If you prefer different bundle IDs (e.g., your company domain), update the Xcode projects before continuing:
1. Open project in Xcode
2. Select target → General tab
3. Update Bundle Identifier
4. Use the new identifier in all subsequent steps

#### Step 2: Create Distribution Certificate

- [ ] On Mac, open Keychain Access
- [ ] Go to: Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
- [ ] Fill in form:
  - User Email Address: Your email
  - Common Name: Your name or organization
  - CA Email Address: Leave empty
  - Request is: Saved to disk
- [ ] Click "Continue" → Save `.certSigningRequest` file
- [ ] In Apple Developer Portal, go to: Certificates, Identifiers & Profiles → Certificates
- [ ] Click "+" to create new certificate
- [ ] Select "Apple Distribution" → Continue
- [ ] Upload `.certSigningRequest` file
- [ ] Click "Continue" → "Download"
- [ ] Double-click downloaded `.cer` file to install in Keychain Access
- [ ] Verify certificate appears in Keychain Access under "My Certificates"

#### Step 3: Create Provisioning Profiles

**App Store Provisioning Profile** (for production release):
- [ ] In Apple Developer Portal, go to: Certificates, Identifiers & Profiles → Profiles
- [ ] Click "+" to create new profile
- [ ] Select "App Store" → Continue
- [ ] Select App ID: `com.universal.mobilehost` → Continue
- [ ] Select certificate created in Step 2 → Continue
- [ ] Profile Name: `Universal MFE Host App Store`
- [ ] Click "Generate" → "Download"
- [ ] Double-click `.mobileprovision` file to install in Xcode
- [ ] Repeat for standalone app (optional):
  - App ID: `com.universal.mobileremote`
  - Profile Name: `Universal MFE Remote Standalone App Store`

**Ad Hoc Provisioning Profile** (optional, for internal testing on registered devices):
- [ ] Register test device UDIDs:
  - Devices → "+" → Add device
  - Device Name: iPhone 15 Pro
  - UDID: (from Xcode or device)
- [ ] Create Ad Hoc profile (same steps as App Store, but select "Ad Hoc" and choose devices)

**Timeline:** 1-2 hours

**Cost:** $0 (included with Apple Developer account)

**Notes:**
- Distribution certificate is valid for 1 year, must renew
- Provisioning profiles expire after 1 year
- Maximum 100 devices for Ad Hoc distribution per year (resets annually)
- Certificates and profiles are tied to Apple Developer account

---

### Task 2.3: Xcode Project Configuration

**Objective:** Configure Xcode project for release builds with code signing.

**Prerequisites:**
- Task 2.2 complete (certificates and provisioning profiles created)

**Steps:**

#### Step 1: Update Display Name and Version

- [ ] Open `packages/mobile-host/ios/MobileHostTmp.xcworkspace` in Xcode
- [ ] Select project in navigator → Select target "MobileHostTmp"
- [ ] Go to: General tab
- [ ] Verify/Update:
  - **Display Name:** Universal MFE Host
  - **Bundle Identifier:** `com.universal.mobilehost` (current value, must match App ID from Task 2.2)
  - **Version:** 1.0.0 (update from current "1.0")
  - **Build:** 1
- [ ] Repeat for standalone app (optional):
  - Open `packages/mobile-remote-hello/ios/MobileRemoteHello.xcworkspace`
  - Bundle ID: `com.universal.mobileremote` (current value)
  - Version: 1.0.0 (update from "1.0")

**Note:** The current Xcode projects already use the correct bundle identifiers:
- Host: `com.universal.mobilehost` (see `PRODUCT_BUNDLE_IDENTIFIER` in project.pbxproj)
- Remote: `com.universal.mobileremote`

Only the version number needs updating from "1.0" to "1.0.0" for consistency with App Store requirements.

#### Step 2: Configure Signing (Manual)

- [ ] In Xcode, select target → Signing & Capabilities tab
- [ ] **Debug configuration:**
  - Automatically manage signing: ✅ Checked
  - Team: Select your team
  - Provisioning Profile: Automatic (Xcode Managed Profile)
- [ ] **Release configuration:**
  - Automatically manage signing: ❌ Unchecked
  - Team: Select your team
  - Provisioning Profile: Select "Universal MFE Host App Store" (manual profile from Task 2.2)
  - Signing Certificate: "Apple Distribution" (certificate from Task 2.2)
- [ ] Verify no signing errors appear

#### Step 3: Build Settings

- [ ] Select target → Build Settings tab
- [ ] Search for "Code Signing Identity"
- [ ] Ensure Release configuration uses "Apple Distribution"
- [ ] Search for "Provisioning Profile"
- [ ] Ensure Release configuration uses App Store provisioning profile
- [ ] Update `Info.plist`:
  - Set `CFBundleDisplayName` to "Universal MFE Host"
  - Set `CFBundleShortVersionString` to "1.0.0"
  - Set `CFBundleVersion` to "1"

**Timeline:** 1 hour

**Cost:** $0

**Notes:**
- Debug builds can use automatic signing (Xcode creates temporary profiles)
- Release builds require manual signing with distribution certificate
- Bundle ID cannot be changed after first submission to App Store Connect

---

### Task 2.4: Test Release Build Locally

**Objective:** Verify release build works correctly before submitting to App Store.

**Prerequisites:**
- Task 2.3 complete (Xcode configured for release)

**Steps:**

#### Step 1: Build for Simulator (Initial Verification)

- [ ] In Xcode, select target "MobileHostTmp"
- [ ] Select scheme: "MobileHostTmp" → Edit Scheme
- [ ] Run section → Build Configuration → Change from "Debug" to "Release"
- [ ] Select destination: Any iOS Simulator (e.g., iPhone 16)
- [ ] Product → Clean Build Folder (⇧⌘K)
- [ ] Product → Build (⌘B)
- [ ] Verify build succeeds with no errors
- [ ] Run app on simulator (⌘R)
- [ ] Verify app launches and works correctly:
  - No Metro bundler required
  - Production remote loads from Firebase Hosting
  - All features functional (theme switching, i18n, etc.)

#### Step 2: Build Archive for Device Testing (Ad Hoc)

**Note:** This step requires an Ad Hoc provisioning profile with registered device UDIDs. Skip if you don't have test devices or want to proceed directly to App Store submission.

- [ ] Connect physical iOS device via USB
- [ ] In Xcode, select target "MobileHostTmp"
- [ ] Edit Scheme → Run → Build Configuration → Release
- [ ] Select destination: Your connected device
- [ ] Ensure device is registered in Apple Developer Portal (Task 2.2)
- [ ] Product → Clean Build Folder
- [ ] Product → Archive (⇧⌘B)
- [ ] Wait for archive to complete
- [ ] In Organizer window:
  - Select archive
  - Click "Distribute App"
  - Select "Ad Hoc"
  - Select distribution options:
    - App Thinning: None (or specific device)
    - Rebuild from bitcode: ❌ (Hermes bytecode incompatible)
    - Include manifest for over-the-air installation: ✅ (optional)
  - Select Ad Hoc provisioning profile
  - Click "Export"
  - Save `.ipa` file to disk
- [ ] Install on device:
  - Option 1: Drag `.ipa` to Xcode Devices window (Window → Devices and Simulators)
  - Option 2: Use `xcrun simctl install` command (simulator only)
  - Option 3: Use Diawi or Firebase App Distribution (OTA installation)
- [ ] Test thoroughly on physical device:
  - App launches correctly
  - Remote loading works
  - Theme switching works
  - Language switching works
  - Performance is acceptable
  - No crashes or errors

**Timeline:** 2-3 hours

**Cost:** $0

**Notes:**
- Simulator build is sufficient for initial verification
- Physical device testing recommended before App Store submission
- Ad Hoc distribution limited to 100 devices per year
- Archive builds can take 5-15 minutes depending on Mac specs

---

### Task 2.5: Export Signing Credentials for CI/CD

**Objective:** Export signing certificate and provisioning profile for GitHub Actions automation.

**Prerequisites:**
- Task 2.2 complete (certificates and profiles created)
- Task 2.4 complete (local release build verified)

#### Step 1: Export Distribution Certificate

- [ ] Open Keychain Access on Mac
- [ ] Select "My Certificates" category
- [ ] Find "Apple Distribution: [Your Name]" certificate
- [ ] Right-click certificate → "Export Apple Distribution..."
- [ ] Save as: `distribution-cert.p12`
- [ ] Enter strong password when prompted (save this password securely)
- [ ] Confirm export

#### Step 2: Export Provisioning Profile

- [ ] In Finder, navigate to: `~/Library/MobileDevice/Provisioning Profiles/`
- [ ] Locate `.mobileprovision` file:
  - Look for file modified on date you created profile
  - Can open in TextEdit to verify it matches your App ID
- [ ] Copy file to known location
- [ ] Rename to: `app-store-profile.mobileprovision`

#### Step 3: Convert to Base64 for GitHub Secrets

```bash
# Export certificate to base64
base64 -i distribution-cert.p12 | pbcopy
# (paste into GitHub secret: IOS_CERTIFICATE_BASE64)

# Export provisioning profile to base64
base64 -i app-store-profile.mobileprovision | pbcopy
# (paste into GitHub secret: IOS_PROVISIONING_PROFILE_BASE64)
```

#### Step 4: Add GitHub Secrets

- [ ] Go to: Repository → Settings → Secrets and variables → Actions
- [ ] Add the following secrets:
  - `IOS_CERTIFICATE_BASE64` - Paste base64-encoded .p12 certificate
  - `IOS_CERTIFICATE_PASSWORD` - Password used when exporting certificate
  - `IOS_PROVISIONING_PROFILE_BASE64` - Paste base64-encoded provisioning profile
  - `APPLE_TEAM_ID` - Find in Apple Developer Portal (Membership → Team ID)

#### Step 5: Update CI/CD Workflow

- [ ] Update `.github/workflows/deploy-ios.yml`:

```yaml
# Add after "Install CocoaPods" step:

- name: Install signing certificate and provisioning profile
  env:
    IOS_CERTIFICATE_BASE64: ${{ secrets.IOS_CERTIFICATE_BASE64 }}
    IOS_CERTIFICATE_PASSWORD: ${{ secrets.IOS_CERTIFICATE_PASSWORD }}
    IOS_PROVISIONING_PROFILE_BASE64: ${{ secrets.IOS_PROVISIONING_PROFILE_BASE64 }}
  run: |
    # Create keychain
    security create-keychain -p "" build.keychain
    security default-keychain -s build.keychain
    security unlock-keychain -p "" build.keychain
    security set-keychain-settings -t 3600 -u build.keychain

    # Import certificate
    echo "$IOS_CERTIFICATE_BASE64" | base64 -d > cert.p12
    security import cert.p12 -k build.keychain -P "$IOS_CERTIFICATE_PASSWORD" -T /usr/bin/codesign
    security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain

    # Install provisioning profile
    mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
    echo "$IOS_PROVISIONING_PROFILE_BASE64" | base64 -d > ~/Library/MobileDevice/Provisioning\ Profiles/app-store-profile.mobileprovision

    # Clean up certificate file
    rm cert.p12

# Update "Build Host iOS app" step to use distribution certificate:
- name: Build Host iOS app for Device
  working-directory: packages/mobile-host/ios
  env:
    NODE_ENV: production
    PLATFORM: ios
  run: |
    xcodebuild \
      -workspace MobileHostTmp.xcworkspace \
      -scheme MobileHostTmp \
      -configuration Release \
      -sdk iphoneos \
      -archivePath build/MobileHostTmp.xcarchive \
      CODE_SIGN_IDENTITY="Apple Distribution" \
      PROVISIONING_PROFILE_SPECIFIER="Universal MFE Host App Store" \
      archive

# Add archive export step:
- name: Export IPA
  working-directory: packages/mobile-host/ios
  run: |
    # Create ExportOptions.plist
    cat > ExportOptions.plist <<EOF
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
      <key>method</key>
      <string>app-store</string>
      <key>teamID</key>
      <string>${{ secrets.APPLE_TEAM_ID }}</string>
      <key>uploadSymbols</key>
      <true/>
      <key>compileBitcode</key>
      <false/>
    </dict>
    </plist>
    EOF

    # Export archive
    xcodebuild \
      -exportArchive \
      -archivePath build/MobileHostTmp.xcarchive \
      -exportPath build/ipa \
      -exportOptionsPlist ExportOptions.plist

    # Rename IPA
    mv build/ipa/MobileHostTmp.ipa build/ipa/mobile-host-release.ipa

# Update "Upload artifacts" step to include IPA:
- name: Upload iOS artifacts
  uses: actions/upload-artifact@v6
  with:
    name: ios-release-artifacts
    path: |
      packages/mobile-host/ios/build/ipa/mobile-host-release.ipa
      packages/mobile-remote-hello/ios/build/ipa/mobile-remote-standalone-release.ipa
    retention-days: 90
```

#### Step 6: Test CI/CD Build

- [ ] Commit changes to workflow file
- [ ] Push a test tag: `git tag v1.0.0-ios-test && git push --tags`
- [ ] Monitor GitHub Actions workflow
- [ ] Verify IPA artifact is created
- [ ] Download and test IPA locally (optional)

**Timeline:** 2-3 hours

**Cost:** $0

**Security Notes:**
- Never commit certificates or provisioning profiles directly to repository
- Use GitHub Secrets for all sensitive credentials
- Certificate password should be strong and unique
- Rotate credentials if compromised

---

### Task 2.6: App Store Connect Setup

**Objective:** Create app listing in App Store Connect.

**Prerequisites:**
- Task 2.1 complete (Apple Developer account active)
- Task 2.2 complete (App ID created)

**Steps:**

#### Step 1: Create App in App Store Connect

- [ ] Go to [App Store Connect](https://appstoreconnect.apple.com/)
- [ ] Click "My Apps" → "+" → "New App"
- [ ] Fill in app information:
  - **Platforms:** iOS
  - **Name:** Universal MFE Host (must be unique on App Store)
  - **Primary Language:** English (U.S.)
  - **Bundle ID:** Select `com.universal.mobilehost` (from Task 2.2)
  - **SKU:** `universal-mfe-host-001` (unique identifier for internal tracking)
  - **User Access:** Full Access (or Limited Access as needed)
- [ ] Click "Create"

#### Step 2: Complete App Information

- [ ] In app overview, go to: App Information
- [ ] Fill in required fields:
  - **Name:** Universal MFE Host
  - **Subtitle:** (Optional, 30 chars max) "Modular Microfrontend Platform"
  - **Privacy Policy URL:** (from Task 1.2, must be hosted)
  - **Category:** Developer Tools (or appropriate category)
  - **Secondary Category:** (Optional)
  - **Content Rights:** (Select appropriate option)
  - **Age Rating:** Click "Edit" → Complete questionnaire
- [ ] Save changes

#### Step 3: Pricing and Availability

- [ ] Go to: Pricing and Availability
- [ ] Set price tier: Free (or select paid tier if applicable)
- [ ] Availability: Select all territories (or specific countries)
- [ ] Save changes

**Timeline:** 1 hour

**Cost:** $0

**Notes:**
- App name must be unique globally on App Store
- Privacy policy URL is mandatory
- Cannot change Bundle ID after app is created
- Age rating affects who can download the app

---

### Task 2.7: Store Assets (iOS)

**Objective:** Create all required graphics for App Store listing.

**Required Assets:**

| Asset | Size | Format | Quantity | Notes |
|-------|------|--------|----------|-------|
| App Icon | 1024x1024px | PNG (no transparency) | 1 | Must match app icon in bundle |
| iPhone Screenshots | Device-specific | PNG or JPG | 3-10 per device size | Required for all supported device sizes |
| iPad Screenshots | Device-specific | PNG or JPG | 3-10 per device size | Required if supporting iPad |

**iPhone Screenshot Sizes (Required):**
- 6.9" Display (iPhone 16 Pro Max): 1320 x 2868 px
- 6.7" Display (iPhone 15 Plus/Pro Max): 1290 x 2796 px
- 6.5" Display (iPhone 11 Pro Max/XS Max): 1242 x 2688 px
- 5.5" Display (iPhone 8 Plus): 1242 x 2208 px

**iPad Screenshot Sizes (Optional):**
- 12.9" Display (iPad Pro 6th gen): 2048 x 2732 px
- 11" Display (iPad Pro 4th gen): 1668 x 2388 px

**Steps:**

#### Step 1: Capture iPhone Screenshots

- [ ] Use Xcode Simulator or physical device
- [ ] Capture screenshots of key features:
  - App home screen
  - Remote module loading
  - Theme switching (light/dark)
  - Language switching (English/Hindi)
  - Key functionality demonstration
- [ ] For each supported device size:
  - Launch app in simulator (e.g., iPhone 16 Pro Max)
  - Navigate to feature screen
  - Take screenshot: Cmd+S (simulator) or Power+Volume Up (device)
  - Screenshots saved to Desktop
- [ ] Verify screenshot dimensions match required sizes
- [ ] Optional: Add device frames using [Screenshot Creator](https://www.appstorescreenshot.com/)

#### Step 2: Create App Icon

- [ ] Ensure app icon is 1024x1024px PNG with no transparency
- [ ] Should match icon used in Xcode project (`Assets.xcassets/AppIcon.appiconset`)
- [ ] Follow [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [ ] Export at exact dimensions (no rounded corners, App Store adds them automatically)

#### Step 3: Optional Marketing Assets

- [ ] App preview videos (optional): 15-30 second video demos
  - Device-specific dimensions
  - Must show actual app functionality
  - No overlaid text or graphics allowed
- [ ] App promotional text (170 chars): Displayed above description, can update anytime

**Timeline:** 2-4 hours

**Cost:** $0 (DIY)

**Tools:**
- Xcode Simulator (built-in screenshot capture)
- [Screenshot Creator](https://www.appstorescreenshot.com/) (device frames)
- [Figma](https://figma.com) or Sketch (graphic design)

**Notes:**
- Must provide screenshots for at least one device size per family (iPhone, iPad)
- Screenshots must be actual app screens (no mockups or marketing images)
- App Store displays first 3-4 screenshots, make them count

---

### Task 2.8: Build and Upload to App Store Connect

**Objective:** Build production IPA and upload to App Store Connect for review.

**Prerequisites:**
- Task 2.3 complete (Xcode configured for release)
- Task 2.6 complete (App Store Connect app created)

**Methods:**

#### Method 1: Upload via Xcode (Recommended for first submission)

- [ ] In Xcode, select target "MobileHostTmp"
- [ ] Ensure scheme is set to Release configuration
- [ ] Select "Any iOS Device (arm64)" as destination
- [ ] Product → Clean Build Folder (⇧⌘K)
- [ ] Product → Archive (⇧⌘B)
- [ ] Wait for archive to complete (5-15 minutes)
- [ ] Xcode Organizer window opens automatically
- [ ] Select archive → Click "Distribute App"
- [ ] Select distribution method: "App Store Connect"
- [ ] Select destination: "Upload"
- [ ] Configure distribution options:
  - **App Thinning:** All compatible device variants
  - **Rebuild from Bitcode:** ❌ Uncheck (Hermes incompatible)
  - **Include symbols:** ✅ Check (for crash reports)
  - **Manage Version and Build Number:** Automatically manage (optional)
- [ ] Select signing: "Automatically manage signing" (or manual if needed)
- [ ] Review IPA summary
- [ ] Click "Upload"
- [ ] Wait for upload to complete (5-30 minutes depending on connection)
- [ ] Receive confirmation: "Upload Successful"
- [ ] Build will appear in App Store Connect within 15-30 minutes

#### Method 2: Upload via CI/CD (Automated)

**Prerequisites:**
- Task 2.5 complete (CI/CD signing configured)

- [ ] Install Fastlane (optional, for easier uploads):
  ```bash
  cd packages/mobile-host/ios
  gem install fastlane
  fastlane init
  ```

- [ ] Create App Store Connect API Key:
  - Go to: App Store Connect → Users and Access → Keys
  - Click "+" to generate new API key
  - Name: `github-actions-appstore`
  - Access: App Manager (or Admin)
  - Download `.p8` key file (save securely, can't re-download)
  - Note Issuer ID and Key ID

- [ ] Add GitHub Secrets:
  - `APP_STORE_CONNECT_API_KEY_ID` - Key ID
  - `APP_STORE_CONNECT_ISSUER_ID` - Issuer ID
  - `APP_STORE_CONNECT_API_KEY_BASE64` - Base64-encoded .p8 file

- [ ] Update `.github/workflows/deploy-ios.yml` with upload step:

  **Option A: Using Transporter (Modern, Recommended)**
  ```yaml
  - name: Upload to App Store Connect via Transporter
    working-directory: packages/mobile-host/ios
    env:
      APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
      APP_STORE_CONNECT_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
      APP_STORE_CONNECT_API_KEY_BASE64: ${{ secrets.APP_STORE_CONNECT_API_KEY_BASE64 }}
    run: |
      # Create API key file in standard location
      mkdir -p ~/.appstoreconnect/private_keys
      echo "$APP_STORE_CONNECT_API_KEY_BASE64" | base64 -d > ~/.appstoreconnect/private_keys/AuthKey_${APP_STORE_CONNECT_API_KEY_ID}.p8

      # Upload using iTMSTransporter (replaces deprecated altool)
      xcrun iTMSTransporter \
        -m upload \
        -assetFile build/ipa/mobile-host-release.ipa \
        -apiKey $APP_STORE_CONNECT_API_KEY_ID \
        -apiIssuer $APP_STORE_CONNECT_ISSUER_ID \
        -v eXtreme

      # Clean up API key
      rm -f ~/.appstoreconnect/private_keys/AuthKey_${APP_STORE_CONNECT_API_KEY_ID}.p8
  ```

  **Option B: Using Fastlane (CI-Friendly Alternative)**
  ```yaml
  - name: Install Fastlane
    run: gem install fastlane

  - name: Upload to App Store Connect via Fastlane
    working-directory: packages/mobile-host/ios
    env:
      APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
      APP_STORE_CONNECT_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_ISSUER_ID }}
      APP_STORE_CONNECT_API_KEY_BASE64: ${{ secrets.APP_STORE_CONNECT_API_KEY_BASE64 }}
    run: |
      # Create API key file
      mkdir -p ~/.appstoreconnect/private_keys
      echo "$APP_STORE_CONNECT_API_KEY_BASE64" | base64 -d > ~/.appstoreconnect/private_keys/AuthKey_${APP_STORE_CONNECT_API_KEY_ID}.p8

      # Set Fastlane environment variables
      export APP_STORE_CONNECT_API_KEY_PATH=~/.appstoreconnect/private_keys/AuthKey_${APP_STORE_CONNECT_API_KEY_ID}.p8

      # Upload using Fastlane pilot
      fastlane pilot upload \
        --ipa build/ipa/mobile-host-release.ipa \
        --api_key_path $APP_STORE_CONNECT_API_KEY_PATH \
        --skip_waiting_for_build_processing

      # Clean up API key
      rm -f ~/.appstoreconnect/private_keys/AuthKey_${APP_STORE_CONNECT_API_KEY_ID}.p8
  ```

  **Note:** `xcrun altool` was deprecated by Apple and replaced with `xcrun iTMSTransporter`. Fastlane provides a higher-level, more CI-friendly interface with better error handling and progress reporting.

- [ ] Push tag to trigger workflow
- [ ] Monitor GitHub Actions for upload status

**Timeline:** 1-2 hours (first upload), 30 mins (subsequent)

**Cost:** $0

**Notes:**
- First upload takes longer due to processing on Apple's servers
- Build must pass automated checks before appearing in App Store Connect
- Can have multiple builds uploaded, but only one can be submitted for review at a time

---

### Task 2.9: Complete App Store Listing

**Objective:** Add metadata, screenshots, and description to App Store Connect listing.

**Prerequisites:**
- Task 2.7 complete (store assets created)
- Task 2.8 complete (build uploaded to App Store Connect)

**Steps:**

#### Step 1: Add App Store Information

- [ ] In App Store Connect, go to: My Apps → Universal MFE Host
- [ ] Select "iOS App" under "App Store" section
- [ ] Go to version being prepared (e.g., "1.0.0 Prepare for Submission")
- [ ] Fill in metadata:

**App Information:**
- **Name:** Universal MFE Host (70 chars max)
- **Subtitle:** Modular Microfrontend Platform (30 chars max)
- **Promotional Text:** (Optional, 170 chars, can update anytime without new version)

**Description:**
```
Universal MFE Host demonstrates a production-ready micro-frontend architecture for React Native, enabling modular, scalable mobile app development.

KEY FEATURES:
• Dynamic Remote Module Loading - Load features on-demand using Module Federation v2
• Theme Support - Switch between light and dark themes seamlessly
• Internationalization - Full support for English and Hindi languages
• Offline-Capable - Works with embedded production bundles
• Modern Architecture - Built on React Native 0.80 with Hermes engine

TECHNICAL HIGHLIGHTS:
This app showcases advanced patterns for enterprise mobile development:
- Independently deployable micro-frontends
- Host-owned routing with loosely coupled MFEs
- Shared state management via event bus
- Universal React Native components for cross-platform UI
- Type-safe TypeScript implementation

PERFECT FOR:
- Developers learning micro-frontend architectures
- Teams building modular, scalable mobile apps
- Anyone interested in advanced React Native patterns

Built with: React Native, Rspack, Module Federation v2, Hermes, Firebase
```

**Keywords:** (100 chars max, comma-separated)
```
microfrontend,react native,modular,architecture,mfe,federation,developer
```

**Support URL:** (Required)
- GitHub repository URL or dedicated support page

**Marketing URL:** (Optional)
- Project website or landing page

#### Step 2: Upload Screenshots

- [ ] Scroll to "App Preview and Screenshots" section
- [ ] For each device size:
  - iPhone 6.9" Display: Upload 3-10 screenshots
  - iPhone 6.7" Display: Upload 3-10 screenshots (or same as 6.9" if similar)
  - iPhone 6.5" Display: Upload 3-10 screenshots (or same as above)
  - iPhone 5.5" Display: Upload 3-10 screenshots (or same as above)
- [ ] Arrange screenshots in order of importance (first 3 displayed prominently)
- [ ] Optional: Upload app preview videos (15-30 seconds)

#### Step 3: Build Information

- [ ] Scroll to "Build" section
- [ ] Click "+" to add build
- [ ] Select the build uploaded in Task 2.8
- [ ] Build will be added to this version
- [ ] If build not available, wait 15-30 minutes for processing

#### Step 4: General App Information

- [ ] Scroll to "General App Information"
- [ ] Fill in:
  - **Copyright:** © 2026 [Your Name/Organization]
  - **Age Rating:** Click "Edit" → Complete questionnaire
  - **App Reviewer Contact Information:**
    - First Name: [Your name]
    - Last Name: [Your name]
    - Phone: [Your phone]
    - Email: [Your email]
  - **Demo Account:** (if app requires login)
    - Username: [test account]
    - Password: [test password]
    - Required: ✅ (if login needed to access features)
  - **Notes:** (Optional) Additional info for reviewer

#### Step 5: Version Information

- [ ] Scroll to "Version Information"
- [ ] **What's New in This Version:** (4000 chars max)
  ```
  Initial release of Universal MFE Host v1.0.0

  This is the first public release, featuring:

  ✨ Dynamic Micro-Frontend Architecture
  - Load remote modules on-demand using Module Federation v2
  - Independently deployable features and updates

  🎨 Theme Support
  - Light and dark theme modes
  - Persistent theme selection across sessions

  🌐 Internationalization
  - Full English and Hindi language support
  - Easy language switching in settings

  📦 Production-Ready
  - Offline-capable with embedded bundles
  - Powered by Hermes JavaScript engine for optimal performance

  🔧 Developer-Focused
  - Clean, maintainable codebase
  - Best practices for modular mobile app development
  - Open source and available on GitHub
  ```

#### Step 6: App Privacy

- [ ] Click "Edit" next to "App Privacy"
- [ ] Complete privacy questionnaire:
  - Does your app collect data? (Select based on your app)
  - If yes, specify data types collected
  - Explain how data is used
  - Explain data retention and deletion
- [ ] Link privacy policy URL (from Task 2.6)
- [ ] Save privacy details

**Timeline:** 2-3 hours

**Cost:** $0

**Notes:**
- All required fields must be completed before submission
- Description and keywords affect App Store search ranking
- First 170 characters of description appear before "more" link
- Can update promotional text anytime without new version submission

---

### Task 2.10: Submit for Review (iOS)

**Objective:** Submit app to Apple for App Store review.

**Prerequisites:**
- All previous tasks in Phase 2 complete
- Build uploaded and selected
- All metadata completed
- Screenshots uploaded
- App privacy completed

**Steps:**

#### Step 1: Final Review

- [ ] In App Store Connect, review all sections for completeness:
  - ✅ App Information complete
  - ✅ Pricing and Availability set
  - ✅ Version metadata complete (description, keywords, etc.)
  - ✅ Screenshots uploaded for all required device sizes
  - ✅ Build selected
  - ✅ App Privacy completed
  - ✅ Age rating set
  - ✅ Review contact information provided
- [ ] Resolve any warnings or errors (indicated by yellow/red dots)

#### Step 2: Export Compliance

- [ ] Scroll to "Export Compliance"
- [ ] Answer encryption questions:
  - **Is your app designed to use cryptography or does it contain or incorporate cryptography?**
    - If using HTTPS only (standard web requests): Select "No"
    - If using additional encryption: Select "Yes" and complete additional questions
- [ ] If "Yes" selected, may need to provide U.S. Export Compliance documentation
- [ ] Most apps can select "No" if only using standard HTTPS

#### Step 3: Advertising Identifier (IDFA)

- [ ] Scroll to "Advertising Identifier"
- [ ] Answer: **Does this app use the Advertising Identifier (IDFA)?**
  - If not using ads or analytics that track users: Select "No"
  - If using Firebase Analytics, Facebook SDK, etc.: Select "Yes" and specify use cases
- [ ] If "Yes", select applicable use cases:
  - Serve advertisements within the app
  - Attribute this app installation to a previously served advertisement
  - Attribute an action taken within this app to a previously served advertisement

#### Step 4: Submit for Review

- [ ] Click "Add for Review" button (top right)
- [ ] Confirm submission in popup
- [ ] Status changes to "Waiting for Review"
- [ ] Receive confirmation email from Apple

**Timeline:** 15-30 minutes

**Cost:** $0

**Review Timeline:**
- Typical review time: 1-7 days
- First submission often takes longer (3-7 days)
- Updates typically faster (1-3 days)
- Expedited review available only in exceptional circumstances

**Post-Submission:**
- Cannot make changes while in review
- Monitor email for status updates
- Check App Store Connect for review status
- If rejected, address issues and resubmit

---

### Task 2.11: Handle App Review

**Objective:** Respond to App Review feedback and address any rejection reasons.

**Possible Review Outcomes:**

#### 1. Approved (Best Case)
- [ ] Receive "Ready for Sale" email
- [ ] App appears on App Store within 24 hours
- [ ] Verify app listing is live
- [ ] Test downloading and installing from App Store
- [ ] Proceed to Task 2.12 (Monitor Release)

#### 2. In Review
- [ ] Reviewer may contact you with questions
- [ ] Respond promptly via Resolution Center in App Store Connect
- [ ] Provide additional information or demo account if requested

#### 3. Metadata Rejected
- [ ] App functionality approved, but metadata issues found
- [ ] Common issues:
  - Screenshots don't match app functionality
  - Description contains prohibited content
  - Keywords violate guidelines
- [ ] Fix metadata issues
- [ ] Resubmit without new build

#### 4. Binary Rejected
- [ ] App functionality rejected, new build required
- [ ] Common rejection reasons:
  - App crashes on launch
  - Features don't work as described
  - Privacy policy missing or incomplete
  - IDFA usage not properly declared
  - Guideline violations (2.3, 4.3, etc.)
- [ ] Review rejection notice carefully
- [ ] Address all issues mentioned
- [ ] Test fixes thoroughly
- [ ] Upload new build
- [ ] Update version number if required
- [ ] Resubmit for review

**Timeline:** Varies (1-14 days depending on issues)

**Cost:** $0

**Tips for Avoiding Rejection:**
- Test thoroughly before submission (Task 2.4)
- Provide clear, accurate descriptions
- Include demo account if app requires login
- Follow [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Respond professionally and promptly to reviewer questions

---

### Task 2.12: Monitor Release (iOS)

**Objective:** Monitor app performance, reviews, and crashes after App Store publication.

**Steps:**

#### Step 1: Monitor App Analytics

- [ ] In App Store Connect, go to: Analytics
- [ ] Monitor key metrics:
  - **App Units:** Downloads
  - **App Views:** Store listing views
  - **App Sessions:** Usage statistics
  - **Active Devices:** Unique devices using app
  - **Crashes:** Crash rate and details
- [ ] Set up alerts:
  - Go to: Users and Access → Notifications
  - Enable email alerts for:
    - Version approved/rejected
    - Crash rate increases
    - Review rating changes

#### Step 2: Monitor Reviews

- [ ] Go to: App Store Connect → My Apps → Universal MFE Host → Ratings and Reviews
- [ ] Read user reviews
- [ ] Respond to reviews (especially negative ones)
- [ ] Identify common issues or feature requests
- [ ] Plan updates based on feedback

#### Step 3: Monitor Crashes

- [ ] Integrate Crashlytics or Sentry (optional):
  ```bash
  yarn workspace @universal/mobile-host add @react-native-firebase/crashlytics
  ```
- [ ] View crash reports in App Store Connect:
  - Go to: TestFlight → Crashes (for TestFlight builds)
  - Go to: App Analytics → Crashes (for App Store builds)
- [ ] Download crash logs and symbolicate:
  ```bash
  # Download from Xcode Organizer: Window → Organizer → Crashes
  ```
- [ ] Fix critical crashes in priority order
- [ ] Release updates with crash fixes

#### Step 4: Plan Updates

- [ ] Regularly release updates (monthly recommended):
  - Bug fixes
  - New features
  - Performance improvements
  - Security patches
- [ ] Follow same submission process (Tasks 2.8-2.10)
- [ ] Increment version number for each release:
  - Major version (1.0.0 → 2.0.0): Breaking changes or major new features
  - Minor version (1.0.0 → 1.1.0): New features, backwards-compatible
  - Patch version (1.0.0 → 1.0.1): Bug fixes only

**Timeline:** Ongoing

**Cost:** $0 (plus optional third-party services)

---

## Phase 3: Continuous Maintenance

**Objective:** Maintain apps on both platforms with regular updates.

### Task 3.1: Version Management

**Objective:** Establish consistent versioning across platforms.

**Versioning Strategy:**

Use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes or significant new functionality
- **MINOR:** New features, backwards-compatible
- **PATCH:** Bug fixes, no new features

**Synchronize Versions:**
- Both Android and iOS should use same version number
- Update version in:
  - Android: `android/app/build.gradle` → `versionName` and `versionCode`
  - iOS: Xcode → General → Version and Build
  - Package.json: `version` field (optional, for tracking)

**Example:**
```
Release 1.0.0 - Initial release
Release 1.0.1 - Bug fixes
Release 1.1.0 - New remote module added
Release 2.0.0 - Major architecture change
```

---

### Task 3.2: Release Checklist

**Objective:** Ensure consistent, high-quality releases.

**Before Each Release:**
- [ ] Run full test suite locally
- [ ] Test on physical devices (Android and iOS)
- [ ] Update version numbers in all files
- [ ] Update CHANGELOG.md with changes
- [ ] Write release notes (user-facing changes)
- [ ] Tag release in git: `git tag v1.1.0 && git push --tags`
- [ ] Wait for CI/CD to build and upload
- [ ] Test builds from CI/CD artifacts
- [ ] Submit for review on both platforms
- [ ] Monitor review status
- [ ] After approval, verify apps are live
- [ ] Announce release (social media, email, etc.)

---

### Task 3.3: Monitoring and Analytics

**Objective:** Track app performance and user behavior.

**Recommended Tools:**

| Tool | Purpose | Cost |
|------|---------|------|
| **Firebase Analytics** | User behavior, events, conversions | $0 (free tier) |
| **Firebase Crashlytics** | Crash reporting, stack traces | $0 (free tier) |
| **Google Play Console** | Android vitals, reviews, installs | $0 (included) |
| **App Store Connect** | iOS analytics, reviews, crashes | $0 (included) |
| **Sentry** (optional) | Error tracking, performance | $0-$26/month |

**Setup Firebase Analytics:**
- Already configured in Task 6.5 (Firebase App Distribution)
- Just need to add analytics SDK:
  ```bash
  yarn workspace @universal/mobile-host add @react-native-firebase/analytics
  ```

---

## Risk Assessment

### Android Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Rejected for policy violation** | Low | High | Follow Play Store policies closely, avoid prohibited content |
| **App not discoverable** | Medium | Medium | Optimize keywords, screenshots, description for ASO |
| **Crash on specific devices** | Medium | High | Use Pre-launch testing, monitor crash reports, fix quickly |
| **Users uninstall quickly** | Medium | Medium | Ensure good UX, respond to reviews, release updates regularly |
| **Account suspended** | Low | Critical | Follow all policies, respond to violations immediately |

### iOS Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Rejected during review** | Medium | High | Follow guidelines strictly, test thoroughly, provide demo account |
| **Certificate expires** | Medium | Medium | Set calendar reminder, renew certificates annually |
| **App crashes in review** | Low | High | Test on multiple devices/iOS versions before submission |
| **Developer account suspended** | Low | Critical | Follow all guidelines, respond to violations immediately |
| **Long review times** | Medium | Medium | Submit well before deadlines, respond quickly to reviewer questions |

---

## Timeline Summary

### Android Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Setup** | Account, privacy policy | 2-3 hours |
| **Assets** | Icons, screenshots, feature graphic | 2-4 hours |
| **Listing** | Metadata, descriptions, categories | 2-3 hours |
| **Upload & Review** | APK upload, pre-launch testing, submission | 2-3 hours |
| **Review Wait** | Google Play review process | 1-3 days |
| **Total** | | **10-15 hours + 1-3 days review** |

### iOS Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Account Setup** | Developer program enrollment | 1-14 days (mostly waiting) |
| **Certificates** | App ID, certificates, profiles | 1-2 hours |
| **Xcode Config** | Signing, build settings | 1-2 hours |
| **Testing** | Local builds, device testing | 2-3 hours |
| **CI/CD** | Export credentials, update workflow | 2-3 hours |
| **App Store Connect** | App creation, metadata | 1-2 hours |
| **Assets** | Icons, screenshots, videos | 2-4 hours |
| **Upload** | Build archive, upload to ASC | 1-2 hours |
| **Listing** | Complete metadata, privacy, export compliance | 2-3 hours |
| **Review** | Submit, respond to feedback | 1-2 hours |
| **Review Wait** | Apple review process | 1-7 days |
| **Total** | | **20-30 hours + 1-21 days (account + review)** |

---

## Cost Summary

### One-Time Costs

| Item | Cost | Platform | Notes |
|------|------|----------|-------|
| Google Play Console | $25 | Android | One-time, lifetime access |
| Apple Developer Program | $99 | iOS | Annual, must renew |
| **Total (First Year)** | **$124** | Both | |
| **Total (Subsequent Years)** | **$99** | iOS only | Android has no recurring costs |

### Ongoing Costs

| Item | Cost | Platform | Notes |
|------|------|----------|-------|
| Apple Developer Program Renewal | $99/year | iOS | Required to keep apps on App Store |
| Hosting (Privacy Policy) | $0 | Both | Use GitHub Pages, Vercel, or Firebase |
| Firebase (Analytics, Crashlytics) | $0 | Both | Free tier sufficient for most apps |
| Asset Design (DIY) | $0 | Both | Or $50-500 if outsourcing |

### Optional Costs

| Item | Cost | Notes |
|------|------|-------|
| Professional icon/asset design | $50-500 | Improves visual appeal, but DIY is fine |
| Expedited Apple review | $0 | Not available for purchase, granted in emergencies only |
| Firebase Paid Plan | $25/month | Only if exceeding free tier limits |
| Sentry Error Tracking | $0-26/month | Optional, Firebase Crashlytics is free |

---

## Success Criteria

### Android Success Criteria

- [ ] App published on Google Play Store
- [ ] No policy violations or warnings
- [ ] At least 10 installs in first week (for testing)
- [ ] Crash-free rate > 99%
- [ ] Average rating > 4.0 stars (after sufficient reviews)
- [ ] Pre-launch report passes with no critical issues

### iOS Success Criteria

- [ ] App approved and published on Apple App Store
- [ ] No guideline violations
- [ ] Successfully installed and runs on physical iOS devices
- [ ] At least 10 TestFlight testers successfully test app
- [ ] Crash-free rate > 99%
- [ ] Average rating > 4.0 stars (after sufficient reviews)
- [ ] CI/CD successfully uploads builds to App Store Connect

### Overall Success Criteria

- [ ] Apps available on both Google Play and App Store
- [ ] Version parity across platforms (same features, versions)
- [ ] Monitoring and analytics operational
- [ ] Update process established and documented
- [ ] Review response process established
- [ ] Zero-downtime remote bundle updates via Firebase Hosting

---

## Decision Points

### When to Publish?

**Factors to Consider:**
- Is the app feature-complete for v1.0?
- Have you tested thoroughly on physical devices?
- Do you have time to respond to reviews and issues?
- Are you prepared for ongoing maintenance?

**Recommendation:**
- Start with Firebase App Distribution (Android) for internal testing
- Gather feedback from 10-20 testers
- Fix critical issues
- Then proceed to public app stores

---

### Which Platform First?

**Publish Android First If:**
- Lower upfront cost ($25 vs $124)
- Faster review process (1-3 days vs 1-7 days)
- Easier to iterate based on feedback
- Already have signed release APKs from CI/CD

**Publish iOS First If:**
- Target audience primarily uses iOS
- Willing to invest $99 upfront
- Want stricter quality assurance from Apple review

**Recommendation:**
- Publish Android first (lower risk, faster iteration)
- Use feedback to improve before iOS submission
- Then publish iOS with refined version

---

### Internal Testing vs Public Release?

**Internal Testing (Recommended):**
- Firebase App Distribution (Android): Free, up to 100 testers
- TestFlight (iOS): Free, up to 100 internal testers (no review required)
- Benefits: Find bugs before public release, get feedback, iterate quickly

**Public Release:**
- Google Play Internal Testing: Up to 100 testers, uses Play Store
- App Store TestFlight External Testing: Up to 10,000 testers, requires review
- Benefits: Larger tester pool, real App Store/Play Store experience

**Recommendation:**
1. Start with Firebase App Distribution (Android) and TestFlight Internal (iOS)
2. Gather feedback from 10-20 testers
3. Fix critical issues
4. Move to public internal testing tracks
5. After 2-3 stable releases, move to production release

---

## Appendix

### Useful Resources

#### Android Resources
- [Google Play Console](https://play.google.com/console/)
- [Play Store Review Guidelines](https://play.google.com/about/developer-content-policy/)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)
- [Pre-launch Report](https://support.google.com/googleplay/android-developer/answer/7002270)

#### iOS Resources
- [Apple Developer Portal](https://developer.apple.com/account/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)

#### Asset Creation
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [App Icon Generator](https://appicon.co/)
- [Screenshot Creator](https://www.appstorescreenshot.com/)
- [Figma](https://figma.com) - Free design tool
- [Canva](https://canva.com) - Free graphic design

#### Privacy Policy
- [App Privacy Policy Generator](https://app-privacy-policy-generator.nisrulz.com/)
- [Firebase Privacy Policy](https://firebase.google.com/support/privacy)
- [Termly Privacy Policy Generator](https://termly.io/products/privacy-policy-generator/)

#### Monitoring & Analytics
- [Firebase Console](https://console.firebase.google.com/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)

---

## Conclusion

This comprehensive plan provides a clear roadmap from the current CI/CD state to having production apps published on both Google Play Store and Apple App Store.

**Key Takeaways:**
- **Android is easier and cheaper** - Publish first to iterate quickly
- **iOS requires more investment** - $99/year and more setup complexity
- **Testing is critical** - Use internal testing before public release
- **Maintenance is ongoing** - Plan for regular updates and monitoring
- **Total cost is reasonable** - $124 first year, $99 subsequent years

**Next Steps:**
1. Review this plan with stakeholders
2. Decide on timeline and priorities
3. Begin with Phase 1 (Android) tasks
4. Allocate 10-15 hours for Android setup and submission
5. Allocate 20-30 hours for iOS setup and submission
6. Establish ongoing maintenance schedule

Good luck with your app store launches!
