# Git Flow Workflow

This document describes the Git Flow branching strategy and development workflow for the Universal MFE project.

## Table of Contents

1. [Overview](#overview)
2. [Branch Strategy](#branch-strategy)
3. [Branch Naming Conventions](#branch-naming-conventions)
4. [Development Workflow](#development-workflow)
5. [Pull Request Process](#pull-request-process)
6. [Release Process](#release-process)
7. [Hotfix Process](#hotfix-process)
8. [Branch Protection Rules](#branch-protection-rules)

---

## Overview

This project follows **Git Flow**, a branching model designed for managing releases and parallel development. The workflow ensures:

- **Stable main branch** - Always production-ready
- **Organized development** - Feature branches isolate work
- **Controlled releases** - Tagged versions for deployment
- **Emergency fixes** - Hotfix branches for critical issues

**Flow Diagram**:
```text
feature/my-feature ──┐
                     ├──> develop ──> main ──> v1.0.0 (tag)
bugfix/my-fix    ────┘                  │
                                        └──> hotfix/critical ──> v1.0.1 (tag)
```

---

## Branch Strategy

### Permanent Branches

| Branch | Purpose | Protected | Auto-deploy |
|--------|---------|-----------|-------------|
| `main` | Production-ready code | ✅ Yes | ✅ Yes (on push) |
| `develop` | Integration branch for features | ✅ Yes | ❌ No |

**Rules**:
- **Never commit directly to `main` or `develop`**
- All changes must go through pull requests
- Only fast-forward merges allowed on `main`

### Temporary Branches

| Branch Type | Purpose | Base Branch | Merge Into | Delete After Merge |
|-------------|---------|-------------|------------|--------------------|
| `feature/*` | New features | `develop` | `develop` | ✅ Yes |
| `bugfix/*` | Bug fixes | `develop` | `develop` | ✅ Yes |
| `hotfix/*` | Critical production fixes | `main` | `main` + `develop` | ✅ Yes |
| `release/*` | Release preparation | `develop` | `main` + `develop` | ✅ Yes |

---

## Branch Naming Conventions

### Feature Branches
**Pattern**: `feature/<description>`

**Examples**:
- ✅ `feature/add-user-authentication`
- ✅ `feature/updated-full-android-deploy-flow`
- ✅ `feature/ios-release-build-support`
- ❌ `feature/fix` (too vague)
- ❌ `add-authentication` (missing prefix)

**Rules**:
- Use lowercase with hyphens
- Be descriptive but concise
- Use present tense verbs (add, update, implement)

### Bugfix Branches
**Pattern**: `bugfix/<description>` or `bugfix/<issue-number>-<description>`

**Examples**:
- ✅ `bugfix/console-initialization-crash`
- ✅ `bugfix/123-chunk-loading-failure`
- ✅ `bugfix/dns-resolution-emulator`

### Hotfix Branches
**Pattern**: `hotfix/<version>` or `hotfix/<critical-issue>`

**Examples**:
- ✅ `hotfix/1.0.1`
- ✅ `hotfix/production-crash-on-android`
- ✅ `hotfix/security-vulnerability-cve-2025-xxxxx`

**Rules**:
- Only for critical production issues
- Merged directly to `main` and then back to `develop`

### Release Branches
**Pattern**: `release/<version>`

**Examples**:
- ✅ `release/1.0.0`
- ✅ `release/1.1.0`
- ✅ `release/2.0.0-beta.1`

---

## Development Workflow

### Step 1: Create Feature Branch

```bash
# Ensure you're on develop and up-to-date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-new-feature

# Verify branch
git branch --show-current
# Output: feature/my-new-feature
```

### Step 2: Develop and Commit

```bash
# Make changes to code
# Test thoroughly

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add user authentication with JWT

- Implement login/logout endpoints
- Add JWT token generation and validation
- Update mobile-host to use auth context
- Add tests for authentication flow

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to remote
git push origin feature/my-new-feature
```

**Commit Message Format**:
```text
<type>: <short summary>

<detailed description>

<footer>
```

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

### Step 3: Keep Branch Updated

```bash
# Regularly sync with develop to avoid conflicts
git checkout develop
git pull origin develop
git checkout feature/my-new-feature
git merge develop

# Or use rebase (if you prefer linear history)
git rebase develop
```

### Step 4: Create Pull Request

Once feature is complete and tested:

1. Push final changes
2. Go to GitHub repository
3. Click "Pull requests" → "New pull request"
4. Base: `develop` ← Compare: `feature/my-new-feature`
5. Fill in PR template (see below)
6. Request reviews from team members

---

## Pull Request Process

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Feature (new functionality)
- [ ] Bug fix (fixes an issue)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Breaking change (requires major version bump)

## Testing
- [ ] Unit tests pass (`yarn test`)
- [ ] Type checking passes (`yarn typecheck`)
- [ ] Lint passes (`yarn lint`)
- [ ] Architecture rules pass (`yarn lint:architecture`)
- [ ] Tested on web (localhost:9001)
- [ ] Tested on Android emulator
- [ ] Tested on iOS simulator
- [ ] Tested on physical device (if applicable)

## Related Issues
Closes #123
Related to #456

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project conventions
- [ ] Documentation updated (if needed)
- [ ] CLAUDE.md and .cursorrules synced (if changed)
- [ ] No breaking changes (or documented in CHANGELOG)
```

### Review Requirements

**Required Checks** (automated via GitHub Actions):
- ✅ `build` - All packages build successfully
- ✅ `typecheck` - TypeScript type checking passes
- ✅ `lint` - ESLint passes
- ✅ `test` - All tests pass
- ✅ `architecture-lint` - Architecture rules enforced

**Manual Review**:
- At least 1 approving review required
- Code quality assessment
- Architecture compliance
- Documentation completeness

### Merge Strategy

**To `develop`**: Squash and merge (clean history)
```bash
# GitHub UI: "Squash and merge"
# This creates a single commit with all changes
```

**To `main`**: Merge commit (preserve history)
```bash
# GitHub UI: "Create a merge commit"
# This preserves the development history
```

---

## Release Process

### When to Create a Release

Create releases when:
- Major feature set is complete
- Sprint/iteration ends
- Production deployment is needed
- Hotfix requires new version

### Release Workflow

#### 1. Create Release Branch

```bash
# From develop
git checkout develop
git pull origin develop

# Create release branch
git checkout -b release/1.0.0
git push origin release/1.0.0
```

#### 2. Prepare Release

```bash
# Update version in package.json files
# Update CHANGELOG.md
# Update version references in documentation
# Run final tests

# Commit version bump
git add .
git commit -m "chore: bump version to 1.0.0

- Update all package.json versions
- Update CHANGELOG.md with release notes
- Update documentation references

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin release/1.0.0
```

#### 3. Merge to Main

```bash
# Create PR: release/1.0.0 → main
# Wait for CI to pass
# Get approval
# Merge (create merge commit, not squash)
```

#### 4. Tag Release

```bash
# After merge to main
git checkout main
git pull origin main

# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0

Features:
- Add user authentication
- Implement dark mode
- Add Firebase App Distribution

Bug Fixes:
- Fix console initialization crash
- Fix chunk loading in production
- Fix DNS resolution on emulator

Breaking Changes:
- None

Migration Guide:
- None required
"

# Push tag
git push origin v1.0.0
```

**Tag triggers**:
- ✅ Automated deployment to production
- ✅ Firebase App Distribution build
- ✅ GitHub Release creation
- ✅ Version documentation

#### 5. Merge Back to Develop

```bash
# Merge main back to develop to sync version changes
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

#### 6. Delete Release Branch

```bash
git branch -d release/1.0.0
git push origin --delete release/1.0.0
```

---

## Hotfix Process

**Use Case**: Critical production bug that can't wait for next release cycle.

### Hotfix Workflow

#### 1. Create Hotfix Branch from Main

```bash
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/1.0.1
git push origin hotfix/1.0.1
```

#### 2. Fix the Issue

```bash
# Make minimal changes to fix the critical issue
# Test thoroughly

git add .
git commit -m "fix: critical security vulnerability in authentication

- Patch CVE-2025-XXXXX
- Add input validation to auth endpoints
- Update security tests

BREAKING: None
SECURITY: Critical

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin hotfix/1.0.1
```

#### 3. Merge to Main

```bash
# Create PR: hotfix/1.0.1 → main
# Fast-track review (critical fix)
# Merge to main
```

#### 4. Tag Hotfix Version

```bash
git checkout main
git pull origin main

git tag -a v1.0.1 -m "Hotfix v1.0.1

CRITICAL: Security vulnerability patch

Fixes:
- CVE-2025-XXXXX: Authentication bypass vulnerability
- Add input validation to prevent injection attacks

Deployment:
- Deploy immediately to production
- Notify all users to update
"

git push origin v1.0.1
```

#### 5. Merge to Develop

```bash
# Merge hotfix back to develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

#### 6. Delete Hotfix Branch

```bash
git branch -d hotfix/1.0.1
git push origin --delete hotfix/1.0.1
```

---

## Branch Protection Rules

### Main Branch

**Required Status Checks**:
- ✅ `build` must pass
- ✅ `typecheck` must pass
- ✅ `lint` must pass
- ✅ `test` must pass
- ✅ `architecture-lint` must pass

**Merge Requirements**:
- ✅ At least 1 approving review
- ✅ All conversations resolved
- ✅ Branch must be up to date with `main`

**Restrictions**:
- ❌ No direct pushes
- ❌ No force pushes
- ❌ Cannot delete branch

### Develop Branch

**Required Status Checks**:
- ✅ `build` must pass
- ✅ `typecheck` must pass
- ✅ `lint` must pass
- ✅ `test` must pass

**Merge Requirements**:
- ✅ At least 1 approving review
- ✅ All conversations resolved

**Restrictions**:
- ❌ No direct pushes
- ❌ No force pushes
- ❌ Cannot delete branch

---

## Common Scenarios

### Scenario 1: Feature Branch Has Conflicts with Develop

```bash
# Option 1: Merge develop into feature branch
git checkout feature/my-feature
git merge develop
# Resolve conflicts
git add .
git commit -m "chore: merge develop into feature branch"
git push origin feature/my-feature

# Option 2: Rebase feature branch on develop (cleaner history)
git checkout feature/my-feature
git rebase develop
# Resolve conflicts
git rebase --continue
git push origin feature/my-feature --force-with-lease
```

### Scenario 2: Need to Undo Last Commit (Not Pushed)

```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and discard changes
git reset --hard HEAD~1
```

### Scenario 3: Need to Undo Pushed Commit

```bash
# Create revert commit (safe, preserves history)
git revert <commit-hash>
git push origin feature/my-feature
```

### Scenario 4: Feature Branch Becoming Stale

```bash
# If feature branch hasn't been worked on for > 2 weeks
# And develop has moved forward significantly

# Option 1: Rebase on develop
git checkout feature/my-feature
git rebase develop
git push origin feature/my-feature --force-with-lease

# Option 2: Close PR and start fresh
git checkout develop
git pull origin develop
git checkout -b feature/my-feature-v2
# Cherry-pick relevant commits or restart
```

### Scenario 5: Emergency Production Fix

```bash
# Skip develop, go straight to main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# Make fix
git add .
git commit -m "fix: critical production crash"
git push origin hotfix/critical-fix

# Create PR to main (fast-track)
# After merge, tag immediately
git tag -a v1.0.1 -m "Hotfix: Critical crash fix"
git push origin v1.0.1

# Merge back to develop
git checkout develop
git merge main
git push origin develop
```

---

## Version Numbering

Follow **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

### MAJOR (1.0.0 → 2.0.0)
- Breaking changes
- API incompatibilities
- Major architecture changes

**Example**: Migrate from React Native 0.74 to 0.80

### MINOR (1.0.0 → 1.1.0)
- New features (backward compatible)
- Significant enhancements
- New remote MFE added

**Example**: Add user authentication feature

### PATCH (1.0.0 → 1.0.1)
- Bug fixes
- Security patches
- Performance improvements

**Example**: Fix console initialization crash

### Pre-release Versions
- `1.0.0-alpha.1` - Internal testing
- `1.0.0-beta.1` - External testing
- `1.0.0-rc.1` - Release candidate

---

## CI/CD Integration

### Automated on Push to `main`

1. ✅ Build all packages
2. ✅ Run all tests
3. ✅ Deploy mobile remote bundles to Firebase Hosting
4. ✅ Build Android release APK
5. ✅ Upload to Firebase App Distribution (testers group)

### Automated on Git Tag

1. ✅ Build production release
2. ✅ Deploy to Firebase Hosting (production)
3. ✅ Deploy to Firebase App Distribution (production group)
4. ✅ Create GitHub Release with changelog
5. ✅ Upload artifacts (APK, AAB)

### Manual Workflows

- `deploy-android.yml` - Can be triggered manually via `workflow_dispatch`
- `deploy-mobile-remote-bundles.yml` - Can be triggered manually

---

## Best Practices

### ✅ Do

1. **Write descriptive commit messages** - Explain why, not just what
2. **Keep branches focused** - One feature/fix per branch
3. **Test before pushing** - Run `yarn typecheck`, `yarn lint`, `yarn test`
4. **Update documentation** - Keep CLAUDE.md and docs/ in sync
5. **Review your own PR first** - Check diff before requesting reviews
6. **Respond to review comments** - Address feedback promptly
7. **Delete merged branches** - Keep repository clean
8. **Tag releases properly** - Use semantic versioning

### ❌ Don't

1. **Don't commit directly to main/develop** - Always use PRs
2. **Don't force push to shared branches** - Use `--force-with-lease` only on your own feature branches
3. **Don't merge without CI passing** - Wait for all checks
4. **Don't leave stale branches** - Close or update branches > 2 weeks old
5. **Don't merge without reviews** - Get at least 1 approval
6. **Don't ignore merge conflicts** - Resolve carefully and test
7. **Don't commit secrets** - Use `.env` and `.gitignore`
8. **Don't skip testing** - Test on all platforms

---

## Troubleshooting

### "Branch is X commits behind main"

```bash
git checkout feature/my-feature
git merge main
git push origin feature/my-feature
```

### "CI failed on my PR"

1. Check CI logs in GitHub Actions tab
2. Reproduce error locally: `yarn typecheck && yarn lint && yarn test`
3. Fix issues and push

### "My branch has merge conflicts"

```bash
git checkout feature/my-feature
git merge develop
# Git shows conflicts in files
# Open files, resolve conflicts (search for <<<<<<)
git add .
git commit -m "chore: resolve merge conflicts with develop"
git push origin feature/my-feature
```

### "I accidentally committed to main"

```bash
# If not pushed yet
git reset --soft HEAD~1
git checkout -b feature/my-feature
git push origin feature/my-feature

# If already pushed (contact team lead immediately)
```

---

## Related Documentation

- [CI/CD Implementation Plan](./CI-CD-IMPLEMENTATION-PLAN.md) - Automated deployment workflows
- [Mobile Release Build Fixes](./MOBILE-RELEASE-BUILD-FIXES.md) - Production build requirements

---

## Questions?

If you have questions about the Git Flow workflow:
1. Check this document first
2. Review recent PRs for examples
3. Ask in team chat or create a GitHub Discussion
4. Consult [Git Flow original article](https://nvie.com/posts/a-successful-git-branching-model/)

---

**Last Updated**: 2026-01-26
**Maintainer**: Universal MFE Team
