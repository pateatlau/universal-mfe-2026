# CI/CD Implementation Plan

**Status:** Complete - World-Class Enterprise CI/CD
**Last Updated:** 2026-02-03
**Target:** Enterprise-grade CI/CD following industry best practices

---

## Executive Summary

This document defines the CI/CD architecture for the Universal Microfrontend Platform. The system implements **shift-left testing** with **mandatory E2E gates** before merge, **staging environments** for validation, and **production promotion** via tags.

### Key Principles

1. **E2E Before Merge** - All platform E2E tests must pass before code reaches `main`
2. **Platform Parity** - Same quality gates for Web, Android, and iOS
3. **Staging → Production** - Two-stage deployment with explicit promotion
4. **Trunk-Based Development** - Single `main` branch, short-lived feature branches
5. **Zero Manual Steps** - Fully automated pipeline, no labels or manual triggers

### Core Invariant

> **`main` is always releasable.**

This invariant is enforced by mandatory E2E gates before merge. Any commit on `main` has passed full platform E2E and can be tagged for production release at any time.

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         WORLD-CLASS CI/CD PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   PR Created                    Merged to Main                   Tag Created    │
│       │                              │                               │          │
│       ▼                              ▼                               ▼          │
│   ┌─────────┐                  ┌───────────┐                  ┌───────────┐     │
│   │   CI    │                  │  Deploy   │                  │  Release  │     │
│   │ + E2E   │──── merge ────▶  │  Staging  │──── tag ──────▶  │Production │     │
│   │ (ALL)   │                  │           │                  │           │     │
│   └─────────┘                  └───────────┘                  └───────────┘     │
│       │                              │                               │          │
│       ▼                              ▼                               ▼          │
│   ┌─────────┐                  ┌───────────┐                  ┌───────────┐     │
│   │BLOCKING │                  │   AUTO    │                  │ BLOCKING  │     │
│   │All must │                  │Deploys to │                  │E2E re-run │     │
│   │  pass   │                  │ staging   │                  │then prod  │     │
│   └─────────┘                  └───────────┘                  └───────────┘     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Quality Gates

| Stage | Gate | Blocks |
|-------|------|--------|
| PR → main | CI (lint, typecheck, test, build) | Merge |
| PR → main | E2E Web (Playwright) | Merge |
| PR → main | E2E Android (Maestro) | Merge |
| PR → main | E2E iOS (Maestro) | Merge |
| Tag → Release | E2E All Platforms (re-verification) | Production deploy |

---

## Workflow Files

### New Structure

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **CI** | `ci.yml` | PR to main | Fast checks: lint, typecheck, unit tests, build verification |
| **E2E** | `e2e.yml` | PR to main | All platform E2E tests (Web + Android + iOS) |
| **Deploy Staging** | `deploy-staging.yml` | Push to main | Deploy all platforms to staging environments |
| **Release Production** | `release.yml` | Tag `v*` | Re-run E2E → Deploy to production → Create GitHub Release |
| **Security** | `codeql.yml` | PR to main + Weekly | CodeQL security analysis |

### Removed/Consolidated

| Old Workflow | Disposition |
|--------------|-------------|
| `e2e-web.yml` | Merged into `e2e.yml` |
| `deploy-web.yml` | Split into `deploy-staging.yml` (staging) + `release.yml` (production) |
| `deploy-mobile-remote-bundles.yml` | Merged into `deploy-staging.yml` |
| `release-mobile.yml` | Merged into `release.yml` |

---

## Detailed Workflow Specifications

### 1. CI Workflow (`ci.yml`)

**Trigger:** Pull request to `main`
**Purpose:** Fast feedback on code quality
**Duration:** ~5-7 minutes

