/**
 * Unit tests for @universal/mobile-remote-hello
 *
 * Tests mobile remote component
 */

import React from 'react';
import { render } from '@testing-library/react';
import HelloRemote from './HelloRemote';

// Mock the shared component
jest.mock('@universal/shared-hello-ui', () => ({
  HelloUniversal: function MockHelloUniversal({
    name,
    onPress,
  }: {
    name?: string;
    onPress?: () => void;
  }) {
    return (
      <div>
        <span data-testid="mock-universal">
          Mock Universal: {name || 'World'}
        </span>
        {onPress && (
          <button
            data-testid="mock-press"
            onClick={onPress}
          >
            Mock Press
          </button>
        )}
      </div>
    );
  },
}));

describe('HelloRemote', () => {
  it('should render with provided name', () => {
    const { getByText } = render(<HelloRemote name="Test User" />);
    expect(getByText('Mock Universal: Test User')).toBeTruthy();
  });

  it('should render without name', () => {
    const { getByText } = render(<HelloRemote />);
    expect(getByText('Mock Universal: World')).toBeTruthy();
  });

  it('should pass onPress handler', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<HelloRemote onPress={onPress} />);
    const button = getByTestId('mock-press') as HTMLButtonElement;
    button.click();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
