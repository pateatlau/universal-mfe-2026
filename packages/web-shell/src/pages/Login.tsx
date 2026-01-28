/**
 * Login page component.
 *
 * Wraps the universal LoginScreen component with web-specific navigation.
 * Supports redirecting back to the intended destination after login.
 */

import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginScreen } from '@universal/shared-hello-ui';
import { Routes } from '@universal/shared-router';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state (set by ProtectedRoute)
  const from = (location.state as LocationState)?.from?.pathname || `/${Routes.HOME}`;

  const handleLoginSuccess = useCallback(() => {
    // Navigate to the intended destination or home
    navigate(from, { replace: true });
  }, [navigate, from]);

  return (
    <LoginScreen
      onSignUpPress={() => navigate(`/${Routes.SIGNUP}`)}
      onForgotPasswordPress={() => navigate(`/${Routes.FORGOT_PASSWORD}`)}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

export default Login;
