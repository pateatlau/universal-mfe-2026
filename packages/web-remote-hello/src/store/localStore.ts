/**
 * @universal/web-remote-hello - Local State Store
 *
 * Each MFE owns its local state via Zustand. This ensures:
 * 1. Loose coupling - MFEs don't share mutable state directly
 * 2. Independent deployability - each MFE can be deployed/tested alone
 * 3. Clear ownership - state mutations happen within the owning MFE
 *
 * Communication between MFEs happens via the Event Bus:
 * - MFE emits events when significant state changes occur
 * - Host/other MFEs can listen and react by updating their own state
 * - Events carry information, not state references
 *
 * Pattern:
 * 1. Local actions update local state
 * 2. After state update, emit event if other MFEs need to know
 * 3. Other MFEs listen for events and update their own state accordingly
 */

import { create } from 'zustand';

/**
 * Local state interface for the HelloRemote MFE
 */
export interface HelloLocalState {
  /** Number of times the button has been pressed in this MFE */
  localPressCount: number;
  /** Last press timestamp */
  lastPressedAt: number | null;
  /** User preferences local to this MFE */
  preferences: {
    /** Whether to show animations */
    showAnimations: boolean;
    /** Custom greeting override (if set) */
    customGreeting: string | null;
  };
}

/**
 * Local actions interface
 */
export interface HelloLocalActions {
  /** Increment the local press count */
  incrementPressCount: () => void;
  /** Reset the local press count */
  resetPressCount: () => void;
  /** Toggle animation preference */
  toggleAnimations: () => void;
  /** Set custom greeting */
  setCustomGreeting: (greeting: string | null) => void;
  /** Reset all local state */
  reset: () => void;
}

/**
 * Combined store type
 */
export type HelloLocalStore = HelloLocalState & HelloLocalActions;

/**
 * Initial state
 */
const initialState: HelloLocalState = {
  localPressCount: 0,
  lastPressedAt: null,
  preferences: {
    showAnimations: true,
    customGreeting: null,
  },
};

/**
 * Create the local Zustand store for HelloRemote MFE
 *
 * This store is:
 * - Local to this MFE only
 * - Not shared with host or other MFEs
 * - Resets when the MFE unmounts (unless persisted)
 *
 * For cross-MFE state sharing, use the Event Bus:
 * - Emit events when local state changes that others need to know about
 * - Listen for events from host/other MFEs to update local state
 */
export const useHelloLocalStore = create<HelloLocalStore>((set) => ({
  ...initialState,

  incrementPressCount: () => {
    set((state) => ({
      localPressCount: state.localPressCount + 1,
      lastPressedAt: Date.now(),
    }));
  },

  resetPressCount: () => {
    set({
      localPressCount: 0,
      lastPressedAt: null,
    });
  },

  toggleAnimations: () => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        showAnimations: !state.preferences.showAnimations,
      },
    }));
  },

  setCustomGreeting: (greeting) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        customGreeting: greeting,
      },
    }));
  },

  reset: () => {
    set(initialState);
  },
}));

/**
 * Selector hooks for optimized re-renders
 * Use these instead of accessing the entire store when you only need specific values
 */
export const useLocalPressCount = () =>
  useHelloLocalStore((state) => state.localPressCount);

export const useShowAnimations = () =>
  useHelloLocalStore((state) => state.preferences.showAnimations);

export const useCustomGreeting = () =>
  useHelloLocalStore((state) => state.preferences.customGreeting);
