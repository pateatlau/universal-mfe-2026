/**
 * @universal/shared-hello-ui/components/auth
 *
 * Universal authentication UI components using React Native primitives.
 * Works across Web (via React Native Web), iOS, and Android.
 */

// =============================================================================
// Base Components
// =============================================================================

export { AuthButton } from './AuthButton';
export type { AuthButtonProps, AuthButtonVariant } from './AuthButton';

export { AuthInput } from './AuthInput';
export type { AuthInputProps, AuthInputType } from './AuthInput';

export { AuthError } from './AuthError';
export type { AuthErrorProps } from './AuthError';

// =============================================================================
// Composite Components
// =============================================================================

export { SocialLoginButtons } from './SocialLoginButtons';
export type { SocialLoginButtonsProps } from './SocialLoginButtons';

// =============================================================================
// Screen Components
// =============================================================================

export { LoginScreen } from './LoginScreen';
export type { LoginScreenProps } from './LoginScreen';

export { SignUpScreen } from './SignUpScreen';
export type { SignUpScreenProps } from './SignUpScreen';

export { ForgotPasswordScreen } from './ForgotPasswordScreen';
export type { ForgotPasswordScreenProps } from './ForgotPasswordScreen';
