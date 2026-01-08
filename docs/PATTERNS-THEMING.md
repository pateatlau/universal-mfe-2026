# Theming Patterns

This document describes the theming architecture and patterns in the Universal MFE Platform.

## Overview

The theming system uses a two-tier token architecture:

1. **Primitive Tokens**: Raw design values (colors, spacing, typography)
2. **Semantic Tokens**: Meaningful, contextual groupings (surface, text, interactive)

This separation enables:
- Consistent visual language across all platforms
- Easy theme switching (light/dark mode)
- Type-safe styling with full TypeScript support

## Package Structure

```text
packages/shared-design-tokens/src/
├── primitives/
│   ├── colors.ts      # Color palette (blue, gray, green, yellow, red)
│   ├── spacing.ts     # 4px-based spacing scale
│   ├── typography.ts  # Font sizes, weights, line heights
│   └── shadows.ts     # Platform-aware shadow definitions
├── semantic/
│   ├── colors.ts      # Surface, text, border, interactive tokens
│   └── spacing.ts     # Layout, component, element spacing
└── themes.ts          # Light and dark theme composition

packages/shared-theme-context/src/
├── ThemeProvider.tsx  # React context provider with persistence
├── useTheme.ts        # Hooks for theme access
└── index.ts           # Public exports
```

## Primitive Tokens

### Color Palette

```typescript
// packages/shared-design-tokens/src/primitives/colors.ts
export const colors = {
  // Primary brand color
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Neutrals
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Status colors
  green: { /* success shades */ },
  yellow: { /* warning shades */ },
  red: { /* error shades */ },

  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;
```

### Spacing Scale

```typescript
// packages/shared-design-tokens/src/primitives/spacing.ts
// 4px base unit
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;
```

### Typography

```typescript
// packages/shared-design-tokens/src/primitives/typography.ts
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
} as const;
```

## Semantic Tokens

### Surface Colors

```typescript
// packages/shared-design-tokens/src/semantic/colors.ts
export interface SemanticColors {
  surface: {
    background: string;    // Main app background
    foreground: string;    // Content on background
    primary: string;       // Primary surface color
    secondary: string;     // Secondary surface
    tertiary: string;      // Tertiary surface
    card: string;          // Card backgrounds
    elevated: string;      // Elevated surfaces
    overlay: string;       // Modal/overlay background
  };

  text: {
    primary: string;       // Main text
    secondary: string;     // Secondary text
    tertiary: string;      // Muted text
    disabled: string;      // Disabled text
    inverse: string;       // Text on dark backgrounds
    link: string;          // Link text
  };

  border: {
    default: string;
    subtle: string;
    strong: string;
    focus: string;
  };

  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;
    disabled: string;
  };

  status: {
    success: string;
    successBackground: string;
    warning: string;
    warningBackground: string;
    error: string;
    errorBackground: string;
    info: string;
    infoBackground: string;
  };

  icon: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
}
```

### Light Theme Colors

```typescript
export const lightColors: SemanticColors = {
  surface: {
    background: colors.gray[50],
    foreground: colors.white,
    primary: colors.white,
    secondary: colors.gray[100],
    tertiary: colors.gray[200],
    card: colors.white,
    elevated: colors.white,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    tertiary: colors.gray[500],
    disabled: colors.gray[400],
    inverse: colors.white,
    link: colors.blue[600],
  },

  interactive: {
    primary: colors.blue[600],
    primaryHover: colors.blue[700],
    primaryActive: colors.blue[800],
    // ...
  },
  // ...
};
```

### Dark Theme Colors

```typescript
export const darkColors: SemanticColors = {
  surface: {
    background: colors.gray[900],
    foreground: colors.gray[800],
    primary: colors.gray[800],
    secondary: colors.gray[700],
    tertiary: colors.gray[600],
    card: colors.gray[800],
    elevated: colors.gray[700],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  text: {
    primary: colors.gray[50],
    secondary: colors.gray[300],
    tertiary: colors.gray[400],
    disabled: colors.gray[500],
    inverse: colors.gray[900],
    link: colors.blue[400],
  },

  interactive: {
    primary: colors.blue[400],
    primaryHover: colors.blue[300],
    primaryActive: colors.blue[200],
    // ...
  },
  // ...
};
```

## Theme Composition

```typescript
// packages/shared-design-tokens/src/themes.ts
export interface Theme {
  colors: SemanticColors;
  spacing: SemanticSpacing;
  typography: typeof typography;
  shadows: typeof shadows;
}

export const lightTheme: Theme = {
  colors: lightColors,
  spacing: semanticSpacing,
  typography,
  shadows,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing: semanticSpacing,
  typography,
  shadows,
};

export type ThemeName = 'light' | 'dark';

export const themes: Record<ThemeName, Theme> = {
  light: lightTheme,
  dark: darkTheme,
};
```

## ThemeProvider

### Provider Implementation

```typescript
// packages/shared-theme-context/src/ThemeProvider.tsx
import { createContext, useState, useEffect, useCallback } from 'react';
import { themes, Theme, ThemeName } from '@universal/shared-design-tokens';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (themeName: ThemeName) => void;
}

const STORAGE_KEY = '@universal/theme';

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  onThemeChange,
}: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);

  // Load persisted theme on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'light' || stored === 'dark')) {
      setThemeName(stored);
    }
  }, []);

  // Persist theme changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, themeName);
  }, [themeName]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setThemeName(e.newValue as ThemeName);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeName((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      onThemeChange?.(next);
      return next;
    });
  }, [onThemeChange]);

  const setTheme = useCallback(
    (name: ThemeName) => {
      setThemeName(name);
      onThemeChange?.(name);
    },
    [onThemeChange]
  );

  const value: ThemeContextValue = {
    theme: themes[themeName],
    themeName,
    isDark: themeName === 'dark',
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## Theme Hooks

### useTheme

Full access to theme context:

```typescript
import { useTheme } from '@universal/shared-theme-context';

