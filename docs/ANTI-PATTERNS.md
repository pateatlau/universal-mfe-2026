# Anti-Patterns to Avoid

This document describes common mistakes and anti-patterns to avoid when working with the Universal MFE Platform.

## Architecture Anti-Patterns

### 1. Direct MFE-to-MFE Imports

**Problem**: Importing code directly from one MFE to another creates tight coupling and breaks independent deployability.

```typescript
// DON'T DO THIS
// packages/web-remote-hello/src/HelloRemote.tsx
import { someHelper } from '@universal/web-remote-other'; // Direct MFE import
```

**Why It's Bad**:
- MFEs can't be deployed independently
- Build failures cascade across MFEs
- Circular dependencies possible

**Solution**: Use the event bus for inter-MFE communication.

```typescript
// DO THIS INSTEAD
import { useEventBus } from '@universal/shared-event-bus';

function HelloRemote() {
  const bus = useEventBus();

  const notifyOtherMfe = () => {
    bus.emit('SOME_EVENT', { data: 'value' });
  };
}
```

---

### 2. DOM Elements in Shared Packages

**Problem**: Using DOM elements (`<div>`, `<span>`, `<button>`) in shared packages breaks mobile builds.

```typescript
// DON'T DO THIS
// packages/shared-hello-ui/src/HelloUniversal.tsx
export function HelloUniversal() {
  return (
    <div className="container">  {/* DOM element */}
      <span>Hello</span>         {/* DOM element */}
      <button onClick={...}>     {/* DOM element */}
        Click
      </button>
    </div>
  );
}
```

**Why It's Bad**:
- React Native doesn't support DOM elements
- Mobile builds will fail
- Breaks the universal component contract

**Solution**: Use React Native primitives only.

```typescript
// DO THIS INSTEAD
import { View, Text, Pressable } from 'react-native';

export function HelloUniversal() {
  return (
    <View style={styles.container}>
      <Text>Hello</Text>
      <Pressable onPress={...}>
        <Text>Click</Text>
      </Pressable>
    </View>
  );
}
```

---

### 3. Browser Globals in Shared Packages

**Problem**: Using browser-specific APIs (`window`, `document`, `localStorage`) in shared packages.

```typescript
// DON'T DO THIS
// packages/shared-utils/src/storage.ts
export function saveData(key: string, value: string) {
  localStorage.setItem(key, value);  // Browser-only API
  window.dispatchEvent(new Event('storage'));  // Browser-only API
}
```

**Why It's Bad**:
- Crashes on React Native (no `window` or `localStorage`)
- Makes shared code platform-specific

**Solution**: Use the storage abstraction.

```typescript
// DO THIS INSTEAD
import { storage, setJSON } from '@universal/shared-utils';

export async function saveData(key: string, value: string) {
  await storage.setItem(key, value);
}
```

---

### 4. Router Imports in Remote MFEs

**Problem**: Importing router libraries or using navigation hooks in remote MFEs.

```typescript
// DON'T DO THIS
// packages/web-remote-hello/src/HelloRemote.tsx
import { useNavigate, Link } from 'react-router-dom';

function HelloRemote() {
  const navigate = useNavigate();

  const goToSettings = () => {
    navigate('/settings');  // Remote knows about host URLs
  };

  return <Link to="/home">Home</Link>;
}
```

**Why It's Bad**:
- Remotes become URL-aware (breaks portability)
- Can't use same remote in different hosts with different URLs
- Breaks the routing ownership model

**Solution**: Use event bus for navigation requests.

```typescript
// DO THIS INSTEAD
import { useEventBus, NavigationEventTypes } from '@universal/shared-event-bus';

function HelloRemote() {
  const bus = useEventBus();

  const requestNavigation = () => {
    bus.emit(NavigationEventTypes.NAVIGATE_TO, {
      path: '/settings',
    });
  };

  return (
    <Pressable onPress={requestNavigation}>
      <Text>Go to Settings</Text>
    </Pressable>
  );
}
```

---

### 5. Shared Mutable State Between MFEs

**Problem**: Sharing mutable state objects directly between MFEs.

```typescript
// DON'T DO THIS
// packages/shared-state/src/globalState.ts
export const globalState = {
  user: null,
  theme: 'light',
  locale: 'en',
};

// In MFE A
globalState.user = currentUser;

// In MFE B
console.log(globalState.user);  // Directly accessing shared mutable state
```

