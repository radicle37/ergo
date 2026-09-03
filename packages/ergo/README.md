# Ergo

`ergo` is a small, opinionated state-management solution for TypeScript codebases.

It builds on top of the modern and modular but unopinionated state-management library, `zustand`, adding a layer of some opinionated conventions.

These conventions allow consumers to get more out-of-the-box, reducing the need for boilerplate code and its maintenance in common scenarios.

While `ergo` itself is agnostic to your framework of chice, for react-consumers, we suggest you consider using `ergo-react` which builds on this package and adds React-specific generated hooks.

Ergo helps store authors express the intended public API for a store: which values can be read, which mutations can be called, which lifecycle APIs are available.
It also helps clarify which details should stay inside the store module.

You define the state once, define selectors once, and get type-safe downstream APIs consumers usually need for free as part of the API:

- `actions` for domain mutations (these actions themselves are kept outside the state object)
- `middleware.<name>` for lifecycle APIs added by Zustand middleware, such as `persist.rehydrate()`.
- `get<Name>()` for imperative reads.
- `subscribe<Name>(listener)` for general subscriptions.
- `use<Name>()` for React hooks (available if using `ergo-react`)


## The Builder

Every Ergo store follows the same setup order:

```ts
createErgoStore<State, Actions>()
  .withMiddleware(...) // optional
  .withInitialState(...)
  .withAutoselectors(...) // or .withoutAutoselectors()
  .withSelectors(...) // optional
  .withActions(...); // or .withoutActions()
```

The staged builder guides authors with TypeScript through store setup in the intended order to maximize ergonomics: middleware first (if needed), then initial state, then selectors, then actions.

TypeScript uses each step to narrow what can happen next and to build the final API from the choices already made.

The generated store API becomes the store's public contract: narrow enough for normal use, but still carrying the low-level `get`, `set`, and middleware lifecycle APIs needed by tests, setup code, and cross-store wiring.

The benefits are in consistency without additional boilerplate.

Consumers do not need to write their own getters, subscibers, and hooks -- those come for free based on the selectors.

Actions can themselves make use of selector-derived functionality.

## Installation And Peer Dependencies

Install Ergo together with Zustand:

```sh
pnpm add ergo zustand
```

`zustand` is a required peer dependency because Ergo creates and wraps Zustand stores. The base `ergo` package does not load React. React consumers should use `ergo-react`.

## Quick Start

```ts
import { createErgoStore } from 'ergo';

interface TaskListState {
  activeTaskId: string | null;
  tasks: {
    id: string;
    completed: boolean;
    title: string;
  }[];
}

interface TaskListActions {
  completeTask: (taskId: string) => void;
}

export const taskListStoreApi = createErgoStore<TaskListState, TaskListActions>()
  .withInitialState(() => ({
    activeTaskId: null,
    tasks: []
  }))
  .withAutoselectors(['activeTaskId'])
  .withSelectors({
    completedTaskCount: state => state.tasks.filter(task => task.completed).length,
    taskCount: state => state.tasks.length
  })
  .withActions(({ get, set }) => ({
    completeTask: taskId =>
      set({
        tasks: get().tasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                completed: true
              }
            : task
        )
      })
  }));

export const {
  actions: taskListActions,
  getTaskCount,
  subscribeTaskCount
} = taskListStoreApi;
```

That export block is an API decision. It lets the store module expose the pieces consumers are meant to use without handing every caller the whole internal store shape. The same store definition gives different consumers the API they need:

```ts
const taskCount = getTaskCount();

const unsubscribe = subscribeTaskCount(count => {
  console.log(count);
});

taskListStoreApi.actions.completeTask('task-1');
```

## React Consumers

`ergo-react` builds on this package for React applications. It keeps the same builder, getters, subscribers, actions, and middleware surface, then adds generated hooks for React render paths. Its docs describe the React value-add and otherwise link back here for the main Ergo concepts.


## Vanilla Consumers

The root package entry generates hookless getters and subscribers:

```ts
import { createErgoStore } from 'ergo';

const counterStoreApi = createErgoStore<{ count: number }>()
  .withInitialState(() => ({
    count: 0
  }))
  .withAutoselectors(['count'])
  .withoutActions();

counterStoreApi.getCount();
counterStoreApi.subscribeCount(count => {
  console.log(count);
});
```

The root entry exposes `get<Name>()`, `subscribe<Name>()`, `actions`, `get`, `set`, and `middleware`, but it does not expose generated React hooks and does not load Ergo's React hook adapter.

## Ergo & Zustand

Ergo is built on top of the fantastic state-management library, [Zustand](https://zustand.docs.pmnd.rs/), and piggy-backs off of its excellent functionality and middleware ecosystem.

A Zustand store holds state and exposes basic operations such as reading state, writing state, and subscribing to changes.

Ergo creates that store internally, then exposes a facade that store authors can shape consistently across a codebase.

Zustand middleware is a wrapper around store creation that can change how the store behaves.
For example, `immer` lets `set` accept draft mutations for a more imperative style, `persist` stores state in browser storage, and `devtools` connects updates to Redux DevTools. Ergo supports middleware through `withMiddleware`; lifecycle APIs added by middleware are available under `storeApi.middleware`.

See [Zustand And Middleware](./docs/zustand-and-middleware.md) for examples, tradeoffs, and links to the official Zustand middleware docs.

## Guide

- [Getting Started](./docs/getting-started.md): the basic store shape, builder stages, and state-only stores.
- [Store Factories](./docs/store-factories.md): creating independent store instances for repeated features and parallel tests.
- [Selectors And Actions](./docs/selectors-and-actions.md): generated getters, subscribers, and using selectors inside actions.
- [State Surface](./docs/state-surface.md): public state, internal `_` state, and where direct state access is allowed.
- [Equality](./docs/equality.md): custom equality functions for subscribers.
- [Zustand And Middleware](./docs/zustand-and-middleware.md): what Zustand is, what middleware does, and how Ergo exposes middleware lifecycle APIs.
- [FAQ](./docs/faq.md): common questions, including when raw Zustand may be a better fit.

## Contributing

Contributor notes for the Ergo package live in [DEVELOPMENT.md](./DEVELOPMENT.md).
