/**
 * @universal/shared-auth-store
 *
 * Constants for authentication store.
 */

/**
 * Storage key for persisted auth state
 */
export const AUTH_STORAGE_KEY = '@universal/auth-state';

/**
 * Storage key for auth tokens
 */
export const AUTH_TOKEN_KEY = '@universal/auth-token';

/**
 * Token refresh threshold (5 minutes before expiry)
 */
export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Token lifetime (1 hour) - Firebase ID tokens expire after 1 hour
 */
export const TOKEN_LIFETIME_MS = 60 * 60 * 1000;

/**
 * Auth event types (for event bus)
 */
export const AUTH_EVENTS = {
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
} as const;

/**
 * Auth error codes (Firebase error codes)
 */
export const AUTH_ERROR_CODES = {
  // Email/Password errors
  INVALID_EMAIL: 'auth/invalid-email',
  USER_DISABLED: 'auth/user-disabled',
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  INVALID_CREDENTIAL: 'auth/invalid-credential',
  EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',

  // Network errors
  NETWORK_ERROR: 'auth/network-request-failed',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',

  // OAuth/Popup errors
  POPUP_CLOSED: 'auth/popup-closed-by-user',
  POPUP_BLOCKED: 'auth/popup-blocked',
  CANCELLED: 'auth/cancelled',
  ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL: 'auth/account-exists-with-different-credential',

  // OAuth configuration errors
  UNAUTHORIZED_DOMAIN: 'auth/unauthorized-domain',
  OPERATION_NOT_ALLOWED: 'auth/operation-not-allowed',
  AUTH_DOMAIN_CONFIG_REQUIRED: 'auth/auth-domain-config-required',
  OPERATION_NOT_SUPPORTED: 'auth/operation-not-supported-in-this-environment',

  // App/API key errors (common in release builds)
  APP_NOT_AUTHORIZED: 'auth/app-not-authorized',
  INVALID_API_KEY: 'auth/invalid-api-key',
  API_KEY_NOT_VALID: 'auth/api-key-not-valid',

  // Token errors
  INVALID_USER_TOKEN: 'auth/invalid-user-token',
  USER_TOKEN_EXPIRED: 'auth/user-token-expired',

  // Internal errors
  INTERNAL_ERROR: 'auth/internal-error',
} as const;

/**
 * Human-readable error messages
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Email/Password errors
  [AUTH_ERROR_CODES.INVALID_EMAIL]: 'Please enter a valid email address.',
  [AUTH_ERROR_CODES.USER_DISABLED]: 'This account has been disabled.',

  // App/API key errors (common in release builds)
  [AUTH_ERROR_CODES.APP_NOT_AUTHORIZED]:
    'This app is not authorized to use Firebase Authentication. Please verify your app configuration.',
  [AUTH_ERROR_CODES.INVALID_API_KEY]:
    'Invalid API key. Please check your Firebase configuration.',
  [AUTH_ERROR_CODES.API_KEY_NOT_VALID]:
    'API key is not valid. Please check your Firebase configuration.',

  // Token errors
  [AUTH_ERROR_CODES.INVALID_USER_TOKEN]:
    'Your session is invalid. Please sign in again.',
  [AUTH_ERROR_CODES.USER_TOKEN_EXPIRED]:
    'Your session has expired. Please sign in again.',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'No account found with this email.',
  [AUTH_ERROR_CODES.WRONG_PASSWORD]:
    'Incorrect password. If you signed up with Google or GitHub, please use that method instead.',
  [AUTH_ERROR_CODES.INVALID_CREDENTIAL]:
    'Invalid email or password. If you previously signed in with Google or GitHub, please use that method instead.',
  [AUTH_ERROR_CODES.EMAIL_ALREADY_IN_USE]: 'An account already exists with this email.',
  [AUTH_ERROR_CODES.WEAK_PASSWORD]: 'Password should be at least 6 characters.',

  // Network errors
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [AUTH_ERROR_CODES.TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later.',

  // OAuth/Popup errors
  [AUTH_ERROR_CODES.POPUP_CLOSED]: 'Sign-in was cancelled.',
  [AUTH_ERROR_CODES.POPUP_BLOCKED]:
    'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.',
  [AUTH_ERROR_CODES.CANCELLED]: 'Sign-in was cancelled.',
  [AUTH_ERROR_CODES.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL]:
    'An account already exists with this email using a different sign-in method. Please sign in with your original method (Google, GitHub, or email/password).',

  // OAuth configuration errors - these indicate setup issues
  [AUTH_ERROR_CODES.UNAUTHORIZED_DOMAIN]:
    'This domain is not authorized for sign-in. Please contact the administrator.',
  [AUTH_ERROR_CODES.OPERATION_NOT_ALLOWED]:
    'This sign-in method is not enabled. Please contact the administrator.',
  [AUTH_ERROR_CODES.AUTH_DOMAIN_CONFIG_REQUIRED]:
    'Authentication is not configured properly. Please contact the administrator.',
  [AUTH_ERROR_CODES.OPERATION_NOT_SUPPORTED]:
    'This sign-in method is not supported in your browser. Please try a different browser.',

  // Internal errors
  [AUTH_ERROR_CODES.INTERNAL_ERROR]:
    'An internal error occurred. Please try again later.',
};

/**
 * Get user-friendly error message from Firebase error code
 */
export function getAuthErrorMessage(errorCode: string): string {
  const message = AUTH_ERROR_MESSAGES[errorCode];

  if (message) {
    return message;
  }

  // Log unknown error codes to help with debugging (codes are not sensitive)
  if (errorCode) {
    console.warn(`[shared-auth-store] Unknown auth error code: "${errorCode}"`);
  } else {
    console.warn('[shared-auth-store] No error code provided to getAuthErrorMessage');
  }

  // Provide a more helpful fallback message
  return 'Unable to complete sign-in. Please try again or use a different sign-in method.';
}
