# Ergo Development

These notes are for developers changing `ergo`. The public README should stay focused on how to use Ergo from an application store.

## Module Layout

- `index.ts` keeps the vanilla root entry point.
- `createErgoVanillaStore.ts` keeps the vanilla builder implementation.
- `types.ts` re-exports only the intentional public type surface for store authors.
- `internalTypes.ts` contains implementation-facing mapped types, builder stages, mode helpers, and finalizer option types.
- `createErgoStoreBuilder.ts` owns the staged builder implementation.
- `createErgoStoreApiFromOptions.ts` assembles the shared vanilla-safe store API from normalized options.
- `createErgoVanillaStoreFromOptions.ts` returns the shared hookless store API for the root entry.
- `createErgoStoreSelectorEntries.ts` combines autoselectors and custom selectors.
- `selectorDefinitions.ts` normalizes selector shorthand and `defineErgoStoreSelector` output.
- `selectorValidation.ts` contains runtime validation for public and internal selector API keys.
- `createSelectorMethodMap.ts` and `createErgoStoreApiMethodName.ts` generate method names.
- `adapter-internal.ts` exposes the narrow internal support surface consumed by `ergo-react`.
- `subscribeWithEqualityFn.ts` contains the non-React selector subscription helper.

## Public Type Coverage

Most Ergo tests live inside `packages/ergo`, where they can test runtime behavior and source-level types together. Some TypeScript problems only show up after another package imports Ergo through its package export, so there is also a small compile-only package that exercises the public API surface from a package-boundary perspective:

```sh
packages/ergo-public-api-check
```

That package is not application code. It exists only to run `tsc` against examples that import `ergo` and `ergo-react` the same way a real workspace package does. Use it for public API type checks, especially cases involving exported declarations, `package.json` exports, or middleware typing. Keep vanilla runtime behavior tests in `packages/ergo`; keep React runtime behavior tests in `packages/ergo-react`.

Use `packages/ergo-public-api-check` when the question is "does another package see the exported type correctly?" Keep a focused source-level type check in `packages/ergo` when the question is about an internal helper, a staged builder type, or a regression that does not need a package-boundary import.

Run the public-API type checks directly with:

```sh
pnpm --filter ergo-public-api-check run typecheck
```

or through Turbo when you want dependency build steps included:

```sh
pnpm exec turbo run typecheck --filter=ergo-public-api-check
```

## Maintenance Notes

The package `exports` field exposes the vanilla root entry (`.`) and the narrow `./adapter-internal` support entry consumed by `ergo-react`. React-capable consumers should import from `ergo-react`; vanilla consumers should import from `ergo`. Keep `./adapter-internal` limited to the smallest surface extension packages need.

When adding selector-related behavior, update both runtime validation and the corresponding type constraints in `internalTypes.ts`; the tests intentionally cover both runtime behavior and type inference. Re-export from `types.ts` only when store authors have a concrete reason to import the type from the package entry.

## Dependency Notes

The root Ergo API must stay React-free. Files used by `src/index.ts` and `src/adapter-internal.ts` may import `zustand/vanilla` and `zustand/vanilla/shallow`, but must not import root `zustand`, `zustand/react`, `zustand/traditional`, `react`, or `use-sync-external-store`. Hook generation belongs in `ergo-react`.

React should remain a peer of `ergo-react`, not `ergo`, so vanilla consumers do not install or load React-only dependencies.

`packages/ergo-public-api-check` should list the peer packages needed by the entries it checks. That keeps the compile-only package shaped like a real package-boundary consumer instead of relying on hoisted or auto-installed peers from another workspace package.

When changing middleware support, check both layers:

- `packages/ergo/src/createErgoStore.test.ts` for source-level behavior and compile-time assertions near the implementation.
- `packages/ergo-public-api-check/src/` for public declaration behavior as a separate package sees it.
