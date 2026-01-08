/**
 * Home page component.
 *
 * Displays a welcome message and navigation to other pages.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Link } from 'react-router-dom';
import { useTheme, Theme } from '@universal/shared-theme-context';
import { useTranslation } from '@universal/shared-i18n';
import { Routes } from '@universal/shared-router';

interface Styles {
  container: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  navSection: ViewStyle;
  navTitle: TextStyle;
  navList: ViewStyle;
  navLink: ViewStyle;
  navLinkText: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    container: {
      flex: 1,
      padding: theme.spacing.layout.screenPadding,
      alignItems: 'center',
    },
    title: {
      fontSize: theme.typography.fontSizes['3xl'],
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.component.gap,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.layout.sectionGap,
      textAlign: 'center',
    },
    navSection: {
      width: '100%',
      maxWidth: 400,
      marginTop: theme.spacing.layout.sectionGap,
    },
    navTitle: {
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.component.gap,
    },
    navList: {
      gap: theme.spacing.element.gap,
    },
    navLink: {
      backgroundColor: theme.colors.surface.card,
      padding: theme.spacing.component.padding,
      borderRadius: theme.spacing.component.borderRadius,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
    navLinkText: {
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.interactive.primary,
      fontWeight: theme.typography.fontWeights.medium,
    },
  });
}

export function Home() {
  const { theme } = useTheme();
  const { t } = useTranslation('common');
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcome')}</Text>
      <Text style={styles.subtitle}>{t('subtitle')}</Text>

      <View style={styles.navSection}>
        <Text style={styles.navTitle}>{t('navigation.title') || 'Navigate'}</Text>
        <View style={styles.navList}>
          <Link to={`/${Routes.REMOTE_HELLO}`} style={{ textDecoration: 'none' }}>
            <Pressable style={styles.navLink}>
              <Text style={styles.navLinkText}>
                🧩 {t('navigation.remoteHello') || 'Remote Module'}
              </Text>
            </Pressable>
          </Link>
          <Link to={`/${Routes.SETTINGS}`} style={{ textDecoration: 'none' }}>
            <Pressable style={styles.navLink}>
              <Text style={styles.navLinkText}>
                ⚙️ {t('navigation.settings')}
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

export default Home;
