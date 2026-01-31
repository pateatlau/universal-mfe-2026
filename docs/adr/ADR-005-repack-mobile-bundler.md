# ADR-005: Re.Pack as Mobile Bundler

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

React Native mobile applications need a bundler that:

1. **Supports Module Federation v2**: Essential for microfrontend architecture
2. **Outputs Hermes bytecode**: Required for React Native 0.70+
3. **Integrates with React Native CLI**: Works with standard RN tooling
4. **Supports dynamic loading**: Load remote bundles at runtime

The default bundler is Metro, but it has limitations:
- No Module Federation support
- No dynamic remote loading
- Optimized for monolithic apps

## Decision

**Use Re.Pack v5.2.0** as the mobile bundler with Module Federation v2 plugin.

Key features used:
- `Repack.plugins.ModuleFederationPluginV2` for MF configuration
- `ScriptManager` for runtime bundle loading
- Rspack core for fast builds
- Hermes bytecode output (.bundle files)

```javascript
// rspack.config.mjs (mobile)
import * as Repack from '@callstack/repack';

export default {
  plugins: [
    new Repack.plugins.ModuleFederationPluginV2({
      name: 'MobileHost',
      shared: {
        react: { singleton: true, eager: true },
        'react-native': { singleton: true, eager: true },
      },
    }),
  ],
};
```

## Consequences

### Positive

1. **Only MF v2 option**: Re.Pack is the only bundler supporting MF v2 on mobile
2. **Rspack performance**: Inherits fast build times from Rspack
3. **Hermes support**: Native bytecode output for production
4. **ScriptManager**: Clean API for dynamic bundle loading
5. **Active maintenance**: Callstack actively develops Re.Pack

### Negative

1. **Smaller community**: Less adoption than Metro
2. **Breaking changes**: Major versions may require config updates
3. **Debugging complexity**: Different bundler than default RN
4. **Learning curve**: Team must learn Re.Pack specifics
5. **Metro incompatibility**: Can't mix Metro and Re.Pack

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Re.Pack deprecated | Low | Very High | No alternative exists; monitor Callstack roadmap |
| RN version incompatibility | Medium | High | Pin versions; test upgrades in isolation |
| Bundle loading failures | Medium | Medium | Retry logic; fallback UI; comprehensive testing |
| Performance regression | Low | Medium | Benchmark builds; profile runtime |

## Alternatives Considered

### Alternative 1: Metro

**Description**: Default React Native bundler by Meta.

**Rejected because**:
- No Module Federation support
- No dynamic remote loading capability
- Would require custom dynamic loading implementation
- No plans to add MF support

### Alternative 2: Webpack (Custom Setup)

**Description**: Configure Webpack directly for React Native.

**Rejected because**:
- Re.Pack already does this with better integration
- Would require significant custom work
- No ScriptManager equivalent
- Re.Pack is battle-tested

### Alternative 3: Metro + Custom Dynamic Loading

**Description**: Keep Metro, implement custom code loading.

**Rejected because**:
- Security concerns with eval-based loading
- No shared dependency management
- Complex implementation
- Reinventing what Re.Pack provides

## ScriptManager Pattern

Re.Pack provides ScriptManager for runtime bundle resolution:

```typescript
// App.tsx
ScriptManager.shared.addResolver(async (scriptId, caller) => {
  const REMOTE_HOST = Platform.OS === 'android'
    ? 'http://10.0.2.2:9004'
    : 'http://localhost:9005';

  if (scriptId === 'HelloRemote') {
    return { url: `${REMOTE_HOST}/HelloRemote.container.js.bundle` };
  }

  // Handle expose chunks
  if (scriptId.startsWith('__federation_expose_')) {
    return { url: `${REMOTE_HOST}/${scriptId}.bundle` };
  }

  throw new Error(`Unknown scriptId: ${scriptId}`);
});
```

## References

- [Re.Pack Documentation](https://re-pack.dev/)
- [Re.Pack Module Federation Guide](https://re-pack.dev/docs/module-federation)
- [Callstack GitHub](https://github.com/callstack/repack)
