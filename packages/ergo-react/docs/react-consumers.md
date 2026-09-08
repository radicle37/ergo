# React consumers

[Back to README](../README.md)

## Neutral interfaces vs. exposed internals

Ergo's philosophy is that your state management implementation shouldn't leak into your React components — and getting that isolation shouldn't require every store to hand-write its own layer of wrapper hooks.

The pattern this is meant to replace is a component reading straight out of the store, inline, with no wrapper at all:

```tsx
// TaskToolbar.tsx — inline selectors, no store-module abstraction
import { useTaskListStore } from './store';

export default function TaskToolbar() {
  const activeTaskId = useTaskListStore(state => state.activeTaskId);
  const completedTaskCount = useTaskListStore(
    state => state.tasks.filter(task => task.completed).length
  );
  const taskCount = useTaskListStore(state => state.tasks.length);

  // ...
}
```

This compiles, works, and is how most components start out. It also means `TaskToolbar` now knows the store's exact shape — `state.tasks`, not some other path — and so does every other component that reads this store the same way. Change that shape later, and it's a search through every component for `useTaskListStore(state => ...)` calls, not a single store module.

The disciplined fix is a hand-written wrapper hook per value, usually collected in a shared `hooks.ts`:

```ts
// hooks.ts — one function per value, repeated for every store in the app
export const useActiveTaskId = () => useTaskListStore(state => state.activeTaskId);
export const useTaskCount = () => useTaskListStore(state => state.tasks.length);
export const useCompletedTaskCount = () =>
  useTaskListStore(state => state.tasks.filter(task => task.completed).length);
```

That's three near-identical functions for one small store, and every new selector means writing — and remembering to write — one more. None of it is hard, it's just tedious, and tedious boilerplate is exactly what gets skipped under deadline pressure, which is how the inline version above creeps back in even on a team that knows better.

There's a real difference between importing something with a neutral interface and importing something that hands you the store's internals through a callback:

```tsx
// Exposes internals: the caller has to know the state shape to write this line.
const isOpen = useStore(state => state.modal.isOpen); // raw Zustand
```

```tsx
// Exposes internals for the same reason — a selector function reaching into state:
const isOpen = useSelector(state => state.modal.isOpen); // Redux
```

```tsx
// Neutral interface: the caller only needs to know what they get back —
// not which library manages the state, or how it's structured underneath.
const isOpen = useModalIsOpen(); // ergo-react
```

`useModalIsOpen()` reveals nothing about what's underneath — it could be backed by Zustand, Redux, Context, or something else entirely, and the component would look the same either way. `useStore(selector)` and `useSelector(selector)` can't make that promise: writing the selector means the caller already knows the state's shape, whether or not anyone remembered to wrap it in a hook that hides that fact.

With `ergo-react`, that isolation isn't a discipline problem to remember on every store, and there's no `hooks.ts` to hand-write and keep in sync — `useActiveTaskId`, `useTaskCount`, and `useCompletedTaskCount` all come straight out of the same `withSelectors` call that already defines the store, one hook generated per selector.

Generated hooks are regular functions on the store API, so a store module can destructure and export only the pieces React components are allowed to use. Components do not need access to the raw Zustand store, selector definitions, imperative setters, or subscription methods.

Prefer destructuring generated hooks into their own top-level `use*` variables or exports before calling them from components — call `useTaskCount()` directly, rather than calling `taskListStoreApi.useTaskCount()` inline. React's Hooks lint rules are built to recognize a hook by its plain name (`useSomething()`). When a hook is instead called as a property off another object, the linter can lose track of the fact that it's a hook at all — so it may not catch real mistakes, like calling it inside an `if`, a loop, or after an early `return`. Destructuring the hook into its own name first keeps that safety net working. When a generated hook name is generic, such as `useIsOpen()` or `useIsEmpty()`, rename it during export to say what it belongs to, e.g. `useModalIsOpen`.

```ts
// store.ts
import { createErgoStore } from 'ergo-react';

interface Task {
  id: string;
  completed: boolean;
  title: string;
}

interface TaskListState {
  activeTaskId: string | null;
  tasks: Task[];
}

interface TaskListActions {
  completeTask: (taskId: string) => void;
}

const taskListStoreApi = createErgoStore<TaskListState, TaskListActions>()
  .withInitialState(() => ({
    activeTaskId: null,
    tasks: []
  }))
  .withAutoselectors(['activeTaskId'])
  .withSelectors({
    completedTaskCount: state => state.tasks.filter(task => task.completed).length,
    taskCount: state => state.tasks.length
  })
  .withActions(({ get, set }) => ({
    completeTask: taskId =>
      set({
        tasks: get().tasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                completed: true
              }
            : task
        )
      })
  }));

export const {
  actions: taskListActions,
  useActiveTaskId,
  useCompletedTaskCount,
  useTaskCount
} = taskListStoreApi;
```

```tsx
// TaskToolbar.tsx
import { taskListActions, useActiveTaskId, useCompletedTaskCount, useTaskCount } from './store';

export default function TaskToolbar() {
  const activeTaskId = useActiveTaskId();
  const completedTaskCount = useCompletedTaskCount();
  const taskCount = useTaskCount();

  return (
    <div>
      <p>
        {completedTaskCount} / {taskCount} tasks complete
      </p>
      <button
        disabled={!activeTaskId}
        onClick={() => {
          if (activeTaskId) {
            taskListActions.completeTask(activeTaskId);
          }
        }}
      >
        Complete Active Task
      </button>
    </div>
  );
}
```

This pattern keeps the React-facing API intentionally small:

- Components import hooks named for what they return instead of `useStore` plus ad hoc selector functions.
- Components cannot accidentally call `set`, `get`, or internal selectors.
- Selector equality behavior stays inside the store module instead of being repeated at call sites.
- Tests and non-React modules can still import a separate API surface when they need getters, actions, or subscriptions.

For larger stores, prefer separate barrels such as `hooks.ts`, `actions.ts`, and `getters.ts` that re-export destructured members from the store API. The important boundary is the same: each consumer layer imports the smallest API it needs.

## Related pages

- [Ergo getting started](../../ergo-state/docs/getting-started.md)
- [Ergo selectors and actions](../../ergo-state/docs/selectors-and-actions.md)
- [Ergo state surface](../../ergo-state/docs/state-surface.md)
- [Zustand vs. Ergo](../../ergo-state/docs/zustand-comparison.md)
- [Redux Toolkit vs. Ergo](../../ergo-state/docs/redux-toolkit-comparison.md)
