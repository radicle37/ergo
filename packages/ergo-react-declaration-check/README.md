# Ergo React Declaration Check

This private fixture models a downstream library that depends on `ergo-react`, exports an inferred store factory, and emits declarations with TypeScript 7.

Its build verifies that generated getters, subscribers, hooks, and actions remain precise, and rejects declarations containing `ergo-state/adapter-internal`, `node_modules`, or `.pnpm` paths.

```sh
pnpm --filter ergo-react-declaration-check build
```
