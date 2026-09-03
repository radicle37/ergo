import { describe, expect, expectTypeOf, test, vi } from 'vitest';

import { createErgoStore } from './index';

describe('documentation examples', () => {
  test('README vanilla consumers example exposes hookless getters and subscribers', () => {
    const counterStoreApi = createErgoStore<{ count: number }>()
      .withInitialState(() => ({
        count: 0
      }))
      .withAutoselectors(['count'])
      .withoutActions();

    type CounterStoreApiKeys = keyof typeof counterStoreApi;
    type HasCountHook = 'useCount' extends CounterStoreApiKeys ? true : false;

    expectTypeOf(counterStoreApi.getCount).returns.toEqualTypeOf<number>();
    expectTypeOf(counterStoreApi.subscribeCount).toEqualTypeOf<
      (listener: (selectedValue: number) => void) => () => void
    >();
    expectTypeOf<HasCountHook>().toEqualTypeOf<false>();

    const count = counterStoreApi.getCount();
    const countListener = vi.fn();
    const unsubscribe = counterStoreApi.subscribeCount(nextCount => {
      countListener(nextCount);
    });

    expect(count).toBe(0);
    expect(countListener).toHaveBeenCalledWith(0);
    expect('useCount' in counterStoreApi).toBe(false);

    counterStoreApi.set({ count: 1 });

    expect(counterStoreApi.getCount()).toBe(1);
    expect(countListener).toHaveBeenCalledTimes(2);
    expect(countListener).toHaveBeenLastCalledWith(1);

    unsubscribe();
  });
});