```yaml
Jobs:
  check:
    - Checkout
    - Setup Node.js (from .nvmrc)
    - Install dependencies (yarn --frozen-lockfile)
    - Validate versions (no ^ or ~ in deps)
    - Build shared packages
    - Type checking (tsc --noEmit)
    - Linting (ESLint)
    - Unit tests (Jest with coverage)
    - Security audit (yarn audit, informational)

  build-web:
    needs: check
    - Build web-shell
    - Build web-remote-hello
    - Upload artifacts

  build-android:
    needs: check
    - Setup Java 17
    - Build mobile-remote for Android
    - Build Android APK (debug)
    - Upload artifact

  build-ios:
    needs: check
    - Setup Xcode 16.2
    - Build mobile-remote for iOS
    - Build iOS app for Simulator
    - Upload artifact
```

### 2. E2E Workflow (`e2e.yml`)

**Trigger:** Pull request to `main`
**Purpose:** Comprehensive E2E testing across all platforms
**Duration:** ~15-20 minutes (runs in parallel)

```yaml
Jobs:
  e2e-web:
    - Build web packages
    - Start web servers (shell + remote)
    - Run Playwright tests
    - Upload test report

  e2e-android:
    - Install Linux emulator dependencies
    - Build Android APK
    - Create placeholder google-services.json
    - Start Android emulator (API 29)
    - Install APK with retry logic
    - Run Maestro tests
    - Upload test report

  e2e-ios:
    - Build iOS app for Simulator
    - Create placeholder GoogleService-Info.plist
    - Boot iOS Simulator (iPhone 16)
    - Install app
    - Run Maestro tests
    - Upload test report
```

**Critical:** All three jobs must pass for PR to be mergeable.

### 3. Deploy Staging Workflow (`deploy-staging.yml`)

**Trigger:** Push to `main` (after PR merge)
**Purpose:** Automatic deployment to staging environments
**Duration:** ~10-12 minutes

```yaml
Jobs:
  deploy-web-staging:
    - Build web-remote-hello
    - Deploy to Vercel (staging-universal-mfe-2026-remote.vercel.app)
    - Build web-shell (with staging remote URL)
    - Deploy to Vercel (staging-universal-mfe-2026-shell.vercel.app)

  deploy-mobile-bundles-staging:
    - Build mobile-remote for Android (production mode)
    - Build mobile-remote for iOS (production mode)
    - Deploy to Firebase Hosting (staging channel)
```

**Staging URLs:**
- Web Shell: `https://staging-universal-mfe-2026-shell.vercel.app`
- Web Remote: `https://staging-universal-mfe-2026-remote.vercel.app`
- Mobile Bundles: `https://universal-mfe--staging-<id>.web.app` (Firebase auto-generates a unique channel URL on first deploy)

### 4. Release Workflow (`release.yml`)

**Trigger:** Tag push matching `v*`
**Purpose:** Production deployment with E2E re-verification
**Duration:** ~25-30 minutes

```yaml
Jobs:
  # Stage 1: Re-verify with E2E (fresh builds from tagged commit)
  e2e-web:
    - Same as e2e.yml (builds and tests from the tagged commit)

  e2e-android:
    - Same as e2e.yml (builds and tests from the tagged commit)

  e2e-ios:
    - Same as e2e.yml (builds and tests from the tagged commit)

  # Stage 2: Deploy to Production (only if ALL E2E pass)
  deploy-web-production:
    needs: [e2e-web, e2e-android, e2e-ios]
    - Promote staging to production on Vercel
    - Or rebuild and deploy to production domains

  deploy-android:
    needs: [e2e-web, e2e-android, e2e-ios]
    - Build release APK (signed)
    - Upload to Firebase App Distribution
    - Prepare for GitHub Release

  deploy-ios:
    needs: [e2e-web, e2e-android, e2e-ios]
    - Build release iOS app (Simulator)
    - Prepare for GitHub Release

  deploy-mobile-bundles-production:
    needs: [e2e-web, e2e-android, e2e-ios]
    - Promote staging bundles to live channel on Firebase

  # Stage 3: Create Release
  create-release:
    needs: [deploy-web-production, deploy-android, deploy-ios, deploy-mobile-bundles-production]
    - Create GitHub Release
    - Attach Android APK
    - Attach iOS Simulator zip
    - Generate release notes
```

---

