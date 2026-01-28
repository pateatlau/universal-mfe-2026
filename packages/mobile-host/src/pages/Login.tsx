/**
 * Login page component for mobile.
 *
 * Wraps the universal LoginScreen component with mobile-specific navigation.
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-native';
import { LoginScreen } from '@universal/shared-hello-ui';
import { Routes } from '@universal/shared-router';

export function Login() {
  const navigate = useNavigate();

  const handleSignUpPress = useCallback(() => {
    navigate(`/${Routes.SIGNUP}`);
  }, [navigate]);

  const handleForgotPasswordPress = useCallback(() => {
    navigate(`/${Routes.FORGOT_PASSWORD}`);
  }, [navigate]);

  const handleLoginSuccess = useCallback(() => {
    navigate(`/${Routes.HOME}`);
  }, [navigate]);

  return (
    <LoginScreen
      onSignUpPress={handleSignUpPress}
      onForgotPasswordPress={handleForgotPasswordPress}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

export default Login;
