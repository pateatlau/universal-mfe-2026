# ADR-002: Module Federation v2 for Dynamic Loading

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

We need a microfrontend architecture that allows:

1. **Independent deployments**: Teams deploy their MFEs without redeploying the host
2. **Runtime loading**: Load modules dynamically at runtime, not build time
3. **Shared dependencies**: Share React, React Native, and common libraries to avoid duplication
4. **Cross-platform support**: Work on both web and mobile

Traditional approaches have limitations:
- **iframes**: Poor performance, limited communication, no shared state
- **Build-time integration**: Requires full rebuild for any change
- **npm packages**: Requires host redeployment for updates

## Decision

**Use Module Federation v2** for dynamic runtime module loading:

- **Web**: `@module-federation/enhanced/rspack` with browser runtime
- **Mobile**: Re.Pack's `ModuleFederationPluginV2` with ScriptManager

Configuration approach:
- Hosts declare shared dependencies as singletons with eager loading
- Remotes expose entry points via `exposes` configuration
- Web remotes loaded via `remoteEntry.js` at runtime
- Mobile remotes loaded via ScriptManager resolver pattern

**Shared Dependencies** (singletons):
- `react`, `react-dom`, `react-native-web` (web)
- `react`, `react-native` (mobile)
- All `@universal/shared-*` packages

## Consequences

### Positive

1. **True independence**: Remotes deploy without host changes
2. **Runtime flexibility**: Update remotes without app store releases (mobile)
3. **Shared singletons**: No duplicate React instances
4. **Version alignment**: MF enforces version consistency
5. **Established pattern**: MF v2 is production-proven at scale

### Negative

1. **Complexity**: MF configuration is intricate and error-prone
2. **Debugging difficulty**: Runtime errors harder to trace than build-time
3. **Version sensitivity**: Mismatched versions cause silent failures
4. **Mobile immaturity**: MF on mobile is newer, less documented
5. **Network dependency**: Remotes require network to load

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Version mismatch crashes | Medium | High | Exact version pinning; CI validation |
| Remote load failures | Medium | Medium | Fallback UI; retry logic; timeout handling |
| Shared dependency conflicts | Medium | High | All shared deps explicit; singleton: true |
| Performance overhead | Low | Medium | Lazy loading; preload hints |

## Alternatives Considered

### Alternative 1: Single-SPA

**Description**: Framework-agnostic microfrontend orchestrator.

**Rejected because**:
- No native mobile support
- Additional orchestration layer complexity
- MF provides sufficient capabilities
- Team already familiar with Webpack/Rspack

### Alternative 2: Build-Time Integration

**Description**: Publish MFEs as npm packages, rebuild host to update.

**Rejected because**:
- No independent deployment (main goal)
- Requires host rebuild for every change
- App store resubmission for mobile updates
- Slower iteration velocity

### Alternative 3: iframe-based Isolation

**Description**: Load MFEs in iframes for complete isolation.

**Rejected because**:
- No shared state (React context doesn't cross iframe boundary)
- Performance overhead of multiple JS runtimes
- Complex inter-frame communication
- Not applicable to React Native mobile

### Alternative 4: Module Federation v1

**Description**: Use original Webpack 5 Module Federation.

**Rejected because**:
- v2 has better TypeScript support
- v2 supports Rspack (faster builds)
- v2 has improved runtime and error handling
- v2 is actively maintained

## References

- [Module Federation Documentation](https://module-federation.io/)
- [Module Federation 2.0 Announcement](https://module-federation.io/blog/announcement.html)
- [Re.Pack Module Federation Guide](https://re-pack.dev/docs/module-federation)
