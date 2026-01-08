/**
 * Remote page component for mobile host.
 * Handles loading and displaying the remote MFE module.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Link } from 'react-router-native';
import { ScriptManager, Federated } from '@callstack/repack/client';
import { useTheme, Theme } from '@universal/shared-theme-context';
import { useTranslation, useLocale } from '@universal/shared-i18n';
import {
  useEventListener,
  InteractionEventTypes,
  type ButtonPressedEvent,
} from '@universal/shared-event-bus';
import { Routes } from '@universal/shared-router';

interface RemoteState {
  remoteComponent: React.ComponentType<any> | null;
  loading: boolean;
  error: string | null;
  pressCount: number;
}

interface Styles {
  container: ViewStyle;
  backLink: ViewStyle;
  backLinkText: TextStyle;
  content: ViewStyle;
  loadButton: ViewStyle;
  loadButtonText: TextStyle;
  loading: ViewStyle;
  loadingText: TextStyle;
  error: ViewStyle;
  errorText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
  remoteContainer: ViewStyle;
  counter: ViewStyle;
  counterText: TextStyle;
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadButton: {
      backgroundColor: theme.colors.interactive.primary,
      paddingHorizontal: theme.spacing.button.paddingHorizontal,
      paddingVertical: theme.spacing.button.paddingVertical,
      borderRadius: theme.spacing.button.borderRadius,
      marginBottom: theme.spacing.layout.screenPadding,
    },
    loadButtonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.fontSizes.base,
      fontWeight: theme.typography.fontWeights.semibold,
    },
    loading: {
      alignItems: 'center',
      padding: theme.spacing.layout.screenPadding,
    },
    loadingText: {
      marginTop: theme.spacing.component.gap,
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.tertiary,
    },
    error: {
      alignItems: 'center',
      padding: theme.spacing.layout.screenPadding,
    },
    errorText: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.status.error,
      marginBottom: theme.spacing.component.gap,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: theme.colors.status.error,
      paddingHorizontal: theme.spacing.button.paddingHorizontalSmall,
      paddingVertical: theme.spacing.button.paddingVerticalSmall,
      borderRadius: theme.spacing.button.borderRadius,
    },
    retryButtonText: {
      color: theme.colors.text.inverse,
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.semibold,
    },
    remoteContainer: {
      width: '100%',
      alignItems: 'center',
    },
    counter: {
      marginTop: theme.spacing.layout.screenPadding,
      padding: theme.spacing.component.padding,
      backgroundColor: theme.colors.surface.tertiary,
      borderRadius: theme.spacing.component.borderRadius,
    },
    counterText: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.interactive.primary,
      fontWeight: theme.typography.fontWeights.medium,
    },
  });
}

function Remote() {
  const { theme } = useTheme();
  const { t } = useTranslation('common');
  const { locale } = useLocale();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [state, setState] = useState<RemoteState>({
    remoteComponent: null,
    loading: false,
    error: null,
    pressCount: 0,
  });

  // Listen for BUTTON_PRESSED events from remote MFEs
  useEventListener<ButtonPressedEvent>(
    InteractionEventTypes.BUTTON_PRESSED,
    (event) => {
      setState((prev) => ({ ...prev, pressCount: prev.pressCount + 1 }));
      console.log(
        `[MobileHost Remote] Received BUTTON_PRESSED from ${event.source}:`,
        event.payload
      );
    }
  );

  const loadRemote = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Prefetch the remote bundle
      await ScriptManager.shared.prefetchScript('HelloRemote');

      // Dynamically import the remote module using MFv2
      const RemoteModule = await Federated.importModule(
        'HelloRemote',
        './HelloRemote',
        'default'
      );

      // Extract the default export (HelloRemote component)
      const HelloRemote = RemoteModule.default || RemoteModule;

      setState((prev) => ({
        ...prev,
        remoteComponent: HelloRemote,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load remote:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, []);

  // Legacy callback for backward compatibility
  const handleRemotePress = useCallback(() => {
    console.log('[MobileHost Remote] Legacy onPress callback triggered');
  }, []);

  const HelloRemote = state.remoteComponent;

  return (
    <View style={styles.container}>
      <Link to={`/${Routes.HOME}`} underlayColor="transparent">
        <View style={styles.backLink}>
          <Text style={styles.backLinkText}>← {t('navigation.home')}</Text>
        </View>
      </Link>

      <View style={styles.content}>
        {!HelloRemote && !state.loading && !state.error && (
          <Pressable style={styles.loadButton} onPress={loadRemote}>
            <Text style={styles.loadButtonText}>{t('loadRemote')}</Text>
          </Pressable>
        )}

        {state.loading && (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color={theme.colors.interactive.primary}
            />
            <Text style={styles.loadingText}>{t('loading')}</Text>
          </View>
        )}

        {state.error && (
          <View style={styles.error}>
            <Text style={styles.errorText}>
              {t('error')}: {state.error}
            </Text>
            <Pressable style={styles.retryButton} onPress={loadRemote}>
              <Text style={styles.retryButtonText}>{t('retry')}</Text>
            </Pressable>
          </View>
        )}

        {HelloRemote && (
          <View style={styles.remoteContainer}>
            <HelloRemote
              name="Mobile User"
              onPress={handleRemotePress}
              locale={locale}
            />
          </View>
        )}

        {state.pressCount > 0 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {t('pressCount', { count: state.pressCount })}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default Remote;
