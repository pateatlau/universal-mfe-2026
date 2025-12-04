/**
 * Unit tests for @universal/shared-hello-ui
 * 
 * Tests React Native universal components using simple rendering
 */

import React from 'react';
import { render } from '@testing-library/react';
import { HelloUniversal } from './HelloUniversal';

describe('HelloUniversal', () => {
  it('should render greeting with provided name', () => {
    const { getByText } = render(<HelloUniversal name="Test User" />);
    expect(getByText('Hello, Test User!')).toBeTruthy();
  });

  it('should render default greeting when no name provided', () => {
    const { getByText } = render(<HelloUniversal />);
    expect(getByText('Hello, World!')).toBeTruthy();
  });

  it('should render button when onPress provided', () => {
    const onPress = jest.fn();
    const { getByText } = render(<HelloUniversal onPress={onPress} />);
    expect(getByText('Press Me')).toBeTruthy();
  });

  it('should not render button when onPress not provided', () => {
    const { queryByText } = render(<HelloUniversal />);
    expect(queryByText('Press Me')).toBeNull();
  });

  it('should call onPress when button is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<HelloUniversal onPress={onPress} />);
    const button = getByText('Press Me') as HTMLButtonElement;
    button.click();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

