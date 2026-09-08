# Redux Toolkit vs. Ergo

[Back to README](../README.md)

This page walks through one feature, built the way Redux Toolkit's own docs recommend, then the same feature built with Ergo.

The examples use React (`react-redux` and `ergo-react`), because that's how both are canonically consumed in a UI — `ergo-state` itself doesn't require React. The React-specific parts (hooks, `useCallback` dependency arrays, JSX) are specific to `react-redux`/`ergo-react`.

The underlying differences — actions living outside state, selectors generating the read side, the `dispatch(...)` footgun, subscription equality — aren't React features, and the same tradeoffs apply consuming Redux Toolkit or Ergo from Vue, Svelte, Angular, or a plain TypeScript module; only the concrete syntax changes.

The feature: a task list with a `completeTask` mutation and a `fetchTasks` action that loads tasks from a server.

## Redux Toolkit

Four files.

```ts
// app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '../features/tasks/tasksSlice';

export const store = configureStore({
  reducer: { tasks: tasksReducer }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```ts
// app/hooks.ts
// Most RTK projects hand-write this file once, so components call typed
// hooks instead of the raw, untyped useDispatch/useSelector from react-redux.
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './store';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```ts
// features/tasks/tasksSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

interface Task {
  id: string;
  completed: boolean;
  title: string;
}

interface TasksState {
  activeTaskId: string | null;
  status: 'error' | 'idle' | 'loading';
  tasks: Task[];
}

const initialState: TasksState = {
  activeTaskId: null,
  status: 'idle',
  tasks: []
};

export const fetchTasks = createAsyncThunk('tasks/fetch', async () => api.getTasks());

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    completeTask(state, action: PayloadAction<string>) {
      const task = state.tasks.find(t => t.id === action.payload);

      if (task) {
        task.completed = true;
      }
    }
  },
  // Three cases just to let one action resolve with a value once the
  // request settles — see the Ergo version below for the alternative.
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'idle';
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, state => {
        state.status = 'error';
      });
  }
});

export const { completeTask } = tasksSlice.actions;
export default tasksSlice.reducer;

// Selectors are defined for Redux similarly to how they are in Ergo, but they
// select from the RootState rather than being tied to a specific slice, and
// the selector definitions sit outside the store's API definition.
export const selectActiveTaskId = (state: RootState) => state.tasks.activeTaskId;
export const selectTaskCount = (state: RootState) => state.tasks.tasks.length;
export const selectCompletedTaskCount = (state: RootState) =>
  state.tasks.tasks.filter(task => task.completed).length;
```

```tsx
// features/tasks/TaskToolbar.tsx
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  completeTask,
  selectActiveTaskId,
  selectCompletedTaskCount,
  selectTaskCount
} from './tasksSlice';

export default function TaskToolbar() {
  // Note: these hooks are all react-redux specific. Keeping components free of
  // references to the state management library would mean adding more
  // boilerplate — a custom hook wrapping each of the calls below.
  const dispatch = useAppDispatch();
  const activeTaskId = useAppSelector(selectActiveTaskId);
  const completedTaskCount = useAppSelector(selectCompletedTaskCount);
  const taskCount = useAppSelector(selectTaskCount);

  // dispatch came from a hook call, so exhaustive-deps requires it here —
  // even though react-redux keeps it stable across renders for a given store.
  const handleClick = useCallback(() => {
    if (activeTaskId) {
      // Forgetting this dispatch(...) wrapper compiles and runs fine —
      // completeTask(activeTaskId) alone just builds an object and
      // throws it away. See "A Footgun This Removes" below.
      dispatch(completeTask(activeTaskId));
    }
  }, [activeTaskId, dispatch]);

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
  .withAutoselectors(['activeTaskId'])
  // Selectors read against local state only — `state.tasks`, not
  // `state.tasks.tasks` — because each store only ever holds its own data.
  .withSelectors({
    completedTaskCount: state => state.tasks.filter(task => task.completed).length,
    taskCount: state => state.tasks.length
  })
  .withActions(({ get, set }) => ({
    // Calling this is the only step — there's no separate object to build
    // and no dispatch call that's possible to forget.
    completeTask(taskId) {
      set({
        tasks: get().tasks.map(task =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      });
    },
    // One function. No pending/fulfilled/rejected action types, no
    // extraReducers — this is just what an async action looks like.
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
  // Each hook already knows what it returns and where it comes from —
  // nothing here passes in a function that reaches into a state tree.
  const activeTaskId = useActiveTaskId();
  const completedTaskCount = useCompletedTaskCount();
  const taskCount = useTaskCount();

  // taskListActions is a plain module-level import, not a hook return
  // value, so it's not part of the dependency array at all.
  const handleClick = useCallback(() => {
    if (activeTaskId) {
      // This call is the effect. There's no dispatch step to add,
      // and so none to forget.
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

## A footgun this removes

In Redux Toolkit, calling an action creator doesn't do anything by itself — it just builds a plain object describing the change. Forgetting the `dispatch(...)` around it is a real, well-known mistake, and it fails silently:

```ts
// Compiles. Runs. Updates nothing. No error, no warning.
completeTask(activeTaskId);

