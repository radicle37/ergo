import { describe, expect, expectTypeOf, test, vi } from 'vitest';

import { createErgoStoreSelectorSource } from 'ergo-state';
import type { ErgoStoreSelectorSource } from 'ergo-state';

import { createErgoStore } from './index.js';

describe('createErgoStoreSelectorSource against ErgoReactStoreApi', () => {
  test('works against a store built by ergo-react, not just the vanilla root', () => {
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
    source.subscribe(listener);

    store.set({ itemCount: 4 });

    expect(listener).toHaveBeenLastCalledWith(4);
  });
});
