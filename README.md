# Ergo Monorepo

Most users should start with the [`ergo-state` README](./packages/ergo-state/README.md), which documents the core store API, selectors, actions, and middleware. React users can then continue to the [`ergo-react` README](./packages/ergo-react/README.md).

This repository contains the Ergo packages: a small TypeScript state-management layer built on top of Zustand, plus the React adapter and public API type checks.

The package READMEs are the source of truth for consumer-facing usage. This root README is only a map of the workspace and the common repo-level commands.

## Packages

| Package | Purpose | Docs |
| --- | --- | --- |
| `ergo-state` | Framework-agnostic store builder and generated getters/subscribers/actions around Zustand. | [README](./packages/ergo-state/README.md), [development notes](./packages/ergo-state/DEVELOPMENT.md) |
| `ergo-react` | React adapter for `ergo-state`, adding generated `use<Name>()` hooks for selector-driven render paths. | [README](./packages/ergo-react/README.md), [development notes](./packages/ergo-react/DEVELOPMENT.md) |
| `ergo-public-api-check` | Compile-only checks confirming that `ergo-state` and `ergo-react` still expose correct types once another package imports them. | [README](./packages/ergo-public-api-check/README.md) |
| `ergo-react-declaration-check` | TypeScript 7 fixture confirming inferred React store factories emit portable declarations. | [README](./packages/ergo-react-declaration-check/README.md) |
| `ergo-state-declaration-check` | TypeScript 7 fixture confirming inferred vanilla store factories emit portable declarations. | [README](./packages/ergo-state-declaration-check/README.md) |

## Documentation Map

Start with the package README that matches what you are working on:

- [Ergo README](./packages/ergo-state/README.md) for the core builder, selectors, actions, middleware, and vanilla usage.
- [Ergo React README](./packages/ergo-react/README.md) for React-specific hook generation and consumption.
- [Public API Check README](./packages/ergo-public-api-check/README.md) for checking that types still look correct once another package imports them.

Additional core Ergo guides live under [packages/ergo-state/docs](./packages/ergo-state/docs):

- [Getting started](./packages/ergo-state/docs/getting-started.md)
- [Store factories](./packages/ergo-state/docs/store-factories.md)
- [Selectors and actions](./packages/ergo-state/docs/selectors-and-actions.md)
- [State surface](./packages/ergo-state/docs/state-surface.md)
- [Store boundaries](./packages/ergo-state/docs/store-boundaries.md)
- [Equality](./packages/ergo-state/docs/equality.md)
- [Zustand and middleware](./packages/ergo-state/docs/zustand-and-middleware.md)
- [Zustand vs. Ergo](./packages/ergo-state/docs/zustand-comparison.md)
- [Redux Toolkit vs. Ergo](./packages/ergo-state/docs/redux-toolkit-comparison.md)
- [FAQ](./packages/ergo-state/docs/faq.md)

React-specific guidance lives in [React consumers](./packages/ergo-react/docs/react-consumers.md).

## Setup

This repo is developed with pnpm specifically — `packageManager` in [package.json](./package.json) pins it, so Corepack will use pnpm regardless of what's installed globally. This only affects contributing to Ergo itself; apps consuming the published `ergo-state`/`ergo-react` packages can use npm, yarn, or pnpm freely (see each package's README).

Use the versions declared by the repo:

- Node: see [.nvmrc](./.nvmrc)
- pnpm: see `packageManager` and `engines.pnpm` in [package.json](./package.json)

Install dependencies:

```sh
pnpm install
```

## Repo Commands

```sh
pnpm build
pnpm typecheck
pnpm test
pnpm lint
```

Useful package-scoped examples:

```sh
pnpm --filter ergo-state test
pnpm --filter ergo-react test
pnpm --filter ergo-public-api-check typecheck
pnpm --filter ergo-react-declaration-check build
```

## Workspace Notes

This is a pnpm workspace orchestrated with Turbo. Package build output is written to each package's `build/` directory and is ignored by git.

Keep package-specific usage examples, API behavior, and maintenance details in the relevant package docs. Keep this root README limited to repository orientation and shared commands.
