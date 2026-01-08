# Internationalization (i18n) Patterns

This document describes the internationalization architecture and patterns in the Universal MFE Platform.

## Overview

The platform implements a custom, zero-dependency i18n system in `@universal/shared-i18n` that:

- Works identically across Web, iOS, and Android
- Uses TypeScript for type-safe translations
- Supports namespace isolation for MFEs
- Leverages browser/RN `Intl` API for formatting

## Package Structure

```
packages/shared-i18n/src/
├── context/
│   ├── I18nContext.tsx      # React context
│   └── I18nProvider.tsx     # Provider component
├── hooks/
│   ├── useTranslation.ts    # Translation hook
│   └── useLocale.ts         # Locale management hook
├── locales/
│   ├── en.ts                # English translations
│   ├── es.ts                # Spanish translations
│   └── index.ts             # Locale exports
├── utils/
│   ├── interpolation.ts     # Variable substitution
│   ├── pluralization.ts     # Plural forms
│   ├── formatting.ts        # Date, number, currency
│   ├── detection.ts         # Platform locale detection
│   └── storage.ts           # Locale persistence
└── index.ts                 # Public exports
```

## Translation Structure

### Namespace Organization

```typescript
// packages/shared-i18n/src/locales/en.ts
export const en = {
  // Host-owned namespaces
  common: {
    appName: 'Universal MFE',
    buttons: {
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
    },
    navigation: {
      home: 'Home',
      settings: 'Settings',
      back: 'Back',
    },
  },

  // MFE-owned namespaces
  hello: {
    greeting: 'Hello, {{name}}!',
    pressCount: {
      zero: 'Not pressed yet',
      one: 'Pressed {{count}} time',
      other: 'Pressed {{count}} times',
    },
  },

  // Feature namespaces
  errors: {
    networkError: 'Network error. Please try again.',
    remoteLoadFailed: 'Failed to load {{moduleName}}',
  },

  accessibility: {
    toggleTheme: 'Toggle theme',
    toggleLanguage: 'Toggle language',
  },
};
```

### Namespace Ownership

| Namespace | Owner | Purpose |
|-----------|-------|---------|
| `common.*` | Host | Shared UI strings |
| `navigation.*` | Host | Navigation labels |
| `errors.*` | Host | Error messages |
| `accessibility.*` | Host | A11y labels |
| `hello.*` | HelloRemote MFE | MFE-specific strings |

## I18nProvider

### Basic Setup

```typescript
import { I18nProvider, locales } from '@universal/shared-i18n';

function App() {
  return (
    <I18nProvider
      translations={locales}
      initialLocale="en"
      onLocaleChange={(locale) => {
        // Persist preference, emit event, etc.
      }}
    >
      <AppContent />
    </I18nProvider>
  );
}
```

### With Event Bus Sync

```typescript
import { I18nProvider, locales } from '@universal/shared-i18n';
import { useEventBus, LocaleEventTypes } from '@universal/shared-event-bus';

function App() {
  const bus = useEventBus();
  const [locale, setLocale] = useState('en');

  const handleLocaleChange = useCallback(
    (newLocale: string) => {
      setLocale(newLocale);
      bus.emit(LocaleEventTypes.LOCALE_CHANGED, {
        locale: newLocale,
        previousLocale: locale,
      });
    },
    [bus, locale]
  );

  return (
    <I18nProvider
      translations={locales}
      initialLocale={locale}
      onLocaleChange={handleLocaleChange}
    >
      <AppContent />
    </I18nProvider>
  );
}
```

## useTranslation Hook

### Basic Usage

```typescript
import { useTranslation } from '@universal/shared-i18n';

function MyComponent() {
  const { t, exists, locale, isLoading } = useTranslation('common');

  return (
    <View>
      <Text>{t('appName')}</Text>
      <Text>{t('buttons.save')}</Text>
      <Text>{t('navigation.home')}</Text>
    </View>
  );
}
```

### With Interpolation

