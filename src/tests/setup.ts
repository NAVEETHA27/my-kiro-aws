/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';

// Provide a minimal localStorage mock for all tests.
// Real localStorage is never used in tests — this keeps tests isolated and order-independent.
const storage: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string): string | null => storage[key] ?? null,
  setItem: (key: string, value: string): void => { storage[key] = value; },
  removeItem: (key: string): void => { delete storage[key]; },
  clear: (): void => { Object.keys(storage).forEach((k) => delete storage[k]); },
  get length(): number { return Object.keys(storage).length; },
  key: (index: number): string | null => Object.keys(storage)[index] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Clear storage before each test so tests are fully isolated
beforeEach(() => {
  localStorageMock.clear();
});
