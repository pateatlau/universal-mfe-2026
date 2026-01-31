/**
 * LoginScreen - Universal login screen component
 *
 * Uses React Native primitives for cross-platform compatibility.
 * Provides email/password and social login options.
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
  ActivityIndicator,
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

export interface LoginScreenProps {
  /** Callback when sign up link is pressed */
  onSignUpPress?: () => void;
  /** Callback when forgot password link is pressed */
  onForgotPasswordPress?: () => void;
  /** Callback when login succeeds */
  onLoginSuccess?: () => void;
  /** Test ID prefix for testing */
  testIDPrefix?: string;
}

/**
 * LoginScreen component for user authentication.
 *
 * Features:
 * - Email/password sign-in
 * - Google sign-in
 * - GitHub sign-in
 * - Forgot password link
 * - Sign up link
 * - Full accessibility support
 */
export function LoginScreen({
  onSignUpPress,
  onForgotPasswordPress,
  onLoginSuccess,
  testIDPrefix = 'login',
}: LoginScreenProps) {
  const { theme } = useTheme();
  const { t } = useTranslation('auth');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isLoading = useIsAuthLoading();
  const error = useAuthError();

  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithGitHub = useAuthStore((state) => state.signInWithGitHub);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isLoginSuccessful, setIsLoginSuccessful] = useState(false);

  const handleEmailLogin = useCallback(async () => {
    if (!email || !password) return;

    try {
      await signInWithEmail(email, password);
      setIsLoginSuccessful(true);
      onLoginSuccess?.();
    } catch {
      // Error is handled by store
    }
  }, [email, password, signInWithEmail, onLoginSuccess]);

  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      setIsLoginSuccessful(true);
      onLoginSuccess?.();
    } catch {
      // Error is handled by store
      setIsGoogleLoading(false);
    }
  }, [signInWithGoogle, onLoginSuccess]);

  const handleGitHubLogin = useCallback(async () => {
    setIsGitHubLoading(true);
    try {
      await signInWithGitHub();
      setIsLoginSuccessful(true);
      onLoginSuccess?.();
    } catch {
      // Error is handled by store
      setIsGitHubLoading(false);
    }
  }, [signInWithGitHub, onLoginSuccess]);

  const isFormDisabled = isLoading || isGoogleLoading || isGitHubLoading || isLoginSuccessful;
  const isEmailLoginDisabled = isFormDisabled || !email || !password;

  // Show full-screen loading overlay after successful login
  if (isLoginSuccessful) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
        <Text style={styles.loadingText}>
          {t('login.signingIn', { defaultValue: 'Signing in...' })}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.select({ ios: 'padding', default: 'height' })}
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
            {t('login.title', { defaultValue: 'Sign In' })}
          </Text>

          <AuthError
            message={error}
            onDismiss={clearError}
            testID={`${testIDPrefix}-error`}
          />

          <AuthInput
            label={t('login.email', { defaultValue: 'Email' })}
            placeholder={t('login.emailPlaceholder', { defaultValue: 'Enter your email' })}
            value={email}
            onChangeText={setEmail}
            type="email"
            disabled={isFormDisabled}
            testID={`${testIDPrefix}-email-input`}
          />

          <AuthInput
            label={t('login.password', { defaultValue: 'Password' })}
            placeholder={t('login.passwordPlaceholder', { defaultValue: 'Enter your password' })}
            value={password}
            onChangeText={setPassword}
            type="password"
            disabled={isFormDisabled}
            testID={`${testIDPrefix}-password-input`}
          />

          <View style={styles.buttonContainer}>
            <AuthButton
              label={t('login.signIn', { defaultValue: 'Sign In' })}
              onPress={handleEmailLogin}
              variant="primary"
              isLoading={isLoading && !isGoogleLoading && !isGitHubLoading}
              disabled={isEmailLoginDisabled}
              accessibilityHint="Signs you in with email and password"
              testID={`${testIDPrefix}-submit-button`}
            />
          </View>

          {onForgotPasswordPress && (
            <Pressable
              style={styles.linkButton}
              onPress={onForgotPasswordPress}
              disabled={isFormDisabled}
              accessibilityRole={A11yRoles.BUTTON}
              accessibilityLabel={t('login.forgotPassword', { defaultValue: 'Forgot Password?' })}
            >
              <Text style={[styles.linkText, isFormDisabled && styles.linkTextDisabled]}>
                {t('login.forgotPassword', { defaultValue: 'Forgot Password?' })}
              </Text>
            </Pressable>
          )}

          <SocialLoginButtons
            onGooglePress={handleGoogleLogin}
            onGitHubPress={handleGitHubLogin}
            isGoogleLoading={isGoogleLoading}
            isGitHubLoading={isGitHubLoading}
            disabled={isFormDisabled}
            showDivider={true}
            testIDPrefix={testIDPrefix}
          />

          {onSignUpPress && (
            <Pressable
              style={styles.signUpContainer}
              onPress={onSignUpPress}
              disabled={isFormDisabled}
              accessibilityRole={A11yRoles.BUTTON}
              accessibilityLabel={t('login.noAccount', { defaultValue: "Don't have an account? Sign Up" })}
            >
              <Text style={[styles.signUpText, isFormDisabled && styles.linkTextDisabled]}>
                {t('login.noAccount', { defaultValue: "Don't have an account? Sign Up" })}
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
  linkButton: ViewStyle;
  linkText: TextStyle;
  linkTextDisabled: TextStyle;
  signUpContainer: ViewStyle;
  signUpText: TextStyle;
  loadingOverlay: ViewStyle;
  loadingText: TextStyle;
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
    linkButton: {
      alignItems: 'center',
      paddingVertical: theme.spacing.element.gap,
    },
    linkText: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.link,
      textAlign: 'center',
    },
    linkTextDisabled: {
      opacity: 0.5,
    },
    signUpContainer: {
      marginTop: theme.spacing.component.padding,
      alignItems: 'center',
      paddingVertical: theme.spacing.element.gap,
    },
    signUpText: {
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.link,
      textAlign: 'center',
    },
    loadingOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface.background,
    },
    loadingText: {
      marginTop: theme.spacing.element.gap,
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.secondary,
    },
  });
}
