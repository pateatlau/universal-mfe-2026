/**
 * Unit tests for @universal/web-remote-hello
 * 
 * Tests web remote component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import HelloRemote from './HelloRemote';

// Mock the shared component
jest.mock('@universal/shared-hello-ui', () => ({
  HelloUniversal: function MockHelloUniversal({ name, onPress }: { name?: string; onPress?: () => void }) {
    return (
      <div data-testid="hello-universal">
        <div>Mock Universal: {name}</div>
        {onPress && <button onClick={onPress}>Mock Press</button>}
      </div>
    );
  },
}));

describe('HelloRemote', () => {
  it('should render with provided name', () => {
    render(<HelloRemote name="Test User" />);
    expect(screen.getByText('Mock Universal: Test User')).toBeTruthy();
  });

  it('should render without name', () => {
    render(<HelloRemote />);
    expect(screen.getByTestId('hello-universal')).toBeTruthy();
  });

  it('should pass onPress handler', () => {
    const onPress = jest.fn();
    render(<HelloRemote onPress={onPress} />);
    const button = screen.getByText('Mock Press') as HTMLButtonElement;
    button.click();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

