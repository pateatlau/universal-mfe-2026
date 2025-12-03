# Design System Evolution: POC-1 → POC-2/POC-3

**Date:** 2026-01-XX  
**Status:** Architecture Decision

---

## Overview

Styling approach evolves from inline Tailwind classes in POC-1 to a full design system in POC-2/POC-3.

---

## POC-1: Inline Tailwind Classes

### Strategy

**Approach:**
- ✅ Direct inline Tailwind classes in components
- ✅ No design system component library
- ✅ Simple and fast for POC-1
- ✅ Full flexibility for rapid development

**Web:**
- Tailwind CSS v4.0+
- Inline utility classes
- Direct styling in components

**Mobile:**
- Uniwind (Tailwind v4 for React Native)
- Inline utility classes
- Direct styling in components

### Example: POC-1 Inline Classes

```typescript
// packages/web-remote-auth/src/SignIn.tsx
import { View, Text, Pressable, TextInput } from 'react-native';

function SignIn() {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4 text-gray-900">
        Sign In
      </Text>
      
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-2 mb-4"
        placeholder="Email"
      />
      
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-2 mb-4"
        placeholder="Password"
        secureTextEntry
      />
      
      <Pressable className="bg-blue-500 px-4 py-2 rounded-lg">
        <Text className="text-white font-semibold text-center">
          Sign In
        </Text>
      </Pressable>
    </View>
  );
}
```

### Pros

- ✅ Simple and fast
- ✅ No design system overhead
- ✅ Full flexibility
- ✅ Easy to prototype
- ✅ No additional dependencies

### Cons

- ⚠️ No reusable components
- ⚠️ Inconsistent styling possible
- ⚠️ Harder to maintain at scale
- ⚠️ No design tokens enforcement

---

## POC-2/POC-3: Design System (Tailwind + shadcn)

### Strategy

**Approach:**
- ✅ Design system using Tailwind + shadcn/ui (web)
- ✅ Mobile equivalent (Nativecn UI or Gluestack UI v2)
- ✅ Reusable component library
- ✅ Consistent design tokens
- ✅ Shared component patterns

**Web:**
- shadcn/ui + Tailwind CSS v4
- Copy-paste components (not npm package)
- Fully customizable
- TypeScript-first

**Mobile:**
- Nativecn UI or Gluestack UI v2 + Uniwind
- React Native components
- Tailwind-like styling
- shadcn-inspired API

### Design System Stack

| Platform | Component Library | Styling | Status |
|----------|------------------|---------|--------|
| **Web** | shadcn/ui | Tailwind CSS v4 | POC-2/POC-3 |
| **Mobile** | Nativecn UI or Gluestack UI v2 | Uniwind | POC-2/POC-3 |

### shadcn/ui (Web)

**Rationale:**
- Copy-paste components (not npm package)
- Fully customizable
- TypeScript-first
- Tailwind CSS v4 compatible
- Production-ready
- Used by major companies

**Components:**
- Button, Input, Card, Dialog, Dropdown, etc.
- Fully customizable
- Accessible by default
- Dark mode support

**Example:**
```typescript
// components/ui/button.tsx (from shadcn/ui)
import { Button } from '@/components/ui/button';

function SignIn() {
  return (
    <Button variant="default" size="lg">
      Sign In
    </Button>
  );
}
```

### Nativecn UI (Mobile - Recommended)

**Rationale:**
- Inspired by shadcn/ui
- React Native components
- Works with NativeWind/Uniwind
- Tailwind-like styling
- Dark mode support
- CLI for component initialization

**Components:**
- Avatar, Badge, Button, Card, Checkbox, Dialog, Input, Progress, Radio Group, Skeleton, Switch, Tabs, Toast, Dropdown, Select

**Example:**
```typescript
// components/ui/button.tsx (from Nativecn UI)
import { Button } from '@/components/ui/button';

function SignIn() {
  return (
    <Button variant="default" size="lg">
      Sign In
    </Button>
  );
}
```

### Gluestack UI v2 (Mobile - Alternative)

**Rationale:**
- shadcn/ui and Tailwind CSS approach for React Native
- Tailwind-like classes
- Promotes code reuse
- Consistent with web approach

**Components:**
- Similar to shadcn/ui components
- React Native optimized
- Tailwind-like styling

---

