import type { Mutate, StoreApi } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createErgoStore } from 'ergo-react';

// This package is intentionally compile-only. It imports Ergo the same way an app package does, so
// tsc checks the generated public types instead of only checking source files inside packages/ergo-state.
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

const inferredStore = createErgoStore()
  .withInitialState(() => ({
    count: 0
  }))
  .withAutoselectors(['count'])
  .withoutActions();

const inferredCount: number = inferredStore.getCount();
void inferredCount;

const immerStore = createErgoStore<CounterState, CounterActions>()
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
  .withActions(({ set }) => ({
    increment: () =>
      set(state => {
        state.label = 'updated';
        state.nested.count += 1;
      })
  }));

const nestedValue: { count: number } = immerStore.getNested();
void nestedValue;

immerStore.actions.increment();
immerStore.set(state => {
  state.nested.count += 1;
});

const persistedStore = createErgoStore<CounterState>()
  .withMiddleware(initializer =>
    persist(initializer, {
      name: 'counter',
      skipHydration: true
    })
  )
  .withInitialState(() => ({
    label: 'ready',
    nested: {
      count: 0
    }
  }))
  .withAutoselectors(['nested'])
  .withoutActions();

void persistedStore.middleware.persist.rehydrate();
const hasHydrated: boolean = persistedStore.middleware.persist.hasHydrated();
void hasHydrated;

const devtoolsStore = createErgoStore<CounterState>()
  .withMiddleware(initializer => devtools(immer(initializer), { name: 'counter' }))
  .withInitialState(() => ({
    label: 'ready',
    nested: {
      count: 0
    }
  }))
  .withAutoselectors(['nested'])
  .withoutActions();

devtoolsStore.middleware.devtools.cleanup();

// @ts-expect-error middleware needs an explicit State generic so TypeScript knows the state shape
createErgoStore().withMiddleware(immer);
