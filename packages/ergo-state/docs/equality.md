# Equality

[Back to README](../README.md)

Use `defineErgoStoreSelector` when a selector needs a custom equality function:

```ts
const store = createErgoStore<{ items: string[] }>()
  .withInitialState(() => ({ items: [] }))
  .withoutAutoselectors()
  .withSelectors({
    itemCount: defineErgoStoreSelector(
      (state: { items: string[] }) => state.items.length,
      Object.is
    )
  })
  .withoutActions();
```

The equality function is part of the selector definition. Ergo passes it to generated subscribers:

- `subscribeItemCount(listener)` uses the equality function through `subscribeWithEqualityFn`.
- `getItemCount()` still just returns the current selected value; equality is irrelevant for a one-off read.

`ergo-react` also uses the same selector equality function for its generated React hooks.

That matters for derived values that are cheap to read but expensive or noisy to react to. The selector can return the most convenient value shape, while the equality function defines what "meaningfully changed" means for subscribers.

## Common Equality Functions

`Object.is` is the usual choice for primitive selected values and stable object references. It is fast, explicit, and matches the common "same value or same reference" expectation.

```ts
const store = createErgoStore<{ activeTaskId: string | null }>()
  .withInitialState(() => ({ activeTaskId: null }))
  .withoutAutoselectors()
  .withSelectors({
    activeTaskId: defineErgoStoreSelector(
      (state: { activeTaskId: string | null }) => state.activeTaskId,
      Object.is
    )
  })
  .withoutActions();
```

Zustand's `shallow` is useful when a selector returns a small object, array, tuple, `Map`, or `Set` whose top-level entries are enough to describe meaningful equality. This is often a good fit for selectors that package a few fields together for a component.

```ts
import { shallow } from 'zustand/vanilla/shallow';

const store = createErgoStore<{ count: number; label: string }>()
  .withInitialState(() => ({ count: 0, label: 'Ready' }))
  .withoutAutoselectors()
  .withSelectors({
    summary: defineErgoStoreSelector(
      state => ({
        count: state.count,
        label: state.label
      }),
      shallow
    )
  })
  .withoutActions();
```

Deep equality functions, such as Lodash `isEqual` or Ramda `equals`, can be useful when a selector returns nested data and reference changes are common even though the semantic value is unchanged. Treat them as a cost model decision rather than a blanket anti-pattern. Deep equality is often a good tradeoff when the selected data is bounded, updates are frequent, and skipped work is expensive or noisy. It is a weaker tradeoff when the selected data can grow without a clear limit, changes are rare, or the avoided work is cheap.

```ts
import isEqual from 'lodash/isEqual';

interface SearchState {
  filters: {
    statuses: string[];
    tags: string[];
  };
}

const store = createErgoStore<SearchState>()
  .withInitialState(() => ({
    filters: {
      statuses: [],
      tags: []
    }
  }))
  .withoutAutoselectors()
  .withSelectors({
    normalizedFilters: defineErgoStoreSelector(
      (state: SearchState) => ({
        statuses: [...state.filters.statuses].sort(),
        tags: [...state.filters.tags].sort()
      }),
      isEqual
    )
  })
  .withoutActions();
```

Small domain-specific equality functions are often better than generic deep equality. They document what the consumer actually cares about and avoid walking irrelevant parts of a selected value.

```ts
const sameOrderedIds = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length && left.every((id, index) => id === right[index]);

const store = createErgoStore<{ selectedIds: string[] }>()
  .withInitialState(() => ({ selectedIds: [] }))
  .withoutAutoselectors()
  .withSelectors({
    selectedIds: defineErgoStoreSelector(
      (state: { selectedIds: string[] }) => state.selectedIds,
      sameOrderedIds
    )
  })
  .withoutActions();
```

## When Custom Equality Functions Make Sense

Prefer the default behavior for primitives, stable object references, and selectors that return state fields directly. A custom equality function is extra logic, so it should describe a real semantic boundary.

Custom equality functions are useful when:

- A selector returns a new array or object on each run, but many of those new references represent the same meaningful value.
- Consumers only care about part of a derived object, such as an ID, status, count, or dimensions.
- A subscriber triggers expensive work and should only run for meaningful changes.

Choose the equality function that matches the selector's meaning. `Object.is`, `shallow`, and deep equality helpers all short-circuit common unequal cases quickly, so the usual concern is not that custom equality is inherently expensive. The important questions are whether the comparator reflects the consumer's notion of "same enough", whether the selected value has predictable structure, and whether a more specific domain comparator would make that intent clearer. Equality functions should be deterministic and should not mutate their inputs.

## Related Pages

- [Selectors And Actions](./selectors-and-actions.md)
