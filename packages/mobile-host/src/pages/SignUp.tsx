/**
 * Sign Up page component for mobile.
 *
 * Wraps the universal SignUpScreen component with mobile-specific navigation.
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-native';
import { SignUpScreen } from '@universal/shared-hello-ui';
import { Routes } from '@universal/shared-router';

export function SignUp() {
  const navigate = useNavigate();

  const handleSignInPress = useCallback(() => {
    navigate(`/${Routes.LOGIN}`);
  }, [navigate]);

  const handleSignUpSuccess = useCallback(() => {
    navigate(`/${Routes.HOME}`);
  }, [navigate]);

  return (
    <SignUpScreen
      onSignInPress={handleSignInPress}
      onSignUpSuccess={handleSignUpSuccess}
    />
  );
}

export default SignUp;
