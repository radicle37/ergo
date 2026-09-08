# FAQ

[Back to README](../README.md)

## What problem is Ergo solving?

Ergo solves consistency and API clarity. Raw Zustand is flexible, but each store author still has to decide how to expose imperative getters, subscriptions, selectors, actions, middleware lifecycle APIs, and test helpers. Ergo makes those decisions once so each store has a clear public API and store modules look and feel the same.

Most of what Ergo generates is exactly what a careful team already writes by hand — a named getter, a subscriber with an equality check, a wrapper hook that hides the state shape from callers. Ergo's whole pitch is that this shouldn't be a per-store, per-project chore: it's the API you'd already write by hand, generated for you.

## What is Zustand?

Zustand is the state library Ergo uses underneath. A Zustand store holds state and gives you methods to read state, update state, and subscribe to changes.

## What are Zustand middleware?

Middleware are wrappers around store creation. They can change how updates work or add extra APIs to the store. For example, `immer` lets updates mutate a draft object, `persist` adds storage and hydration helpers, and `devtools` adds Redux DevTools integration.

## Why not use Zustand directly?

Use raw Zustand when a store needs a custom shape or uncommon middleware behavior that Ergo would make awkward. Use Ergo when a store should follow a fixed shape: selectors generate getters/subscribers, actions live outside state, and consumers import the smallest API they need.

The tradeoff is deliberate. Raw Zustand gives maximum flexibility. Ergo gives less room for local variation and a more predictable API.

## Does Ergo hide Zustand?

No. Zustand is still the underlying implementation, and middleware still comes from Zustand. Ergo hides the raw store object from normal consumers, but it does not prevent store authors from using Zustand features through the supported `withMiddleware`, `get`, `set`, selector, subscriber, and `middleware` APIs.

## Why are actions outside the state object?

Actions are behavior, not state data. Keeping them outside the state object gives every store the same convention: read state through generated getters/subscribers, and call mutations through `storeApi.actions`.

It also avoids several practical problems. Actions inside Zustand state are mutable references, so they can be replaced as part of normal state updates unless every caller is careful. Keeping actions outside state gives those function references a stable home while state changes. It also keeps persisted or serialized state focused on data, avoids name collisions with generated APIs such as `get<Name>()`, and prevents selectors from accidentally exposing action functions as state.

## Why does middleware require an explicit state type?

Middleware can change the type of `set`, `get`, or the store object. TypeScript needs to know the state shape before it can understand those changes. That is why middleware stores should start with `createErgoStore<State>()` or `createErgoStore<State, Actions>()`.

## Why is middleware under `middleware`?

Middleware APIs such as `persist.rehydrate()` and `devtools.cleanup()` are useful, but exposing every middleware property at the top level would make Ergo's store API look more like the raw Zustand store, and would risk naming collisions with existing methods, action names, and generated selector APIs. Grouping them under `middleware` keeps those APIs available without crowding the rest of the store API.

For example, `storeApi.middleware.persist.rehydrate()` makes it clear that `persist` is infrastructure provided by middleware, not domain state or a store action.

## Why not export the raw Zustand store too?

Exporting the raw store would let callers skip selectors and actions and read or write state directly from anywhere in the codebase. That undoes the consistency Ergo is built to give you. If a consumer needs a new read or operation, add a selector, subscriber, or action to the store module instead — that keeps the store's logic in one place.

## Can tests use `get` and `set` directly?

Yes. Tests can use the full Ergo store API — including `get` and `set` — to seed, reset, and assert state. This keeps production APIs focused on real behavior instead of adding test-only actions.

## When should I use a store factory?

Use a factory (a function that creates a new, independent store each time it's called) when callers need independent store instances, such as repeated feature instances or parallel tests. Exporting one shared instance from the factory keeps normal app imports simple, while tests can import the factory function directly and get fresh state per test. See [Store factories](./store-factories.md) for a full walkthrough.

## Do I need custom equality functions?

Usually no. The default behavior works well for primitives and stable object references. Use a custom equality function when a selector returns a new array or object often, but consumers should only react when the selected value meaningfully changes.

## What if my app needs to update two stores together?

Ergo doesn't have a feature for that, on purpose. If updating one store always needs to correctly update another too — with no safe way for just one of them to happen — that's usually a sign they should be a single store instead of two. See [Store boundaries](./store-boundaries.md) for how to work through that, including the cases where it's fine to keep them separate (for example, when a server already owns the real data and your stores are just local copies of it).

## Coming from Redux or Redux Toolkit?

A lot carries over directly: state should only change through actions, and a slice's shape should be defined in one place. Ergo agrees with both.

What's different is the read side. Redux Toolkit doesn't generate a getter/subscriber/hook for a selector — most projects hand-write a typed `useAppSelector`/`useAppDispatch` pair once, then call `useAppSelector(selectFoo)` at every call site, reaching for `reselect`/`createSelector` when memoization matters. Ergo generates `getFoo()`, `subscribeFoo(...)`, and (with `ergo-react`) `useFoo()` straight from the same selector definition that backs the action side, so there's nothing to hand-write per project.

Async is also lighter. `createAsyncThunk` needs pending/fulfilled/rejected action types and `extraReducers` just to have an action that resolves with a value. In Ergo, an action is a function, so it can already return a promise — see [Actions can return values](./selectors-and-actions.md#actions-can-return-values).

Where Redux Toolkit is still the better fit: a single, serializable, time-travelable store for the whole app. Redux's one-big-store convention gives you one action log across every domain. Ergo, like Zustand, favors many small independent stores — better co-location and code-splitting, but no single cross-domain timeline. If your app genuinely needs that, use Redux Toolkit. The same is true of RTK Query: Ergo has no server-cache layer, so pair it with TanStack Query, RTK Query, or similar for that job.

See [Redux Toolkit vs. Ergo](./redux-toolkit-comparison.md) for the same feature built both ways, file by file.
