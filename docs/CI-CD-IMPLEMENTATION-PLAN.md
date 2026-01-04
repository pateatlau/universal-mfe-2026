# CI/CD Implementation Plan

**Status:** Draft
**Last Updated:** 2026-01-04
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

- [ ] **GitHub Repository Access**
  - [ ] Repository is hosted on GitHub (confirmed)
  - [ ] GitHub Actions enabled for the repository
  - [ ] Sufficient Actions minutes (free tier: 2,000 mins/month for public repos)

- [ ] **Testing Infrastructure Setup**
  - [ ] Jest configuration for unit tests
  - [x] ESLint configuration for linting ✅
  - [x] Prettier configuration for formatting ✅
  - [x] TypeScript strict mode already enabled ✅

- [x] **Root Package.json Scripts** ✅
  - [x] Add `build:shared` script
  - [x] Add `lint` script
  - [x] Add `test` script
  - [x] Add `typecheck` script

### CD Pre-requisites

- [ ] **Web Deployment (Vercel)**
  - [ ] Create Vercel account (free tier)
  - [ ] Link GitHub repository to Vercel
  - [ ] Add VERCEL_TOKEN to GitHub secrets

- [ ] **Android Deployment (GitHub Releases)**
  - [ ] Debug keystore available (default Android debug keystore)
  - [ ] No external accounts required

- [ ] **iOS Deployment (Simulator Build)**
  - [ ] macOS runner available (GitHub Actions provides this)
  - [ ] Xcode 16.2 available on runner
  - [ ] No signing certificates required (simulator-only)

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
- eslint-plugin-react-hooks@5.2.0
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

### Task 1.4: Jest Configuration
- [ ] Create `jest.config.js` in root
  - [ ] Configure TypeScript transform
  - [ ] Setup workspace projects
  - [ ] Configure coverage thresholds
- [ ] Add Jest dependencies to root package.json
- [ ] Create sample tests for shared-utils
- [ ] Create sample tests for shared-hello-ui
- [ ] Verify tests pass locally

### Task 1.5: TypeScript Validation Script
- [ ] Add `typecheck` script that runs `tsc --noEmit`
- [ ] Verify all packages pass type checking

---

## Phase 2: GitHub Actions CI

### Task 2.1: Basic CI Workflow
- [ ] Create `.github/workflows/ci.yml`
  - [ ] Trigger on push to main and pull requests
  - [ ] Setup Node.js 24.x with caching
  - [ ] Install dependencies with Yarn
  - [ ] Run type checking
  - [ ] Run linting
  - [ ] Run unit tests
  - [ ] Build shared packages

### Task 2.2: Web Build Job
- [ ] Add web build job to CI workflow
  - [ ] Build web-shell
  - [ ] Build web-remote-hello
  - [ ] Upload build artifacts
  - [ ] Cache node_modules and build outputs

### Task 2.3: Android Build Job
- [ ] Add Android build job to CI workflow
  - [ ] Setup Java 17 (required for Gradle 8.14.1)
  - [ ] Setup Android SDK
  - [ ] Run symlink setup
  - [ ] Build mobile-remote-hello for Android
  - [ ] Build Android APK (debug)
  - [ ] Upload APK as artifact
  - [ ] Cache Gradle dependencies

### Task 2.4: iOS Build Job
- [ ] Add iOS build job to CI workflow
  - [ ] Use macOS runner
  - [ ] Setup Xcode 16.2
  - [ ] Run pod install (Pods are cached in repo)
  - [ ] Build mobile-remote-hello for iOS
  - [ ] Build iOS app for Simulator (no signing required)
  - [ ] Upload .app bundle as artifact
  - [ ] Consider manual-trigger only to control macOS runner costs

---

## Phase 3: Deployment (CD)

### Task 3.1: Web Deployment (Vercel)
- [ ] Create Vercel project for web-shell
- [ ] Create Vercel project for web-remote-hello
- [ ] Configure build settings in Vercel dashboard
  - [ ] Build command: `yarn build`
  - [ ] Output directory: `dist`
  - [ ] Install command: `yarn install`
- [ ] Add VERCEL_TOKEN to GitHub secrets
- [ ] Add VERCEL_ORG_ID to GitHub secrets
- [ ] Add VERCEL_PROJECT_ID for each project
- [ ] Create `.github/workflows/deploy-web.yml`
  - [ ] Trigger on push to main
  - [ ] Deploy web-remote-hello first (remote before host)
  - [ ] Deploy web-shell after remote is deployed