```typescript
function Greeting({ name }) {
  const { t } = useTranslation('hello');

  // Translation: "Hello, {{name}}!"
  return <Text>{t('greeting', { params: { name } })}</Text>;
}
```

### With Pluralization

```typescript
function PressCount({ count }) {
  const { t } = useTranslation('hello');

  // Uses plural rules:
  // zero: "Not pressed yet"
  // one: "Pressed 1 time"
  // other: "Pressed 5 times"
  return <Text>{t('pressCount', { count })}</Text>;
}
```

### With Fallback

```typescript
function MaybeTranslated({ key }) {
  const { t, exists } = useTranslation('common');

  // Check if key exists
  if (!exists(key)) {
    return <Text>Key not found</Text>;
  }

  // Or use fallback
  return <Text>{t(key, { defaultValue: 'Fallback text' })}</Text>;
}
```

### Type-Safe Translations

```typescript
import { createTypedT } from '@universal/shared-i18n';

type HelloKeys = 'greeting' | 'pressCount' | 'buttonLabel';

function HelloComponent() {
  const { t } = useTranslation('hello');
  const typedT = createTypedT<HelloKeys>(t);

  // Type error if key doesn't exist
  return <Text>{typedT('greeting')}</Text>;
}
```

## useLocale Hook

### Locale Management

```typescript
import { useLocale } from '@universal/shared-i18n';

function LanguageSelector() {
  const {
    locale,           // Current locale code
    setLocale,        // Change locale
    localeName,       // Display name ("English", "Español")
    supportedLocales, // Array of { code, name }
    isSupported,      // Check if locale is supported
    isRTL,            // Right-to-left detection
    isLoading,        // Loading state
  } = useLocale();

  return (
    <View>
      <Text>Current: {localeName}</Text>

      {supportedLocales.map(({ code, name }) => (
        <Pressable key={code} onPress={() => setLocale(code)}>
          <Text>{name}</Text>
        </Pressable>
      ))}
    </View>
  );
}
```

### Locale Cycling

```typescript
function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  const availableLocales = ['en', 'es', 'fr'];

  const cycleLocale = () => {
    const currentIndex = availableLocales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % availableLocales.length;
    setLocale(availableLocales[nextIndex]);
  };

  return (
    <Pressable onPress={cycleLocale}>
      <Text>🌐 {locale.toUpperCase()}</Text>
    </Pressable>
  );
}
```

## Interpolation

### Template Syntax

Use `{{variableName}}` for placeholders:

```typescript
// Translation: "Hello, {{name}}! You have {{count}} messages."
t('greeting', { params: { name: 'John', count: 5 } })
// Output: "Hello, John! You have 5 messages."
```

### Utility Functions

```typescript
import {
  interpolate,
  extractVariables,
  hasInterpolation,
  validateInterpolation,
  createInterpolator,
} from '@universal/shared-i18n';

// Direct interpolation
interpolate('Hello, {{name}}!', { name: 'World' });
// "Hello, World!"

// Extract variable names
extractVariables('Hello, {{name}}! You have {{count}} items.');
// ['name', 'count']

// Check for placeholders
hasInterpolation('Hello, {{name}}!');  // true
hasInterpolation('Hello, World!');     // false

// Validate all variables provided
validateInterpolation('{{name}} has {{count}}', { name: 'John' });
// { valid: false, missing: ['count'] }

// Type-safe interpolator
const greet = createInterpolator<{ name: string }>('Hello, {{name}}!');
greet({ name: 'Alice' });  // "Hello, Alice!"
```

## Pluralization

### CLDR Plural Categories

```typescript
type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
```

### Plural Rules in Translations

```typescript
const en = {
  items: {
    zero: 'No items',
    one: '{{count}} item',
    other: '{{count}} items',
  },
  // English only needs zero, one, other
};

const ar = {
  items: {
    zero: 'لا عناصر',
    one: 'عنصر واحد',
    two: 'عنصران',
    few: '{{count}} عناصر',
    many: '{{count}} عنصرًا',
    other: '{{count}} عنصر',
  },
  // Arabic uses all six categories
};
```

