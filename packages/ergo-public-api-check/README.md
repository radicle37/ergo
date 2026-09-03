# Ergo Public API Check

This package contains compile-only TypeScript checks for the public API surface of `ergo` and `ergo-react`.

It is separate from `packages/ergo` and `packages/ergo-react` on purpose. Tests inside those packages are good for runtime behavior and source-level typing, but they can miss problems in the built public declarations or in the package `exports` field. This package imports both packages by their public names, the same way app packages do, so it checks the public API that consumers actually see.

## What Belongs Here

Use this package for type cases that must cross the package boundary:

- exported builder overloads;
- generated getter/action/hook types as seen by consumers;
- middleware typing, such as `immer` changing what `set` accepts;
- expected compile failures for unsupported public API shapes;
- confirmation that internal-only types are NOT reachable from the public entries.

Keep runtime behavior tests in `packages/ergo` and `packages/ergo-react`. This package should not use Vitest, React test helpers, mocks, or application-specific dependencies.

## Dependencies

This package declares the peer packages needed by the entries it checks in its own `dependencies` because it is meant to behave like a real consumer package. Do not rely on another workspace package, hoisting, or pnpm peer auto-install behavior to provide `react`, `use-sync-external-store`, or `zustand` here.

## How To Add A Case

Add a small `.ts` file under `src/`, import from `ergo` or `ergo-react`, and let `tsc` be the test runner.

For positive cases, assign values to the expected type or use `satisfies`:

```ts
void (set satisfies ExpectedSetType);
```

For negative cases, use `@ts-expect-error` next to the exact expression that should fail:

```ts
// @ts-expect-error middleware needs an explicit State generic so TypeScript knows the state shape
createErgoStore().withMiddleware(immer);
```

If a negative case starts compiling, `tsc` reports the unused `@ts-expect-error`, which means the public API changed and the case should be reviewed.

## How To Run

Run only this package:

```sh
pnpm --filter ergo-public-api-check run typecheck
```

Run it through Turbo, including dependency build steps:

```sh
pnpm exec turbo run typecheck --filter=ergo-public-api-check
```

The package has no build output and no runtime test command.
