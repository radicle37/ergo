# Ergo

**The API you'd already write by hand — generated for you.**

Ergo is a small, opinionated state-management library for TypeScript apps.

Ergo helps store authors express a store's intended public API — which values can be read, which mutations can be called, which lifecycle APIs are available — with consistent naming, full type safety, and minimal boilerplate, while keeping implementation details out of consumer code.

Most state libraries leave you to build that exposure layer yourself — a getter, a hook, a subscription, for every value, in every store — and to keep it from leaking the state's internal shape into every call site. Nothing stops you from hand-writing that layer carefully; some teams do. Many get sick of writing the boilerplate and just start leaking the details. When repeated by hand across enough stores, implementations tend to diverge depending on who wrote it. Ergo's answer is to generate that layer from one set of selector definitions, instead of leaving it to hand-written judgment calls.

An alternative like Redux Toolkit gives you structure, but at the cost of a lot of setup — action types, typed hooks, slices wired into one big store. Zustand gives you freedom, but at the cost of a public API — state and actions sit together as one flat object, with nothing distinguishing what's meant for consumers from what's an internal implementation detail.

Ergo offers a middle ground: underneath, it's Zustand's small, framework-agnostic state container without all the serialization-related restrictions, but on top of that, Ergo generates the missing structure from explicit actions and one set of selector definitions, instead of leaving it to be hand-written in another layer.

## Less boilerplate

In Zustand and Redux, the store itself only exposes low-level primitives — `getState`/`setState`/`subscribe`, or `dispatch`. Every named accessor a consumer actually calls — a `selectFoo`, a `useFoo` hook, a `getFoo()` wrapper — lives in a separate layer that someone writes and maintains by hand, store by store. In Ergo, that layer isn't separate code you maintain: the store's returned API object *is* the generated getters, subscribers, hooks, and actions.

### Autoselectors

A common scenario you are likely to encounter is the need to extract a property from a store or subscribe to it. When using a solution like Zustand for state management, you might approach that by writing the following by hand:

```ts
function getIsOpen() {
  return modalStore.getState().isOpen;
}

function subscribeIsOpen(listener: (isOpen: boolean) => void) {
  let previous = getIsOpen();
  return modalStore.subscribe(() => {
    const next = getIsOpen();
    if (next !== previous) {
      previous = next;
      listener(next);
    }
  });
}
```

Using `withAutoselectors`, ergo helps you generate getters and subscribers in such cases with minimal code:

```ts
const modalStoreApi = createErgoStore<{ isOpen: boolean }>()
  .withInitialState(() => ({ isOpen: false }))
  .withAutoselectors(['isOpen'])
  .withoutActions();

modalStoreApi.getIsOpen();
modalStoreApi.subscribeIsOpen(isOpen => {
  /* ... */
});
```

