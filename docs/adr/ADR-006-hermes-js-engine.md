# ADR-006: Hermes as Mobile JavaScript Engine

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

React Native supports multiple JavaScript engines:

1. **JavaScriptCore (JSC)**: Default on iOS, available on Android
2. **Hermes**: Meta's engine optimized for React Native
3. **V8**: Chrome's engine, available via react-native-v8

For Module Federation with dynamic loading, we need:
- **Fast startup**: Users shouldn't wait for JS parsing
- **Small bundles**: Reduce download size
- **Bytecode execution**: ScriptManager requires pre-compiled bytecode
- **Memory efficiency**: Mobile devices have limited RAM

## Decision

**Use Hermes as the JavaScript engine** for both iOS and Android.

React Native 0.80.0 enables Hermes by default. Configuration:

```ruby
# ios/Podfile
:hermes_enabled => true
```

```groovy
// android/app/build.gradle
hermesEnabled = true
```

**Critical**: Hermes requires the `PatchMFConsolePlugin` workaround for Module Federation v2 (see ADR-012).

## Consequences

### Positive

1. **30-40% smaller bundles**: Bytecode more compact than source
2. **Faster startup**: No JS parsing at runtime (pre-compiled)
3. **Lower memory**: Optimized garbage collection
4. **Required for ScriptManager**: Re.Pack MF requires Hermes bytecode
5. **Meta supported**: Primary engine for React Native going forward

### Negative

1. **Console workaround needed**: Hermes doesn't provide console before InitializeCore
2. **Different runtime behavior**: Some JS edge cases differ from V8/JSC
3. **Debugging differences**: Hermes debugger vs Chrome DevTools
4. **Build complexity**: Bytecode compilation adds build step

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Console crash (MF) | Certain | Critical | PatchMFConsolePlugin workaround |
| JS compatibility issues | Low | Medium | Test on Hermes early; avoid edge cases |
| Debugging difficulty | Low | Low | Flipper integration; console polyfill |

## Alternatives Considered

### Alternative 1: JavaScriptCore (JSC)

**Description**: WebKit's JavaScript engine, iOS default.

**Rejected because**:
- Larger bundle sizes (no bytecode)
- Slower cold start (parsing required)
- Not optimized for React Native
- Android version less performant

### Alternative 2: V8 (react-native-v8)

**Description**: Chrome's V8 engine via community package.

**Rejected because**:
- Community maintained, not official
- No bytecode format for ScriptManager
- Larger engine size
- Different debugging experience

### Alternative 3: Disable Hermes

**Description**: Fall back to JSC for simplicity.

**Rejected because**:
- Loses all Hermes benefits
- ScriptManager requires Hermes for MF
- Going against React Native direction
- Performance regression

## The Console Issue

Hermes with Module Federation v2 has a critical initialization order issue:

1. Bundle loads and starts executing
2. MF v2 webpack runtime calls `console.warn()` / `console.error()`
3. **Crash**: Hermes hasn't initialized `console` yet (happens in InitializeCore)

**Solution**: `PatchMFConsolePlugin` prepends console/Platform polyfills before webpack runtime code.

```javascript
// Polyfill prepended by plugin
var console = console || {
  log: function() {},
  warn: function() {},
  error: function() {},
};
```

See [ADR-012](./ADR-012-patchmfconsoleplugin-workaround.md) for full details.

## Performance Comparison

| Metric | Hermes | JSC | V8 |
|--------|--------|-----|-----|
| Cold Start | ~1.5s | ~2.5s | ~2.0s |
| Bundle Size | Base | +30% | +25% |
| Memory Usage | Low | Medium | Medium |
| Bytecode Support | Yes | No | No |

*Approximate values for medium-sized RN app.*

## References

- [Hermes Engine](https://hermesengine.dev/)
- [Hermes in React Native](https://reactnative.dev/docs/hermes)
- [Hermes Performance](https://engineering.fb.com/2019/07/12/android/hermes/)
