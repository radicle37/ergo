import { describe, expect, expectTypeOf, test } from 'vitest';

import { createErgoStore, ErgoStoreSelectorMapMarker } from './index.js';
import type { ErgoStoreApi, ErgoStoreSelectorMapOf } from './index.js';

// Mirrors the `fromSelector`-style helper external tooling would write against
// `ErgoStoreSelectorMapOf`: given a store and a bare selector name, produce a typed
// `{ get, subscribe }` pair without needing the already-prefixed getter/subscriber name.
const fromSelector = <
  StoreApi extends ErgoStoreApi<any, any, any, any>,
  Key extends keyof ErgoStoreSelectorMapOf<StoreApi> & string
>(
  storeApi: StoreApi,
  key: Key
) => {
  const capitalizedKey = (key.charAt(0).toUpperCase() + key.slice(1)) as Capitalize<Key>;
  const storeApiRecord = storeApi as unknown as Record<string, unknown>;

  return {
    get: storeApiRecord[`get${capitalizedKey}`] as () => ReturnType<
      ErgoStoreSelectorMapOf<StoreApi>[Key]
    >,
    subscribe: storeApiRecord[`subscribe${capitalizedKey}`] as (
      listener: (value: ReturnType<ErgoStoreSelectorMapOf<StoreApi>[Key]>) => void
    ) => () => void
  };
};

describe('ErgoStoreSelectorMapMarker / ErgoStoreSelectorMapOf', () => {
  test('infers the bare selector name and its value type from a store value', () => {
    const store = createErgoStore()
      .withInitialState(() => ({ itemCount: 3 }))
      .withAutoselectors(['itemCount'])
      .withoutActions();

    const itemCount = fromSelector(store, 'itemCount');

    expectTypeOf(itemCount.get).returns.toEqualTypeOf<number>();
    expect(itemCount.get()).toBe(3);

    // @ts-expect-error 'itemCont' is a typo, not a real selector key
    fromSelector(store, 'itemCont');

    // @ts-expect-error 'getItemCount' is the generated getter name, not the bare selector name
    fromSelector(store, 'getItemCount');
  });

  test('merges autoselectors and custom selectors, with custom selectors winning on key collision', () => {
    const store = createErgoStore()
      .withInitialState(() => ({ itemCount: 3, taxRate: 0.1 }))
      .withAutoselectors(['itemCount'])
      .withSelectors({
        total: (state: { itemCount: number; taxRate: number }) =>
          state.itemCount * (1 + state.taxRate)
      })
      .withoutActions();

    expectTypeOf(fromSelector(store, 'itemCount').get).returns.toEqualTypeOf<number>();
    expectTypeOf(fromSelector(store, 'total').get).returns.toEqualTypeOf<number>();

    // @ts-expect-error 'taxRate' was never turned into a selector or autoselector
    fromSelector(store, 'taxRate');

    const overriddenStore = createErgoStore()
      .withInitialState(() => ({ itemCount: 3 }))
      .withAutoselectors(['itemCount'])
      .withSelectors({
        itemCount: (state: { itemCount: number }) => `${state.itemCount} items`
      })
      .withoutActions();

    // The custom selector replaces the autoselector with the same key, so the inferred type is
    // the override's `string`, not the shadowed autoselector's `number`.
    expectTypeOf(fromSelector(overriddenStore, 'itemCount').get).returns.toEqualTypeOf<string>();
  });

  test('the marker is unreachable via dot notation and never populated at runtime', () => {
    const store = createErgoStore()
      .withInitialState(() => ({ itemCount: 3 }))
      .withAutoselectors(['itemCount'])
      .withoutActions();

    // @ts-expect-error the marker is keyed on a symbol, not the string '_selectorMap'
    void store._selectorMap;
    // @ts-expect-error the marker's name typed as a plain string is not a real property either
    void store.ErgoStoreSelectorMapMarker;

    expect(store[ErgoStoreSelectorMapMarker]).toBeUndefined();
  });
});
