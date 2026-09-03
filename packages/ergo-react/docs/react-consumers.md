# React Consumers

[Back to README](../README.md)

Generated hooks are regular functions on the store API, so a store module can destructure and export only the pieces React components are allowed to use. Components do not need access to the raw Zustand store, selector definitions, imperative setters, or subscription methods.

Prefer destructuring generated hooks into top-level `use*` variables or exports before calling them from components. React Hooks lint rules reliably recognize direct calls such as `useTaskCount()`. They can miss lower-camel member expressions such as `taskListStoreApi.useTaskCount()`, which weakens `rules-of-hooks` coverage for conditional calls and other invalid hook usage. When a generated hook name is generic, such as `useIsOpen()` or `useIsEmpty()`, rename it during export to include the store or domain concept.

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
    <button
      disabled={!activeTaskId}
      onClick={() => {
        if (activeTaskId) {
          taskListActions.completeTask(activeTaskId);
        }
      }}
    >
      {completedTaskCount} / {taskCount} complete
    </button>
  );
}
```

This pattern keeps the React-facing API intentionally small:

- Components import domain-named hooks instead of `useStore` plus ad hoc selector functions.
- Components cannot accidentally call `set`, `get`, or internal selectors.
- Selector equality behavior stays inside the store module instead of being repeated at call sites.
- Tests and non-React modules can still import a separate API surface when they need getters, actions, or subscriptions.

For larger stores, prefer separate barrels such as `hooks.ts`, `actions.ts`, and `getters.ts` that re-export destructured members from the store API. The important boundary is the same: each consumer layer imports the smallest API it needs.

## Related Pages

- [Ergo Getting Started](../../ergo/docs/getting-started.md)
- [Ergo Selectors And Actions](../../ergo/docs/selectors-and-actions.md)
- [Ergo State Surface](../../ergo/docs/state-surface.md)
