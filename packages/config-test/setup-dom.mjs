import "@testing-library/jest-dom/vitest";

function createMatchMediaResult(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  };
}

function installDomTestSetup() {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: createMatchMediaResult,
      writable: true
    });
  }

  Object.defineProperty(window, "scrollTo", {
    configurable: true,
    value: () => {},
    writable: true
  });
}

installDomTestSetup();

export { installDomTestSetup };
