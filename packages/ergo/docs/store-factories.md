# Store Factories

[Back to README](../README.md)

Most app stores can be exported as a singleton from their store module.

However, it can be useful to use a store factory when the same state model needs more than one independent store instance.

Common cases:

- A feature can appear more than once on the page and each instance needs its own state.
- Tests need a fresh store per test, especially when tests run in parallel.
- A parent object owns the lifecycle of a store and should create or discard it with that object.
- Middleware configuration varies by instance, such as a `persist` storage key or `devtools` name.

## Factory Shape

Put the full `createErgoStore` chain inside a function. Each call creates a new underlying store, new generated subscribers, and a new `actions` object.

```ts
import { createErgoStore } from 'ergo';

interface CounterState {
  count: number;
  label: string;
}

interface CounterActions {
  increment: () => void;
  reset: () => void;
}

interface CreateCounterStoreOptions {
  initialState?: Partial<CounterState>;
}

const getInitialCounterState = (initialState: Partial<CounterState> = {}): CounterState => ({
  count: 0,
  label: 'ready',
  ...initialState
});

export const createCounterStore = ({ initialState = {} }: CreateCounterStoreOptions = {}) => {
  const getInitialState = () => getInitialCounterState(initialState);

  return createErgoStore<CounterState, CounterActions>()
    .withInitialState(getInitialState)
    .withAutoselectors(['count', 'label'])
    .withActions(({ getCount, set }) => ({
      increment: () => {
        set({ count: getCount() + 1 });
      },
      reset: () => {
        set(getInitialState());
      }
    }));
};

export type CounterStoreApi = ReturnType<typeof createCounterStore>;
```

Keep initial state creation inside a function so each store instance receives fresh state. This matters when state contains arrays, objects, maps, sets, or other mutable references.

## Singleton From The Same Factory

When app code only needs one instance, create and export a singleton from the same factory:

```ts
export const counterStoreApi = createCounterStore();

export const {
  actions: counterActions,
  getCount,
  subscribeCount
} = counterStoreApi;
```

This keeps normal app imports ergonomic while still giving tests and repeated feature instances a factory for isolated stores.

## Parallel Tests

Imported singleton stores share state inside a test worker. Resetting a singleton in `beforeEach` is fine for simple sequential tests, but a factory is safer when tests run in parallel or when each test needs a custom starting point.

```ts
import { describe, expect, test } from 'vitest';

import { createCounterStore } from './store';

describe('counter store', () => {
  test.concurrent('increments from the default state', () => {
    const store = createCounterStore();

    store.actions.increment();

    expect(store.getCount()).toBe(1);
  });

  test.concurrent('increments from a custom state', () => {
    const store = createCounterStore({
      initialState: {
        count: 10
      }
    });

    store.actions.increment();

    expect(store.getCount()).toBe(11);
  });
});
```

The important part is that the test imports `createCounterStore`, not the module-level `counterStoreApi` singleton. Each test gets its own independent state, actions, and subscribers.

## Multiple Runtime Instances

Factories are also useful for repeated runtime surfaces:

```ts
const leftPanelStore = createCounterStore({
  initialState: {
    label: 'left'
  }
});

const rightPanelStore = createCounterStore({
  initialState: {
    label: 'right'
  }
});

leftPanelStore.actions.increment();

rightPanelStore.getCount(); // 0
```

Generated subscribers are bound to the store instance that created them. For repeated instances, keep the store API tied to the owning feature instance so consumers do not accidentally read from the wrong instance. React-specific factory guidance lives in `ergo-react`.

## Middleware In Factories

Middleware options belong inside the factory too. If middleware uses external identity, make that identity part of the factory options so separate instances do not collide.

```ts
import { persist } from 'zustand/middleware';

interface CreatePersistedCounterStoreOptions {
  initialState?: Partial<CounterState>;
  storageName: string;
}

export const createPersistedCounterStore = ({
  initialState = {},
  storageName
}: CreatePersistedCounterStoreOptions) => {
  const getInitialState = () => getInitialCounterState(initialState);

  return createErgoStore<CounterState, CounterActions>()
    .withMiddleware(initializer =>
      persist(initializer, {
        name: storageName
      })
    )
    .withInitialState(getInitialState)
    .withAutoselectors(['count', 'label'])
    .withActions(({ getCount, set }) => ({
      increment: () => {
        set({ count: getCount() + 1 });
      },
      reset: () => {
        set(getInitialState());
      }
    }));
};
```

The same rule applies to `devtools` names, storage adapters, hydration behavior, or any other middleware option that should differ by store instance.

## Avoid

- Do not call a store factory repeatedly from a hot path when the caller expects one stable store instance.
- Do not destructure generated methods from a factory before you know which store instance they belong to. Destructure from a singleton or from a specific created instance.
- Do not share mutable initial state objects between instances. Return fresh state from the initial-state function.
- Do not import a module-level singleton in tests that need isolated or parallel store state. Import the factory instead.

## Related Pages

- [Getting Started](./getting-started.md)
- [State Surface](./state-surface.md)
