# Selectors and actions

[Back to README](../README.md)

Selectors are the center of the Ergo API. Each selector creates two public methods with the same selected value type:

- `get<Name>()` reads the current selected value.
- `subscribe<Name>(listener)` calls the listener immediately with the selected value, then calls it again only when that value changes.

React applications can use `ergo-react` to add generated hooks for the same selectors.

## Autoselectors

Autoselectors are generated from top-level state properties. They remove boilerplate for direct state reads:

```ts
const counterStore = createErgoStore<{ count: number }>()
  .withInitialState(() => ({ count: 0 }))
  .withAutoselectors(['count'])
  .withoutActions();

counterStore.getCount();
counterStore.subscribeCount(count => {
  console.log(count);
});
```

## Custom selectors

Use custom selectors when the consumer should read a derived value or a narrower view of internal state:

```ts
const itemStore = createErgoStore<{ items: string[] }>()
  .withInitialState(() => ({ items: [] }))
  .withAutoselectors(['items'])
  .withSelectors({
    itemCount: state => state.items.length
  })
  .withoutActions();

const { getItemCount, subscribeItemCount } = itemStore;

getItemCount();
subscribeItemCount(count => {
  console.log(count);
});
```

This keeps selector logic in one place. A component, a background process, a service, and a unit test can all depend on `itemCount` without each one recreating `state => state.items.length`.

Getters are simple snapshots: `getItemCount()` runs the selector against the current state and returns the result. There is no subscription and no equality check involved.

Subscribers are reactive. They compare selector results between updates, so changes to unrelated state do not automatically cause subscriber callbacks. For custom selectors without an explicit equality function, subscribers use `Object.is`.

## Selectors inside actions

Ergo defines autoselectors and custom selectors before actions. That means the `withActions` callback receives a typed store object that already includes the generated selector methods. Actions can call generated getters such as `getNextDraftTask()` instead of reaching into `get()` and repeating selector logic.

```ts
interface DraftTask {
  id: string;
  title: string;
}

interface TaskQueueState {
  _draftTasks: DraftTask[];
  publishedTaskIds: string[];
}

interface TaskQueueActions {
  dismissDraft: (taskId: string) => void;
  publishNextDraft: () => void;
}

const taskQueueStoreApi = createErgoStore<TaskQueueState, TaskQueueActions>()
  .withInitialState(() => ({
    _draftTasks: [],
    publishedTaskIds: []
  }))
  .withAutoselectors(['_draftTasks'])
  .withSelectors({
    nextDraftTask: state => state._draftTasks.at(0)
  })
  .withActions(({ _getDraftTasks, get, getNextDraftTask, set }) => {
    function dismissDraft(taskId: string) {
      set({
        _draftTasks: _getDraftTasks().filter(task => task.id !== taskId)
      });
    }

    function publishNextDraft() {
      const task = getNextDraftTask();

      if (!task) {
        return;
      }

      set({
        publishedTaskIds: [...get().publishedTaskIds, task.id]
      });
      dismissDraft(task.id);
    }

    return {
      dismissDraft,
      publishNextDraft
    };
  });
```

This is a meaningful ergonomic difference from many hand-rolled Zustand stores. With raw Zustand, derived reads inside actions are often handled by calling `get()` and duplicating selector logic, or by importing selector functions into the action module manually. Ergo makes that reuse part of the store construction flow and keeps it type-safe: if a selector is renamed, removed, or changes return type, the generated getter usage inside `withActions` is checked by TypeScript.

Inside actions, prefer generated getters for selected values. Selectors, getters, and subscribers are all produced from the same definitions.

Do not register subscribers from inside `withActions`. Subscribers fire their initial callback synchronously with the current selected value, but the `actions` object is still being populated while the `createActions` initializer is running. A subscriber that calls back into `storeApi.actions` in its initial call will see the not-yet-populated action object. Set subscriptions up at module scope after the store is constructed, once `actions` is fully assembled.

## Actions can return values

An action is just a function. It doesn't have to return `void` — it can return whatever the caller needs, including a result that describes what happened instead of just throwing on any failure:

```ts
interface CastResult {
  status: 'cast' | 'insufficient-mana';
  damage?: number;
}

interface CharacterActions {
  castSpell: (spellId: string) => Promise<CastResult>;
}

// ...
  .withActions(({ getMana, set }) => ({
    async castSpell(spellId) {
      const spell = await spellbookApi.load(spellId);

      if (getMana() < spell.manaCost) {
        return { status: 'insufficient-mana' };
      }

      set({ mana: getMana() - spell.manaCost });

      return { status: 'cast', damage: spell.damage };
    }
  }));
```

Callers can `await characterStoreApi.actions.castSpell('fireball')` and branch on the result directly, instead of calling the action and then separately reading a selector to find out what happened:

```ts
const result = await characterStoreApi.actions.castSpell('fireball');

if (result.status === 'insufficient-mana') {
  showOutOfManaWarning();
}
```

This is also why Ergo doesn't need a separate thunk mechanism for async work the way some other state libraries do — an async action is just an `async` function in `withActions`.

## Related pages

- [State surface](./state-surface.md)
- [Equality](./equality.md)
