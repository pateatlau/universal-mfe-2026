/**
 * Mock for @callstack/repack/client for Jest testing
 */

export const ScriptManager = {
  shared: {
    addResolver: jest.fn(),
    prefetchScript: jest.fn(() => Promise.resolve()),
  },
};

export const Federated = {
  importModule: jest.fn(() =>
    Promise.resolve({
      default: function MockHelloRemote({ name }: { name?: string }) {
        return { name };
      },
    })
  ),
};

