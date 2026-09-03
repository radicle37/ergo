# Ergo React

`ergo-react` is the React adapter for `ergo-state`. It uses the same store builder and facade conventions as Ergo, then adds generated `use<Name>()` hooks for selectors and autoselectors.

Use this package when a store is consumed from React render paths. Use `ergo-state` directly when a store only needs getters, subscribers, actions, middleware APIs, and full-state `get` / `set`.

## Installation And Peer Dependencies

```sh
pnpm add ergo-react zustand react use-sync-external-store
```

`ergo-react` depends on the base `ergo-state` package and has React-specific peer dependencies: `react`, `use-sync-external-store`, and `zustand`.

The React integration is built and tested for Single Page Applications using React 18+. Server-side rendering and hydration compatibility are not part of the supported scope. They may work in some setups, but they are not a compatibility target and should be validated by the consuming application.

## Value Add

Ergo React keeps the base Ergo API and adds generated hooks:

- `get<Name>()` for imperative reads.
- `subscribe<Name>(listener)` for non-React subscriptions.
- `use<Name>()` for React render paths.
- `actions` for domain mutations kept outside the state object.
- `middleware.<name>` for lifecycle APIs added by Zustand middleware.

The main benefit is that selector definitions stay in the store module while React consumers import stable, domain-named hooks. Components do not need to import raw Zustand hooks, selector functions, or store internals.

## Quick Start

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

## Main Documentation

The core builder, selector, action, state-surface, equality, middleware, and factory behavior is documented in `ergo`. Start with the base Ergo README for those concepts, then use the React-specific guide here for hook export patterns.

## Guide

- [React Consumers](./docs/react-consumers.md): how to export hook-focused APIs for components.