## Environment Strategy

### Staging Environment

| Platform | URL/Location | Auto-Deploy |
|----------|--------------|-------------|
| Web Shell | `staging-universal-mfe-2026-shell.vercel.app` | On push to main |
| Web Remote | `staging-universal-mfe-2026-remote.vercel.app` | On push to main |
| Mobile Bundles | Firebase Hosting (`staging` channel) | On push to main |
| Mobile Apps | N/A (see note below) | N/A |

**Note on Mobile App Staging:** Mobile staging validates remote bundles only, not native app binaries. Native apps are built fresh for E2E tests. This covers runtime integration correctness but not distribution mechanics (signing, store constraints, metadata). This is an intentional scope limitation for this POC - full distribution testing would require Apple Developer account and Play Store access.

### Production Environment

| Platform | URL/Location | Deploy Trigger |
|----------|--------------|----------------|
| Web Shell | `universal-mfe-2026-shell.vercel.app` | Tag v* (after E2E) |
| Web Remote | `universal-mfe-2026-remote.vercel.app` | Tag v* (after E2E) |
| Mobile Bundles | Firebase Hosting (`live` channel) | Tag v* (after E2E) |
| Android APK | GitHub Releases + Firebase App Distribution | Tag v* (after E2E) |
| iOS Simulator | GitHub Releases | Tag v* (after E2E) |

### Environment Invariants

To ensure staging accurately represents production behavior, maintain these invariants:

| Invariant | Staging | Production |
|-----------|---------|------------|
| Node.js version | Same (from .nvmrc) | Same (from .nvmrc) |
| Build configuration | `NODE_ENV=production` | `NODE_ENV=production` |
| Bundle optimization | Minified, production mode | Minified, production mode |
| Feature flags | Same defaults | Same defaults |
| Firebase project | Same project, different channel | Same project, different channel |

**Drift Prevention:** Both environments use identical build commands. The only difference is the deployment target (staging domain/channel vs production domain/channel).

---

## Branch Protection Rules

Configure in GitHub: **Settings → Branches → Add rule for `main`**

### Required Settings

| Setting | Value |
|---------|-------|
| Branch name pattern | `main` |
| Require pull request before merging | ✅ Enabled |
| Required approvals | 0 (or 1+ for team) |
| Require status checks to pass | ✅ Enabled |
| Require branches to be up to date | ✅ Enabled |
| Do not allow bypassing | ✅ Enabled |

### Required Status Checks

All of these must pass before merge is allowed:

```text
CI / Lint, Typecheck, Test (ubuntu-latest)
E2E / E2E Web Tests (ubuntu-latest)
E2E / E2E Android Tests (ubuntu-latest)
E2E / E2E iOS Tests (macos-15)
```

---

## Developer Workflow

### Daily Development

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/my-feature

# 2. Make changes, commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR
git push -u origin feature/my-feature
# Create PR via GitHub UI or CLI

# 4. Wait for CI + E2E to pass (automated, ~20 min)
# - CI runs first (~5 min)
# - E2E runs in parallel (~15-20 min)

# 5. Get review and merge
# PR can only merge when ALL checks pass

# 6. Staging auto-deploys (no action needed)
# Verify at staging URLs if desired
```

### Creating a Release

```bash
# 1. Ensure main is stable (all staging tests passing)
git checkout main
git pull origin main

# 2. Create and push tag
git tag v1.2.3
git push origin v1.2.3

# 3. Release workflow runs automatically:
# - E2E re-runs (~20 min)
# - If pass: deploys to production
# - Creates GitHub Release with artifacts

