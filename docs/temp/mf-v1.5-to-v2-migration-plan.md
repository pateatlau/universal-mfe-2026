# Module Federation v1.5 → v2 Migration Plan

**Status:** Ready for Implementation  
**Version:** 1.0  
**Date:** 2026-01-XX  
**Based on:** `docs/universal-mfe-mf-v2-migration-analysis.md`

---

## Executive Summary

**Migration Goal:** Migrate web implementation from Module Federation v1.5 to v2 using Rspack

**Timeline:** 1-2 weeks  
**Complexity:** Medium  
**Risk Level:** Low  
**Success Probability:** 85-90%

**Key Changes:**
- Update plugin import from `rspack.container.ModuleFederationPlugin` to `@module-federation/enhanced/rspack`
- Update remote configuration format
- Test thoroughly before deployment

---

## Prerequisites

### Required Packages
- ✅ `@module-federation/enhanced@0.21.6` (already installed)
- ✅ `@rspack/core` (already installed)
- ✅ React 19.2.0 (already installed)
- ✅ React Native Web 0.21.2 (already installed)

### Pre-Migration Checklist
- [ ] Create backup branch: `git checkout -b backup/mf-v1.5-before-migration`
- [ ] Document current working state (screenshots, test results)
- [ ] Verify all remotes are working with MF v1.5
- [ ] Run full test suite and document results
- [ ] Review current configuration files

---

## Phase 1: Preparation (Day 1)

### Tasks

#### 1.1 Configuration Inventory
- [ ] Document all current MF v1.5 configurations
- [ ] List all remotes and their URLs
- [ ] Document all shared dependencies
- [ ] Create configuration comparison document

**Files to Review:**
- `packages/web-shell/rspack.config.mjs`
- `packages/web-remote-hello/rspack.config.mjs`
- Any other web remote configurations

#### 1.2 Backup & Branching
- [ ] Create backup branch: `backup/mf-v1.5-before-migration`
- [ ] Commit current state: `git add . && git commit -m "Backup: Before MF v2 migration"`
- [ ] Create migration branch: `git checkout -b feature/mf-v2-migration`

#### 1.3 Environment Setup
- [ ] Verify `@module-federation/enhanced@0.21.6` is installed
- [ ] Check Rspack version compatibility
- [ ] Verify all dependencies are up to date

**Deliverables:**
- ✅ Configuration inventory document
- ✅ Backup branch created
- ✅ Migration branch created
- ✅ Environment verified

---

## Phase 2: Web Shell Migration (Day 2-3)

### Tasks

#### 2.1 Update Web Shell Configuration

**File:** `packages/web-shell/rspack.config.mjs`

**Before (MF v1.5):**
```javascript
import rspack from '@rspack/core';
const { ModuleFederationPlugin } = rspack.container;

new ModuleFederationPlugin({
  name: 'web_shell',
  remotes: {
    hello_remote: 'hello_remote@http://localhost:9003/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '19.2.0', eager: true },
    'react-dom': { singleton: true, requiredVersion: '19.2.0', eager: true },
    'react-native-web': {
      singleton: true,
      requiredVersion: '0.21.2',
      eager: true,
    },
  },
});
```

**After (MF v2):**
```javascript
import rspack from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

new ModuleFederationPlugin({
  name: 'web_shell',
  remotes: {
    hello_remote: {
      type: 'module',
      entry: 'http://localhost:9003/remoteEntry.js',
    },
  },
  shared: {
    react: { singleton: true, requiredVersion: '19.2.0', eager: true },
    'react-dom': { singleton: true, requiredVersion: '19.2.0', eager: true },
    'react-native-web': {
      singleton: true,
      requiredVersion: '0.21.2',
      eager: true,
    },
  },
});
```

**Steps:**
- [ ] Update import statement
- [ ] Update remote configuration format
- [ ] Verify shared dependencies remain the same
- [ ] Save and commit: `git commit -m "feat: migrate web-shell to MF v2"`

#### 2.2 Test Web Shell

- [ ] Start web shell: `cd packages/web-shell && yarn dev`
- [ ] Verify shell loads without errors
- [ ] Check browser console for errors
- [ ] Verify shell UI renders correctly
- [ ] Document any issues

**Expected Results:**
- ✅ Shell starts on port 9001
- ✅ No console errors
- ✅ Shell UI renders
- ⚠️ Remote loading may fail (expected - remote not migrated yet)

**Deliverables:**
- ✅ Web shell configuration updated
- ✅ Shell loads successfully
- ✅ Test results documented

---

## Phase 3: Web Remote Migration (Day 4-5)

### Tasks

#### 3.1 Update Web Remote Configuration

**File:** `packages/web-remote-hello/rspack.config.mjs`