function MyComponent() {
  const { theme, themeName, isDark, toggleTheme, setTheme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.surface.background }}>
      <Text style={{ color: theme.colors.text.primary }}>
        Current theme: {themeName}
      </Text>
      <Pressable onPress={toggleTheme}>
        <Text>{isDark ? '☀️' : '🌙'}</Text>
      </Pressable>
    </View>
  );
}
```

### Convenience Hooks

```typescript
// Just the theme object
const theme = useThemeTokens();

// Just colors
const colors = useThemeColors();

// Just spacing
const spacing = useThemeSpacing();
```

## Styling Pattern

### Create Styles with Theme

```typescript
import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme, Theme } from '@universal/shared-theme-context';

interface Styles {
  container: ViewStyle;
  title: TextStyle;
  card: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface.background,
      padding: theme.spacing.layout.screenPadding,
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSizes.xl,
      fontWeight: theme.typography.fontWeights.bold,
      marginBottom: theme.spacing.component.gap,
    },
    card: {
      backgroundColor: theme.colors.surface.card,
      borderRadius: 8,
      padding: theme.spacing.component.padding,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
    button: {
      backgroundColor: theme.colors.interactive.primary,
      paddingVertical: theme.spacing.button.paddingVertical,
      paddingHorizontal: theme.spacing.button.paddingHorizontal,
      borderRadius: 6,
    },
    buttonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.fontSizes.base,
      fontWeight: theme.typography.fontWeights.semibold,
      textAlign: 'center',
    },
  });
}

export function MyComponent() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <View style={styles.card}>
        <Text>Card content</Text>
      </View>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Action</Text>
      </Pressable>
    </View>
  );
}
```

## Theme Synchronization Across MFEs

### Host Broadcasts Theme Changes

```typescript
// packages/web-shell/src/App.tsx
import { useEventBus, ThemeEventTypes } from '@universal/shared-event-bus';
import { ThemeProvider } from '@universal/shared-theme-context';

function App() {
  const bus = useEventBus();

  const handleThemeChange = useCallback(
    (newTheme: ThemeName) => {
      bus.emit(ThemeEventTypes.THEME_CHANGED, {
        theme: newTheme,
        previousTheme: themeName,
      });
    },
    [bus, themeName]
  );

  return (
    <ThemeProvider onThemeChange={handleThemeChange}>
      <AppContent />
    </ThemeProvider>
  );
}
```

### Remote Listens for Theme Changes

```typescript
// packages/web-remote-hello/src/HelloRemote.tsx
import { useEventListener, ThemeEventTypes } from '@universal/shared-event-bus';
import { ThemeProvider, ThemeName } from '@universal/shared-theme-context';

function HelloRemote({ theme: initialTheme }: HelloRemoteProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(initialTheme ?? 'light');

  // Listen for theme changes from host
  useEventListener(ThemeEventTypes.THEME_CHANGED, (event) => {
    setCurrentTheme(event.payload.theme);
  });

  return (
    <ThemeProvider defaultTheme={currentTheme}>
      <HelloUniversal name="World" />
    </ThemeProvider>
  );
}
```

## Testing Themes

```typescript
// packages/shared-theme-context/src/__tests__/ThemeProvider.test.tsx
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../';

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should default to light theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    expect(result.current.themeName).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.themeName).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('should persist theme to localStorage', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(localStorage.getItem('@universal/theme')).toBe('dark');
  });

  it('should provide correct colors for each theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider,
    });

    // Light theme colors
    expect(result.current.theme.colors.surface.background).toBe('#F9FAFB');

    act(() => {
      result.current.setTheme('dark');
    });

    // Dark theme colors
    expect(result.current.theme.colors.surface.background).toBe('#111827');
  });
});
```

## Key Principles

1. **Two-Tier Tokens**: Primitives for raw values, semantics for meaning
2. **Platform Agnostic**: Works identically on web and mobile
3. **Performance**: Styles memoized with `useMemo` to prevent re-renders
4. **Type Safety**: Full TypeScript types for all tokens
5. **Persistence**: Theme preference survives page reloads
6. **Cross-Tab Sync**: Theme changes sync across browser tabs
7. **MFE Sync**: Event bus broadcasts theme changes to remotes

## WCAG Compliance

The semantic color tokens are designed for WCAG 2.1 AA compliance:

- **Text on backgrounds**: 4.5:1 contrast ratio minimum
- **Large text**: 3:1 contrast ratio minimum
- **UI components**: 3:1 contrast ratio minimum

Always use semantic tokens rather than primitive tokens in components to ensure accessibility.

## File Locations

| Component | Path |
|-----------|------|
| Primitive tokens | `packages/shared-design-tokens/src/primitives/` |
| Semantic tokens | `packages/shared-design-tokens/src/semantic/` |
| Theme composition | `packages/shared-design-tokens/src/themes.ts` |
| ThemeProvider | `packages/shared-theme-context/src/ThemeProvider.tsx` |
| Theme hooks | `packages/shared-theme-context/src/useTheme.ts` |
| Tests | `packages/shared-theme-context/src/__tests__/` |
