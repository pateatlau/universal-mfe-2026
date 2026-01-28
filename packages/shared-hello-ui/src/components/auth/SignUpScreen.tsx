/**
 * SignUpScreen - Universal sign-up screen component
 *
 * Uses React Native primitives for cross-platform compatibility.
 * Provides email/password registration form.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  DimensionValue,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme, Theme } from '@universal/shared-theme-context';
import { useTranslation } from '@universal/shared-i18n';
import {
  useAuthStore,
  useIsAuthLoading,
  useAuthError,
} from '@universal/shared-auth-store';
import { A11yRoles } from '@universal/shared-a11y';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';
import { AuthError } from './AuthError';
import { SocialLoginButtons } from './SocialLoginButtons';

export interface SignUpScreenProps {
  /** Callback when sign in link is pressed */
  onSignInPress?: () => void;
  /** Callback when sign up succeeds */
  onSignUpSuccess?: () => void;
  /** Minimum password length */
  minPasswordLength?: number;
  /** Test ID prefix for testing */
  testIDPrefix?: string;
}

/**
 * SignUpScreen component for user registration.
 *
 * Features:
 * - Display name input
 * - Email/password registration
 * - Password confirmation
 * - Password strength validation
 * - Google sign-in option
 * - GitHub sign-in option
 * - Sign in link
 * - Full accessibility support
 */
