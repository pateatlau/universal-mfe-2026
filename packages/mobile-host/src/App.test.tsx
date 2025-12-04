/**
 * Unit tests for @universal/mobile-host
 * 
 * Tests mobile host application
 */

import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Mock StorageDemo to avoid storage dependencies in tests
jest.mock('@universal/shared-hello-ui', () => {
  const React = require('react');
  return {
    StorageDemo: () => null, // Return null to avoid rendering issues
  };
});

// Mock ScriptManager and Federated to avoid runtime dependencies
jest.mock('@callstack/repack/client', () => ({
  ScriptManager: {
    shared: {
      addResolver: jest.fn(),
      prefetchScript: jest.fn(),
    },
  },
  Federated: {
    importModule: jest.fn(),
  },
}));

describe('App', () => {
  it('should render mobile host title', () => {
    const { getByText } = render(<App />);
    expect(getByText('Universal MFE - Mobile Host')).toBeTruthy();
  });

  it('should render subtitle', () => {
    const { getByText } = render(<App />);
    expect(getByText(/Dynamically loading remote/i)).toBeTruthy();
  });

  it('should render load button initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('Load Remote Component')).toBeTruthy();
  });
});

