/**
 * Unit tests for @universal/mobile-host
 * 
 * Tests mobile host application
 */

import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

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

