import { describe, expect, test, vi } from 'vitest';

import type { StoreApi } from 'zustand';

const useStoreWithEqualityFnMock = vi.hoisted(() => vi.fn());

vi.mock('zustand/traditional', () => ({
  useStoreWithEqualityFn: useStoreWithEqualityFnMock
}));

interface TestState {
  count: number;
}

describe('createStoreHook', () => {
  test('creates a hook that reads through useStoreWithEqualityFn with Object.is by default', async () => {
    const { createStoreHook } = await import('./createStoreHook');
    const store = {} as StoreApi<TestState>;
    const selector = (state: TestState) => state.count;

    useStoreWithEqualityFnMock.mockReturnValue(3);

    const useCount = createStoreHook(store, selector);

    expect(useCount()).toBe(3);
    expect(useStoreWithEqualityFnMock).toHaveBeenCalledWith(store, selector, Object.is);
  });

  test('creates a hook that forwards a custom equality function', async () => {
    const { createStoreHook } = await import('./createStoreHook');
    const store = {} as StoreApi<TestState>;
    const selector = (state: TestState) => ({ count: state.count });
    const equalityFn = (left: { count: number }, right: { count: number }) =>
      left.count === right.count;

    useStoreWithEqualityFnMock.mockReturnValue({ count: 4 });

    const useCountSummary = createStoreHook(store, selector, equalityFn);

    expect(useCountSummary()).toEqual({ count: 4 });
    expect(useStoreWithEqualityFnMock).toHaveBeenCalledWith(store, selector, equalityFn);
  });

  test('names the returned hook after the provided hookName for React DevTools', async () => {
    const { createStoreHook } = await import('./createStoreHook');
    const store = {} as StoreApi<TestState>;
    const selector = (state: TestState) => state.count;

    const useCount = createStoreHook(store, selector, Object.is, 'useCount');

    expect(useCount.name).toBe('useCount');
  });
});