### Pluralization Functions

```typescript
import {
  getPluralCategory,
  pluralize,
  formatCount,
  getOrdinalSuffix,
  formatOrdinal,
} from '@universal/shared-i18n';

// Get plural category
getPluralCategory('en', 5);   // 'other'
getPluralCategory('en', 1);   // 'one'

// Format with singular/plural
formatCount(1, 'item');       // "1 item"
formatCount(5, 'item');       // "5 items"
formatCount(3, 'child', 'children');  // "3 children"

// Ordinals (English)
getOrdinalSuffix(1, 'en');    // 'st'
getOrdinalSuffix(22, 'en');   // 'nd'
formatOrdinal(1, 'en');       // '1st'
formatOrdinal(3, 'en');       // '3rd'
```

## Formatting Functions

### Date Formatting

```typescript
import { formatDate } from '@universal/shared-i18n';

// Locale-aware formatting
formatDate(new Date(), 'en', { dateStyle: 'long' });
// "January 7, 2026"

formatDate(new Date(), 'de', { dateStyle: 'short' });
// "07.01.26"

// Custom format
formatDate(new Date(), 'en', {
  custom: { weekday: 'long', month: 'short', day: 'numeric' },
});
// "Tuesday, Jan 7"
```

### Number Formatting

```typescript
import { formatNumber } from '@universal/shared-i18n';

// Decimal numbers
formatNumber(1234567.89, 'en');    // "1,234,567.89"
formatNumber(1234567.89, 'de');    // "1.234.567,89"

// Percentages
formatNumber(0.456, 'en', { style: 'percent' });  // "46%"

// Compact notation
formatNumber(1234, 'en', { notation: 'compact' });  // "1.2K"
```

### Currency Formatting

```typescript
import { formatCurrency } from '@universal/shared-i18n';

formatCurrency(99.99, 'USD', 'en');   // "$99.99"
formatCurrency(99.99, 'EUR', 'de');   // "99,99 €"
formatCurrency(99.99, 'GBP', 'en');   // "£99.99"
```

### Relative Time Formatting

```typescript
import { formatRelativeTime, formatRelativeTimeAuto } from '@universal/shared-i18n';

formatRelativeTime(-1, 'day', 'en');   // "1 day ago"
formatRelativeTime(2, 'week', 'en');   // "in 2 weeks"

// Automatic unit selection
formatRelativeTimeAuto(new Date(Date.now() - 30000), 'en');
// "less than a minute ago"
```

### List Formatting

```typescript
import { formatList } from '@universal/shared-i18n';

formatList(['apple', 'banana', 'cherry'], 'en');
// "apple, banana, and cherry"

formatList(['apple', 'banana', 'cherry'], 'es');
// "apple, banana y cherry"
```

## Platform Locale Detection

```typescript
import {
  detectLocale,
  getPreferredLocales,
  getBestMatchingLocale,
  isDeviceRTL,
  getTextDirection,
} from '@universal/shared-i18n';

// Detect device locale
const deviceLocale = detectLocale();  // e.g., 'en'

// Get all preferred locales (ordered)
const preferred = getPreferredLocales();  // ['en-US', 'en', 'es']

// Find best match from supported locales
const match = getBestMatchingLocale(['en-US', 'en']);  // 'en'

// RTL detection
const isRTL = isDeviceRTL();          // false
const direction = getTextDirection();  // 'ltr'
```

## Locale Persistence

```typescript
import {
  configureLocaleStorage,
  saveLocale,
  loadLocale,
  clearLocale,
  loadOrDetectLocale,
} from '@universal/shared-i18n';

// Configure storage (mobile)
import AsyncStorage from '@react-native-async-storage/async-storage';

configureLocaleStorage({
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
});

// Save preference
await saveLocale('es');

// Load preference
const saved = await loadLocale();  // 'es' or null

// Clear preference
await clearLocale();

// Load or detect
const locale = await loadOrDetectLocale(detectLocale);
```

