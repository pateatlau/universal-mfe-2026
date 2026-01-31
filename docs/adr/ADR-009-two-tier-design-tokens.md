# ADR-009: Two-Tier Design Token Architecture

**Status**: Accepted
**Date**: 2025-12
**Decision Makers**: Platform Architecture Team

## Context

Design systems need a structured approach to colors, spacing, and typography that:

1. **Enables theming**: Support light/dark modes and future themes
2. **Ensures consistency**: Components use the same values
3. **Facilitates maintenance**: Changes propagate correctly
4. **Supports accessibility**: Contrast ratios are auditable
5. **Cross-platform**: Works with React Native StyleSheet

Options for token architecture:
- **Single tier**: Direct color values (`#3B82F6`)
- **Two tier**: Primitives + semantics (`blue.500` → `interactive.primary`)
- **Three tier**: Primitives + semantics + component-specific

## Decision

**Implement a two-tier design token architecture**:

### Tier 1: Primitive Tokens (Raw Values)

Static, theme-independent values:

```typescript
// packages/shared-design-tokens/src/primitives.ts
export const primitiveTokens = {
  colors: {
    blue: {
      50: '#EFF6FF',
      500: '#3B82F6',
      900: '#1E3A8A',
    },
    gray: {
      50: '#F9FAFB',
      900: '#111827',
    },
    // ... full palette
  },
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    // ... spacing scale
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      base: 16,
      // ... size scale
    },
  },
};
```

### Tier 2: Semantic Tokens (Contextual Meanings)

Theme-aware mappings:

```typescript
// packages/shared-design-tokens/src/themes/light.ts
export const lightTheme = {
  colors: {
    surface: {
      background: primitiveTokens.colors.white,
      foreground: primitiveTokens.colors.gray[50],
    },
    text: {
      primary: primitiveTokens.colors.gray[900],
      secondary: primitiveTokens.colors.gray[600],
    },
    interactive: {
      primary: primitiveTokens.colors.blue[500],
      primaryHover: primitiveTokens.colors.blue[600],
    },
  },
};
```

## Consequences

### Positive

1. **Theme switching**: Change semantic mappings, not component code
2. **Consistency**: Components use `text.primary`, never raw hex
3. **Auditability**: Contrast ratios checked at token level
4. **Maintainability**: Palette changes in one place
5. **Designer alignment**: Token names match design specs
6. **Scalability**: Add themes without touching components

### Negative

1. **Indirection**: Two lookups to find actual value
2. **Initial complexity**: More setup than direct values
3. **Token explosion**: Many semantic tokens needed
4. **Learning curve**: Team must understand tier distinction

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Inconsistent token usage | Medium | Medium | ESLint rule for raw colors; code review |
| Missing semantic tokens | Medium | Low | Add tokens as needed; document gaps |
| Performance overhead | Very Low | Very Low | Tokens resolved at build time |

## Alternatives Considered

### Alternative 1: Single-Tier (Direct Values)

**Description**: Use color values directly in components.

**Rejected because**:
- No theming support
- Changes require updating many files
- Inconsistency inevitable at scale
- Contrast ratios hard to audit

### Alternative 2: Three-Tier (Component Tokens)

**Description**: Add component-specific tokens (button.background).

**Rejected because**:
- Overkill for current scale
- Token explosion becomes unmanageable
- Two tiers provide sufficient abstraction
- Can add third tier later if needed

### Alternative 3: CSS Custom Properties

**Description**: Use CSS variables for theming.

**Rejected because**:
- React Native doesn't support CSS variables
- Need solution that works cross-platform
- StyleSheet API requires concrete values

## Token Categories

### Primitive Tokens

| Category | Values |
|----------|--------|
| Colors | Blue, gray, green, yellow, red (50-900 each) |
| Spacing | 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128 |
| Typography | Font sizes (12-48px), weights (400-700), line heights |
| Shadows | Platform-aware shadow definitions |
| Radii | Border radius scale |

### Semantic Token Groups

| Group | Purpose |
|-------|---------|
| `surface.*` | Background colors for containers |
| `text.*` | Text colors for content |
| `border.*` | Border and divider colors |
| `interactive.*` | Button, link, control colors |
| `status.*` | Success, warning, error, info |
| `icon.*` | Icon colors |

## Usage in Components

```typescript
// Correct: Use semantic tokens
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface.background,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSizes.lg,
  },
  button: {
    backgroundColor: theme.colors.interactive.primary,
  },
});

// Wrong: Direct primitive or raw value
const badStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF', // Never use raw hex
    backgroundColor: primitiveTokens.colors.white, // Don't use primitives
  },
});
```

## References

- [Design Tokens W3C Draft](https://design-tokens.github.io/community-group/format/)
- [Shopify Polaris Token Architecture](https://polaris.shopify.com/tokens)
- [Adobe Spectrum Design Tokens](https://spectrum.adobe.com/page/design-tokens/)