**Why It's Bad**:
- No reactivity (components don't re-render)
- Race conditions between MFEs
- Hard to debug state changes
- Breaks state ownership model

**Solution**: Use Zustand stores with proper ownership, or event bus for cross-MFE sync.

```typescript
// DO THIS INSTEAD
// MFE A (owner) updates and broadcasts
useAuthStore.getState().setUser(currentUser);
bus.emit(AuthEventTypes.USER_LOGGED_IN, { user: currentUser });

// MFE B listens for changes
useEventListener(AuthEventTypes.USER_LOGGED_IN, (event) => {
  // Update local state or UI
});
```

---

## Theming Anti-Patterns

### 6. Using Primitive Tokens in Components

**Problem**: Using primitive color values directly instead of semantic tokens.

```typescript
// DON'T DO THIS
import { colors } from '@universal/shared-design-tokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[50],  // Primitive token
    color: colors.gray[900],           // Primitive token
  },
});
```

**Why It's Bad**:
- Won't change with theme (light/dark)
- Inconsistent color usage across app
- Harder to maintain design system

**Solution**: Use semantic tokens from the theme.

```typescript
// DO THIS INSTEAD
import { useTheme } from '@universal/shared-theme-context';

function MyComponent() {
  const { theme } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface.background,
      color: theme.colors.text.primary,
    },
  }), [theme]);
}
```

---

### 7. Inline Styles Without Theme

**Problem**: Using hardcoded colors or styles without theme awareness.

```typescript
// DON'T DO THIS
function Button() {
  return (
    <Pressable style={{ backgroundColor: '#3B82F6' }}>
      <Text style={{ color: 'white' }}>Click</Text>
    </Pressable>
  );
}
```

**Why It's Bad**:
- Ignores user's theme preference
- Inconsistent with design system
- Accessibility issues (contrast in dark mode)

**Solution**: Always use theme-aware styles.

```typescript
// DO THIS INSTEAD
function Button() {
  const { theme } = useTheme();

  return (
    <Pressable style={{ backgroundColor: theme.colors.interactive.primary }}>
      <Text style={{ color: theme.colors.text.inverse }}>Click</Text>
    </Pressable>
  );
}
```

---

## i18n Anti-Patterns

### 8. Hardcoded Strings

**Problem**: Hardcoding user-facing strings instead of using translations.

```typescript
// DON'T DO THIS
function WelcomeMessage() {
  return <Text>Welcome to our app!</Text>;
}

function ErrorMessage() {
  return <Text>Something went wrong. Please try again.</Text>;
}
```

**Why It's Bad**:
- Can't be translated
- Inconsistent messaging
- Hard to update across app

**Solution**: Use translation keys.

```typescript
// DO THIS INSTEAD
function WelcomeMessage() {
  const { t } = useTranslation('common');
  return <Text>{t('welcome')}</Text>;
}

function ErrorMessage() {
  const { t } = useTranslation('errors');
  return <Text>{t('genericError')}</Text>;
}
```

---

### 9. Translation Keys Without Namespace

**Problem**: Using flat translation keys that can collide across MFEs.

```typescript
// DON'T DO THIS
const translations = {
  en: {
    greeting: 'Hello',      // Might collide with other MFE's "greeting"
    buttonLabel: 'Click',   // Generic, could conflict
  },
};
```

**Why It's Bad**:
- Key collisions when MFEs are merged
- Unclear ownership of translations
- Hard to maintain

**Solution**: Use namespaced translations.

```typescript
// DO THIS INSTEAD
const translations = {
  en: {
    hello: {                    // MFE namespace
      greeting: 'Hello',
      buttonLabel: 'Click me',
    },
  },
};

// In component
const { t } = useTranslation('hello');
```

---

## Performance Anti-Patterns

### 10. Creating Styles on Every Render

**Problem**: Creating StyleSheet objects inside render function.

```typescript
// DON'T DO THIS
function MyComponent() {
  const { theme } = useTheme();

  // StyleSheet.create called on EVERY render
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface.background,
    },
  });

  return <View style={styles.container} />;
}
```

**Why It's Bad**:
- Creates new style objects every render
- Unnecessary memory allocation
- Performance degradation

**Solution**: Memoize styles with `useMemo`.

```typescript
// DO THIS INSTEAD
function MyComponent() {
  const { theme } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface.background,
    },
  }), [theme]);

  return <View style={styles.container} />;
}
```

---

### 11. Missing Zustand Selectors

**Problem**: Selecting entire store state when only part is needed.

```typescript
// DON'T DO THIS
function PressCount() {
  // Re-renders on ANY store change
  const store = useHelloLocalStore();

  return <Text>{store.localPressCount}</Text>;
}
```

**Why It's Bad**:
- Component re-renders on every store change
- Even unrelated state changes trigger re-render
- Performance degradation

**Solution**: Use selectors.

```typescript
// DO THIS INSTEAD
function PressCount() {
  // Only re-renders when localPressCount changes
  const count = useHelloLocalStore((state) => state.localPressCount);

  return <Text>{count}</Text>;
}
```

---

## Module Federation Anti-Patterns

### 12. Hardcoded Remote URLs

**Problem**: Hardcoding remote module URLs in configuration.

```typescript
// DON'T DO THIS
// rspack.config.mjs
new ModuleFederationPlugin({
  remotes: {
    hello_remote: 'hello_remote@http://localhost:9003/remoteEntry.js',
  },
});
```

**Why It's Bad**:
- Different URLs for dev/staging/prod
- Can't deploy to different environments
- Requires config changes for each environment

**Solution**: Use environment variables.

```typescript
// DO THIS INSTEAD
const REMOTE_URL = process.env.REMOTE_HELLO_URL || 'http://localhost:9003';

new ModuleFederationPlugin({
  remotes: {
    hello_remote: `hello_remote@${REMOTE_URL}/remoteEntry.js`,
  },
});
```

---

### 13. Missing Shared Dependency Configuration

**Problem**: Not configuring shared dependencies in Module Federation.

```typescript
// DON'T DO THIS
new ModuleFederationPlugin({
  name: 'hello_remote',
  // No shared configuration
});
```

**Why It's Bad**:
- Multiple copies of React loaded
- Runtime errors from version mismatches
- Bundle size bloat

**Solution**: Configure shared dependencies properly.

```typescript
// DO THIS INSTEAD
new ModuleFederationPlugin({
  name: 'hello_remote',
  shared: {
    react: { singleton: true, eager: true, requiredVersion: '19.1.0' },
    'react-native': { singleton: true, eager: true },
    '@universal/shared-theme-context': { singleton: true, eager: true },
    // ... other shared deps
  },
});
```

---

## Testing Anti-Patterns

### 14. Testing Implementation Details

**Problem**: Testing internal implementation instead of behavior.

```typescript
// DON'T DO THIS
it('should call setState with correct value', () => {
  const setStateSpy = jest.spyOn(React, 'useState');
  render(<Counter />);

  fireEvent.click(screen.getByRole('button'));

  expect(setStateSpy).toHaveBeenCalledWith(1);  // Implementation detail
});
```

**Why It's Bad**:
- Brittle tests that break on refactor
- Tests internal state management
- Doesn't test actual behavior

**Solution**: Test behavior from user perspective.

```typescript
// DO THIS INSTEAD
it('should increment count when button is clicked', () => {
  render(<Counter />);

  fireEvent.click(screen.getByRole('button'));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

---

### 15. Missing Provider Wrappers in Tests

**Problem**: Testing components without their required context providers.

```typescript
// DON'T DO THIS
it('should render greeting', () => {
  // Missing ThemeProvider, I18nProvider, etc.
  render(<HelloUniversal name="World" />);
});
```

**Why It's Bad**:
- Tests fail due to missing context
- Doesn't test real component behavior
- False negatives

**Solution**: Always wrap with full provider stack.

```typescript
// DO THIS INSTEAD
function TestWrapper({ children }) {
  return (
    <I18nProvider translations={locales} initialLocale="en">
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </I18nProvider>
  );
}

it('should render greeting', () => {
  render(<HelloUniversal name="World" />, { wrapper: TestWrapper });
});
```

---

## Dependency Anti-Patterns

### 16. Version Ranges in Dependencies

**Problem**: Using version ranges (`^`, `~`) for critical dependencies.

```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-native": "~0.80.0"
  }
}
```

**Why It's Bad**:
- Different versions across environments
- Module Federation version mismatches
- Unpredictable runtime behavior

**Solution**: Use exact versions.

```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-native": "0.80.0"
  }
}
```

---

## Summary Checklist

Before submitting code, verify:

- [ ] No direct imports between MFE packages
- [ ] No DOM elements in shared packages
- [ ] No browser globals in shared packages
- [ ] No router imports in remote MFEs
- [ ] Using semantic tokens, not primitives
- [ ] All user-facing strings use translations
- [ ] Translations use namespaced keys
- [ ] Styles are memoized with `useMemo`
- [ ] Zustand selectors used for specific state
- [ ] Remote URLs from environment variables
- [ ] Shared dependencies configured in MF
- [ ] Tests wrap components with providers
- [ ] Exact versions for all dependencies

## Architecture Enforcement

These rules are automatically enforced by ESLint:

| Rule | Enforces |
|------|----------|
| `architecture/no-cross-mfe-imports` | No direct MFE-to-MFE imports |
| `architecture/no-dom-in-shared` | No DOM elements in shared packages |

Run `yarn lint:architecture` to check for violations.
