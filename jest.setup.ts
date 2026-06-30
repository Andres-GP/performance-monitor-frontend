import "@testing-library/jest-dom"

// Some suites use the `node` test environment (no `window`). Only install the
// browser stubs when running under jsdom.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  })
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== "undefined") {
  // @ts-expect-error - assigning a stub to the global
  window.ResizeObserver = window.ResizeObserver ?? ResizeObserverStub
}
