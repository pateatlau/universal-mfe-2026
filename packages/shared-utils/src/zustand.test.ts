/**
 * Zustand Installation Verification Test
 * 
 * This test verifies that Zustand is properly installed and can be used
 * in the shared-utils package.
 */

import { create } from 'zustand';

interface TestState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

describe('Zustand Installation Verification', () => {
  it('should be able to import zustand', () => {
    expect(typeof create).toBe('function');
  });

  it('should be able to create a store', () => {
    const useStore = create<TestState>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }));

    expect(useStore).toBeDefined();
    expect(typeof useStore.getState).toBe('function');
  });

  it('should be able to use a store', () => {
    const useStore = create<TestState>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }));

    const store = useStore.getState();
    
    expect(store.count).toBe(0);
    
    store.increment();
    expect(useStore.getState().count).toBe(1);
    
    store.increment();
    expect(useStore.getState().count).toBe(2);
    
    store.decrement();
    expect(useStore.getState().count).toBe(1);
    
    store.reset();
    expect(useStore.getState().count).toBe(0);
  });

  it('should support TypeScript types correctly', () => {
    interface TypedState {
      value: string;
      setValue: (value: string) => void;
    }

    const useStore = create<TypedState>((set) => ({
      value: 'initial',
      setValue: (value) => set({ value }),
    }));

    const store = useStore.getState();
    expect(store.value).toBe('initial');
    
    store.setValue('updated');
    expect(useStore.getState().value).toBe('updated');
  });
});

