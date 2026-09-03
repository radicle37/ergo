# FAQ

[Back to README](../README.md)

## What Problem Is Ergo Solving?

Ergo solves consistency and API clarity. Raw Zustand is flexible, but each store author still has to decide how to expose imperative getters, subscriptions, selectors, actions, middleware lifecycle APIs, and test helpers. Ergo makes those decisions once so each store has a clear public facade and store modules look and feel the same.

## What Is Zustand?

Zustand is the state library Ergo uses underneath. A Zustand store holds state and gives you methods to read state, update state, and subscribe to changes.

## What Are Zustand Middleware?

Middleware are wrappers around store creation. They can change how updates work or add extra APIs to the store. For example, `immer` lets updates mutate a draft object, `persist` adds storage and hydration helpers, and `devtools` adds Redux DevTools integration.

## Why Not Use Zustand Directly?

Use raw Zustand when a store needs a custom shape or uncommon middleware behavior that Ergo would make awkward. Use Ergo when a store should follow a fixed shape: selectors generate getters/subscribers, actions live outside state, and consumers import the smallest API they need.

The tradeoff is deliberate. Raw Zustand gives maximum flexibility. Ergo gives less room for local variation and a more predictable API.

## Does Ergo Hide Zustand?

No. Zustand is still the underlying implementation, and middleware still comes from Zustand. Ergo hides the raw store object from normal consumers, but it does not prevent store authors from using Zustand features through the supported `withMiddleware`, `get`, `set`, selector, subscriber, and `middleware` APIs.

## Why Are Actions Outside The State Object?

Actions are behavior, not state data. Keeping them outside the state object gives every store the same convention: read state through generated getters/subscribers, and call mutations through `storeApi.actions`.

It also avoids several practical problems. Actions inside Zustand state are mutable references, so they can be replaced as part of normal state updates unless every caller is careful. Keeping actions outside state gives those function references a stable home while state changes. It also keeps persisted or serialized state focused on data, avoids name collisions with generated APIs such as `get<Name>()`, and prevents selectors from accidentally exposing action functions as state.

## Why Does Middleware Require An Explicit State Type?

Middleware can change the type of `set`, `get`, or the store object. TypeScript needs to know the state shape before it can understand those changes. That is why middleware stores should start with `createErgoStore<State>()` or `createErgoStore<State, Actions>()`.

## Why Is Middleware Under `middleware`?

Middleware APIs such as `persist.rehydrate()` and `devtools.cleanup()` are useful, but exposing every middleware property at the top level would make the Ergo facade look more like the raw Zustand store. It would also create collision risk with existing facade members, action names, and generated selector APIs. The namespace keeps those APIs available without crowding the main store surface.

For example, `storeApi.middleware.persist.rehydrate()` makes it clear that `persist` is infrastructure provided by middleware, not domain state or a store action.

## Why Not Export The Raw Zustand Store Too?

Exporting the raw store would let callers bypass selectors, actions, and the store module boundary. That undoes the consistency Ergo generates. If a consumer needs a new read or operation, prefer adding a selector, subscriber, or action to the store module.

## Can Tests Use `get` And `set` Directly?

Yes. Tests can use the full Ergo facade to seed, reset, and assert state. This keeps production APIs focused on real behavior instead of adding test-only actions.

## When Should I Use A Store Factory?

Use a factory when callers need independent store instances, such as repeated feature instances or parallel tests. Exporting a singleton from the factory keeps app imports simple, while tests can import the factory directly and create fresh state per test.

## Do I Need Custom Equality Functions?

Usually no. The default behavior works well for primitives and stable object references. Use a custom equality function when a selector returns a new array or object often, but consumers should only react when the selected value meaningfully changes.
