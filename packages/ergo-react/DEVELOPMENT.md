# Ergo React Development

These notes are for developers changing `ergo-react`. The main Ergo behavior is owned by `ergo-state`; this package should stay focused on React-specific generated hooks and React consumer documentation.

## Module Layout

- `createErgoStore.ts` keeps the React builder entry point and public React-capable type exports.
- `createErgoStoreFromOptions.ts` adds generated React hooks to the shared Ergo store API.
- `createStoreHook.ts` contains the React hook adapter around `zustand/traditional`.
- `index.ts` re-exports the public React package surface.
- `docs/react-consumers.md` contains React hook export and consumption guidance.

The package depends on `ergo-state` for the staged builder, vanilla-safe store assembly, selector helpers, and shared types. Import those through `ergo-state/adapter-internal`; do not reach into `ergo-state/src`.

## Dependency Notes

React should remain a peer instead of a normal dependency so consumers use their application React instance. The peer range should stay broad enough for supported React majors; the dev dependency can stay pinned to the version used by this repo's tests.

`createStoreHook.ts` imports `zustand/traditional`, which loads React and `use-sync-external-store` at runtime. Keep that dependency isolated in this package so the base Ergo package remains React-free.

## Testing

Keep React runtime behavior tests in this package. Keep package-boundary declaration checks in `packages/ergo-public-api-check` when the question is "does another package see the exported type correctly?"
