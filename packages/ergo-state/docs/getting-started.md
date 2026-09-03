# Getting Started

[Back to README](../README.md)

Ergo creates a store internally and returns a typed facade. That facade is the store's intended public API: it tells consumers which values to read, which actions to call, and which infrastructure APIs are available without exposing the raw store.

## Store Shape

```ts
import { createErgoStore } from 'ergo-state';

interface CounterState {
  count: number;
}

interface CounterActions {
  increment: () => void;
}

export const counterStoreApi = createErgoStore<CounterState, CounterActions>()
  .withInitialState(() => ({
    count: 0
  }))
  .withAutoselectors(['count'])
  .withActions(({ getCount, set }) => ({
    increment: () => {
      set({ count: getCount() + 1 });
    }
  }));
```

The returned API includes:

- `get()` for full-state reads when a narrower getter is not enough.
- `set(...)` for tightly scoped setup, reset, and tests.
- `middleware` for lifecycle APIs added by Zustand middleware.
- `actions` for store mutations.
- Generated selector methods such as `getCount()` and `subscribeCount(...)`.

Store modules can then re-export the subset that each consumer layer should use. Services might import getters, subscribers, and actions; tests can import the full facade when they need setup or assertions. React applications can use `ergo-react` when they also need generated hooks.

## Builder Stages

Every store makes the same setup choices in the same order:

```ts
createErgoStore<State, Actions>()
  .withMiddleware(...) // optional
  .withInitialState(...)
  .withAutoselectors(...) // or .withoutAutoselectors()
  .withSelectors(...) // optional
  .withActions(...); // or .withoutActions()
```

This keeps store setup predictable. The builder guides authors through the intended order, and TypeScript uses each step to narrow what can happen next. By the time the store is finished, the generated getters, subscribers, actions, and middleware APIs all reflect the choices made earlier in the chain.

## State-Only Stores

Use `.withoutActions()` when a store only needs state and selectors:

```ts
export const panelStoreApi = createErgoStore<{ isOpen: boolean }>()
  .withInitialState(() => ({
    isOpen: false
  }))
  .withAutoselectors(['isOpen'])
  .withoutActions();
```

## Inferred State

Stores without middleware can let TypeScript infer state from `withInitialState`:

```ts
const store = createErgoStore()
  .withInitialState(() => ({
    label: 'ready'
  }))
  .withAutoselectors(['label'])
  .withoutActions();

store.getLabel();
```

Stores with middleware should pass an explicit state type before calling `withMiddleware`. Middleware can change the type of `set`, `get`, or the store object, and TypeScript needs the state shape before it can understand those changes.

## Related Pages

- [Selectors And Actions](./selectors-and-actions.md)
- [Store Factories](./store-factories.md)
- [Zustand And Middleware](./zustand-and-middleware.md)
