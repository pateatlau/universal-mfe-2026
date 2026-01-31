# ADR-001: Universal UI with React Native Primitives

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

We need to build applications that run on Web, iOS, and Android with maximum code reuse. Traditional approaches require:

1. **Separate codebases**: React for web, React Native for mobile (2x development cost)
2. **Framework abstractions**: Tools like Ionic/Capacitor that wrap web in native shells (poor native experience)
3. **Platform-specific UI**: Write once but render differently per platform (inconsistent UX)

The core challenge is finding a UI abstraction that:
- Provides native performance on mobile
- Works efficiently on web
- Allows sharing 80%+ of UI code
- Doesn't compromise on platform-specific capabilities

## Decision

**Use React Native primitives as the universal UI API**, rendered via:
- **React Native Web** on browsers
- **Native rendering** on iOS/Android

All shared UI components use only React Native primitives:
- `View`, `Text`, `Pressable`, `Image`, `ScrollView`, `TextInput`
- `Platform.select()` for platform-specific logic when needed
- `StyleSheet.create()` for styling

**Explicitly forbidden in shared components:**
- DOM elements (`<div>`, `<span>`, `<button>`)
- Browser APIs (`window`, `document`, `localStorage`)
- React Native Web imports (RNW is bundler config only)

## Consequences

### Positive

1. **True code sharing**: 80%+ of UI code runs on all three platforms
2. **Native performance**: Mobile uses native components, not WebViews
3. **Familiar API**: Teams already know React and React Native
4. **Type safety**: Full TypeScript support across platforms
5. **Single mental model**: Developers think in one abstraction

### Negative

1. **Limited web features**: Some CSS features unavailable (pseudo-selectors, complex animations)
2. **Learning curve**: Web developers must learn React Native primitives
3. **Debugging complexity**: Issues may manifest differently per platform
4. **Bundle size**: React Native Web adds overhead vs plain React

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RNW maintenance declining | Low | High | Monitor repo activity; fallback to fork if needed |
| Platform divergence | Medium | Medium | Enforce lint rules; review all shared component changes |
| Performance issues on web | Low | Medium | Profile regularly; use web-specific optimizations if needed |

## Alternatives Considered

### Alternative 1: Capacitor/Ionic

**Description**: Build web app, wrap in native WebView container.

**Rejected because**:
- WebView performance inferior to native
- Limited access to native APIs
- "App in a browser" user experience
- Doesn't meet native quality bar

### Alternative 2: Flutter

**Description**: Use Flutter for all platforms (web, iOS, Android).

**Rejected because**:
- Dart language learning curve
- Smaller ecosystem than React
- Web support less mature
- Team expertise in React, not Dart

### Alternative 3: Kotlin Multiplatform

**Description**: Share business logic in Kotlin, native UI per platform.

**Rejected because**:
- Still requires platform-specific UI (3x UI codebases)
- UI is the largest part of frontend work
- Kotlin ecosystem less mature for web

### Alternative 4: Separate Codebases

**Description**: Maintain React web app and React Native mobile app separately.

**Rejected because**:
- 2x development cost
- Feature parity challenges
- Inconsistent user experience
- Doubled maintenance burden

## References

- [React Native Web Documentation](https://necolas.github.io/react-native-web/)
- [React Native Documentation](https://reactnative.dev/)
- [Universal Apps with React Native Web (Meta)](https://engineering.fb.com/2018/05/23/android/react-native-at-f8-and-open-source/)