## Example: POC-2/POC-3 Design System

### Shared Component Library

```typescript
// packages/shared-ui/src/button/Button.tsx
import { Pressable, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress?: () => void;
}

export function Button({ variant = 'default', size = 'md', children, onPress }: ButtonProps) {
  return (
    <Pressable
      className={cn(
        'rounded-lg font-semibold',
        variant === 'default' && 'bg-blue-500',
        variant === 'outline' && 'border border-gray-300',
        size === 'sm' && 'px-3 py-1.5',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3'
      )}
      onPress={onPress}
    >
      <Text
        className={cn(
          variant === 'default' && 'text-white',
          variant === 'outline' && 'text-gray-900'
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}
```

### Usage in MFEs

```typescript
// packages/web-remote-auth/src/SignIn.tsx
import { Button } from '@universal/shared-ui/button';
import { Card } from '@universal/shared-ui/card';
import { Input } from '@universal/shared-ui/input';

function SignIn() {
  return (
    <Card>
      <Input placeholder="Email" />
      <Input placeholder="Password" secureTextEntry />
      <Button variant="default" size="lg">
        Sign In
      </Button>
    </Card>
  );
}
```

---

## Migration Path: POC-1 → POC-2/POC-3

### Step 1: Setup Design System Infrastructure

```bash
# Install shadcn/ui (web)
npx shadcn@latest init

# Install Nativecn UI (mobile)
npx nativecn-ui@latest init
```

### Step 2: Create Shared Component Library

```bash
# Create shared UI package
mkdir -p packages/shared-ui/src
```

### Step 3: Migrate Components

1. Identify common components (Button, Input, Card, etc.)
2. Create shared components using design system
3. Replace inline classes with component usage
4. Test on web and mobile

### Step 4: Establish Design Tokens

```typescript
// packages/shared-ui/src/tokens.ts
export const tokens = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    // ...
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    // ...
  },
  // ...
};
```

---

## Design Tokens (POC-2/POC-3)

### Color System

```typescript
// Shared color tokens
export const colors = {
  primary: {
    50: '#EFF6FF',
    500: '#007AFF',
    900: '#003A7F',
  },
  gray: {
    50: '#F9FAFB',
    500: '#6B7280',
    900: '#111827',
  },
  // ...
};
```

### Typography

```typescript
// Shared typography tokens
export const typography = {
  fontFamily: {
    sans: 'System',
    mono: 'Courier',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 24,
    // ...
  },
  // ...
};
```

### Spacing

```typescript
// Shared spacing tokens
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  // ...
};
```

---

## Benefits of Design System

### 1. Consistency

- Consistent styling across all MFEs
- Enforced design tokens
- Reusable components

### 2. Maintainability

- Single source of truth for components
- Easy to update design system
- Changes propagate automatically

### 3. Developer Experience

- Faster development (reusable components)
- Better IntelliSense
- Type-safe components

### 4. Scalability

- Easy to add new components
- Scales to complex UIs
- Production-ready

---

## Recommendations

### POC-1

- ✅ Use inline Tailwind classes
- ✅ Keep it simple and functional
- ✅ Focus on functionality, not design system

### POC-2/POC-3

- ✅ Implement design system
- ✅ Use shadcn/ui for web
- ✅ Use Nativecn UI or Gluestack UI v2 for mobile
- ✅ Create shared component library
- ✅ Establish design tokens

---

## Component Library Structure (POC-2/POC-3)

```
packages/
├── shared-ui/                    # Shared component library
│   ├── src/
│   │   ├── button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.test.tsx
│   │   ├── input/
│   │   │   ├── Input.tsx
│   │   │   └── Input.test.tsx
│   │   ├── card/
│   │   │   ├── Card.tsx
│   │   │   └── Card.test.tsx
│   │   ├── tokens.ts            # Design tokens
│   │   └── index.ts
│   └── package.json
```

---

## Summary

| Phase | Approach | Components | Design Tokens |
|-------|----------|------------|---------------|
| **POC-1** | Inline Tailwind classes | ❌ No | ⚠️ Basic |
| **POC-2/POC-3** | Design system (shadcn) | ✅ Yes | ✅ Full |

---

**Last Updated:** 2026-01-XX  
**Status:** Architecture Decision - POC-1 → POC-2/POC-3 Evolution

