/**
 * Settings page component for mobile host.
 * Allows users to change theme and language preferences.
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Link } from 'react-router-native';
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
  content: ViewStyle;
  title: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  optionsRow: ViewStyle;
  optionButton: ViewStyle;
  optionButtonActive: ViewStyle;
  optionText: TextStyle;
  optionTextActive: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface.background,
    },
    backLink: {
      padding: theme.spacing.component.padding,
    },
    backLinkText: {
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.interactive.primary,
    },
    content: {
      flex: 1,
      padding: theme.spacing.layout.screenPadding,
    },
    title: {
      fontSize: theme.typography.fontSizes['2xl'],
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.layout.screenPadding,
    },
    section: {
      marginBottom: theme.spacing.layout.screenPadding,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.element.gap,
    },
    optionsRow: {
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
      fontWeight: theme.typography.fontWeights.bold,
    },
  });
}

function Settings() {
  const { theme, isDark, toggleTheme, themeName } = useTheme();
  const { t } = useTranslation('common');
  const { locale, setLocale } = useLocale();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const bus = useEventBus<AppEvents>();

  // Handle theme change with event bus emission
  const handleThemeChange = useCallback(
    (newTheme: 'light' | 'dark') => {
      if ((newTheme === 'dark') !== isDark) {
        const previousTheme = themeName;
        toggleTheme();
        bus.emit(
          ThemeEventTypes.THEME_CHANGED,
          {
            theme: newTheme,
            previousTheme,
          },
          1,
          { source: 'MobileHost' }
        );
      }
    },
    [bus, isDark, themeName, toggleTheme]
  );

  // Handle locale change with event bus emission
  const handleLocaleChange = useCallback(
    (newLocale: string) => {
      if (newLocale !== locale) {
        const previousLocale = locale;
        setLocale(newLocale as typeof locale);
        bus.emit(
          LocaleEventTypes.LOCALE_CHANGED,
          {
            locale: newLocale,
            previousLocale,
          },
          1,
          { source: 'MobileHost' }
        );
      }
    },
    [bus, locale, setLocale]
  );

  const themeOptions = [
    { value: 'light', label: '☀️ Light' },
    { value: 'dark', label: '🌙 Dark' },
  ] as const;

  return (
    <View style={styles.container}>
      <Link to={`/${Routes.HOME}`} underlayColor="transparent">
        <View style={styles.backLink}>
          <Text style={styles.backLinkText}>← {t('navigation.home')}</Text>
        </View>
      </Link>

      <View style={styles.content}>
        <Text style={styles.title}>{t('navigation.settings')}</Text>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>
          <View style={styles.optionsRow}>
            {themeOptions.map((option) => {
              const isActive =
                (option.value === 'dark' && isDark) ||
                (option.value === 'light' && !isDark);
              return (
                <Pressable
                  key={option.value}
                  style={[styles.optionButton, isActive && styles.optionButtonActive]}
                  onPress={() => handleThemeChange(option.value)}
                >
                  <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <View style={styles.optionsRow}>
            {availableLocales.map((loc) => {
              const isActive = loc === locale;
              return (
                <Pressable
                  key={loc}
                  style={[styles.optionButton, isActive && styles.optionButtonActive]}
                  onPress={() => handleLocaleChange(loc)}
                >
                  <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                    {getLocaleDisplayName(loc)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

export default Settings;