// This is the version that actually changes the store.
dispatch(completeTask(activeTaskId));
```

TypeScript has no reason to object — `completeTask(activeTaskId)` is a perfectly well-typed expression, it's just a discarded one. Nothing about the line looks wrong in a diff or a code review; the bug only shows up as "the button doesn't seem to do anything," reproduced by a person, later.

This bug has nowhere to hide in Ergo, because there's no two-step "describe it, then separately dispatch it." An action is just a function:

```ts
// This is the only version. Calling it is the effect.
taskListActions.completeTask(activeTaskId);
```

## Subscribing outside a component

Inside a component, `useAppSelector` quietly handles subscribing for you. Outside one — a plain service module, a test, an analytics listener — there's no generated subscription tied to a selector. The store only gives you the raw primitive it's built on:

```ts
// store.subscribe from Redux core, re-exported by configureStore.
// The listener takes no arguments and fires on every dispatched action,
// whether or not anything you care about changed.
store.subscribe(() => {
  console.log(store.getState()); // the whole state tree, every time
});
```

To get "call me only when this specific value changes," you write the diff-it-yourself wrapper from Redux's own "computing derived data" recipe — select, snapshot, compare, call back only on change:

```ts
// the classic Redux "observeStore" pattern — a wrapper projects that
// need this often end up writing (or importing) for themselves
function observeStore<T>(store: Store, select: (state: RootState) => T, onChange: (value: T) => void) {
  let currentValue = select(store.getState());

  const unsubscribe = store.subscribe(() => {
    const nextValue = select(store.getState());

    if (nextValue !== currentValue) {
      currentValue = nextValue;
      onChange(currentValue);
    }
  });

  onChange(currentValue);
  return unsubscribe;
}

const unsubscribeCompletedTaskCount = observeStore(store, selectCompletedTaskCount, count => {
  console.log(count);
});
```

Ergo generates this per selector, so there's no wrapper to write or import:

```ts
// This is the whole thing. The equality check is the same one the
// getter and the hook already use, because it's the same selector.
const unsubscribeCompletedTaskCount = taskListStoreApi.subscribeCompletedTaskCount(count => {
  console.log(count);
});
```

## Side by side

| | Redux Toolkit | Ergo |
| --- | --- | --- |
| Files for one feature | Slice + store wiring + typed hooks + component | Store + component |
| Sync mutation | Action creator, handled by a `reducers` case in `createSlice` | A function in `withActions` |
| Calling that mutation | `dispatch(completeTask(id))` — omitting `dispatch(...)` compiles and runs but silently does nothing | `taskListActions.completeTask(id)` — calling it is the only step, so there's nothing to omit |
| Async mutation | `createAsyncThunk` plus three `extraReducers` cases (`pending`/`fulfilled`/`rejected`) | An `async` function in `withActions` that sets state and returns a value |
| Reading state in a component | `useAppSelector(selectX)`, against a typed-hooks file most projects write once | Generated `useX()`, no hooks file to write |
| Using dispatch in `useCallback` | `dispatch` comes from a hook call, so `exhaustive-deps` requires it in the dependency array even though react-redux keeps it stable | `taskListActions` is a plain module-level import — nothing to list |
| Subscribing outside a component | Raw `store.subscribe(listener)`, fires on every dispatch; selecting one value and skipping no-op calls means hand-writing an `observeStore`-style wrapper | Generated `subscribeX(listener)`, using the same selector and equality check as the getter and hook |
| Where selectors live | Wherever the project chooses to define and export them | First-class in `withSelectors`, next to the state they read |
| Memoized derived state | `createSelector` from `reselect` | `withSelectors` plus an optional [custom equality function](./equality.md) |
| Store scope | One store for the whole app by convention, slices combined via `configureStore` | One store per domain; see [Store boundaries](./store-boundaries.md) |

## What carries over

Two of RTK's core beliefs are also Ergo's: state should only change through actions, and a feature's shape should be defined in one place, not scattered across the codebase. Ergo doesn't ask you to give those up — it just also generates the read side from the same definition that backs the writes.

## Where Redux Toolkit is still the better fit

- **Cache management.** RTK Query or similar libraries (such as TanStack Query) are better designed for handling cache management around your network requests. Zustand and Ergo are well suited for application state, but it's often a good idea to pair them with something managing fetched data with more advanced tooling around caches, cache invalidation, refetches, etc.
- **One serializable, time-travelable store for the whole app.** RTK's single-store convention gives you one aggregated action log across every domain, which is valuable for some kinds of debugging and auditing. Ergo, like Zustand, tends to favor architectures with many small independent stores which are generally not as suitable to meeting these needs.
- **An existing RTK codebase with no acute pain.** Migrating a working app for its own sake isn't the suggestion here. This comparison is for new features, new apps, or a codebase that's already feeling the boilerplate tax above.

## Related pages

- [FAQ: Coming from Redux or Redux Toolkit?](./faq.md#coming-from-redux-or-redux-toolkit)
- [Zustand vs. Ergo](./zustand-comparison.md)
- [Zustand and middleware](./zustand-and-middleware.md)
- [Selectors and actions](./selectors-and-actions.md)
- [Store boundaries](./store-boundaries.md)
