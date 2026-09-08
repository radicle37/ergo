# Zustand and middleware

[Back to README](../README.md)

Ergo uses Zustand as its store engine. You do not need to be a Zustand expert to use Ergo, but it helps to know what Ergo is wrapping.

## What is Zustand?

Zustand is a small state-management library. A vanilla Zustand store is an object with a few basic methods:

- `getState()` reads the full state object.
- `setState(...)` updates the state.
- `subscribe(listener)` runs a listener when state changes.
- `getInitialState()` returns the store's initial state.

Zustand also works outside React. Ergo builds on the vanilla store so the same state can be consumed from services, tests, and other TypeScript modules. 

React applications can use `ergo-react` for hook-based consumption.

## How Ergo differs from Zustand

Ergo keeps Zustand as the underlying implementation and adds a consistent store API on top of it. See [Zustand vs. Ergo](./zustand-comparison.md) for this same difference worked through as a full code example.

### Actions vs. state

In Ergo, `actions` are functions that live on the store API but outside the state object. In plain Zustand, functions like this are conventionally placed inside the state itself.

You can put functions in Ergo's state too — for example, state that tracks a list of registered callbacks is a reasonable case for it. But most store-related functions aren't really part of the *data*; they're ways to change the data or act on it, and, unlike state, they aren't meant to change over time. Ergo encourages keeping those functions in `actions`, separate from state, so it's clear they're behavior rather than data, and so their references stay stable while the state around them changes.

### Selectors

In Zustand, selectors are just a pattern you can use — they don't shape the store's API. In Ergo, selectors *do* shape the API: each selector definition generates a matching `get<Name>()` and `subscribe<Name>()` method (and, with `ergo-react`, a `use<Name>()` hook too), so there's less to write by hand for the same result.