**Before (MF v1.5):**
```javascript
import rspack from '@rspack/core';
const { ModuleFederationPlugin } = rspack.container;

new ModuleFederationPlugin({
  name: 'hello_remote',
  filename: 'remoteEntry.js',
  exposes: {
    './HelloRemote': './src/HelloRemote.tsx',
  },
  shared: {
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
    'react-native-web': { singleton: true, eager: true },
    '@universal/shared-utils': { singleton: true, eager: true },
    '@universal/shared-hello-ui': { singleton: true, eager: true },
  },
});
```

**After (MF v2):**
```javascript
import rspack from '@rspack/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

new ModuleFederationPlugin({
  name: 'hello_remote',
  filename: 'remoteEntry.js',
  exposes: {
    './HelloRemote': './src/HelloRemote.tsx',
  },
  shared: {
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
    'react-native-web': { singleton: true, eager: true },
    '@universal/shared-utils': { singleton: true, eager: true },
    '@universal/shared-hello-ui': { singleton: true, eager: true },
  },
});
```

**Steps:**
- [ ] Update import statement
- [ ] Verify expose configuration (should remain the same)
- [ ] Verify shared dependencies (should remain the same)
- [ ] Save and commit: `git commit -m "feat: migrate web-remote-hello to MF v2"`

#### 3.2 Test Web Remote

- [ ] Build remote: `cd packages/web-remote-hello && yarn build`
- [ ] Verify build succeeds
- [ ] Check for `remoteEntry.js` in dist folder
- [ ] Start remote dev server: `yarn dev`
- [ ] Verify remote serves on port 9003
- [ ] Test remote entry accessibility: `curl http://localhost:9003/remoteEntry.js`

**Expected Results:**
- ✅ Build succeeds
- ✅ `remoteEntry.js` is generated
- ✅ Remote dev server starts
- ✅ Remote entry is accessible

**Deliverables:**
- ✅ Web remote configuration updated
- ✅ Remote builds successfully
- ✅ Remote serves correctly

---

## Phase 4: Integration Testing (Day 6-7)

### Tasks

#### 4.1 Full Stack Testing

**Setup:**
1. Start web remote: `cd packages/web-remote-hello && yarn dev` (port 9003)
2. Start web shell: `cd packages/web-shell && yarn dev` (port 9001)

**Test Scenarios:**

- [ ] **Test 1: Shell Loading**
  - Open `http://localhost:9001`
  - Verify shell loads without errors
  - Check browser console for errors

- [ ] **Test 2: Remote Loading**
  - Trigger remote component loading
  - Verify remote loads dynamically
  - Check network tab for `remoteEntry.js` fetch
  - Verify no CORS errors

- [ ] **Test 3: Shared Dependencies**
  - Verify React is shared correctly
  - Verify React DOM is shared correctly
  - Verify React Native Web is shared correctly
  - Check for "Invalid hook call" errors

- [ ] **Test 4: React Native Web Components**
  - Verify universal components render
  - Test View, Text, Pressable components
  - Verify styling works correctly
  - Test component interactions

- [ ] **Test 5: Props Passing**
  - Test props from shell to remote
  - Test callback props from remote to shell
  - Verify event handling works

- [ ] **Test 6: Error Handling**
  - Test remote loading failure (stop remote server)
  - Verify error boundaries work
  - Test graceful degradation

**Expected Results:**
- ✅ All tests pass
- ✅ No console errors
- ✅ Remote loads successfully
- ✅ Components render correctly
- ✅ Interactions work

#### 4.2 Production Build Testing

- [ ] Build web remote for production: `yarn build`
- [ ] Build web shell for production: `yarn build`
- [ ] Test production builds locally
- [ ] Verify bundle sizes are acceptable
- [ ] Compare bundle sizes with MF v1.5 (if metrics available)

**Deliverables:**
- ✅ Integration test results
- ✅ Production build verification
- ✅ Performance metrics

---

## Phase 5: Cross-Platform Verification (Day 8)

### Tasks

#### 5.1 Mobile Compatibility Check

**Important:** Mobile uses MF v2 already, so it should be unaffected. However, verify:

- [ ] Mobile host still works
- [ ] Mobile remote still works
- [ ] No shared dependency conflicts
- [ ] Mobile builds succeed

**Steps:**
- [ ] Build mobile remote: `cd packages/mobile-remote-hello && yarn build:remote`
- [ ] Start mobile host: `cd packages/mobile-host && yarn android`
- [ ] Test mobile remote loading
- [ ] Verify no regressions

#### 5.2 Shared Libraries Verification

- [ ] Verify `@universal/shared-utils` works in both web and mobile
- [ ] Verify `@universal/shared-hello-ui` works in both web and mobile
- [ ] Test shared components render correctly on both platforms

**Deliverables:**
- ✅ Mobile compatibility verified
- ✅ Shared libraries verified
- ✅ Cross-platform tests pass

