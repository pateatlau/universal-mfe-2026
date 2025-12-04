/**
 * Zustand with React Component Test
 * 
 * This test verifies that Zustand works correctly with React components
 * in the shared-hello-ui package.
 */

import React from 'react';
import { create } from 'zustand';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Pressable, Text, View } from 'react-native';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

const CounterComponent: React.FC = () => {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);

  return (
    <View>
      <Text testID="count-display">Count: {count}</Text>
      <Pressable testID="increment-button" onPress={increment}>
        <Text>Increment</Text>
      </Pressable>
      <Pressable testID="decrement-button" onPress={decrement}>
        <Text>Decrement</Text>
      </Pressable>
    </View>
  );
};

describe('Zustand with React Components', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCounterStore.setState({ count: 0 });
  });

  it('should render component with initial state', () => {
    render(<CounterComponent />);
    
    expect(screen.getByTestId('count-display')).toBeDefined();
    expect(screen.getByText('Count: 0')).toBeDefined();
    expect(screen.getByTestId('increment-button')).toBeDefined();
    expect(screen.getByTestId('decrement-button')).toBeDefined();
  });

  it('should update state when increment is called', async () => {
    render(<CounterComponent />);
    
    const incrementButton = screen.getByTestId('increment-button');
    
    await act(async () => {
      incrementButton.click();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Count: 1/)).toBeDefined();
    });
  });

  it('should update state when decrement is called', async () => {
    render(<CounterComponent />);
    
    const incrementButton = screen.getByTestId('increment-button');
    const decrementButton = screen.getByTestId('decrement-button');
    
    // First increment twice
    await act(async () => {
      incrementButton.click();
      incrementButton.click();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Count: 2/)).toBeDefined();
    });
    
    // Then decrement
    await act(async () => {
      decrementButton.click();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Count: 1/)).toBeDefined();
    });
  });

  it('should support multiple components sharing the same store', async () => {
    const { rerender } = render(<CounterComponent />);
    
    // Increment from first component
    await act(async () => {
      screen.getByTestId('increment-button').click();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Count: 1/)).toBeDefined();
    });
    
    // Re-render (simulating another component)
    rerender(<CounterComponent />);
    
    // Should still show the updated count
    expect(screen.getByText(/Count: 1/)).toBeDefined();
  });
});

