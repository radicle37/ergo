# Zustand vs. Ergo

[Back to README](../README.md)

Ergo is built directly on Zustand, so this comparison is narrower than [Redux Toolkit vs. Ergo](./redux-toolkit-comparison.md) — there's no separate store-wiring file, no action-type ceremony, and Zustand's own async story is already close to Ergo's. The gap is concentrated in two places: how much of the store's shape a component's imports reveal, and what a subscription looks like by default. For the conceptual differences (actions living inside state vs. outside it, selectors shaping the API), see [How Ergo differs from Zustand](./zustand-and-middleware.md#how-ergo-differs-from-zustand); this page is the code-level walkthrough of the same feature built both ways.

The store and the plain `.subscribe(...)` examples below are framework-agnostic — Zustand and `ergo-state` both work outside React. The component examples (`hooks.ts`, `TaskToolbar.tsx`, `useCallback`) use React and `ergo-react` specifically, since that's the most common way either is consumed in a UI. The React-specific parts don't transfer literally to Vue, Svelte, or Angular, but the underlying point — a selector function passed into a generic accessor exposes the state shape, a named accessor doesn't — does, just with different concrete syntax.

The feature: a task list with a `completeTask` mutation and a `fetchTasks` action that loads tasks from a server.

## Zustand

```ts
// store.ts
import { create } from 'zustand';

interface Task {
  id: string;
  completed: boolean;
  title: string;
}

// activeTaskId/status/tasks are data; completeTask/fetchTasks are behavior.
// One interface describes both, because Zustand's convention puts them in
// the same state object — there's no type-level split between the two.
interface TaskListState {
  activeTaskId: string | null;
  status: 'error' | 'idle' | 'loading';
  tasks: Task[];
  completeTask: (taskId: string) => void;
  fetchTasks: () => Promise<Task[]>;
}

// Actions live inside the state object, alongside the data, by convention.
// See "Actions vs. state" in Zustand and middleware for why Ergo splits them out.
export const useTaskListStore = create<TaskListState>()((set, get) => ({
  // --- initial data ---
  activeTaskId: null,
  status: 'idle',
  tasks: [],
  // --- actions ---
  completeTask(taskId) {
    set({
      tasks: get().tasks.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    });
  },
  async fetchTasks() {
    set({ status: 'loading' });

    try {
      const tasks = await api.getTasks();

      set({ status: 'idle', tasks });

      return tasks;
    } catch (error) {
      set({ status: 'error' });
      throw error;
    }
  }
}));
```

```ts
// hooks.ts
// Hand-written once per store, so components call a named hook instead of
// passing a selector function that exposes the state shape at every call site.
export const useActiveTaskId = () => useTaskListStore(state => state.activeTaskId);
export const useTaskCount = () => useTaskListStore(state => state.tasks.length);
export const useCompletedTaskCount = () =>
  useTaskListStore(state => state.tasks.filter(task => task.completed).length);
```

```tsx
// TaskToolbar.tsx
import { useCallback } from 'react';
import { useActiveTaskId, useCompletedTaskCount, useTaskCount, useTaskListStore } from './store';

export default function TaskToolbar() {
  const activeTaskId = useActiveTaskId();
  const completedTaskCount = useCompletedTaskCount();
  const taskCount = useTaskCount();
  // This store happens to define its actions once, inside the creator, so
  // this reference doesn't change across renders — but that's a property
  // of how this store is written, not something Zustand guarantees.
  const completeTask = useTaskListStore(state => state.completeTask);

  // completeTask came from a hook call, so exhaustive-deps requires it here
  // even though it never actually changes for this store.
  const handleClick = useCallback(() => {
    if (activeTaskId) {
      completeTask(activeTaskId);
    }
  }, [activeTaskId, completeTask]);

  return (
    <div>
      <p>
        {completedTaskCount} / {taskCount} tasks complete
      </p>
      <button disabled={!activeTaskId} onClick={handleClick}>
        Complete Active Task
      </button>
    </div>
  );
}
```

## Ergo

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
  status: 'error' | 'idle' | 'loading';
  tasks: Task[];
}