# 4. Monitor at: GitHub → Actions → Release workflow
```

### Hotfix Process

```bash
# Same as regular development - trunk-based
git checkout main
git checkout -b hotfix/critical-bug
# Make fix
git push -u origin hotfix/critical-bug
# Create PR, wait for CI+E2E, merge
# Then tag for immediate release
git checkout main
git pull
git tag v1.2.4
git push origin v1.2.4
```

---

## Cost Estimation

### GitHub Actions Minutes

| Runner | Cost | Free Tier | Our Usage (Est.) |
|--------|------|-----------|------------------|
| Ubuntu | 1x | 2,000 min/month | ~800 min |
| macOS | 10x | 200 min/month | ~150 min (= 1,500 min equivalent) |

**Monthly Estimate:** Within free tier for moderate PR volume (10-20 PRs/month)

### External Services

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Hobby | $0 |
| Firebase Hosting | Spark | $0 |
| Firebase App Distribution | Free | $0 |
| **Total** | | **$0/month** |

---

## Comparison: Before vs After

| Aspect | Before (Broken) | After (World-Class) |
|--------|-----------------|---------------------|
| Web E2E timing | After merge (manual label) | Before merge (required) |
| Mobile E2E timing | Only on release tag | Before merge (required) |
| E2E as merge blocker | No | Yes |
| Staging environment | None | Full staging |
| Platform parity | Different gates per platform | Same gates all platforms |
| Manual steps | Label required for E2E | Zero manual steps |
| Production safety | Broken code could deploy | E2E re-verified on release |

---

## Implementation Checklist

### Prerequisites (Manual)

- [x] Vercel: Add staging domain for web-shell
- [x] Vercel: Add staging domain for web-remote
- [x] Firebase: Staging channel (auto-created on first deploy)
- [x] GitHub: Merge current `fix/mobile-deploy-flow` PR

### Implementation (Automated by Claude)

- [x] Create `e2e.yml` (consolidated E2E workflow)
- [x] Create `deploy-staging.yml` (staging deployments)
- [x] Create `release.yml` (production release)
- [x] Update `ci.yml` (updated PR summary, removed label references)
- [x] Delete `e2e-web.yml`
- [x] Delete `deploy-web.yml`
- [x] Delete `deploy-mobile-remote-bundles.yml`
- [x] Delete `release-mobile.yml`
- [x] Delete `docs/GIT-FLOW-WORKFLOW.md`
- [x] Update `CLAUDE.md` and `.cursorrules`
- [x] Update this document

### Post-Implementation (Manual)

- [ ] Configure branch protection rules
- [ ] Add required status checks
- [ ] Test full workflow with a PR
- [ ] Test release workflow with a tag

---

## Success Criteria

| Metric | Target | Verification |
|--------|--------|--------------|
| E2E blocks merge | All 3 platforms required | Cannot merge without green checks |
| Staging auto-deploys | On every push to main | Verify staging URLs update |
| Production requires tag | Only deploys on v* tag | Verify prod URLs don't change on main push |
| Release E2E re-runs | E2E passes before prod deploy | Check release workflow logs |
| Zero manual steps | No labels, no manual triggers | Full automation |
| CI time | < 25 min total | Measure in GitHub Actions |

---

## Appendix: Firebase Hosting Channels

Firebase Hosting channels allow multiple versions to be deployed simultaneously:

```bash
# Deploy to staging channel
firebase deploy --only hosting --channel staging

# Deploy to production (live channel)
firebase deploy --only hosting --channel live

# Or just (live is default)
firebase deploy --only hosting
```

Channel URLs:
- Staging: `https://universal-mfe--staging-{random}.web.app`
- Production: `https://universal-mfe.web.app`

---

## Appendix: Vercel Deployment Aliases

Vercel allows multiple domains per project:

```bash
# Deploy to staging alias
vercel --prod --alias staging-universal-mfe-2026-shell.vercel.app

# Deploy to production alias
vercel --prod --alias universal-mfe-2026-shell.vercel.app
```

Both point to the same project, different deployments.

---

## Architectural Trade-offs

This section documents intentional design decisions and their implications.

### Trade-off 1: Full E2E on Every PR (All Platforms)

**Decision:** Every PR runs Web, Android, and iOS E2E tests, regardless of which files changed.

**Rationale:**
- Maximizes correctness and cross-platform safety
- Eliminates "forgot to test mobile" scenarios
- Simpler mental model - no conditional logic

