import type { AccessibilityRole } from 'react-native';

/**
 * Common accessibility roles used across the application.
 * Maps to React Native's accessibilityRole prop.
 * These roles help screen readers understand the purpose of UI elements.
 */
export const A11yRoles = {
  // Interactive elements
  BUTTON: 'button' as AccessibilityRole,
  LINK: 'link' as AccessibilityRole,
  CHECKBOX: 'checkbox' as AccessibilityRole,
  RADIO: 'radio' as AccessibilityRole,
  SWITCH: 'switch' as AccessibilityRole,
  SLIDER: 'adjustable' as AccessibilityRole,
  SPINBUTTON: 'spinbutton' as AccessibilityRole,
  COMBOBOX: 'combobox' as AccessibilityRole,
  MENU: 'menu' as AccessibilityRole,
  MENUITEM: 'menuitem' as AccessibilityRole,
  MENUBAR: 'menubar' as AccessibilityRole,
  TAB: 'tab' as AccessibilityRole,
  TABLIST: 'tablist' as AccessibilityRole,

  // Text and content
  HEADER: 'header' as AccessibilityRole,
  TEXT: 'text' as AccessibilityRole,
  SUMMARY: 'summary' as AccessibilityRole,
  ALERT: 'alert' as AccessibilityRole,

  // Images and media
  IMAGE: 'image' as AccessibilityRole,
  IMAGEBUTTON: 'imagebutton' as AccessibilityRole,

  // Form elements
  SEARCH: 'search' as AccessibilityRole,

  // Navigation and structure
  NAVIGATION: 'navigation' as AccessibilityRole,
  LIST: 'list' as AccessibilityRole,
  TOOLBAR: 'toolbar' as AccessibilityRole,
  PROGRESSBAR: 'progressbar' as AccessibilityRole,
  SCROLLBAR: 'scrollbar' as AccessibilityRole,
  TIMER: 'timer' as AccessibilityRole,

  // Special
  NONE: 'none' as AccessibilityRole,
} as const;

/**
 * Common accessibility states for interactive elements.
 * Use with accessibilityState prop.
 */
export const A11yStates = {
  // Selected state
  SELECTED: { selected: true },
  NOT_SELECTED: { selected: false },

  // Disabled state
  DISABLED: { disabled: true },
  ENABLED: { disabled: false },

  // Checked state (for checkboxes, radio buttons)
  CHECKED: { checked: true },
  UNCHECKED: { checked: false },
  MIXED: { checked: 'mixed' as const },

  // Expanded state (for accordions, dropdowns)
  EXPANDED: { expanded: true },
  COLLAPSED: { expanded: false },

  // Busy state (for loading indicators)
  BUSY: { busy: true },
  NOT_BUSY: { busy: false },
} as const;

/**
 * Common accessibility actions that can be triggered.
 * Use with accessibilityActions prop.
 */
export const A11yActions = {
  // Standard actions
  ACTIVATE: { name: 'activate', label: 'Activate' },
  INCREMENT: { name: 'increment', label: 'Increment' },
  DECREMENT: { name: 'decrement', label: 'Decrement' },
  ESCAPE: { name: 'escape', label: 'Close' },
  LONG_PRESS: { name: 'longpress', label: 'Long press' },

  // Custom action helpers
  createAction: (name: string, label: string) => ({ name, label }),
} as const;

/**
 * Common accessibility label patterns.
 * Use these as templates for consistent labeling.
 */
export const A11yLabels = {
  // Navigation
  BACK: 'Go back',
  CLOSE: 'Close',
  MENU: 'Open menu',
  SEARCH: 'Search',
  HOME: 'Go to home',
  SETTINGS: 'Open settings',

  // Actions
  SUBMIT: 'Submit',
  CANCEL: 'Cancel',
  SAVE: 'Save',
  DELETE: 'Delete',
  EDIT: 'Edit',
  ADD: 'Add',
  REMOVE: 'Remove',
  REFRESH: 'Refresh',
  RETRY: 'Retry',

  // Toggle states
  TOGGLE_ON: 'Turn on',
  TOGGLE_OFF: 'Turn off',
  SHOW_MORE: 'Show more',
  SHOW_LESS: 'Show less',
  EXPAND: 'Expand',
  COLLAPSE: 'Collapse',

  // Media
  PLAY: 'Play',
  PAUSE: 'Pause',
  STOP: 'Stop',
  MUTE: 'Mute',
  UNMUTE: 'Unmute',

  // Form helpers
  REQUIRED: '(required)',
  OPTIONAL: '(optional)',
  ERROR: 'Error:',
  HELP: 'Help:',

  /**
   * Create a formatted accessibility label.
   * Combines a primary label with optional context.
   */
  format: (primary: string, context?: string): string => {
    return context ? `${primary}, ${context}` : primary;
  },

  /**
   * Create a label for a button that performs an action on an item.
   */
  forAction: (action: string, item: string): string => {
    return `${action} ${item}`;
  },

  /**
   * Create a label for a count badge.
   */
  forCount: (count: number, singular: string, plural?: string): string => {
    const label = count === 1 ? singular : (plural ?? `${singular}s`);
    return `${count} ${label}`;
  },
} as const;

/**
 * Accessibility hint patterns.
 * Hints provide additional context about what an action will do.
 */
export const A11yHints = {
  // Common hints
  DOUBLE_TAP_TO_ACTIVATE: 'Double tap to activate',
  DOUBLE_TAP_TO_TOGGLE: 'Double tap to toggle',
  DOUBLE_TAP_TO_SELECT: 'Double tap to select',
  DOUBLE_TAP_TO_EXPAND: 'Double tap to expand',
  SWIPE_TO_DELETE: 'Swipe to delete',
  SWIPE_TO_DISMISS: 'Swipe to dismiss',

  // Form hints
  ENTER_TEXT: 'Enter text',
  SELECT_OPTION: 'Select an option',
  ADJUST_VALUE: 'Swipe up or down to adjust value',

  // Navigation hints
  OPENS_NEW_SCREEN: 'Opens a new screen',
  OPENS_DIALOG: 'Opens a dialog',
  OPENS_MENU: 'Opens a menu',
  OPENS_LINK: 'Opens in browser',

  /**
   * Create a custom hint.
   */
  custom: (hint: string): string => hint,
} as const;

/**
 * Live region politeness levels.
 * Use with accessibilityLiveRegion prop.
 */
export const A11yLiveRegion = {
  /** Content changes will be announced after current speech */
  POLITE: 'polite' as const,
  /** Content changes will interrupt current speech */
  ASSERTIVE: 'assertive' as const,
  /** Content changes will not be announced */
  NONE: 'none' as const,
} as const;

/**
 * Minimum touch target size for accessibility (in pixels).
 * WCAG 2.1 AA requires 44x44 minimum.
 */
export const A11Y_MIN_TOUCH_TARGET = 44;

/**
 * Recommended minimum contrast ratios.
 * WCAG 2.1 AA requirements.
 */
export const A11Y_CONTRAST_RATIOS = {
  /** Normal text (< 18pt or < 14pt bold) */
  NORMAL_TEXT: 4.5,
  /** Large text (>= 18pt or >= 14pt bold) */
  LARGE_TEXT: 3.0,
  /** UI components and graphical objects */
  UI_COMPONENT: 3.0,
} as const;
