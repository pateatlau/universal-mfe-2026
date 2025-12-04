/**
 * Unit tests for @universal/web-shell
 * 
 * Tests web shell application
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock React.lazy to return a synchronous component for testing
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    lazy: (fn: () => Promise<any>) => {
      const MockComponent = ({ name, onPress }: { name?: string; onPress?: () => void }) => (
        <div data-testid="hello-remote">
          <div>Mock Remote: {name}</div>
          {onPress && <button onClick={onPress}>Mock Button</button>}
        </div>
      );
      MockComponent.displayName = 'MockHelloRemote';
      return MockComponent;
    },
  };
});

describe('App', () => {
  it('should render web shell title', () => {
    render(<App />);
    expect(screen.getByText('Universal MFE - Web Shell')).toBeTruthy();
  });

  it('should render subtitle', () => {
    render(<App />);
    expect(screen.getByText(/Dynamically loading remote component/i)).toBeTruthy();
  });

  it('should render remote component', async () => {
    render(<App />);
    // The mocked lazy component should render immediately
    await waitFor(() => {
      expect(screen.getByTestId('hello-remote')).toBeTruthy();
    });
  });
});

