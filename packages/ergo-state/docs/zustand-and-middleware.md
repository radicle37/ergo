# Zustand And Middleware

[Back to README](../README.md)

Ergo uses Zustand as its store engine. You do not need to be a Zustand expert to use Ergo, but it helps to know what Ergo is wrapping.

## What Is Zustand?

Zustand is a small state-management library. A vanilla Zustand store is an object with a few basic methods:

- `getState()` reads the full state object.
- `setState(...)` updates the state.
- `subscribe(listener)` runs a listener when state changes.
- `getInitialState()` returns the store's initial state.

Zustand also works outside React. Ergo builds on the vanilla store so the same state can be consumed from services, tests, and other TypeScript modules. 

React applications can use `ergo-react` for hook-based consumption.

## How does Zustand differ

Ergo keeps Zustand as the underlying implementation and adds a consistent facade,

### Actions vs State

In Ergo, `actions` are functions that are part of the Store API, but live outside the state itself.

In Zustand, such functions are canonically not directly on the Store API but defined to be a part of the state.

Functions can be placed in the state in Ergo as well but generally most functions related to a store are not actually really part of the mental model for the state so Ergo does not treat them as state.

There are exceptions when functions may make sense as part of state (e.g. cases such as where the state is keeping track of registered callbacks).

However, typically functions associated with the store are not meant to themselves change over time but rather offer ways to update state or perform some functionality based on the state.

In Ergo, we strongly encourage having such functions defined as actions, external to the state itself.

This allows us to make it clear that they exist outside of the mutable state and have more obviously stable references as the state evolves.

### Selectors

In Zustand, selectors are not generally related to the construction of the store API.

In Ergo, selectors play a major role in shaping the store API.

This provides more functionality for convenience with less boilerplate.

Selector definitions generate matching `get<Name>()` and `subscribe<Name>(...)` methods. With `zustand-react` you also get React hooks `use<Name>()`.

Relatedly, Ergo has a few conventions around naming: e.g. using underscore prefixes to signal state that is really meant for internal usage or using lowercase letters when specifying the name to avoid collisions.

### Other deviances
For Ergo, `get` and `set` are the Ergo names for full-state reads and writes analogous to `getState` and `setState` for Zustand.

Lifecycle APIs added by any middleware are grouped under `middleware` in Ergo and ergo snapshots the middleware namespace once at store construction.

This would mean that more exotic middleware that installs lifecycle APIs asynchronously would not appear on `storeApi.middleware`.


## What Is Zustand Middleware?

Middleware is code that wraps store creation and changes what the store can do. Some middleware changes how existing methods behave. Some middleware adds extra APIs to the store object.

Common examples:

- [`immer`](https://zustand.docs.pmnd.rs/reference/middlewares/immer) lets `set` accept draft-style updates.
- [`persist`](https://zustand.docs.pmnd.rs/reference/middlewares/persist) saves and restores state from storage.
- [`devtools`](https://zustand.docs.pmnd.rs/reference/middlewares/devtools) connects store updates to Redux DevTools.
- [`subscribeWithSelector`](https://zustand.docs.pmnd.rs/reference/middlewares/subscribe-with-selector) adds a selector-aware overload to Zustand's raw `subscribe` method.
- [`redux`](https://zustand.docs.pmnd.rs/reference/middlewares/redux) adds a reducer and `dispatch` pattern.
- [`combine`](https://zustand.docs.pmnd.rs/reference/middlewares/combine) combines initial state with additional state or actions and can help with type inference in raw Zustand stores.

## Using Middleware In Ergo

Choose middleware before `withInitialState` so middleware behavior is available while the store is created and after the facade is returned.

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

## Composing Middleware

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

## Middleware Namespace

Zustand APIs added by middleware are exposed under `storeApi.middleware` instead of at the top level. This keeps the Ergo facade narrow while still making lifecycle APIs available when a store opts into them. It also prevents name collisions with core facade members, actions, and generated selector APIs.

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

## Official Zustand Docs

Use the Ergo examples on this page for the supported facade shape. Use the official Zustand docs when you need middleware-specific options or lower-level Zustand behavior:

- [Zustand reference](https://zustand.docs.pmnd.rs/reference/index)
- [Zustand middleware reference](https://zustand.docs.pmnd.rs/reference/index#middlewares)
- [Beginner TypeScript guide](https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript)
- [Advanced TypeScript guide](https://zustand.docs.pmnd.rs/learn/guides/advanced-typescript)
- [Slices pattern guide](https://zustand.docs.pmnd.rs/learn/guides/slices-pattern)
- [Third-party libraries](https://zustand.docs.pmnd.rs/reference/integrations/third-party-libraries)

## DevTools Runtime Note

The `devtools` middleware follows Zustand's behavior. Its TypeScript API includes `middleware.devtools.cleanup()` when the store is built with `devtools`, but the runtime object depends on the Redux DevTools extension connection being available. In code paths that may run without the extension, guard the call:

```ts
counterStoreApi.middleware.devtools?.cleanup();
```

## Related Pages

- [Getting Started](./getting-started.md)
- [FAQ](./faq.md)
