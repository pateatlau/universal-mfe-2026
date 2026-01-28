/**
 * ForgotPasswordScreen - Universal password reset screen component
 *
 * Uses React Native primitives for cross-platform compatibility.
 * Provides email-based password reset functionality.
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

export interface ForgotPasswordScreenProps {
  /** Callback when back to login link is pressed */
  onBackToLoginPress?: () => void;
  /** Callback when reset email is sent successfully */
  onResetSuccess?: () => void;
  /** Test ID prefix for testing */
  testIDPrefix?: string;
}

/**
 * ForgotPasswordScreen component for password reset.
 *
 * Features:
 * - Email input for password reset
 * - Success message after sending reset email
 * - Back to login link
 * - Full accessibility support
 */
export function ForgotPasswordScreen({
  onBackToLoginPress,
  onResetSuccess,
  testIDPrefix = 'forgot-password',
}: ForgotPasswordScreenProps) {
  const { theme } = useTheme();
  const { t } = useTranslation('auth');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isLoading = useIsAuthLoading();
  const error = useAuthError();

  const resetPassword = useAuthStore((state) => state.resetPassword);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateEmail = useCallback((): boolean => {
    setLocalError(null);

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

    return true;
  }, [email, t]);

  const handleResetPassword = useCallback(async () => {
    if (!validateEmail()) return;

    try {
      await resetPassword(email);
      setIsSuccess(true);
      onResetSuccess?.();
    } catch {
      // Error is handled by store
    }
  }, [validateEmail, email, resetPassword, onResetSuccess]);

  const handleClearError = useCallback(() => {
    setLocalError(null);
    clearError();
  }, [clearError]);

  const handleTryAgain = useCallback(() => {
    setIsSuccess(false);
    setEmail('');
    clearError();
  }, [clearError]);

  const displayError = localError || error;

  if (isSuccess) {
    return (
      <View style={styles.keyboardAvoid}>
        <View style={styles.container}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon} accessibilityLabel="Success">
              ✓
            </Text>
            <Text
              style={styles.title}
              accessibilityRole={A11yRoles.HEADER}
            >
              {t('forgotPassword.successTitle', { defaultValue: 'Email Sent!' })}
            </Text>
            <Text style={styles.description}>
              {t('forgotPassword.success', {
                defaultValue: 'Password reset email sent! Check your inbox.',
              })}
            </Text>
            <Text style={styles.emailSentTo}>
              {t('forgotPassword.sentTo', {
                defaultValue: `We sent a reset link to ${email}`,
                params: { email },
              })}
            </Text>

            <View style={styles.buttonContainer}>
              <AuthButton
                label={t('forgotPassword.backToLogin', { defaultValue: 'Back to Sign In' })}
                onPress={onBackToLoginPress ?? handleTryAgain}
                variant="primary"
                testID={`${testIDPrefix}-back-button`}
              />
            </View>

            <Pressable
              style={styles.linkButton}
              onPress={handleTryAgain}
              accessibilityRole={A11yRoles.BUTTON}
              accessibilityLabel={t('forgotPassword.tryAgain', { defaultValue: 'Try a different email' })}
            >
              <Text style={styles.linkText}>
                {t('forgotPassword.tryAgain', { defaultValue: 'Try a different email' })}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

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
            {t('forgotPassword.title', { defaultValue: 'Reset Password' })}
          </Text>

          <Text style={styles.description}>
            {t('forgotPassword.description', {
              defaultValue: "Enter your email and we'll send you a reset link.",
            })}
          </Text>

          <AuthError
            message={displayError}
            onDismiss={handleClearError}
            testID={`${testIDPrefix}-error`}
          />

          <AuthInput
            label={t('forgotPassword.email', { defaultValue: 'Email' })}
            placeholder={t('forgotPassword.emailPlaceholder', { defaultValue: 'Enter your email' })}
            value={email}
            onChangeText={setEmail}
            type="email"
            disabled={isLoading}
            testID={`${testIDPrefix}-email-input`}
          />

          <View style={styles.buttonContainer}>
            <AuthButton
              label={t('forgotPassword.send', { defaultValue: 'Send Reset Link' })}
              onPress={handleResetPassword}
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading || !email}
              accessibilityHint="Sends a password reset link to your email"
              testID={`${testIDPrefix}-submit-button`}
            />
          </View>

          {onBackToLoginPress && (
            <Pressable
              style={styles.linkButton}
              onPress={onBackToLoginPress}
              disabled={isLoading}
              accessibilityRole={A11yRoles.BUTTON}
              accessibilityLabel={t('forgotPassword.backToLogin', { defaultValue: 'Back to Sign In' })}
            >
              <Text style={[styles.linkText, isLoading && styles.linkTextDisabled]}>
                {t('forgotPassword.backToLogin', { defaultValue: 'Back to Sign In' })}
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
  successContainer: ViewStyle;
  successIcon: TextStyle;
  title: TextStyle;
  description: TextStyle;
  emailSentTo: TextStyle;
  buttonContainer: ViewStyle;
  linkButton: ViewStyle;
  linkText: TextStyle;
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
    successContainer: {
      alignItems: 'center',
    },
    successIcon: {
      fontSize: 48,
      color: theme.colors.status.success,
      marginBottom: theme.spacing.component.padding,
    },
    title: {
      fontSize: theme.typography.fontSizes['2xl'],
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.element.stackGap,
    },
    description: {
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.layout.sectionGap,
      lineHeight: theme.typography.fontSizes.base * theme.typography.lineHeights.normal,
    },
    emailSentTo: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
      marginBottom: theme.spacing.component.padding,
    },
    buttonContainer: {
      marginTop: theme.spacing.element.stackGap,
      marginBottom: theme.spacing.element.stackGap,
      width: '100%',
    },
    linkButton: {
      alignItems: 'center',
      paddingVertical: theme.spacing.element.gap,
    },
    linkText: {
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.link,
      textAlign: 'center',
    },
    linkTextDisabled: {
      opacity: 0.5,
    },
  });
}