## MFE Namespace Isolation

### Problem

Multiple MFEs might use the same translation keys, causing conflicts.

### Solution

Each MFE owns a dedicated namespace:

```
Host (web-shell)
├── common.*          ← Host owns
├── navigation.*      ← Host owns
└── errors.*          ← Host owns

HelloRemote MFE
└── hello.*           ← MFE owns
```

### Translation Merging

```typescript
import { mergeTranslations } from '@universal/shared-i18n';

// Host translations
const hostTranslations = {
  en: { common: { appName: 'My App' } },
  es: { common: { appName: 'Mi App' } },
};

// MFE translations
const mfeTranslations = {
  en: { hello: { greeting: 'Hello!' } },
  es: { hello: { greeting: '¡Hola!' } },
};

// Merge for full app
const allTranslations = mergeTranslations(hostTranslations, mfeTranslations);
// {
//   en: { common: {...}, hello: {...} },
//   es: { common: {...}, hello: {...} }
// }
```

### MFE with Own Provider

```typescript
// packages/web-remote-hello/src/HelloRemote.tsx
import { I18nProvider, locales, LocaleCode } from '@universal/shared-i18n';
import { useEventListener, LocaleEventTypes } from '@universal/shared-event-bus';

function HelloRemote({ locale: initialLocale }: HelloRemoteProps) {
  const [currentLocale, setCurrentLocale] = useState<LocaleCode>(
    initialLocale ?? 'en'
  );

  // Sync with host locale changes
  useEventListener(LocaleEventTypes.LOCALE_CHANGED, (event) => {
    setCurrentLocale(event.payload.locale);
  });

  return (
    <I18nProvider
      translations={locales}
      initialLocale={currentLocale}
      onLocaleChange={setCurrentLocale}
    >
      <HelloContent />
    </I18nProvider>
  );
}
```

## RTL Support

```typescript
import { useLocale } from '@universal/shared-i18n';
import { I18nManager } from 'react-native';

function App() {
  const { isRTL, locale } = useLocale();

  useEffect(() => {
    // Update RN's RTL layout direction
    I18nManager.forceRTL(isRTL);
  }, [isRTL]);

  return (
    <View style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Content adapts to text direction */}
    </View>
  );
}
```

## Testing i18n

```typescript
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@universal/shared-i18n';

const testLocales = {
  en: { greeting: 'Hello' },
  es: { greeting: 'Hola' },
};

function renderWithI18n(ui, { locale = 'en' } = {}) {
  return render(
    <I18nProvider translations={testLocales} initialLocale={locale}>
      {ui}
    </I18nProvider>
  );
}

describe('Greeting', () => {
  it('should show English greeting', () => {
    renderWithI18n(<Greeting />, { locale: 'en' });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should show Spanish greeting', () => {
    renderWithI18n(<Greeting />, { locale: 'es' });
    expect(screen.getByText('Hola')).toBeInTheDocument();
  });
});
```

## Key Principles

1. **Namespace Isolation**: Each MFE owns its translation namespace
2. **Type Safety**: TypeScript types for all i18n APIs
3. **Platform Agnostic**: Works on Web, iOS, Android
4. **Zero Dependencies**: Uses native `Intl` API for formatting
5. **Event Sync**: Event bus keeps locale in sync across MFEs
6. **RTL Support**: Built-in right-to-left language detection
7. **Graceful Fallback**: Missing keys preserved for debugging

## File Locations

| Component | Path |
|-----------|------|
| Provider | `packages/shared-i18n/src/context/I18nProvider.tsx` |
| Hooks | `packages/shared-i18n/src/hooks/` |
| Translations | `packages/shared-i18n/src/locales/` |
| Utilities | `packages/shared-i18n/src/utils/` |
| Main export | `packages/shared-i18n/src/index.ts` |
