# ADR-013: India-First Localization Strategy

**Status**: Accepted
**Date**: 2026-01
**Decision Makers**: Platform Architecture Team

## Context

The platform needs internationalization (i18n) support. Key decisions:

1. **Which languages to support initially?**
2. **What number/date/currency formatting conventions?**
3. **Build vs buy for i18n library?**
4. **How to structure translations?**

Market considerations:
- Initial target market is India
- English is business/tech language
- Hindi is most widely spoken Indian language
- Indian number formatting uses lakhs/crores (not millions/billions)
- INR currency formatting specific

## Decision

**Implement India-first localization strategy**:

### Languages

| Language | Code | Purpose |
|----------|------|---------|
| English | `en` | Default, business language |
| Hindi | `hi` | Primary Indian language |

### Formatting Locale

Use `en-IN` (English - India) for number/date/currency formatting:

```typescript
// Number formatting
formatNumber(100000);     // "1,00,000" (lakh notation)
formatNumber(10000000);   // "1,00,00,000" (crore notation)

// Currency formatting
formatCurrency(50000);    // "₹50,000"

// Date formatting
formatDate(date);         // "30/01/2026" (DD/MM/YYYY)
```

### Zero-Dependency i18n

Build custom i18n library rather than using react-i18next or similar:

```typescript
// packages/shared-i18n/src/
const { t } = useTranslation('auth');
t('login.title');        // "Sign In" or "साइन इन करें"
t('items', { count: 5 }); // Pluralization support
```

## Consequences

### Positive

1. **Market fit**: Tailored for Indian users from day one
2. **Smaller bundle**: Custom library ~5KB vs react-i18next ~40KB
3. **Full control**: No external dependency constraints
4. **Type safety**: Full TypeScript support
5. **Extensible**: Easy to add more languages later

### Negative

1. **Limited languages**: Only 2 languages initially
2. **Maintenance burden**: Own i18n library to maintain
3. **No ecosystem**: No plugins/tooling from i18n libraries
4. **Translation management**: No built-in tooling for translators

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hindi translations incomplete | Medium | Medium | Professional translation review |
| Missing i18n features | Low | Medium | Add features as needed |
| Scaling to more languages | Medium | Medium | Designed for extensibility |

## Alternatives Considered

### Alternative 1: react-i18next

**Description**: Industry standard React i18n library.

**Rejected because**:
- 40KB+ bundle size impact
- Overkill for 2 languages
- Complex configuration
- Dependencies on i18next core

### Alternative 2: FormatJS (react-intl)

**Description**: Comprehensive i18n from Meta.

**Rejected because**:
- Larger bundle than needed
- Complex CLDR data requirements
- More features than needed
- Steeper learning curve

### Alternative 3: US/EU First

**Description**: English only, add i18n later.

**Rejected because**:
- Indian market is primary target
- Retrofitting i18n is harder than building in
- Hindi is essential for mass market
- Indian formatting needed from start

### Alternative 4: Multiple Indian Languages

**Description**: Support Hindi, Tamil, Telugu, etc.

**Rejected because**:
- Scope creep for v1
- Hindi covers largest population
- Can add more languages in v1.x
- Translation quality over quantity

## i18n Architecture

### Namespace Isolation

Each MFE/feature has its own namespace:

```typescript
const namespaces = [
  'common',     // Shared UI strings
  'auth',       // Authentication flows
  'hello',      // HelloRemote MFE
  'navigation', // Nav elements
  'errors',     // Error messages
  'a11y',       // Accessibility labels
  'datetime',   // Date/time formatting
];
```

### Translation Keys

```typescript
// en.ts
export const en = {
  auth: {
    login: {
      title: 'Sign In',
      email: 'Email',
      password: 'Password',
      submit: 'Sign In',
    },
  },
};

// hi.ts
export const hi = {
  auth: {
    login: {
      title: 'साइन इन करें',
      email: 'ईमेल',
      password: 'पासवर्ड',
      submit: 'साइन इन करें',
    },
  },
};
```

### Pluralization

Supports CLDR plural rules:

```typescript
// Hindi pluralization (one, other)
t('items', { count: 0 });  // "0 आइटम"
t('items', { count: 1 });  // "1 आइटम"
t('items', { count: 5 });  // "5 आइटम"

// Translation definition
{
  items: {
    one: '{{count}} आइटम',
    other: '{{count}} आइटम',
  }
}
```

### RTL Support

Infrastructure ready for RTL languages:

```typescript
const isRTL = i18n.isRTL(); // false for en/hi, true for ar/he
```

## Implementation

Location: `packages/shared-i18n/`

Key features:
- Device locale detection
- Locale persistence
- Event bus sync across MFEs
- Formatting utilities (date, number, currency)
- Type-safe translation keys

## References

- [CLDR Plural Rules](https://cldr.unicode.org/index/cldr-spec/plural-rules)
- [Indian Numbering System](https://en.wikipedia.org/wiki/Indian_numbering_system)
- [Hindi Unicode](https://unicode.org/charts/PDF/U0900.pdf)