**Cost:**
- Higher CI minutes usage
- Longer feedback loop (~20 min vs ~5 min for CI-only)
- May create throughput bottleneck at high PR volume (>20/month)

**Mitigation:** This is acceptable for current scale. See "Future Enhancements" for change-aware optimization.

### Trade-off 2: Rebuild vs Promote Artifacts

**Decision:** Production artifacts are rebuilt from source at release time, not promoted from staging.

**Current behavior:**
- PR: Build artifacts for E2E testing
- Staging: Rebuild and deploy
- Production: Rebuild and deploy

**Rationale:**
- Simpler implementation
- No artifact storage/versioning complexity
- Acceptable for POC scale

**Implication:**
- Production artifacts are not bit-for-bit identical to tested artifacts
- Source is identical (same git tag), but build is separate

**Mitigation:** The double E2E (PR + release) compensates by re-verifying before production deploy.

### Trade-off 3: Double E2E Execution

**Decision:** E2E runs both before merge (PR gate) and before production (release gate).

**Rationale:**
- PR E2E: Ensures `main` stays releasable
- Release E2E: Final verification before production
- Catches any issues from staging soak time

**Cost:**
- Release takes ~25-30 min instead of ~10 min
- Higher CI minutes on release

**Justification:** Production safety is worth the extra time and cost.

---

## Known Limitations

### Mobile App Distribution Testing

- Simulator builds only (no physical device testing in CI)
- No TestFlight/Play Store integration testing
- Signing and store metadata validation not covered

**Why:** Requires Apple Developer account ($99/year) and Play Store access. Out of scope for POC.

### Security Scanning Depth

Current controls:
- CodeQL for static analysis
- `yarn audit` for dependency vulnerabilities (informational)

Not implemented:
- Dependency change risk analysis
- SBOM (Software Bill of Materials) generation
- Container scanning (not applicable - no containers)

**Why:** Sufficient for POC. Enterprise deployments should enhance.

---

## Future Enhancements

These optimizations are documented for future implementation as the project scales.

### Enhancement 1: Change-Aware E2E Scoping

Reduce CI load by running only relevant E2E based on changed files:

| Change Scope | Required E2E |
|--------------|--------------|
| `packages/shared-*/**` | Web + Android + iOS (all) |
| `packages/web-*/**` only | Web + 1 mobile sanity |
| `packages/mobile-*/**` only | Android + iOS |
| `docs/**`, `scripts/**` | CI only (skip E2E) |

**When to implement:** When PR volume exceeds ~20/month or CI costs become significant.

### Enhancement 2: Artifact Promotion Pipeline

Replace rebuild-on-release with promote-tested-artifacts:

1. PR: Build artifacts → Store with commit SHA
2. E2E: Test stored artifacts
3. Staging: Deploy stored artifacts
4. Production: Promote same artifacts (no rebuild)

**Benefits:**
- "What we tested is what shipped" guarantee
- Faster releases
- Better incident forensics

**When to implement:** When release frequency increases or audit requirements demand it.

### Enhancement 3: Release Candidate Tags

Add intermediate verification stage:

- `rc/v1.2.3` tag → Full E2E, deploy to staging
- `v1.2.3` tag → Deploy to production only (E2E already passed)

**Benefits:**
- Faster production deployments
- Explicit "release candidate" phase for stakeholder review

**When to implement:** When release approval process requires stakeholder sign-off.

### Enhancement 4: Enhanced Security Scanning

- Dependency diff analysis on PRs
- SBOM generation for releases
- Secret rotation reminders
- Supply chain attestation (SLSA)

**When to implement:** When preparing for enterprise/regulated deployments.

---

## Document History

| Date | Change | Author |
|------|--------|--------|
| 2026-02-01 | Add architectural trade-offs, limitations, future enhancements from expert review | Claude + User |
| 2026-02-01 | Complete restructure for world-class CI/CD | Claude + User |
| 2026-01-30 | Phase 8 - Optimized workflow | Previous |
| 2026-01-08 | Initial CI/CD implementation | Previous |
