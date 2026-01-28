/**
 * Sign Up page component.
 *
 * Wraps the universal SignUpScreen component with web-specific navigation.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpScreen } from '@universal/shared-hello-ui';
import { Routes } from '@universal/shared-router';

export function SignUp() {
  const navigate = useNavigate();

  return (
    <SignUpScreen
      onSignInPress={() => navigate(`/${Routes.LOGIN}`)}
      onSignUpSuccess={() => navigate(`/${Routes.HOME}`)}
    />
  );
}

export default SignUp;
