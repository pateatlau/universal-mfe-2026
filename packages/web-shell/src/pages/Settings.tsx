/**
 * Settings page component.
 *
 * Allows users to configure theme and language preferences.
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Link } from 'react-router-dom';
import { useTheme, Theme } from '@universal/shared-theme-context';
import {
  useTranslation,
  useLocale,
  availableLocales,
  getLocaleDisplayName,
} from '@universal/shared-i18n';
import {
  useEventBus,
  ThemeEventTypes,
  LocaleEventTypes,
  type AppEvents,
} from '@universal/shared-event-bus';
import { Routes } from '@universal/shared-router';

interface Styles {
  container: ViewStyle;
  backLink: ViewStyle;
  backLinkText: TextStyle;
  title: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  optionList: ViewStyle;
  optionButton: ViewStyle;
  optionButtonActive: ViewStyle;
  optionText: TextStyle;
  optionTextActive: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    container: {
      flex: 1,
      padding: theme.spacing.layout.screenPadding,
    },
    backLink: {
      marginBottom: theme.spacing.layout.sectionGap,
    },
    backLinkText: {
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.interactive.primary,
    },
    title: {
      fontSize: theme.typography.fontSizes['2xl'],
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.layout.sectionGap,
    },
    section: {
      marginBottom: theme.spacing.layout.sectionGap,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.component.gap,
    },
    optionList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.element.gap,
    },
    optionButton: {
      backgroundColor: theme.colors.surface.card,
      paddingHorizontal: theme.spacing.component.padding,
      paddingVertical: theme.spacing.element.gap,
      borderRadius: theme.spacing.component.borderRadius,
      borderWidth: 2,
      borderColor: theme.colors.border.default,
    },
    optionButtonActive: {
      backgroundColor: theme.colors.surface.tertiary,
      borderColor: theme.colors.interactive.primary,
    },
    optionText: {
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.secondary,
      fontWeight: theme.typography.fontWeights.medium,
    },
    optionTextActive: {
      color: theme.colors.interactive.primary,
      fontWeight: theme.typography.fontWeights.semibold,
    },
  });
}

export function Settings() {
  const { theme, isDark, themeName, setTheme } = useTheme();
  const { t } = useTranslation('common');
  const { locale, setLocale } = useLocale();
  const bus = useEventBus<AppEvents>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleThemeChange = useCallback(
    (newTheme: 'light' | 'dark') => {
      const previousTheme = themeName;
      setTheme(newTheme);
      bus.emit(
        ThemeEventTypes.THEME_CHANGED,
        { theme: newTheme, previousTheme },
        1,
        { source: 'WebShell/Settings' }
      );
    },
    [bus, themeName, setTheme]
  );

  const handleLocaleChange = useCallback(
    (newLocale: string) => {
      const previousLocale = locale;
      setLocale(newLocale as typeof locale);
      bus.emit(
        LocaleEventTypes.LOCALE_CHANGED,
        { locale: newLocale, previousLocale },
        1,
        { source: 'WebShell/Settings' }
      );
    },
    [bus, locale, setLocale]
  );

  return (
    <View style={styles.container}>
      <Link to={`/${Routes.HOME}`} style={{ textDecoration: 'none' }}>
        <View style={styles.backLink}>
          <Text style={styles.backLinkText}>← {t('navigation.home')}</Text>
        </View>
      </Link>

      <Text style={styles.title}>{t('navigation.settings')}</Text>

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('theme.title') || 'Theme'}</Text>
        <View style={styles.optionList}>
          <Pressable
            style={[
              styles.optionButton,
              !isDark && styles.optionButtonActive,
            ]}
            onPress={() => handleThemeChange('light')}
          >
            <Text
              style={[
                styles.optionText,
                !isDark && styles.optionTextActive,
              ]}
            >
              ☀️ {t('theme.light')}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.optionButton,
              isDark && styles.optionButtonActive,
            ]}
            onPress={() => handleThemeChange('dark')}
          >
            <Text
              style={[
                styles.optionText,
                isDark && styles.optionTextActive,
              ]}
            >
              🌙 {t('theme.dark')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('language.title') || 'Language'}</Text>
        <View style={styles.optionList}>
          {availableLocales.map((loc) => (
            <Pressable
              key={loc}
              style={[
                styles.optionButton,
                locale === loc && styles.optionButtonActive,
              ]}
              onPress={() => handleLocaleChange(loc)}
            >
              <Text
                style={[
                  styles.optionText,
                  locale === loc && styles.optionTextActive,
                ]}
              >
                {getLocaleDisplayName(loc)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

export default Settings;