interface TaskListActions {
  completeTask: (taskId: string) => void;
  fetchTasks: () => Promise<Task[]>;
}

const taskListStoreApi = createErgoStore<TaskListState, TaskListActions>()
  .withInitialState(() => ({
    activeTaskId: null,
    status: 'idle',
    tasks: []
  }))
  // `tasks` is a plain field, not a derivation, so it's an autoselector too
  .withAutoselectors(['activeTaskId', 'tasks'])
  .withSelectors({
    completedTaskCount: state => state.tasks.filter(task => task.completed).length,
    taskCount: state => state.tasks.length
  })
  .withActions(({ get, set }) => ({
    completeTask(taskId) {
      set({
        tasks: get().tasks.map(task =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      });
    },
    async fetchTasks() {
      set({ status: 'loading' });

      try {
        const tasks = await api.getTasks();

        set({ status: 'idle', tasks });

        return tasks;
      } catch (error) {
        set({ status: 'error' });
        throw error;
      }
    }
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
import { useCallback } from 'react';
import { taskListActions, useActiveTaskId, useCompletedTaskCount, useTaskCount } from './store';

export default function TaskToolbar() {
  const activeTaskId = useActiveTaskId();
  const completedTaskCount = useCompletedTaskCount();
  const taskCount = useTaskCount();

  // taskListActions is a plain module-level import, not a hook return
  // value, so it's not part of the dependency array at all.
  const handleClick = useCallback(() => {
    if (activeTaskId) {
      taskListActions.completeTask(activeTaskId);
    }
  }, [activeTaskId]);

  return (
    <div>
      <p>
        {completedTaskCount} / {taskCount} tasks complete
      </p>
      <button disabled={!activeTaskId} onClick={handleClick}>
        Complete Active Task
      </button>
    </div>
  );
}
```

## Interfaces that leak the store

The `hooks.ts` file above is the disciplined version. Nothing requires writing it — the quicker, equally valid-looking version is to skip it and call the store directly from the component:

```tsx
// Also compiles. Also works. Also now couples this component to the
// store's exact shape: `state.tasks`, not some other path.
const activeTaskId = useTaskListStore(state => state.activeTaskId);
const completedTaskCount = useTaskListStore(
  state => state.tasks.filter(task => task.completed).length
);
```

Both versions type-check. Both render correctly. The difference only shows up later, when the store's internal shape needs to change and someone has to find every component that reached into it directly instead of going through a named hook. Writing the wrapper hooks avoids that, but it's a decision every store author has to remember to make, file by file. Ergo generates the wrapper-hook version directly — there's no leakier alternative sitting one keystroke away. See [Neutral interfaces vs. exposed internals](../../ergo-react/docs/react-consumers.md#neutral-interfaces-vs-exposed-internals) for the fuller argument.

## Subscribing outside a component

Zustand's default `subscribe` fires on every state change, with no selecting:

```ts
// Fires on every set() call anywhere in the store, whether or not
// tasks.length actually changed.
useTaskListStore.subscribe((state, previousState) => {
  console.log(state.tasks.length);
});
```

Getting a selector-based, equality-aware subscription back requires opting a store into the `subscribeWithSelector` middleware — a decision made once per store, and easy to skip on a store that didn't need it when it was created:

```ts
import { subscribeWithSelector } from 'zustand/middleware';

export const useTaskListStore = create<TaskListState>()(
  subscribeWithSelector((set, get) => ({
    // ...same state and actions as above
  }))
);

const unsubscribeCompletedTaskCount = useTaskListStore.subscribe(
  state => state.tasks.filter(task => task.completed).length,
  count => {
    console.log(count);
  }
);
```

A raw field works the same way — no derivation, just a narrower selector. Wrapped as a named function in `hooks.ts`, next to the read hooks, it's a closer comparison to what Ergo generates:

```ts
// hooks.ts
// The default equality check is reference equality (Object.is). This only
// fires because completeTask/fetchTasks above always replace `tasks` with
// a new array instead of mutating the existing one — mutate it in place
// and this subscription would never see a change.
export const subscribeTasks = (listener: (tasks: Task[]) => void) =>
  useTaskListStore.subscribe(state => state.tasks, listener);
```

```ts
const unsubscribeTasks = subscribeTasks(tasks => {
  console.log(tasks);
});
```

Ergo generates both per selector, for every store, with no middleware decision required and the same equality check the getter and hook already use:

```ts
const unsubscribeCompletedTaskCount = taskListStoreApi.subscribeCompletedTaskCount(count => {
  console.log(count);
});

// tasks is a plain autoselector, not a custom selector, but it's generated
// the exact same way. Same default equality check as above, so the same
// caveat applies: mutating `tasks` in place instead of replacing it would
// mean this never fires either — see Equality for using a custom check.
const unsubscribeTasks = taskListStoreApi.subscribeTasks(tasks => {
  console.log(tasks);
});
```

See [Equality](./equality.md) for attaching a custom equality function instead of relying on reference equality.

## Side by side

| | Zustand | Ergo |
| --- | --- | --- |
| Files for one feature | Store + hand-written hook wrappers + component | Store + component |
| Actions | Defined inside the state object, alongside the data | Defined in `withActions`, outside state |
| Reading state in a component | `useStore(state => state.x)` directly, or a hand-written wrapper hook to avoid exposing the state shape at the call site | Generated `useX()` |
| Using an action in `useCallback` | Obtained via a hook call, so `exhaustive-deps` requires it in the dependency array even when it's stable in practice | A plain module-level import, not a hook return value — nothing to list |
| Where selectors live | Wherever the project chooses — inline at the call site, or in a hooks file someone writes | First-class in `withSelectors`/`withAutoselectors`, generating the getter, subscriber, and hook together |
| Custom equality | Passed per call site (`useStore(selector, shallow)`), or centralized only if the wrapper hook remembers to do it | Attached once, in the selector definition |
| Subscribing outside a component | Plain `.subscribe(listener)` fires on every change; selector-based subscriptions require opting into the `subscribeWithSelector` middleware | Generated `subscribeX(listener)`, selector-based and equality-aware by default |
| Middleware ecosystem | The full Zustand middleware ecosystem | The same ecosystem — Ergo wraps the same engine; see [Zustand and middleware](./zustand-and-middleware.md) |

## What carries over

Everything. Ergo doesn't reimplement Zustand's engine — `withMiddleware` passes straight through to Zustand's `create`, `persist`/`devtools`/`immer` all still work, and `get`/`set` on an Ergo store do the same job as `getState`/`setState` on a raw one. Nothing above is a runtime Ergo adds on top; it's Zustand generating a different, larger surface from the same selector and action definitions.

## Where raw Zustand is still the better fit

- **A store small enough that consistency doesn't matter.** A single-field store backing one widget doesn't need a builder to stay consistent with itself. See the [FAQ](./faq.md#why-not-use-zustand-directly) for the general version of this tradeoff.
- **A shape the builder makes awkward.** Ergo's staged builder order (middleware, then state, then selectors, then actions) fits most stores. A store with an unusual construction order or exotic middleware composition may be simpler to write directly against Zustand's `create`.
- **An existing raw-Zustand codebase with no acute pain.** If every store already has its wrapper hooks and nobody's tripped over an inconsistency, there's no urgency to migrate working code.
- **A bundle-size-sensitive app with very few, simple stores.** Zustand is a peer dependency either way, so it isn't the comparison — Ergo's own generation and builder code is a small, fixed cost, added once, not per store. For one or two simple stores, hand-writing the getters and wrapper hooks yourself will usually ship less code than including that runtime to generate them. That gap narrows as the number of stores and selectors grows, since the hand-written version keeps growing while Ergo's runtime doesn't — but there's no fixed store count where one becomes clearly smaller than the other; it depends on how much wrapper code your stores would otherwise need.

## Related pages

- [Zustand and middleware](./zustand-and-middleware.md)
- [Redux Toolkit vs. Ergo](./redux-toolkit-comparison.md)
- [Selectors and actions](./selectors-and-actions.md)
- [FAQ](./faq.md)
