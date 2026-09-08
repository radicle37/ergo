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

That matters for values that are cheap to compute but expensive — or just very frequent — to react to. The selector can return whatever value shape is most convenient, while the equality function defines what "actually changed" means for subscribers.

## Common equality functions

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

Deep equality functions, such as Lodash `isEqual` or Ramda `equals`, can be useful when a selector returns nested data — like a filters object with arrays inside it — that often comes back as a brand-new object even when nothing inside it actually changed. Reaching for deep equality isn't a bad practice to avoid; it's a tradeoff to weigh for each case. It tends to be worth it when the selected data has a known, reasonably small size, updates happen often, and skipping unnecessary work (like a re-render or an expensive callback) actually saves something real. It's a weaker fit when the selected data can grow without any limit, changes are rare, or the work you'd be skipping was cheap to begin with.

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

Small, purpose-built equality functions are often better than generic deep equality. They make it obvious what actually matters for that selector, and they skip checking the parts of the value nobody cares about.

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

## When custom equality functions make sense

Prefer the default behavior for primitives and selectors that return a state field directly. A custom equality function is extra code to write and maintain, so only reach for one when there's a real reason two different-looking values should count as "the same" for that selector's subscribers.

Custom equality functions are useful when:

- A selector returns a new array or object every time it runs, but a lot of those "new" values represent the same result underneath.
- Consumers only care about part of a derived object — an ID, a status, a count, a set of dimensions — not the whole thing.
- A subscriber triggers expensive work and should only run when something meaningful actually changed.

Pick the equality function based on what "the same" should mean for that selector, not based on performance — `Object.is`, `shallow`, and the deep-equality helpers above all bail out quickly on the common cases, so a custom function is rarely the expensive part. Worth asking instead: does this comparison match what "unchanged" should mean here, is the selected value's shape predictable enough to compare with confidence, and would a small, hand-written comparison make that intent clearer than a generic one? Whatever function you use, make sure it always gives the same answer for the same inputs, and never modifies the values it's comparing.

## Related pages

- [Selectors and actions](./selectors-and-actions.md)
