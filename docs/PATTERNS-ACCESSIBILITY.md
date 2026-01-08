# Accessibility Patterns

This document describes the accessibility (a11y) architecture and patterns in the Universal MFE Platform.

## Overview

The platform provides a comprehensive accessibility framework in `@universal/shared-a11y` that:

- Works identically across Web, iOS, and Android
- Uses React Native's built-in accessibility APIs
- Provides WCAG 2.1 AA compliant components
- Includes custom Jest matchers for testing

## Accessibility Hooks

### useAccessibilityInfo

Detect and monitor platform accessibility settings:

```typescript
import { useAccessibilityInfo } from '@universal/shared-a11y';

function MyComponent() {
  const {
    isScreenReaderEnabled,  // VoiceOver (iOS) / TalkBack (Android)
    isReduceMotionEnabled,  // prefers-reduced-motion
    isBoldTextEnabled,      // iOS only
    isGrayscaleEnabled,     // Android only
    isInvertColorsEnabled,  // iOS only
  } = useAccessibilityInfo();

  return (
    <View>
      {isScreenReaderEnabled && (
        <Text>Screen reader is active</Text>
      )}
      {!isReduceMotionEnabled && (
        <AnimatedComponent />
      )}
    </View>
  );
}
```

#### Convenience Shortcuts

```typescript
import { useScreenReader, useReduceMotion } from '@universal/shared-a11y';

function MyComponent() {
  const isScreenReaderOn = useScreenReader();
  const prefersReducedMotion = useReduceMotion();

  // Conditionally show/hide based on a11y settings
}
```

### useFocusManagement

Programmatic focus control for modals, dialogs, and custom interactions:

```typescript
import { useFocusManagement } from '@universal/shared-a11y';

function Modal({ isOpen, onClose }) {
  const closeButtonRef = useRef(null);
  const { setFocus, saveFocus, restoreFocus } = useFocusManagement();

  useEffect(() => {
    if (isOpen) {
      saveFocus();  // Save current focus
      setFocus(closeButtonRef);  // Focus close button
    } else {
      restoreFocus();  // Restore previous focus
    }
  }, [isOpen]);

  return (
    <View>
      <Pressable ref={closeButtonRef} onPress={onClose}>
        <Text>Close</Text>
      </Pressable>
    </View>
  );
}
```

#### Derived Hooks

```typescript
import { useFocusOnMount, useFocusTrap } from '@universal/shared-a11y';

function Dialog({ children }) {
  const containerRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Auto-focus close button on mount
  useFocusOnMount(closeButtonRef, true);

  // Trap Tab key within dialog (web only)
  useFocusTrap(containerRef, true);

  return (
    <View ref={containerRef}>
      <Pressable ref={closeButtonRef}>Close</Pressable>
      {children}
    </View>
  );
}
```

### useAnnounce

Screen reader announcements with priority levels:

```typescript
import { useAnnounce } from '@universal/shared-a11y';

function ActionButton() {
  const { announce, announcePolite, announceAssertive } = useAnnounce();

  const handleSuccess = () => {
    // Polite: Waits for current speech to finish
    announcePolite('Item saved successfully');
  };

  const handleError = () => {
    // Assertive: Interrupts current speech (use sparingly)
    announceAssertive('Error: Failed to save item');
  };

  const handleCustom = () => {
    // Default is polite
    announce('Custom message', 'polite');
  };

  return (
    <Pressable onPress={handleSuccess}>
      <Text>Save</Text>
    </Pressable>
  );
}
```

#### useAnnounceResult

Convenience wrapper for async operations:

```typescript
import { useAnnounceResult } from '@universal/shared-a11y';

function SaveButton() {
  const announceResult = useAnnounceResult();

  const handleSave = async () => {
    try {
      await saveData();
      announceResult.success('Data saved successfully');
    } catch (error) {
      announceResult.error('Failed to save data');
    }
  };

  return (
    <Pressable onPress={handleSave}>
      <Text>Save</Text>
    </Pressable>
  );
}
```

## Accessible Components

### AccessibleText

Semantic text with proper ARIA roles:

```typescript
import { AccessibleText } from '@universal/shared-a11y';

function Page() {
  return (
    <View>
      {/* Heading with level */}
      <AccessibleText role="header" headingLevel={1}>
        Page Title
      </AccessibleText>

      {/* Regular text */}
      <AccessibleText role="text">
        Regular paragraph content
      </AccessibleText>

      {/* Alert (announces assertively) */}
      <AccessibleText role="alert">
        Error: Something went wrong
      </AccessibleText>

      {/* Summary */}
      <AccessibleText role="summary">
        3 items in cart
      </AccessibleText>

      {/* Dynamic announcements */}
      <AccessibleText role="text" announceChanges>
        {`Count: ${count}`}
      </AccessibleText>
    </View>
  );
}
```

### AccessibleButton

WCAG-compliant button with 44x44px minimum touch target:

