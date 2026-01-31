import type { Translations } from '../types';

/**
 * English translations for the Universal Microfrontend Platform.
 *
 * Translation structure follows namespace conventions:
 * - `common.*` - Shared strings used across the app (owned by host)
 * - `navigation.*` - Navigation-related strings (owned by host)
 * - `errors.*` - Error messages (owned by host)
 * - `hello.*` - HelloRemote MFE namespace (owned by HelloRemote)
 *
 * Pluralization keys use CLDR plural categories:
 * - `one` - Singular form (1 item)
 * - `other` - Plural form (0, 2+ items)
 * - `zero`, `two`, `few`, `many` - Optional, language-specific
 *
 * Interpolation uses double curly braces: {{variableName}}
 */
export const en: Translations = {
  common: {
    appName: 'Universal MFE',
    loading: 'Loading...',
    loadingRemote: 'Loading remote component...',
    loadRemote: 'Load Remote Component',
    subtitle: 'Dynamically loading remote component via Module Federation',
    subtitleMobile: 'Dynamically loading remote via ScriptManager + MFv2',
    error: 'An error occurred',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    clear: 'Clear',
    reset: 'Reset',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    done: 'Done',
    welcome: 'Welcome',
    welcomeUser: 'Welcome, {{name}}!',
    homeDescription: 'Explore the Universal Microfrontend Platform',
    standaloneTitle: {
      web: 'Web Remote - Standalone Mode',
      mobile: 'Mobile Remote - Standalone',
    },
    standaloneSubtitle: 'Testing remote component in isolation',
    items: {
      zero: 'No items',
      one: '{{count}} item',
      other: '{{count}} items',
    },
    pressCount: {
      zero: 'No presses yet',
      one: 'Remote button pressed {{count}} time',
      other: 'Remote button pressed {{count}} times',
    },
    selected: {
      zero: 'None selected',
      one: '{{count}} selected',
      other: '{{count}} selected',
    },
    lastUpdated: 'Last updated {{date}}',
    createdBy: 'Created by {{author}}',
    // Settings page section titles
    settings: {
      theme: 'Theme',
      language: 'Language',
    },
    // Navigation nested inside common (used via t('navigation.home') with namespace 'common')
    navigation: {
      title: 'Navigate',
      home: 'Home',
      settings: 'Settings',
      remoteHello: 'Remote Module',
      profile: 'Profile',
      help: 'Help',
      about: 'About',
      logout: 'Log out',
      login: 'Log in',
      signUp: 'Sign up',
      menu: 'Menu',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
    // Theme nested inside common (used via t('theme.light') with namespace 'common')
    theme: {
      title: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      toggle: 'Toggle theme',
      currentTheme: 'Current theme: {{theme}}',
    },
    // Language nested inside common (used via t('language.title') with namespace 'common')
    language: {
      title: 'Language',
      select: 'Select language',
      current: 'Current language: {{language}}',
      english: 'English',
      hindi: 'Hindi',
      french: 'French',
      german: 'German',
      italian: 'Italian',
      portuguese: 'Portuguese',
      chinese: 'Chinese',
      japanese: 'Japanese',
      korean: 'Korean',
      arabic: 'Arabic',
    },
  },

  // Keep root-level navigation for backward compatibility
  navigation: {
    home: 'Home',
    settings: 'Settings',
    profile: 'Profile',
    help: 'Help',
    about: 'About',
    logout: 'Log out',
    login: 'Log in',
    signUp: 'Sign up',
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },

  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    notFound: 'The requested resource was not found.',
    unauthorized: 'You are not authorized to view this content.',
    forbidden: 'Access denied.',
    serverError: 'Server error. Please try again later.',
    timeout: 'Request timed out. Please try again.',
    validation: 'Please check your input and try again.',
    required: '{{field}} is required',
    invalidEmail: 'Please enter a valid email address',
    invalidPhone: 'Please enter a valid phone number',
    passwordTooShort: 'Password must be at least {{min}} characters',
    passwordMismatch: 'Passwords do not match',
    remoteLoadFailed: 'Failed to load {{moduleName}}. Please try again.',
    remoteTimeout: '{{moduleName}} took too long to load.',
  },

  accessibility: {
    skipToMain: 'Skip to main content',
    loading: 'Loading, please wait',
    menuOpen: 'Menu is open',
    menuClosed: 'Menu is closed',
    expandedSection: '{{section}} expanded',
    collapsedSection: '{{section}} collapsed',
    selectedItem: '{{item}} selected',
    pageOf: 'Page {{current}} of {{total}}',
    resultsCount: {
      zero: 'No results found',
      one: '{{count}} result found',
      other: '{{count}} results found',
    },
  },

  theme: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    toggle: 'Toggle theme',
    currentTheme: 'Current theme: {{theme}}',
  },

  language: {
    select: 'Select language',
    current: 'Current language: {{language}}',
    english: 'English',
    hindi: 'Hindi',
    french: 'French',
    german: 'German',
    italian: 'Italian',
    portuguese: 'Portuguese',
    chinese: 'Chinese',
    japanese: 'Japanese',
    korean: 'Korean',
    arabic: 'Arabic',
  },

  // HelloRemote MFE namespace
  // In a real app, this would be in the MFE's own translation file
  // and merged via mergeTranslations()
  hello: {
    greeting: 'Hello from Remote!',
    greetingWithName: 'Hello, {{name}}!',
    clickCount: {
      zero: "You haven't clicked yet",
      one: 'You clicked {{count}} time',
      other: 'You clicked {{count}} times',
    },
    buttonLabel: 'Click me',
    buttonHint: 'Tap to increment the counter',
    description: 'This component is loaded from a remote microfrontend.',
  },

  // Authentication namespace
  auth: {
    login: {
      title: 'Sign In',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      forgotPassword: 'Forgot Password?',
      or: 'or',
      continueWithGoogle: 'Continue with Google',
      continueWithGitHub: 'Continue with GitHub',
      noAccount: "Don't have an account? Sign Up",
    },
    signup: {
      title: 'Create Account',
      displayName: 'Display Name',
      displayNamePlaceholder: 'Enter your name',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Create a password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm your password',
      signUp: 'Sign Up',
      hasAccount: 'Already have an account? Sign In',
      termsAgreement: 'I agree to the Terms of Service and Privacy Policy',
      passwordStrength: {
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong',
      },
    },
    forgotPassword: {
      title: 'Reset Password',
      description: "Enter your email and we'll send you a reset link.",
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      send: 'Send Reset Link',
      successTitle: 'Email Sent!',
      success: 'Password reset email sent! Check your inbox.',
      sentTo: 'We sent a reset link to {{email}}',
      backToLogin: 'Back to Sign In',
      tryAgain: 'Try a different email',
    },
    errors: {
      invalidEmail: 'Please enter a valid email address.',
      emailRequired: 'Email is required',
      displayNameRequired: 'Display name is required',
      weakPassword: 'Password must be at least {{min}} characters.',
      passwordMismatch: 'Passwords do not match.',
      required: 'This field is required.',
      userNotFound: 'No account found with this email.',
      wrongPassword: 'Incorrect password.',
      emailInUse: 'An account with this email already exists.',
      tooManyRequests: 'Too many attempts. Please try again later.',
      networkError: 'Network error. Please check your connection.',
      genericError: 'An error occurred. Please try again.',
    },
  },

  // Date/time formatting labels
  datetime: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    now: 'Now',
    justNow: 'Just now',
    minutesAgo: {
      one: '{{count}} minute ago',
      other: '{{count}} minutes ago',
    },
    hoursAgo: {
      one: '{{count}} hour ago',
      other: '{{count}} hours ago',
    },
    daysAgo: {
      one: '{{count}} day ago',
      other: '{{count}} days ago',
    },
    weeksAgo: {
      one: '{{count}} week ago',
      other: '{{count}} weeks ago',
    },
    monthsAgo: {
      one: '{{count}} month ago',
      other: '{{count}} months ago',
    },
    yearsAgo: {
      one: '{{count}} year ago',
      other: '{{count}} years ago',
    },
    inMinutes: {
      one: 'in {{count}} minute',
      other: 'in {{count}} minutes',
    },
    inHours: {
      one: 'in {{count}} hour',
      other: 'in {{count}} hours',
    },
    inDays: {
      one: 'in {{count}} day',
      other: 'in {{count}} days',
    },
  },
};
