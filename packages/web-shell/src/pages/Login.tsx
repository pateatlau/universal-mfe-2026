/**
 * Login page component.
 *
 * Wraps the universal LoginScreen component with web-specific navigation.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginScreen } from '@universal/shared-hello-ui';
import { Routes } from '@universal/shared-router';

export function Login() {
  const navigate = useNavigate();

  return (
    <LoginScreen
      onSignUpPress={() => navigate(`/${Routes.SIGNUP}`)}
      onForgotPasswordPress={() => navigate(`/${Routes.FORGOT_PASSWORD}`)}
      onLoginSuccess={() => navigate(`/${Routes.HOME}`)}
    />
  );
}

export default Login;
