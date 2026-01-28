/**
 * Forgot Password page component for mobile.
 *
 * Wraps the universal ForgotPasswordScreen component with mobile-specific navigation.
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-native';
import { ForgotPasswordScreen } from '@universal/shared-hello-ui';
import { Routes } from '@universal/shared-router';

export function ForgotPassword() {
  const navigate = useNavigate();

  const handleBackToLoginPress = useCallback(() => {
    navigate(`/${Routes.LOGIN}`);
  }, [navigate]);

  return (
    <ForgotPasswordScreen
      onBackToLoginPress={handleBackToLoginPress}
    />
  );
}

export default ForgotPassword;
