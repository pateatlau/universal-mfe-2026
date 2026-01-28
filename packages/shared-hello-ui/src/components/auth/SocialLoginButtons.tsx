/**
 * SocialLoginButtons - Social authentication buttons component
 *
 * Uses React Native primitives for cross-platform compatibility.
 * Provides Google and GitHub sign-in buttons.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme, Theme } from '@universal/shared-theme-context';
import { useTranslation } from '@universal/shared-i18n';
import { AuthButton } from './AuthButton';

export interface SocialLoginButtonsProps {
  /** Google sign-in handler */
  onGooglePress?: () => void;
  /** GitHub sign-in handler */
  onGitHubPress?: () => void;
  /** Loading state for Google button */
  isGoogleLoading?: boolean;
  /** Loading state for GitHub button */
  isGitHubLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Show divider with "or" text */
  showDivider?: boolean;
  /** Test ID prefix for testing */
  testIDPrefix?: string;
}

/**
 * SocialLoginButtons component for social authentication.
 *
 * Features:
 * - Google sign-in button
 * - GitHub sign-in button
 * - Optional divider
 * - Loading states per provider
 */
export function SocialLoginButtons({
  onGooglePress,
  onGitHubPress,
  isGoogleLoading = false,
  isGitHubLoading = false,
  disabled = false,
  showDivider = true,
  testIDPrefix = 'social-login',
}: SocialLoginButtonsProps) {
  const { theme } = useTheme();
  const { t } = useTranslation('auth');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isAnyLoading = isGoogleLoading || isGitHubLoading;

  return (
    <View style={styles.container}>
      {showDivider && (
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>
            {t('login.or', { defaultValue: 'or' })}
          </Text>
          <View style={styles.dividerLine} />
        </View>
      )}

      {onGooglePress && (
        <View style={styles.buttonWrapper}>
          <AuthButton
            label={t('login.continueWithGoogle', { defaultValue: 'Continue with Google' })}
            onPress={onGooglePress}
            variant="google"
            isLoading={isGoogleLoading}
            disabled={disabled || (isAnyLoading && !isGoogleLoading)}
            accessibilityHint="Signs you in using your Google account"
            testID={`${testIDPrefix}-google`}
          />
        </View>
      )}

      {onGitHubPress && (
        <View style={styles.buttonWrapper}>
          <AuthButton
            label={t('login.continueWithGitHub', { defaultValue: 'Continue with GitHub' })}
            onPress={onGitHubPress}
            variant="github"
            isLoading={isGitHubLoading}
            disabled={disabled || (isAnyLoading && !isGitHubLoading)}
            accessibilityHint="Signs you in using your GitHub account"
            testID={`${testIDPrefix}-github`}
          />
        </View>
      )}
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  divider: ViewStyle;
  dividerLine: ViewStyle;
  dividerText: TextStyle;
  buttonWrapper: ViewStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    container: {
      width: '100%',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.component.padding,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border.default,
    },
    dividerText: {
      marginHorizontal: theme.spacing.element.inlineGap,
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.secondary,
    },
    buttonWrapper: {
      marginBottom: theme.spacing.element.stackGap,
    },
  });
}