---

## Phase 6: Performance & Optimization (Day 9)

### Tasks

#### 6.1 Performance Metrics

**Measure and Document:**
- [ ] Build time (web shell)
- [ ] Build time (web remote)
- [ ] Bundle size (web shell)
- [ ] Bundle size (web remote)
- [ ] Initial load time
- [ ] Remote load time
- [ ] Runtime performance

**Comparison:**
- [ ] Compare with MF v1.5 metrics (if available)
- [ ] Document any regressions
- [ ] Document any improvements

#### 6.2 Optimization (if needed)

- [ ] Review bundle sizes
- [ ] Optimize shared dependencies if needed
- [ ] Review code splitting
- [ ] Optimize remote loading strategy

**Deliverables:**
- ✅ Performance metrics documented
- ✅ Optimization recommendations (if any)

---

## Phase 7: Documentation & Cleanup (Day 10)

### Tasks

#### 7.1 Update Documentation

**Files to Update:**
- [ ] `docs/universal-mfe-architecture-overview.md` - Update MF version
- [ ] `docs/universal-mfe-mf-v2-migration-analysis.md` - Mark as completed
- [ ] Configuration examples in README files
- [ ] Any other relevant documentation

**Content to Update:**
- [ ] MF version references (v1.5 → v2)
- [ ] Configuration examples
- [ ] Migration notes
- [ ] Known issues or limitations

#### 7.2 Code Cleanup

- [ ] Remove unused imports
- [ ] Update comments
- [ ] Remove old configuration examples
- [ ] Code review
- [ ] Final commit: `git commit -m "docs: update documentation for MF v2"`

#### 7.3 Final Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Performance acceptable
- [ ] No regressions
- [ ] Ready for merge

**Deliverables:**
- ✅ Documentation updated
- ✅ Code cleaned up
- ✅ Final review complete

---

## Rollback Plan

### If Migration Fails

**Immediate Rollback:**
1. Switch to backup branch: `git checkout backup/mf-v1.5-before-migration`
2. Or revert commits: `git revert HEAD~n` (where n = number of commits)
3. Restore original configuration files
4. Test that MF v1.5 still works

**Rollback Time:** < 1 hour

**Post-Rollback:**
1. Document issues encountered
2. Analyze root causes
3. Update migration plan
4. Reassess migration strategy

---

## Success Criteria

**✅ Migration is successful if:**

- [x] Web shell loads with MF v2
- [x] Web remote loads dynamically from shell
- [x] Shared dependencies work correctly
- [x] React Native Web components render correctly
- [x] Production builds work
- [x] Mobile compatibility maintained
- [x] No performance regressions
- [x] All tests pass
- [x] Documentation updated

---

## Risk Mitigation

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Remote loading fails | Medium | High | Test thoroughly, have rollback plan |
| Shared dependencies break | Low | Medium | Verify shared config carefully |
| React Native Web issues | Low | High | Test RNW components extensively |
| Production build issues | Medium | High | Test production builds early |
| Mobile compatibility | Low | Medium | Mobile uses MF v2 already (proven) |

### Mitigation Strategies

1. **Thorough Testing:** Test each phase before proceeding
2. **Incremental Migration:** Migrate one component at a time
3. **Backup Branch:** Always have a rollback option
4. **Documentation:** Document all changes and issues
5. **Code Review:** Review all changes before merging

---

## Timeline Summary

| Phase | Days | Tasks | Status |
|-------|------|-------|--------|
| Phase 1: Preparation | Day 1 | Configuration inventory, backup, setup | ⏳ Pending |
| Phase 2: Web Shell | Day 2-3 | Update shell config, test | ⏳ Pending |
| Phase 3: Web Remote | Day 4-5 | Update remote config, test | ⏳ Pending |
| Phase 4: Integration | Day 6-7 | Full stack testing | ⏳ Pending |
| Phase 5: Cross-Platform | Day 8 | Mobile verification | ⏳ Pending |
| Phase 6: Performance | Day 9 | Metrics and optimization | ⏳ Pending |
| Phase 7: Documentation | Day 10 | Docs and cleanup | ⏳ Pending |

**Total Timeline:** 10 days (2 weeks)

---

## Next Steps

1. **Review this plan** with the team
2. **Schedule migration window** (prefer low-activity period)
3. **Assign migration owner**
4. **Set up communication channel** for updates
5. **Begin Phase 1** when ready

---

## Notes

- This migration only affects the **web** implementation
- **Mobile** already uses MF v2 and should be unaffected
- Keep mobile tests running to catch any unexpected issues
- Test in development environment first, then staging, then production

---

**Last Updated:** 2026-01-XX  
**Status:** Ready for Implementation  
**Owner:** [To be assigned]

