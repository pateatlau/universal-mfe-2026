/**
 * Home page component for mobile host.
 * Displays welcome message and navigation options.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Link } from 'react-router-native';
import { useTheme, Theme } from '@universal/shared-theme-context';
import { useTranslation } from '@universal/shared-i18n';
import { Routes } from '@universal/shared-router';

interface Styles {
  container: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  navSection: ViewStyle;
  navButton: ViewStyle;
  navButtonText: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    container: {
      flex: 1,
      padding: theme.spacing.layout.screenPadding,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.background,
    },
    title: {
      fontSize: theme.typography.fontSizes['2xl'],
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.element.gap,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.layout.screenPadding,
      textAlign: 'center',
    },
    navSection: {
      width: '100%',
      gap: theme.spacing.element.gap,
    },
    navButton: {
      backgroundColor: theme.colors.interactive.primary,
      paddingHorizontal: theme.spacing.button.paddingHorizontal,
      paddingVertical: theme.spacing.button.paddingVertical,
      borderRadius: theme.spacing.button.borderRadius,
      alignItems: 'center',
    },
    navButtonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.fontSizes.base,
      fontWeight: theme.typography.fontWeights.semibold,
    },
  });
}

function Home() {
  const { theme } = useTheme();
  const { t } = useTranslation('common');
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcome')}</Text>
      <Text style={styles.subtitle}>{t('homeDescription')}</Text>

      <View style={styles.navSection}>
        <Link to={`/${Routes.REMOTE_HELLO}`} underlayColor="transparent">
          <View style={styles.navButton}>
            <Text style={styles.navButtonText}>{t('navigation.remoteHello')}</Text>
          </View>
        </Link>

        <Link to={`/${Routes.SETTINGS}`} underlayColor="transparent">
          <View style={styles.navButton}>
            <Text style={styles.navButtonText}>{t('navigation.settings')}</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}

export default Home;