If you are using React, `ergo-react` reduces the boilerplate further by giving you the custom hooks for selectors out of the box. React apps should use [`ergo-react`](#react-consumers), which builds on this vanilla package and adds generated React hooks.

### Custom selectors

Not every value a consumer needs is a top-level property — sometimes it's a derived value, or one that needs a custom equality check to avoid firing on every unrelated update. Use `withSelectors` for those:

```ts
.withSelectors({
  itemCount: state => state.items.length,
  activeTaskId: defineErgoStoreSelector(
    state => state.activeTaskId,
    Object.is
  )
})
```

You still get `getItemCount()`/`subscribeItemCount()` (and, with `ergo-react`, `useItemCount()`) for free. The equality function attached to `activeTaskId` is shared by its getter, subscriber, and hook — no need to repeat yourself. See [Equality](./docs/equality.md) for the built-in equality functions.

Most state libraries don't treat selectors as part of the store's API, so this consistency has to be hand-maintained per project. Elevating selectors to first-class status means naming stays consistent by default, every getter's value is also subscribable, and consuming code stays free of implementation details that would otherwise lock it to the current store shape.

### Super-powered actions

Actions are stable functions, defined alongside the store, with access to its internal state and selector-derived getters. They're the mechanism by which state should be updated in production code — though not every action has to update state, and an action can return anything you'd like, including a promise. Action inputs and outputs generally don't need to be serializable.

An action is just a function, so it can be `async` and return a result describing what happened, instead of just throwing on any failure:

```ts
interface CastResult {
  status: 'cast' | 'insufficient-mana';
  damage?: number;
}

// ...
  .withActions(({ getMana, set }) => ({
    async castSpell(spellId: string): Promise<CastResult> {
      const spell = await spellbookApi.load(spellId);

      const manaAfterSpell = getMana() - spell.manaCost;

      if (manaAfterSpell < 0) {
        return { status: 'insufficient-mana' };
      }

      set({ mana: manaAfterSpell });
      return { status: 'cast', damage: spell.damage };
    }
  }));
```

Callers can `await` the result and branch on it directly — no separate thunk mechanism, and no need to call the action and then separately re-read a selector to find out what happened:

```ts
const result = await characterStoreApi.actions.castSpell('fireball');

if (result.status === 'insufficient-mana') {
  showOutOfManaWarning();
}
```

See [Selectors and actions](./docs/selectors-and-actions.md#actions-can-return-values) for the full example.

#### Comparison to Redux and Zustand

Zustand doesn't have a dedicated concept of actions — functions that update state are usually just written as properties on the state object itself, and can be replaced or overwritten like any other value. Redux actions live outside state too, but each one is a plain object (`{ type, payload }`) that describes what happened; nothing actually happens until you call `dispatch(...)` with that object, and it's a common, silent bug to build the object and forget to dispatch it.

In Ergo, as in Zustand, an action is tied to its store from the moment it's created: the function's name plays the role Redux's `type` string plays, and its arguments play the role of `payload`. Calling the function is the only step — there's nothing separate to dispatch, and no extra "thunk" utility needed to handle a promise. That's also why action inputs and outputs in Ergo don't need to be JSON-serializable, unlike Redux, where every action and every piece of state has to be plain, serializable data so tools like Redux DevTools can log and "replay" past actions. Ergo and Zustand give up that replay ability in exchange for simpler, more flexible code — you can pass real class instances, functions, or anything else through an action without a workaround.

## Clearer conventions

Ergo gives clearer answers to two questions every store author faces: what's public API versus internal state, and how state should be updated.

Properties and selectors meant for internal use by your actions, rather than exposed in the public API, are prefixed with underscores:

```ts
.withSelectors({
  _hasPendingRequests: state => state._pendingRequestIds.length > 0, // internal only
  completedTaskCount: state => state.tasks.filter(t => t.completed).length // public
})
```

`_hasPendingRequests` provides a getter (`_getHasPendingRequests`) and subscriber (`_subscribeHasPendingRequests`) usable inside `withActions`  but generates no public getter, subscriber, or hook. See [State surface](./docs/state-surface.md) for the full rules.

## Everything in its right place

Where in your code should you specify middleware, initial state, selectors, and actions? Ergo guides you through a builder pattern that orders these specifications for you, removing ambiguity about where each piece belongs — see [The builder](#the-builder) below for the full setup order.

**Coming from Zustand?** Ergo is built directly on top of Zustand — same store engine, same middleware ecosystem, same modularity. The difference: Zustand's `create()` only gives you `getState`/`setState`/`subscribe`, so any named getter, subscriber, or hook is a wrapper you write yourself, per store. Ergo generates that wrapper layer from your selector definitions instead. See [Zustand vs. Ergo](./docs/zustand-comparison.md) for the same feature built both ways.

**Coming from Redux Toolkit?** You already believe in the important parts of this: a store's shape is defined in one place, and actions live outside state (see [Super-powered actions](#super-powered-actions) above for how Ergo's actions compare directly to `createSlice`/thunks). Ergo also generates the read side — getters, subscribers, hooks — from the same sort of selector definitions you are used to, so there's no separate `useAppSelector`/`hooks.ts` layer to hand-write per project. See [Redux Toolkit vs. Ergo](./docs/redux-toolkit-comparison.md) for the same feature built both ways.

You define the state once, define selectors once, and get type-safe APIs consumers usually need for free as part of the API:

- `actions` for domain mutations (these actions themselves are kept outside the state object)
- `middleware.<name>` for lifecycle APIs added by Zustand middleware, such as `persist.rehydrate()`.
- `get<Name>()` for imperative reads.
- `subscribe<Name>(listener)` for general subscriptions.
- `use<Name>()` for React hooks (available if using `ergo-react`)

### The builder

Every Ergo store follows the same setup order:

```ts
createErgoStore<State, Actions>()
  .withMiddleware(...) // optional
  .withInitialState(...)
  .withAutoselectors(...) // or .withoutAutoselectors()
  .withSelectors(...) // optional
  .withActions(...); // or .withoutActions()
```

TypeScript enforces this order, narrowing what's available at each step and building the final API from the choices already made. The result is the store's public contract: narrow enough for everyday use, but still carrying the low-level `get`, `set`, and middleware lifecycle APIs that tests, setup code, and cross-store wiring need.

## Installation and peer dependencies

Install Ergo together with Zustand:

```sh
npm install ergo-state zustand
# or
yarn add ergo-state zustand
# or
pnpm add ergo-state zustand
```

`zustand` is a required peer dependency because Ergo creates and wraps Zustand stores. The base `ergo-state` package does not load React. React consumers should use `ergo-react`.

## Quick start

```ts
import { createErgoStore } from 'ergo-state';

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

## React consumers

`ergo-react` builds on this package for React applications. It keeps the same builder, getters, subscribers, actions, and middleware surface, then adds generated hooks for React render paths. Its docs describe the React value-add and otherwise link back here for the main Ergo concepts.

## Vanilla consumers

The root package entry generates plain getters and subscribers you can call from anywhere — services, tests, non-React code. If you're in a React app, use `ergo-react` (above) instead, for generated hooks:

```ts
import { createErgoStore } from 'ergo-state';

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

Ergo creates that store internally, then exposes an API object that store authors can shape consistently across a codebase.

Zustand middleware is a wrapper around store creation that can change how the store behaves.
For example, `immer` lets `set` accept draft mutations for a more imperative style, `persist` stores state in browser storage, and `devtools` connects updates to Redux DevTools. Ergo supports middleware through `withMiddleware`; lifecycle APIs added by middleware are available under `storeApi.middleware`.

See [Zustand and middleware](./docs/zustand-and-middleware.md) for examples, tradeoffs, and links to the official Zustand middleware docs.

## Guide

- [Getting started](./docs/getting-started.md): the basic store shape, builder stages, and state-only stores.
- [Store factories](./docs/store-factories.md): creating independent store instances for repeated features and parallel tests.
- [Selectors and actions](./docs/selectors-and-actions.md): generated getters, subscribers, and using selectors inside actions.
- [State surface](./docs/state-surface.md): public state, internal `_` state, and where direct state access is allowed.
- [Store boundaries](./docs/store-boundaries.md): deciding whether related state belongs in one store or several, and why Ergo doesn't support cross-store write transactions.
- [Equality](./docs/equality.md): custom equality functions for subscribers.
- [Zustand and middleware](./docs/zustand-and-middleware.md): what Zustand is, what middleware does, and how Ergo exposes middleware lifecycle APIs.
- [Zustand vs. Ergo](./docs/zustand-comparison.md): the same feature built with raw Zustand and with Ergo, file by file.
- [Redux Toolkit vs. Ergo](./docs/redux-toolkit-comparison.md): the same feature built with `createSlice`/`createAsyncThunk` and with Ergo, file by file.
- [FAQ](./docs/faq.md): common questions, including when raw Zustand may be a better fit.

## Contributing

Contributor notes for the Ergo package live in [DEVELOPMENT.md](./DEVELOPMENT.md).
