# ADR-003: Yarn Classic as Package Manager

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

Modern JavaScript monorepos have several package manager options:

1. **npm workspaces**: Built into npm, widely supported
2. **Yarn Classic (v1)**: Mature, stable, widely used
3. **Yarn Berry (v2+)**: Modern, Plug'n'Play, stricter
4. **pnpm**: Fast, disk-efficient, strict

React Native has specific requirements:
- **Autolinking**: Gradle and CocoaPods need to find native modules in `node_modules/`
- **Hoisting**: React Native build tools expect dependencies hoisted to root
- **Symlink resolution**: Native build systems struggle with non-standard layouts

## Decision

**Use Yarn Classic v1.22.22** with workspace hoisting.

Configuration:
- `packageManager` field in root `package.json` locks version
- Workspaces defined in root `package.json`
- Default hoisting behavior (dependencies lifted to root)
- Symlinks created in `packages/mobile-host/node_modules/` for native build compatibility

```json
{
  "packageManager": "yarn@1.22.22",
  "workspaces": [
    "packages/*"
  ]
}
```

## Consequences

### Positive

1. **React Native compatibility**: Hoisting works with autolinking out of the box
2. **Stability**: v1 is mature with predictable behavior
3. **Ecosystem support**: Most CI/CD systems and tools support Yarn Classic
4. **Simple mental model**: Flat node_modules is easy to understand
5. **No migration risk**: Proven in millions of projects

### Negative

1. **Phantom dependencies**: Non-explicit dependencies may work accidentally
2. **Disk space**: Hoisting duplicates some dependencies
3. **Missing v2 features**: No Plug'n'Play, no zero-installs
4. **Maintenance mode**: v1 receives only critical fixes
5. **No strict mode**: Can't enforce dependency declarations

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Yarn v1 deprecated | Low | Medium | Migration path to v2+ exists; evaluate periodically |
| Phantom dependency breaks | Medium | Low | Review dependency changes; explicit declarations |
| Hoisting conflicts | Low | Medium | Explicit version pinning; nohoist when needed |

## Alternatives Considered

### Alternative 1: pnpm

**Description**: Fast, disk-efficient package manager with strict dependency resolution.

**Rejected because**:
- Content-addressable storage incompatible with React Native autolinking
- Symlink structure confuses Gradle/CocoaPods
- Would require extensive configuration and workarounds
- Risk of subtle build failures

### Alternative 2: Yarn Berry (v2+)

**Description**: Modern Yarn with Plug'n'Play and stricter dependency resolution.

**Rejected because**:
- Plug'n'Play breaks React Native autolinking
- `nodeLinker: node-modules` mode adds complexity
- React Native ecosystem not fully compatible
- Migration risk during active development

### Alternative 3: npm Workspaces

**Description**: Built-in npm workspace support.

**Rejected because**:
- Less mature workspace implementation
- Yarn has better monorepo tooling
- Team already familiar with Yarn
- Minor: slower than Yarn for install operations

## Implementation Details

### Symlink Script

React Native's build systems expect packages in the mobile package's local `node_modules/`. A setup script bridges this:

```javascript
// packages/mobile-host/scripts/setup-symlinks.js
const symlinks = [
  'react-native',
  '@react-native',
  '@callstack',
];
// Creates: packages/mobile-host/node_modules/X -> ../../../node_modules/X
```

### Android Gradle Configuration

```groovy
// android/app/build.gradle
react {
    reactNativeDir = file("../../../../node_modules/react-native")
    codegenDir = file("../../../../node_modules/@react-native/codegen")
}
```

## References

- [Yarn Classic Documentation](https://classic.yarnpkg.com/)
- [React Native Autolinking](https://github.com/react-native-community/cli/blob/main/docs/autolinking.md)
- [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)
