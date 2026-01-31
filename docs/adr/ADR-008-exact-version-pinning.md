# ADR-008: Exact Version Pinning Strategy

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

JavaScript projects typically use semver ranges for dependencies:

- `^19.0.0` - Allow minor and patch updates
- `~19.0.0` - Allow patch updates only
- `19.0.0` - Exact version, no updates

Module Federation has **extreme version sensitivity**:
- Shared singletons must be exact same version across host and remotes
- Mismatched React versions cause silent failures or crashes
- React Native adds another layer of version interdependencies
- Hermes bytecode format may change between versions

## Decision

**Use exact versions (no `^` or `~`)** for all core dependencies.

Pinned packages:
- React ecosystem: `react`, `react-dom`, `react-native`, `react-native-web`
- Module Federation: `@module-federation/enhanced`
- Bundlers: `@rspack/core`, `@rspack/cli`, `@callstack/repack`
- Build tools: `typescript`, `@swc/helpers`

```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-native": "0.80.0"
  }
}
```

**Not pinned** (semver allowed):
- Dev-only tools: ESLint, Prettier, Jest
- Utilities with stable APIs: lodash, date-fns

## Consequences

### Positive

1. **Reproducible builds**: Same code → same output every time
2. **MF compatibility**: Guarantees shared dependency versions match
3. **Debugging clarity**: Know exact versions in any environment
4. **Controlled upgrades**: Updates are intentional, reviewed decisions
5. **CI/CD stability**: Builds don't break from upstream changes

### Negative

1. **Manual updates**: No automatic security patches
2. **Maintenance burden**: Must actively track updates
3. **Potential staleness**: May miss important fixes
4. **More lockfile churn**: Updates touch many files

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing security fixes | Medium | High | Dependabot alerts; regular review cycles |
| Falling behind ecosystem | Medium | Medium | Quarterly version review; track changelogs |
| Version conflict on upgrade | Medium | Medium | Test upgrades in isolation; comprehensive CI |

## Alternatives Considered

### Alternative 1: Semver Ranges (^)

**Description**: Allow automatic minor/patch updates.

**Rejected because**:
- Module Federation breaks on version mismatches
- `react@^19.0.0` could resolve to 19.0.0 in host, 19.1.0 in remote
- Debugging version mismatches is extremely difficult
- Breaking changes happen in "minor" versions in RN ecosystem

### Alternative 2: Lock File Only

**Description**: Use ranges but rely on yarn.lock for consistency.

**Rejected because**:
- Different package.json would allow drift
- New installs might resolve differently
- Harder to audit actual versions
- MF requires explicit version control

### Alternative 3: Resolutions/Overrides

**Description**: Use ranges with resolutions to force versions.

**Rejected because**:
- Adds complexity to understand
- Easy to miss adding resolution for new package
- Exact versions are simpler and clearer
- Resolutions are a workaround, not a solution

## Version Matrix

Current locked versions:

| Package | Version | Notes |
|---------|---------|-------|
| react (mobile) | 19.1.0 | Required by RN 0.80.0 |
| react (web) | 19.2.0 | Latest stable |
| react-native | 0.80.0 | Hermes default |
| react-native-web | 0.21.2 | RN 0.80 compatible |
| @module-federation/enhanced | 0.21.6 | MF v2 |
| @rspack/core | 1.6.5 | Rspack stable |
| @callstack/repack | 5.2.0 | Re.Pack MF v2 |
| typescript | 5.9.3 | Strict mode |
| @swc/helpers | 0.5.17 | SWC runtime |

## Update Process

1. **Weekly**: Review Dependabot security alerts
2. **Monthly**: Check for patch updates to pinned packages
3. **Quarterly**: Evaluate minor/major version upgrades
4. **Per-release**: Test full version matrix compatibility

```bash
# Check for outdated packages
yarn outdated

# Update specific package (with testing)
yarn upgrade react@19.2.0 --exact
yarn test
yarn build
```

## References

- [npm Semver Documentation](https://docs.npmjs.com/cli/v6/using-npm/semver)
- [Module Federation Shared Dependencies](https://module-federation.io/guide/basic/shared.html)
- [React Native Version Compatibility](https://reactnative.dev/docs/upgrading)
