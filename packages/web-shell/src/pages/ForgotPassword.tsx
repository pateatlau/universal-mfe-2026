/**
 * Forgot Password page component.
 *
 * Wraps the universal ForgotPasswordScreen component with web-specific navigation.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ForgotPasswordScreen } from '@universal/shared-hello-ui';
import { Routes } from '@universal/shared-router';

export function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <ForgotPasswordScreen
      onBackToLoginPress={() => navigate(`/${Routes.LOGIN}`)}
    />
  );
}

export default ForgotPassword;