- [ ] Configure preview deployments for PRs

### Task 3.2: Android Deployment (GitHub Releases)
- [ ] Create `.github/workflows/deploy-android.yml`
  - [ ] Trigger on tag push (v*)
  - [ ] Build shared packages
  - [ ] Build mobile-remote-hello for Android
  - [ ] Build Android APK (debug for POC)
  - [ ] Create GitHub Release
  - [ ] Upload APK as release asset
  - [ ] Generate release notes from commits

### Task 3.3: iOS Deployment (Simulator Build)
- [ ] Create `.github/workflows/deploy-ios.yml`
  - [ ] Trigger on tag push (v*) or manual dispatch
  - [ ] Use macOS runner
  - [ ] Build shared packages
  - [ ] Build mobile-remote-hello for iOS
  - [ ] Build iOS app for Simulator
  - [ ] Zip .app bundle
  - [ ] Upload to GitHub Release
  - [ ] NOTE: Simulator builds cannot run on real devices

---

## Phase 4: Workflow Enhancements

### Task 4.1: Caching Strategy
- [ ] Cache node_modules with yarn.lock hash
- [ ] Cache Gradle dependencies (~/.gradle/caches)
- [ ] Cache CocoaPods (already in repo, but cache derived data)
- [ ] Cache Rspack build outputs
- [ ] Measure and optimize build times

### Task 4.2: PR Checks
- [ ] Add required status checks for PRs
- [ ] Configure branch protection rules on main
- [ ] Add PR comment with build status/artifact links

### Task 4.3: Version Management
- [ ] Add version validation check
  - [ ] Verify no `^` or `~` in dependencies
  - [ ] Verify Node.js version matches .nvmrc
  - [ ] Verify Yarn version matches packageManager

### Task 4.4: Security Scanning (Optional)
- [ ] Add dependency vulnerability scanning (npm audit)
- [ ] Add CodeQL analysis for JavaScript/TypeScript
- [ ] Enable GitHub secret scanning alerts

---

## Workflow Files Summary

| File | Purpose | Trigger |
|------|---------|---------|
| `.github/workflows/ci.yml` | Build, lint, test | Push, PR |
| `.github/workflows/deploy-web.yml` | Deploy to Vercel | Push to main |
| `.github/workflows/deploy-android.yml` | Build APK & release | Tag v* |
| `.github/workflows/deploy-ios.yml` | Build Simulator .app & release | Tag v* / Manual |

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

## Implementation Order

### Week 1: Foundation
1. Root package.json scripts
2. ESLint setup
3. Jest setup
4. Basic CI workflow (lint + typecheck + test)

### Week 2: Build Automation
1. Web build job
2. Android build job
3. iOS build job (simulator)
4. Artifact uploads

### Week 3: Deployment
1. Web deployment (Vercel)
2. Android deployment (GitHub Releases)
3. iOS deployment (GitHub Releases - simulator)

### Week 4: Polish
1. Caching optimization
2. PR checks and branch protection
3. Documentation updates

---

## Success Criteria

- [ ] All PRs automatically run lint, typecheck, and tests
- [ ] Main branch automatically deploys web apps to Vercel
- [ ] Tagged releases automatically build and publish Android APK
- [ ] Tagged releases automatically build and publish iOS Simulator app
- [ ] Build times under 10 minutes for full CI
- [ ] Zero cost for CI/CD ($0/month)

---

## Notes

### iOS Simulator Limitations
The iOS deployment produces a Simulator-only build (.app bundle):
- Can only run in Xcode iOS Simulator
- Cannot be installed on real iOS devices
- No code signing required
- Useful for developers to test without Xcode setup

To test on real devices in the future, you would need:
- Apple Developer account ($99/year)
- Code signing certificates
- Provisioning profiles
- TestFlight distribution

### React Native Specific Considerations
- Symlinks must be setup after yarn install (`postinstall` hook handles this)
- Android SDK and Java 17 required for Android builds
- Hermes bytecode compilation is automatic
- Platform-specific output directories (`dist/android/`, `dist/ios/`)

### Module Federation Deployment Order
- Remote modules must be deployed before or with host
- Web: Deploy web-remote-hello → web-shell
- Mobile: Remote bundles are loaded at runtime from configured URLs

### Future Production Considerations
When moving to production:
- Android: Create release keystore, configure Google Play upload
- iOS: Setup Apple Developer account, code signing, TestFlight
- Web: Configure custom domain, CDN caching headers
