# Ergo React

**The API you'd already write by hand — generated for you.**

`ergo-react` is the React adapter for `ergo-state`. It uses the same store builder and store API conventions as Ergo, then adds generated `use<Name>()` hooks for selectors and autoselectors.

Use this package when a store is consumed from React render paths. Use `ergo-state` directly when a store only needs getters, subscribers, actions, middleware APIs, and full-state `get` / `set`.

## Installation and peer dependencies

```sh
npm install ergo-react zustand react use-sync-external-store
# or
yarn add ergo-react zustand react use-sync-external-store
# or
pnpm add ergo-react zustand react use-sync-external-store
```

`ergo-react` depends on the base `ergo-state` package and has React-specific peer dependencies: `react`, `use-sync-external-store`, and `zustand`.

The React integration is built and tested for Single Page Applications using React 18+. Server-side rendering and hydration compatibility are not part of the supported scope. They may work in some setups, but they are not a compatibility target and should be validated by the consuming application.

## Value add

Ergo believes your state management implementation details shouldn't find their way into your React components. Ergo React keeps the base Ergo API and adds generated hooks:

- `get<Name>()` for imperative reads.
- `subscribe<Name>(listener)` for non-React subscriptions.
- `use<Name>()` for React render paths.
- `actions` for domain mutations kept outside the state object.
- `middleware.<name>` for lifecycle APIs added by Zustand middleware.

The main benefit is that selector definitions stay in the store module while React consumers import stable, domain-named hooks. Components do not need to import raw Zustand hooks, selector functions, or store internals.

This is the same wrapper hook teams often hand-write to avoid leaking state shape into components:

```tsx
// what you'd hand-write around useStore / Redux's useSelector
function useModalIsOpen() {
  return useStore(modalStore, state => state.isOpen);
}
```

```tsx
// what a selector definition already gives you in ergo-react
export const { useIsOpen: useModalIsOpen } = modalStoreApi;
```

`useModalIsOpen()` reveals nothing about what's underneath — it could be Zustand, Redux, Context, or something else entirely. `useStore(state => state.modal.isOpen)` and Redux's `useSelector(state => state.modal.isOpen)` can't make that promise: writing the selector means the caller already knows the state's shape.

Hand-writing that wrapper is fine for one value. It stops being fine once you have many stores and dozens or hundreds of selectors across a growing app: it's a near-identical function per value, repeated per store, with no compiler check that anyone actually wrote one for a new selector before a component reaches into the store directly instead. `ergo-react` generates the whole set from the same selector definitions that already back `get<Name>()` and `subscribe<Name>()`, so there's nothing to hand-write and nothing to fall out of sync. See [Neutral interfaces vs. exposed internals](./docs/react-consumers.md#neutral-interfaces-vs-exposed-internals) for the full argument, including what it looks like when a component skips the wrapper hook entirely.

## Quick start

```ts
import { createErgoStore } from 'ergo-react';

interface CounterState {
  count: number;
}

export const counterStoreApi = createErgoStore<CounterState>()
  .withInitialState(() => ({
    count: 0
  }))
  .withAutoselectors(['count'])
  .withoutActions();

export const { getCount, subscribeCount, useCount } = counterStoreApi; // The "useCount" export is what sets `ergo-react` apart from `ergo`
```

## Main documentation

The core builder, selector, action, state-surface, equality, middleware, and factory behavior is documented in `ergo`. Start with the base Ergo README for those concepts, then use the React-specific guide here for hook export patterns.

## Guide

- [React consumers](./docs/react-consumers.md): how to export hook-focused APIs for components.
