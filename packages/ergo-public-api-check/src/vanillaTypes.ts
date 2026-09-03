import type { Mutate, StoreApi } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';

import { createErgoStore, defineErgoStoreSelector } from 'ergo';

interface CounterState {
  label: string;
  nested: {
    count: number;
  };
}

interface CounterActions {
  increment: () => void;
}

type ImmerSetState<State extends object> = Mutate<
  StoreApi<State>,
  [['zustand/immer', never]]
>['setState'];

const vanillaStore = createErgoStore()
  .withInitialState(() => ({
    count: 0,
    items: [] as string[]
  }))
  .withAutoselectors(['count'])
  .withSelectors({
    itemCount: defineErgoStoreSelector(
      (state: { count: number; items: string[] }) => state.items.length,
      Object.is
    )
  })
  .withoutActions();

const count: number = vanillaStore.getCount();
const itemCount: number = vanillaStore.getItemCount();
void count;
void itemCount;

const unsubscribe = vanillaStore.subscribeCount(selectedCount => {
  const nextCount: number = selectedCount;
  void nextCount;
});

unsubscribe();

const assertNoVanillaStoreHook = () => {
  // @ts-expect-error vanilla stores do not expose generated React hooks
  return vanillaStore.useCount;
};

void assertNoVanillaStoreHook;

const vanillaImmerStore = createErgoStore<CounterState, CounterActions>()
  .withMiddleware(immer)
  .withInitialState(set => {
    // Compile-time regression check only: `set` should be the immer-mutated setter here.
    void (set satisfies ImmerSetState<CounterState>);

    return {
      label: 'ready',
      nested: {
        count: 0
      }
    };
  })
  .withAutoselectors(['nested'])
  .withActions(({ getNested, set }) => ({
    increment: () =>
      set(state => {
        state.label = 'updated';
        state.nested.count = getNested().count + 1;
      })
  }));

vanillaImmerStore.actions.increment();

const assertNoVanillaActionStoreHook = () => {
  // @ts-expect-error vanilla action stores do not expose generated React hooks
  return vanillaImmerStore.useNested;
};

void assertNoVanillaActionStoreHook;
