/**
 * Login page component.
 *
 * Wraps the universal LoginScreen component with web-specific navigation.
 *
 * CRITICAL: This component guards against the "login flash" issue where the
 * login form briefly appears after successful authentication before the
 * router redirects. The solution:
 * 1. Use a ref (not state) to track login initiation - refs persist across re-renders
 * 2. NEVER render LoginScreen if user is authenticated or login was initiated
 * 3. Render Navigate immediately when authenticated to trigger redirect
 */

import React, { useCallback, useMemo, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { LoginScreen } from '@universal/shared-hello-ui';
import { Routes } from '@universal/shared-router';
import { useTheme, Theme } from '@universal/shared-theme-context';
import { useTranslation } from '@universal/shared-i18n';
import { useIsAuthenticated, useIsAuthInitialized, useIsAuthLoading } from '@universal/shared-auth-store';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { t: tAuth } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isAuthenticated = useIsAuthenticated();
  const isInitialized = useIsAuthInitialized();
  const isAuthLoading = useIsAuthLoading();

  // Use a REF instead of state to track login initiation.
  // Refs persist their value across re-renders without triggering new renders.
  // This prevents the login form from flashing during the async gap between
  // when auth state updates and when the router completes navigation.
  const loginInitiatedRef = useRef(false);

  // Get the intended destination from location state (set by ProtectedRoute)
  const from = (location.state as LocationState)?.from?.pathname || `/${Routes.HOME}`;

  const handleSignUpPress = useCallback(() => {
    navigate(`/${Routes.SIGNUP}`);
  }, [navigate]);

  const handleForgotPasswordPress = useCallback(() => {
    navigate(`/${Routes.FORGOT_PASSWORD}`);
  }, [navigate]);

  const handleLoginSuccess = useCallback(() => {
    // Mark login as initiated - this ref persists across re-renders
    loginInitiatedRef.current = true;
  }, []);

  // PRIORITY 1: If authenticated, redirect immediately
  // This must be checked FIRST to prevent any flash of login UI
  if (isAuthenticated && isInitialized) {
    return <Navigate to={from} replace />;
  }

  // PRIORITY 2: Show loading for any of these conditions:
  // - Auth hasn't initialized yet (app startup)
  // - Auth is currently loading (login API call in progress)
  // - Login was initiated (waiting for auth state to update)
  // - User is authenticated (shouldn't reach here due to check above, but safety net)
  if (!isInitialized || isAuthLoading || loginInitiatedRef.current || isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
        <Text style={styles.loadingText}>
          {loginInitiatedRef.current || isAuthLoading
            ? tAuth('login.signingIn')
            : tCommon('loading')
          }
        </Text>
      </View>
    );
  }

  // PRIORITY 3: Only show LoginScreen if:
  // - Auth is initialized
  // - User is NOT authenticated
  // - No login is in progress
  // - No login was initiated
  return (
    <LoginScreen
      onSignUpPress={handleSignUpPress}
      onForgotPasswordPress={handleForgotPasswordPress}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

interface Styles {
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
}

function createStyles(theme: Theme): Styles {
  return StyleSheet.create<Styles>({
    loadingContainer: {
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

export default Login;