export function SignUpScreen({
  onSignInPress,
  onSignUpSuccess,
  minPasswordLength = 6,
  testIDPrefix = 'signup',
}: SignUpScreenProps) {
  const { theme } = useTheme();
  const { t } = useTranslation('auth');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isLoading = useIsAuthLoading();
  const error = useAuthError();

  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithGitHub = useAuthStore((state) => state.signInWithGitHub);
  const clearError = useAuthStore((state) => state.clearError);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateForm = useCallback((): boolean => {
    setLocalError(null);

    if (!displayName.trim()) {
      setLocalError(t('errors.displayNameRequired', { defaultValue: 'Display name is required' }));
      return false;
    }

    if (!email.trim()) {
      setLocalError(t('errors.emailRequired', { defaultValue: 'Email is required' }));
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError(t('errors.invalidEmail', { defaultValue: 'Please enter a valid email address' }));
      return false;
    }

    if (password.length < minPasswordLength) {
      setLocalError(
        t('errors.weakPassword', {
          defaultValue: `Password must be at least ${minPasswordLength} characters`,
          params: { min: minPasswordLength },
        })
      );
      return false;
    }

    if (password !== confirmPassword) {
      setLocalError(t('errors.passwordMismatch', { defaultValue: 'Passwords do not match' }));
      return false;
    }

    return true;
  }, [displayName, email, password, confirmPassword, minPasswordLength, t]);

  const handleSignUp = useCallback(async () => {
    if (!validateForm()) return;

    try {
      await signUpWithEmail(email, password, displayName);
      onSignUpSuccess?.();
    } catch {
      // Error is handled by store
    }
  }, [validateForm, email, password, displayName, signUpWithEmail, onSignUpSuccess]);

  const handleGoogleSignUp = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      onSignUpSuccess?.();
    } catch {
      // Error is handled by store
    } finally {
      setIsGoogleLoading(false);
    }
  }, [signInWithGoogle, onSignUpSuccess]);

  const handleGitHubSignUp = useCallback(async () => {
    setIsGitHubLoading(true);
    try {
      await signInWithGitHub();
      onSignUpSuccess?.();
    } catch {
      // Error is handled by store
    } finally {
      setIsGitHubLoading(false);
    }
  }, [signInWithGitHub, onSignUpSuccess]);

  const handleClearError = useCallback(() => {
    setLocalError(null);
    clearError();
  }, [clearError]);

  const isFormDisabled = isLoading || isGoogleLoading || isGitHubLoading;
  const displayError = localError || error;

  // Password strength indicator
  const passwordStrength = useMemo(() => {
    if (!password) return null;
    if (password.length < minPasswordLength) return 'weak';
    if (password.length < 10) return 'medium';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) return 'strong';
    return 'medium';
  }, [password, minPasswordLength]);

  const passwordStrengthColor = useMemo(() => {
    switch (passwordStrength) {
      case 'weak':
        return theme.colors.status.error;
      case 'medium':
        return theme.colors.status.warning;
      case 'strong':
        return theme.colors.status.success;
      default:
        return theme.colors.text.tertiary;
    }
  }, [passwordStrength, theme]);

  // Calculate password strength bar width based on strength level
  const passwordStrengthWidth = useMemo((): DimensionValue => {
    switch (passwordStrength) {
      case 'strong':
        return '100%';
      case 'medium':
        return '66%';
      case 'weak':
      default:
        return '33%';
    }
  }, [passwordStrength]);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text
            style={styles.title}
            accessibilityRole={A11yRoles.HEADER}
          >
            {t('signup.title', { defaultValue: 'Create Account' })}
          </Text>

          <AuthError
            message={displayError}
            onDismiss={handleClearError}
            testID={`${testIDPrefix}-error`}
          />

          <AuthInput
            label={t('signup.displayName', { defaultValue: 'Display Name' })}
            placeholder={t('signup.displayNamePlaceholder', { defaultValue: 'Enter your name' })}
            value={displayName}
            onChangeText={setDisplayName}
            type="text"
            disabled={isFormDisabled}
            testID={`${testIDPrefix}-name-input`}
          />

          <AuthInput
            label={t('signup.email', { defaultValue: 'Email' })}
            placeholder={t('signup.emailPlaceholder', { defaultValue: 'Enter your email' })}
            value={email}
            onChangeText={setEmail}
            type="email"
            disabled={isFormDisabled}
            testID={`${testIDPrefix}-email-input`}
          />

          <AuthInput
            label={t('signup.password', { defaultValue: 'Password' })}
            placeholder={t('signup.passwordPlaceholder', { defaultValue: 'Create a password' })}
            value={password}
            onChangeText={setPassword}
            type="password"
            disabled={isFormDisabled}
            testID={`${testIDPrefix}-password-input`}
          />

          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View
                style={[
                  styles.strengthBar,
                  { backgroundColor: passwordStrengthColor, width: passwordStrengthWidth },
                ]}
              />
              <Text style={[styles.strengthText, { color: passwordStrengthColor }]}>
                {t(`signup.passwordStrength.${passwordStrength}`, {
                  defaultValue: passwordStrength ? passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1) : '',
                })}
              </Text>
            </View>
          )}

          <AuthInput
            label={t('signup.confirmPassword', { defaultValue: 'Confirm Password' })}
            placeholder={t('signup.confirmPasswordPlaceholder', { defaultValue: 'Confirm your password' })}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            type="password"
            disabled={isFormDisabled}
            error={confirmPassword && password !== confirmPassword ? t('errors.passwordMismatch', { defaultValue: 'Passwords do not match' }) : undefined}
            testID={`${testIDPrefix}-confirm-password-input`}
          />

          <View style={styles.buttonContainer}>
            <AuthButton
              label={t('signup.signUp', { defaultValue: 'Sign Up' })}
              onPress={handleSignUp}
              variant="primary"
              isLoading={isLoading && !isGoogleLoading && !isGitHubLoading}
              disabled={isFormDisabled || !displayName || !email || !password || !confirmPassword}
              accessibilityHint="Creates a new account with the provided information"
              testID={`${testIDPrefix}-submit-button`}
            />
          </View>

          <SocialLoginButtons
            onGooglePress={handleGoogleSignUp}
            onGitHubPress={handleGitHubSignUp}
            isGoogleLoading={isGoogleLoading}
            isGitHubLoading={isGitHubLoading}
            disabled={isFormDisabled}
            showDivider={true}
            testIDPrefix={testIDPrefix}
          />

          {onSignInPress && (
            <Pressable
              style={styles.signInContainer}
              onPress={onSignInPress}
              disabled={isFormDisabled}
              accessibilityRole={A11yRoles.BUTTON}
              accessibilityLabel={t('signup.hasAccount', { defaultValue: 'Already have an account? Sign In' })}
            >
              <Text style={[styles.signInText, isFormDisabled && styles.linkTextDisabled]}>
                {t('signup.hasAccount', { defaultValue: 'Already have an account? Sign In' })}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface Styles {
  keyboardAvoid: ViewStyle;
  scrollContent: ViewStyle;
  container: ViewStyle;
  title: TextStyle;
  buttonContainer: ViewStyle;
  strengthContainer: ViewStyle;
  strengthBar: ViewStyle;
  strengthText: TextStyle;
  signInContainer: ViewStyle;
  signInText: TextStyle;
  linkTextDisabled: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    keyboardAvoid: {
      flex: 1,
      backgroundColor: theme.colors.surface.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    container: {
      flex: 1,
      padding: theme.spacing.layout.screenPadding,
      justifyContent: 'center',
      maxWidth: 400,
      width: '100%',
      alignSelf: 'center',
    },
    title: {
      fontSize: theme.typography.fontSizes['2xl'],
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.layout.sectionGap,
    },
    buttonContainer: {
      marginTop: theme.spacing.element.stackGap,
      marginBottom: theme.spacing.element.stackGap,
    },
    strengthContainer: {
      marginBottom: theme.spacing.element.stackGap,
    },
    strengthBar: {
      height: 4,
      borderRadius: 2,
      marginBottom: theme.spacing.element.gap,
    },
    strengthText: {
      fontSize: theme.typography.fontSizes.xs,
      textAlign: 'right',
    },
    signInContainer: {
      marginTop: theme.spacing.component.padding,
      alignItems: 'center',
      paddingVertical: theme.spacing.element.gap,
    },
    signInText: {
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.link,
      textAlign: 'center',
    },
    linkTextDisabled: {
      opacity: 0.5,
    },
  });
}
