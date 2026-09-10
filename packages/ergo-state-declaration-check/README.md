# Ergo State Declaration Check

This private fixture models a downstream library that depends on `ergo-state`, exports an inferred
store factory, and emits declarations with TypeScript 7.

Its build verifies that generated getters, subscribers, and actions remain precise, and rejects
declarations containing internal or package-manager-specific paths.

```sh
pnpm --filter ergo-state-declaration-check build
```
