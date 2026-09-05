import { describe, expect, expectTypeOf, test, vi } from 'vitest';

import { immer } from 'zustand/middleware/immer';

import { createErgoStore, createErgoStoreSelectorSource } from './index.js';
import type { ErgoStoreSelectorSource } from './index.js';

describe('createErgoStoreSelectorSource', () => {
  test('returns the same get/subscribe references the store already exposes, and subscribe delivers updates', () => {
    const store = createErgoStore()
      .withInitialState(() => ({ itemCount: 3 }))
      .withAutoselectors(['itemCount'])
      .withoutActions();

    const source = createErgoStoreSelectorSource(store, 'itemCount');

    expectTypeOf(source).toEqualTypeOf<ErgoStoreSelectorSource<number>>();
    expect(source.get).toBe(store.getItemCount);
    expect(source.subscribe).toBe(store.subscribeItemCount);
    expect(source.get()).toBe(3);

    const listener = vi.fn();
    const unsubscribe = source.subscribe(listener);

    expect(listener).toHaveBeenCalledWith(3);

    store.set({ itemCount: 4 });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(4);

    unsubscribe();
    store.set({ itemCount: 5 });

    expect(listener).toHaveBeenCalledTimes(2);

    const assertTypoIsRejectedAtTypeLevel = () => {
      // @ts-expect-error 'itemCont' is a typo, not a real selector key
      createErgoStoreSelectorSource(store, 'itemCont');
    };

    void assertTypoIsRejectedAtTypeLevel;
  });

  test('works against stores built with middleware (immer), unaffected by the Mutators type parameter', () => {
    interface DraftState {
      nested: {
        count: number;
      };
    }

    const store = createErgoStore<DraftState>()
      .withMiddleware(immer)
      .withInitialState(() => ({ nested: { count: 0 } }))
      .withAutoselectors(['nested'])
      .withoutActions();

    const source = createErgoStoreSelectorSource(store, 'nested');

    expectTypeOf(source).toEqualTypeOf<ErgoStoreSelectorSource<{ count: number }>>();
    expect(source.get()).toEqual({ count: 0 });

    const listener = vi.fn();
    source.subscribe(listener);

    store.set(state => {
      state.nested.count += 1;
    });

    expect(listener).toHaveBeenLastCalledWith({ count: 1 });
  });

  test('the defensive runtime check fires when a caller bypasses the Key constraint with a cast', () => {
    const store = createErgoStore()
      .withInitialState(() => ({ itemCount: 3 }))
      .withAutoselectors(['itemCount'])
      .withoutActions();

    expect(() => createErgoStoreSelectorSource(store, 'missing' as 'itemCount')).toThrow(
      'Ergo store has no selector named "missing" (expected "getMissing"/"subscribeMissing").'
    );
  });

  test('surfaces nothing beyond the already-public get<Name>/subscribe<Name> methods', () => {
    const store = createErgoStore()
      .withInitialState(() => ({ itemCount: 3 }))
      .withAutoselectors(['itemCount'])
      .withoutActions();

    const source = createErgoStoreSelectorSource(store, 'itemCount');

    expect(Object.keys(source).sort()).toEqual(['get', 'subscribe']);
    expect(Object.getOwnPropertyNames(store)).toEqual(
      expect.arrayContaining(['getItemCount', 'subscribeItemCount'])
    );
  });
});