```typescript
import { AccessibleButton } from '@universal/shared-a11y';

function Actions() {
  return (
    <View>
      {/* Basic button */}
      <AccessibleButton
        label="Submit"
        onPress={handleSubmit}
      />

      {/* With accessibility hint */}
      <AccessibleButton
        label="Delete"
        accessibilityHint="Removes item permanently"
        onPress={handleDelete}
      />

      {/* Loading state */}
      <AccessibleButton
        label="Save"
        loading={isSaving}
        loadingLabel="Saving..."
        onPress={handleSave}
      />

      {/* Disabled state */}
      <AccessibleButton
        label="Continue"
        disabled={!isValid}
        onPress={handleContinue}
      />

      {/* Selected state (toggle) */}
      <AccessibleButton
        label="Favorite"
        selected={isFavorite}
        onPress={toggleFavorite}
      />
    </View>
  );
}
```

### AccessibleInput

Form input with associated label and error handling:

```typescript
import { AccessibleInput } from '@universal/shared-a11y';

function Form() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  return (
    <View>
      {/* Basic input with visible label */}
      <AccessibleInput
        label="Email"
        value={email}
        onChangeText={setEmail}
      />

      {/* Hidden label (for icon-only inputs) */}
      <AccessibleInput
        label="Search"
        labelHidden
        value={query}
        onChangeText={setQuery}
      />

      {/* With hint */}
      <AccessibleInput
        label="Password"
        hint="Must be at least 8 characters"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* With error (announces assertively) */}
      <AccessibleInput
        label="Email"
        value={email}
        error={error}
        onChangeText={setEmail}
      />

      {/* Required field */}
      <AccessibleInput
        label="Name"
        required
        value={name}
        onChangeText={setName}
      />
    </View>
  );
}
```

### SkipLink

Skip navigation to main content (WCAG 2.4.1):

```typescript
import { SkipLink } from '@universal/shared-a11y';

function App() {
  const mainContentRef = useRef(null);

  return (
    <View>
      {/* Visually hidden until focused */}
      <SkipLink
        label="Skip to main content"
        targetRef={mainContentRef}
      />

      <Header />

      <View ref={mainContentRef}>
        <MainContent />
      </View>
    </View>
  );
}
```

### VisuallyHidden

Content visible to screen readers but hidden visually:

```typescript
import { VisuallyHidden, visuallyHiddenStyle } from '@universal/shared-a11y';

function IconButton({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <Icon name={icon} />
      {/* Screen reader sees the label, sighted users see only icon */}
      <VisuallyHidden>
        <Text>{label}</Text>
      </VisuallyHidden>
    </Pressable>
  );
}

// Or use the style directly
function StatusIndicator({ isOnline }) {
  return (
    <View>
      <View style={[styles.dot, isOnline && styles.online]} />
      <Text style={visuallyHiddenStyle}>
        {isOnline ? 'Online' : 'Offline'}
      </Text>
    </View>
  );
}
```

## Accessibility Constants

### ARIA Roles

```typescript
import { A11yRoles } from '@universal/shared-a11y';

// Interactive
A11yRoles.BUTTON
A11yRoles.LINK
A11yRoles.CHECKBOX
A11yRoles.RADIO
A11yRoles.SWITCH
A11yRoles.SLIDER
A11yRoles.COMBOBOX
A11yRoles.MENU
A11yRoles.TAB

// Text & Content
A11yRoles.HEADER
A11yRoles.TEXT
A11yRoles.ALERT
A11yRoles.SUMMARY

// Navigation
A11yRoles.NAVIGATION
A11yRoles.LIST
A11yRoles.TOOLBAR

// Media
A11yRoles.IMAGE
A11yRoles.IMAGEBUTTON

// Status
A11yRoles.PROGRESSBAR
A11yRoles.TIMER
```

### Accessibility States

```typescript
import { A11yStates } from '@universal/shared-a11y';

A11yStates.SELECTED / A11yStates.NOT_SELECTED
A11yStates.DISABLED / A11yStates.ENABLED
A11yStates.CHECKED / A11yStates.UNCHECKED / A11yStates.MIXED
A11yStates.EXPANDED / A11yStates.COLLAPSED
A11yStates.BUSY / A11yStates.NOT_BUSY
```

### Common Labels

```typescript
import { A11yLabels } from '@universal/shared-a11y';

// Navigation
A11yLabels.BACK
A11yLabels.CLOSE
A11yLabels.MENU
A11yLabels.SEARCH
A11yLabels.HOME
A11yLabels.SETTINGS

// Actions
A11yLabels.SUBMIT
A11yLabels.CANCEL
A11yLabels.SAVE
A11yLabels.DELETE
A11yLabels.EDIT
A11yLabels.ADD
A11yLabels.REMOVE
A11yLabels.REFRESH
A11yLabels.RETRY

// Helper functions
A11yLabels.format('Delete', 'item 5')  // "Delete, item 5"
A11yLabels.forAction('Delete', 'photo')  // "Delete photo"
A11yLabels.forCount(3, 'item')  // "3 items"
A11yLabels.forCount(1, 'item')  // "1 item"
```

### Hint Patterns

