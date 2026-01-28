/**
 * @universal/shared-hello-ui
 *
 * Universal React Native UI components export.
 */

// =============================================================================
// Hello Components
// =============================================================================

export { HelloUniversal } from "./HelloUniversal";
export type { HelloUniversalProps } from "./HelloUniversal";

// =============================================================================
// Authentication Components
// =============================================================================

export {
  // Base Components
  AuthButton,
  AuthInput,
  AuthError,
  // Composite Components
  SocialLoginButtons,
  // Screen Components
  LoginScreen,
  SignUpScreen,
  ForgotPasswordScreen,
} from './components/auth';

export type {
  // Base Component Props
  AuthButtonProps,
  AuthButtonVariant,
  AuthInputProps,
  AuthInputType,
  AuthErrorProps,
  // Composite Component Props
  SocialLoginButtonsProps,
  // Screen Component Props
  LoginScreenProps,
  SignUpScreenProps,
  ForgotPasswordScreenProps,
} from './components/auth';

