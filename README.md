# Ergo Monorepo

This repository contains the Ergo packages: a small TypeScript state-management layer built on top of Zustand, plus the React adapter and public API type checks.

The package READMEs are the source of truth for consumer-facing usage. This root README is only a map of the workspace and the common repo-level commands.

## Packages

| Package | Purpose | Docs |
| --- | --- | --- |
| `ergo-state` | Framework-agnostic store builder and generated getters/subscribers/actions around Zustand. | [README](./packages/ergo-state/README.md), [development notes](./packages/ergo-state/DEVELOPMENT.md) |
| `ergo-react` | React adapter for `ergo-state`, adding generated `use<Name>()` hooks for selector-driven render paths. | [README](./packages/ergo-react/README.md), [development notes](./packages/ergo-react/DEVELOPMENT.md) |
| `ergo-public-api-check` | Compile-only package-boundary checks for the public declaration surface of `ergo-state` and `ergo-react`. | [README](./packages/ergo-public-api-check/README.md) |

## Documentation Map

Start with the package README that matches what you are working on:

- [Ergo README](./packages/ergo-state/README.md) for the core builder, selectors, actions, middleware, and vanilla usage.
- [Ergo React README](./packages/ergo-react/README.md) for React-specific hook generation and consumption.
- [Public API Check README](./packages/ergo-public-api-check/README.md) for package-boundary type coverage.

Additional core Ergo guides live under [packages/ergo-state/docs](./packages/ergo-state/docs):

- [Getting Started](./packages/ergo-state/docs/getting-started.md)
- [Store Factories](./packages/ergo-state/docs/store-factories.md)
- [Selectors And Actions](./packages/ergo-state/docs/selectors-and-actions.md)
- [State Surface](./packages/ergo-state/docs/state-surface.md)
- [Equality](./packages/ergo-state/docs/equality.md)
- [Zustand And Middleware](./packages/ergo-state/docs/zustand-and-middleware.md)
- [FAQ](./packages/ergo-state/docs/faq.md)

React-specific guidance lives in [React Consumers](./packages/ergo-react/docs/react-consumers.md).

## Setup

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
```

## Workspace Notes

This is a pnpm workspace orchestrated with Turbo. Package build output is written to each package's `build/` directory and is ignored by git.

Keep package-specific usage examples, API behavior, and maintenance details in the relevant package docs. Keep this root README limited to repository orientation and shared commands.