```typescript
import { A11yHints } from '@universal/shared-a11y';

// Touch/Interaction
A11yHints.DOUBLE_TAP_TO_ACTIVATE
A11yHints.SWIPE_TO_DELETE
A11yHints.SWIPE_TO_DISMISS

// Form
A11yHints.ENTER_TEXT
A11yHints.SELECT_OPTION
A11yHints.ADJUST_VALUE

// Navigation
A11yHints.OPENS_NEW_SCREEN
A11yHints.OPENS_DIALOG
A11yHints.OPENS_MENU
A11yHints.OPENS_LINK

// Custom
A11yHints.custom('Swipe left to archive')
```

### WCAG Constants

```typescript
import {
  A11Y_MIN_TOUCH_TARGET,
  A11Y_CONTRAST_RATIOS,
} from '@universal/shared-a11y';

// Minimum touch target size (WCAG 2.1 AA)
A11Y_MIN_TOUCH_TARGET  // 44 pixels

// Contrast ratio requirements
A11Y_CONTRAST_RATIOS.normalText  // 4.5:1
A11Y_CONTRAST_RATIOS.largeText   // 3:1
A11Y_CONTRAST_RATIOS.uiComponents  // 3:1
```

## Using Constants in Components

```typescript
import {
  A11yRoles,
  A11Y_MIN_TOUCH_TARGET,
} from '@universal/shared-a11y';

function CustomButton({ label, onPress }) {
  return (
    <Pressable
      accessibilityRole={A11yRoles.BUTTON}
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        minHeight: A11Y_MIN_TOUCH_TARGET,
        minWidth: A11Y_MIN_TOUCH_TARGET,
      }}
    >
      <Text>{label}</Text>
    </Pressable>
  );
}
```

## Testing Accessibility

### Custom Jest Matchers

```typescript
// In test setup
import { extendExpectWithA11yMatchers } from '@universal/shared-a11y/testing';
extendExpectWithA11yMatchers();

// In tests
describe('MyButton', () => {
  it('should have proper accessibility', () => {
    render(<MyButton label="Submit" />);
    const button = screen.getByRole('button');

    // Check role
    expect(button).toHaveAccessibilityRole('button');

    // Check label
    expect(button).toHaveAccessibilityLabel('Submit');

    // Partial label match
    expect(button).toHaveAccessibilityLabel('Sub', { exact: false });

    // Check hint
    expect(button).toHaveAccessibilityHint('Submits the form');

    // Check state
    expect(button).toHaveAccessibilityState({ disabled: false });

    // Check value (for sliders, progress bars)
    expect(slider).toHaveAccessibilityValue({ now: 50, min: 0, max: 100 });

    // Basic a11y check
    expect(button).toBeAccessible();

    // Touch target size
    expect(button).toHaveMinimumTouchTarget();
    expect(button).toHaveMinimumTouchTarget(48);  // Custom size
  });
});
```

### Testing Screen Reader Announcements

```typescript
describe('Form validation', () => {
  it('should announce errors to screen readers', async () => {
    const { getByLabelText } = render(<Form />);

    const input = getByLabelText('Email');
    fireEvent.changeText(input, 'invalid');
    fireEvent.blur(input);

    // Error should be announced assertively
    await waitFor(() => {
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent('Invalid email');
    });
  });
});
```

## Platform-Specific Behavior

### Web Platform

- Uses ARIA live regions for announcements
- `aria-live="polite"` or `aria-live="assertive"`
- `role="status"` for status messages
- Visually hidden container positioned off-screen

### iOS Platform

- Uses `AccessibilityInfo` API
- VoiceOver integration
- Platform-specific events: `boldTextChanged`, `invertColorsChanged`

### Android Platform

- Uses `AccessibilityInfo` API
- TalkBack integration
- Platform-specific events: `grayscaleChanged`

## Architecture Exception

The `shared-a11y` package has a documented exception in ESLint rules because:
- It requires DOM APIs for web platform accessibility (ARIA live regions)
- This is necessary for proper screen reader support on web
- The exception is documented in `eslint-rules/no-dom-in-shared.js`

## Best Practices

1. **Always provide labels**: Every interactive element needs an `accessibilityLabel`
2. **Use semantic roles**: Help screen readers understand element purpose
3. **Announce dynamic content**: Use live regions for content that changes
4. **Respect user preferences**: Check `isReduceMotionEnabled` before animations
5. **44x44px touch targets**: Ensure all interactive elements meet minimum size
6. **Test with screen readers**: Manually verify with VoiceOver/TalkBack
7. **Use constants**: Leverage `A11yRoles`, `A11yLabels`, `A11yHints` for consistency

## File Locations

| Component | Path |
|-----------|------|
| Hooks | `packages/shared-a11y/src/hooks/` |
| Components | `packages/shared-a11y/src/components/` |
| Constants | `packages/shared-a11y/src/constants.ts` |
| Testing utilities | `packages/shared-a11y/src/testing/` |
| Main export | `packages/shared-a11y/src/index.ts` |
