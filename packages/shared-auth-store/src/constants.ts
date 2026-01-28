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
  INVALID_EMAIL: 'auth/invalid-email',
  USER_DISABLED: 'auth/user-disabled',
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  INVALID_CREDENTIAL: 'auth/invalid-credential',
  EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  NETWORK_ERROR: 'auth/network-request-failed',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
  POPUP_CLOSED: 'auth/popup-closed-by-user',
  CANCELLED: 'auth/cancelled',
  ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL: 'auth/account-exists-with-different-credential',
} as const;

/**
 * Human-readable error messages
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_ERROR_CODES.INVALID_EMAIL]: 'Please enter a valid email address.',
  [AUTH_ERROR_CODES.USER_DISABLED]: 'This account has been disabled.',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'No account found with this email.',
  [AUTH_ERROR_CODES.WRONG_PASSWORD]: 'Incorrect password. Please try again.',
  [AUTH_ERROR_CODES.INVALID_CREDENTIAL]: 'Invalid email or password. Please try again.',
  [AUTH_ERROR_CODES.EMAIL_ALREADY_IN_USE]: 'An account already exists with this email.',
  [AUTH_ERROR_CODES.WEAK_PASSWORD]: 'Password should be at least 6 characters.',
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [AUTH_ERROR_CODES.TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later.',
  [AUTH_ERROR_CODES.POPUP_CLOSED]: 'Sign-in was cancelled.',
  [AUTH_ERROR_CODES.CANCELLED]: 'Sign-in was cancelled.',
  [AUTH_ERROR_CODES.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL]:
    'An account already exists with this email using a different sign-in method.',
};

/**
 * Get user-friendly error message from Firebase error code
 */
export function getAuthErrorMessage(errorCode: string): string {
  return AUTH_ERROR_MESSAGES[errorCode] || 'An unexpected error occurred. Please try again.';
}
