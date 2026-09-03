# State Surface

[Back to README](../README.md)

Ergo treats store design as API design. The store facade is the supported public API, and the names chosen for state, selectors, and actions describe what consumers are meant to use.

The goal is not to hide that a store has internal implementation detail. The goal is to make the intended public API clear: public values get generated getters and subscribers; mutations live under `actions`; middleware lifecycle APIs live under `middleware`; internal state stays inside the store module unless a public selector exposes it deliberately.

## Public State

Autoselectors are generated from root state property names. Public autoselectors become part of the public store API. For example, `activeTaskId` becomes `getActiveTaskId()` and `subscribeActiveTaskId()`.

Use lower camelCase names that start with a lowercase ASCII letter for root state properties that are intended to be broadly consumed:

```ts
interface PublicState {
  activeTaskId: string | null;
  completedTaskCount: number;
  isSaving: boolean;
}
```

Ergo enforces predictable public names. Public autoselectors only expose public state properties that start with a lowercase ASCII letter. Empty string keys and symbol keys are rejected during store creation because Ergo cannot generate stable string-named API methods for them. State properties named `actions` and function-valued state properties are allowed when they are intentionally listed in `withAutoselectors`; they generate normal selector APIs such as `getActions()`.

## Internal State

Prefix root state properties with `_` when they are implementation details that should not be exposed as public autoselectors. Internal state can still be read by custom selectors, actions, and tests that intentionally depend on the full store API, but it will not accidentally become a public getter/subscriber.

```ts
interface StoreState {
  activeTaskId: string | null;
  _lastSyncedAt: number | null;
  _pendingRequestIds: string[];
}
```

Underscore-prefixed root state properties can be listed in `withAutoselectors`, but they are treated as internal autoselectors. Instead of creating public getters or subscribers, they create internal getters for `withActions` only. Ergo inserts `get` after the adjacent leading underscores:

- `_lastSyncedAt` becomes `_getLastSyncedAt()`.
- `_pendingRequestIds` becomes `_getPendingRequestIds()`.
- `__draftAnswer` becomes `__getDraftAnswer()`.

These internal getters are not exposed on the returned store API, and Ergo does not generate internal subscribers. They are meant for action implementations that need typed access to internal state without widening the consumer-facing API.

Because internal autoselectors are explicit, they also work for optional state fields that are not present in the initial state:

```ts
interface StoreState {
  _loadedProfile?: {
    id: string;
    name: string;
  };
}

const store = createErgoStore<StoreState, StoreActions>()
  .withInitialState(() => ({}))
  .withAutoselectors(['_loadedProfile'])
  .withActions(({ _getLoadedProfile }) => {
    function hasLoadedProfile() {
      return !!_getLoadedProfile();
    }

    return {
      hasLoadedProfile
    };
  });
```

Custom selectors can also be internal by using the same underscore convention:

```ts
const store = createErgoStore<StoreState, StoreActions>()
  .withInitialState(() => ({
    activeTaskId: null,
    _pendingRequestIds: []
  }))
  .withAutoselectors(['activeTaskId', '_pendingRequestIds'])
  .withSelectors({
    _hasPendingRequests: state => state._pendingRequestIds.length > 0
  })
  .withActions(({ _getHasPendingRequests, _getPendingRequestIds }) => {
    function canStartRequest() {
      return !_getHasPendingRequests() && _getPendingRequestIds().length === 0;
    }

    return {
      canStartRequest
    };
  });
```

For internal state properties and internal selector names, use one or more leading underscores followed by a lowercase ASCII letter. `_pendingRequestIds` and `__draftAnswer` are valid; `_PendingRequestIds`, `_1pendingRequestIds`, and `_` are rejected. The first character after the underscore prefix is capitalized only in the generated internal getter name.

## Where Internal State Access Is Allowed

The `_` prefix keeps internal properties out of the generated public API (`get<Name>`, `subscribe<Name>`), but it does not hide them from the full-state accessors. `store.get()` returns the entire state object, including internal fields, and `store.set(...)` accepts them for scoped writes. That is deliberate: `_` is a public-surface marker, not an encapsulation boundary. The encapsulation boundary is whatever module or directory the store definition lives in — Ergo does not prescribe a file layout, only that internal state stays behind that boundary.

Inside the store module, internal state is fair game:

- Custom selector definitions receive the full state and can read `_foo` directly to derive a public value.
- Action bodies can use the generated `_get<Name>()` internal getter, or fall back to `get()` / `set(...)` when they need multi-field reads or writes.
- Same-module helpers, subscriber setup, and migration shims can also read internal state directly.

Outside the store module, internal state should stay off-limits in production code. Consumers should go through the public API (`get<Name>`, `subscribe<Name>`, actions). If a consumer needs data that is only in an internal field, add a public custom selector inside the store module and expose that instead of reaching into `.get()._foo` from outside the store module. React components should use `ergo-react` when they need hook-based access.

Tests are a natural exception. They can seed and assert internal state via `.get()._foo` and `.set({ _foo })`, so a store does not need to grow a `resetForTest` action or a test-only export:

```ts
import { beforeEach, expect, test } from 'vitest';

import { taskQueueStoreApi } from './store';

beforeEach(() => {
  taskQueueStoreApi.set({
    _draftTasks: [],
    publishedTaskIds: []
  });
});

test('publishes the next draft', () => {
  taskQueueStoreApi.set({
    _draftTasks: [{ id: 'draft-1', title: 'Write docs' }]
  });

  taskQueueStoreApi.actions.publishNextDraft();

  expect(taskQueueStoreApi.get()._draftTasks).toEqual([]);
  expect(taskQueueStoreApi.get().publishedTaskIds).toEqual(['draft-1']);
});
```

| Context | Access via `.get()._foo` / `.set({ _foo })` | Preferred alternative |
| --- | --- | --- |
| Custom selectors in the same store module | Fine | Direct property read on `state` |
| Actions in the same store module | Fine | `_get<Name>()` |
| Same-module helpers, subscribers, facades | Fine | Public selector when consumed outside the module |
| Tests | Fine | Direct setup/assertions are acceptable |
| Production code outside the store module | Discouraged | Add a public custom selector |

## Related Pages

- [Selectors And Actions](./selectors-and-actions.md)
- [Store Factories](./store-factories.md)
- [FAQ](./faq.md)