That difference is not just less typing — it changes what a consumer's *interface* looks like. `store.getState().modal.isOpen` and `store.subscribe(state => state.modal.isOpen, listener)` both require the caller to know the state's shape: what `state` looks like, and where `isOpen` lives inside it. That knowledge now lives at every call site. `getModalIsOpen()` and `subscribeModalIsOpen(listener)` require none of that — the caller sees a name and a value, nothing about what produced it. Passing a selector function into a generic accessor is a different kind of interface than calling a name that already means something; the first exposes internals through its call site, the second doesn't expose any. In raw Zustand (or Redux's `useSelector`), getting the second shape means hand-writing a dedicated wrapper per value, project after project. Ergo generates that wrapper as the direct output of defining a selector — see [React consumers](../../ergo-react/docs/react-consumers.md#neutral-interfaces-vs-exposed-internals) for the same argument applied to hooks.

Ergo also layers a couple of naming conventions on top: an underscore prefix marks state meant for internal use only (see [State surface](./state-surface.md)), and property names should start with a lowercase letter to avoid collisions with generated methods.

### Naming: `get`/`set` vs. `getState`/`setState`

Ergo's `get` and `set` do the same job as Zustand's `getState` and `setState` — full-state reads and writes — just under shorter names.

## What is Zustand middleware?

Middleware is code that wraps store creation and changes what the store can do. Some middleware changes how existing methods behave. Some middleware adds extra APIs to the store object.

Common examples:

- [`immer`](https://zustand.docs.pmnd.rs/reference/middlewares/immer) lets `set` accept draft-style updates.
- [`persist`](https://zustand.docs.pmnd.rs/reference/middlewares/persist) saves and restores state from storage.
- [`devtools`](https://zustand.docs.pmnd.rs/reference/middlewares/devtools) connects store updates to Redux DevTools.
- [`subscribeWithSelector`](https://zustand.docs.pmnd.rs/reference/middlewares/subscribe-with-selector) adds a selector-aware overload to Zustand's raw `subscribe` method.
- [`redux`](https://zustand.docs.pmnd.rs/reference/middlewares/redux) adds a reducer and `dispatch` pattern.
- [`combine`](https://zustand.docs.pmnd.rs/reference/middlewares/combine) combines initial state with additional state or actions and can help with type inference in raw Zustand stores.

## Using middleware in Ergo

Choose middleware before `withInitialState` so middleware behavior is available while the store is created and after the store API is returned.

```ts
import { immer } from 'zustand/middleware/immer';

interface CounterState {
  nested: {
    count: number;
  };
}

interface CounterActions {
  increment: () => void;
}

const counterStoreApi = createErgoStore<CounterState, CounterActions>()
  .withMiddleware(immer)
  .withInitialState(() => ({
    nested: {
      count: 0
    }
  }))
  .withAutoselectors(['nested'])
  .withActions(({ set }) => ({
    increment: () =>
      set(state => {
        state.nested.count += 1;
      })
  }));
```

When using middleware, provide the store state type before calling `withMiddleware`: `createErgoStore<State>()` or `createErgoStore<State, Actions>()`. Stores without middleware can still use `createErgoStore()` and let TypeScript infer the state from `withInitialState`.

## Composing middleware

For multiple Zustand middlewares, pass a small composition function:

```ts
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const storeApi = createErgoStore<CounterState>()
  .withMiddleware(initializer => devtools(immer(initializer), { name: 'counter' }))
  .withInitialState(() => ({
    nested: {
      count: 0
    }
  }))
  .withoutAutoselectors()
  .withoutActions();
```

## Middleware namespace

Zustand APIs added by middleware are exposed under `storeApi.middleware` instead of at the top level. This keeps Ergo's main store API small while still making lifecycle APIs available when a store opts into them. It also avoids naming collisions with the store's core methods, actions, and generated selector APIs.

```ts
import { persist } from 'zustand/middleware';

const counterStoreApi = createErgoStore<CounterState>()
  .withMiddleware(initializer =>
    persist(initializer, {
      name: 'counter',
      skipHydration: true
    })
  )
  .withInitialState(() => ({
    nested: {
      count: 0
    }
  }))
  .withAutoselectors(['nested'])
  .withoutActions();

counterStoreApi.middleware.persist.rehydrate();
```

The namespace is inferred from the middleware passed to `withMiddleware`, so `counterStoreApi.middleware.persist` is available only for stores built with `persist`. Under the hood, this uses Zustand's middleware type metadata, but store authors usually do not need to work with that directly.

Middleware that only changes base store methods shows up through the existing Ergo method. For example, `immer` changes `setState`, so Ergo's `set` gets the draft-update type; it does not add a `middleware.immer` property.

Ergo snapshots the middleware namespace once at store construction. Middleware that installs lifecycle APIs asynchronously (for example, after a network handshake) will not appear on `storeApi.middleware`. 

All Zustand built-ins (`persist`, `devtools`, `subscribeWithSelector`) attach synchronously during initializer execution, so this only matters for custom middleware that defers key installation.

## Official Zustand docs

Use the Ergo examples on this page for the supported store API shape. Use the official Zustand docs when you need middleware-specific options or lower-level Zustand behavior:

- [Zustand reference](https://zustand.docs.pmnd.rs/reference/index)
- [Zustand middleware reference](https://zustand.docs.pmnd.rs/reference/index#middlewares)
- [Beginner TypeScript guide](https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript)
- [Advanced TypeScript guide](https://zustand.docs.pmnd.rs/learn/guides/advanced-typescript)
- [Slices pattern guide](https://zustand.docs.pmnd.rs/learn/guides/slices-pattern)
- [Third-party libraries](https://zustand.docs.pmnd.rs/reference/integrations/third-party-libraries)

## DevTools runtime note

The `devtools` middleware follows Zustand's behavior. Its TypeScript API includes `middleware.devtools.cleanup()` when the store is built with `devtools`, but the runtime object depends on the Redux DevTools extension connection being available. In code paths that may run without the extension, guard the call:

```ts
counterStoreApi.middleware.devtools?.cleanup();
```

## Related pages

- [Getting started](./getting-started.md)
- [FAQ](./faq.md)
