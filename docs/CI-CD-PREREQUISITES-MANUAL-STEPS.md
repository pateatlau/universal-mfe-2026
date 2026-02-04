# CI/CD Prerequisites - Manual Steps

**Purpose:** Complete these steps before the CI/CD restructure implementation.

**Estimated Time:** 15-20 minutes

---

## 1. Vercel Console (5 minutes)

### 1.1 Add Staging Domain for Web Shell

1. Go to: https://vercel.com → Select `universal-mfe-2026-shell` project
2. Navigate to: **Settings → Domains**
3. Click: **Add**
4. Enter: `staging-universal-mfe-2026-shell.vercel.app`
5. Click: **Add**

### 1.2 Add Staging Domain for Web Remote

1. Go to: https://vercel.com → Select `universal-mfe-2026-remote` project
2. Navigate to: **Settings → Domains**
3. Click: **Add**
4. Enter: `staging-universal-mfe-2026-remote.vercel.app`
5. Click: **Add**

### 1.3 Record Production URLs (for reference)

Document these (should already exist):
- Production Shell: `universal-mfe-2026-shell.vercel.app`
- Production Remote: `universal-mfe-2026-remote.vercel.app`

---

## 2. Firebase Console (3 minutes)

### 2.1 Create Staging Channel for Hosting

1. Go to: https://console.firebase.google.com → Select `universal-mfe` project
2. Navigate to: **Hosting** (left sidebar)
3. Click: **Add another site** or look for **Channels** section
4. If using channels:
   - Click on your site → **Releases history** → **Create channel**
   - Channel name: `staging`
   - Click: **Create**

**Note:** If you don't see a "Create channel" option, channels are created automatically when you deploy with `--channel staging`. No manual setup needed.

---

## 3. GitHub Repository Settings (10 minutes)

### 3.1 Merge Current PR First

1. Go to: https://github.com/pateatlau/universal-mfe-2026/pulls
2. Find PR from branch `fix/mobile-deploy-flow`
3. Wait for CI to pass (or merge if it's passing)
4. Merge the PR

### 3.2 Configure Branch Protection Rules

**After the new workflows are created**, configure these rules:

1. Go to: Repository → **Settings** → **Branches**
2. Click: **Add branch protection rule**
3. Branch name pattern: `main`

**Enable these settings:**

| Setting | Value |
|---------|-------|
| Require a pull request before merging | ✅ |
| Require approvals | 1 (optional, set to 0 for solo dev) |
| Require status checks to pass before merging | ✅ |
| Require branches to be up to date before merging | ✅ |
| Do not allow bypassing the above settings | ✅ |

**Required Status Checks (add these after workflows exist):**

```text
CI / Lint, Typecheck, Test (ubuntu-latest)
E2E / E2E Web Tests (ubuntu-latest)
E2E / E2E Android Tests (ubuntu-latest)
E2E / E2E iOS Tests (macos-15)
```

**Note:** You can only add status checks AFTER the workflows have run at least once. I'll remind you to do this after implementation.

---

## 4. Local Verification (2 minutes)

Before CI restructure, verify Maestro tests work locally:

```bash
# Android (in one terminal)
cd packages/mobile-host
yarn android

# In another terminal - run Maestro
maestro test .maestro/ --exclude-tags=remote
```

If tests pass locally, mobile E2E is ready for CI.

---

## Checklist

Complete and check off each item:

- [ ] 1.1 Vercel: Added staging domain for web-shell
- [ ] 1.2 Vercel: Added staging domain for web-remote
- [ ] 2.1 Firebase: Created staging channel (or verified it auto-creates)
- [ ] 3.1 GitHub: Merged `fix/mobile-deploy-flow` PR
- [ ] 3.2 GitHub: Branch protection rules ready (will configure after workflows exist)
- [ ] 4.0 Local: Verified Maestro tests pass locally

---

## After Prerequisites Complete

Reply with: **"Prerequisites complete, proceed with implementation"**

I will then:
1. Create new workflow files
2. Delete old/conflicting workflows
3. Update documentation
4. Create PR for your review
