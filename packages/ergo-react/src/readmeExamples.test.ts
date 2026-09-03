import { createElement } from 'react';
import { act, render, screen } from '@testing-library/react';
import { shallow } from 'zustand/vanilla/shallow';
import { describe, expect, expectTypeOf, test, vi } from 'vitest';

import { createErgoStore, defineErgoStoreSelector } from './createErgoStore';

const isEqual = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const equals = isEqual;

describe('documentation examples', () => {
  test('README quick start example exposes the documented store exports', () => {
    interface TaskListState {
      activeTaskId: string | null;
      tasks: {
        id: string;
        completed: boolean;
        title: string;
      }[];
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

    const {
      actions: taskListActions,
      getTaskCount,
      subscribeTaskCount,
      useActiveTaskId,
      useCompletedTaskCount,
      useTaskCount
    } = taskListStoreApi;

    expectTypeOf(taskListActions.completeTask).toEqualTypeOf<(taskId: string) => void>();
    expectTypeOf(getTaskCount).returns.toEqualTypeOf<number>();
    expectTypeOf(subscribeTaskCount).toEqualTypeOf<
      (listener: (selectedValue: number) => void) => () => void
    >();
    expectTypeOf(useActiveTaskId).returns.toEqualTypeOf<string | null>();
    expectTypeOf(useCompletedTaskCount).returns.toEqualTypeOf<number>();
    expectTypeOf(useTaskCount).returns.toEqualTypeOf<number>();

    taskListStoreApi.set({
      activeTaskId: 'task-1',
      tasks: [
        {
          completed: false,
          id: 'task-1',
          title: 'Write docs'
        },
        {
          completed: false,
          id: 'task-2',
          title: 'Add tests'
        }
      ]
    });

    const taskCount = getTaskCount();
    const taskCountListener = vi.fn();
    const unsubscribe = subscribeTaskCount(count => {
      taskCountListener(count);
    });

    function TaskSummary() {
      const completedTaskCount = useCompletedTaskCount();
      const taskCount = useTaskCount();

      return createElement(
        'output',
        {
          'data-testid': 'task-summary'
        },
        `${completedTaskCount} / ${taskCount} complete`
      );
    }

    expect(taskCount).toBe(2);
    expect(taskCountListener).toHaveBeenCalledWith(2);

    render(createElement(TaskSummary));

    expect(screen.getByTestId('task-summary')).toHaveTextContent('0 / 2 complete');

    act(() => {
      taskListActions.completeTask('task-1');
    });

    expect(screen.getByTestId('task-summary')).toHaveTextContent('1 / 2 complete');
    expect(taskListStoreApi.get().tasks).toEqual([
      {
        completed: true,
        id: 'task-1',
        title: 'Write docs'
      },
      {
        completed: false,
        id: 'task-2',
        title: 'Add tests'
      }
    ]);
    expect(taskCountListener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  test('createErgoStore builder example exposes generated getters, hooks, and subscribers', () => {
    const counterStore = createErgoStore<{ count: number }>()
      .withInitialState(() => ({ count: 0 }))
      .withAutoselectors(['count'])
      .withSelectors({
        isEmpty: state => state.count === 0
      })
      .withoutActions();

    const { getCount, getIsEmpty, subscribeCount, useIsEmpty: useIsCounterEmpty } = counterStore;
    const listener = vi.fn();
    const unsubscribe = subscribeCount(listener);

    expectTypeOf(getCount).returns.toEqualTypeOf<number>();
    expectTypeOf(useIsCounterEmpty).returns.toEqualTypeOf<boolean>();
    expect(getCount()).toBe(0);
    expect(getIsEmpty()).toBe(true);
    expect(typeof useIsCounterEmpty).toBe('function');
    expect(listener).toHaveBeenCalledWith(0);

    counterStore.set({ count: 1 });

    expect(getCount()).toBe(1);
    expect(getIsEmpty()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(1);

    unsubscribe();
  });

  test('selector API example reuses itemCount through getter, hook, and subscriber APIs', () => {
    const itemStore = createErgoStore<{ items: string[] }>()
      .withInitialState(() => ({ items: [] }))
      .withAutoselectors(['items'])
      .withSelectors({
        itemCount: state => state.items.length
      })
      .withoutActions();

    const { getItemCount, subscribeItemCount, useItemCount } = itemStore;
    const listener = vi.fn();
    const unsubscribe = subscribeItemCount(listener);

    expectTypeOf(getItemCount).returns.toEqualTypeOf<number>();
    expectTypeOf(useItemCount).returns.toEqualTypeOf<number>();
    expect(getItemCount()).toBe(0);
    expect(typeof useItemCount).toBe('function');
    expect(listener).toHaveBeenCalledWith(0);

    itemStore.set({ items: ['a', 'b'] });

    expect(getItemCount()).toBe(2);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(2);

    unsubscribe();
  });

  test('selectors inside actions example reuses public and internal generated getters', () => {
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
        expectTypeOf(_getDraftTasks).returns.toEqualTypeOf<DraftTask[]>();
        expectTypeOf(getNextDraftTask).returns.toEqualTypeOf<DraftTask | undefined>();

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

    taskQueueStoreApi.set({
      _draftTasks: [
        { id: 'draft-1', title: 'First draft' },
        { id: 'draft-2', title: 'Second draft' }
      ]
    });

    expect('_getDraftTasks' in taskQueueStoreApi).toBe(false);
    expect(taskQueueStoreApi.getNextDraftTask()).toEqual({
      id: 'draft-1',
      title: 'First draft'
    });

    taskQueueStoreApi.actions.publishNextDraft();

    expect(taskQueueStoreApi.get().publishedTaskIds).toEqual(['draft-1']);
    expect(taskQueueStoreApi.getNextDraftTask()).toEqual({
      id: 'draft-2',
      title: 'Second draft'
    });

    taskQueueStoreApi.actions.dismissDraft('draft-2');

    expect(taskQueueStoreApi.get()._draftTasks).toEqual([]);
    expect(taskQueueStoreApi.get().publishedTaskIds).toEqual(['draft-1']);
  });

  test('optional internal autoselector example supports action-only getters', () => {
    interface StoreState {
      _loadedProfile?: {
        id: string;
        name: string;
      };
    }

    interface StoreActions {
      hasLoadedProfile: () => boolean;
    }

    const store = createErgoStore<StoreState, StoreActions>()
      .withInitialState(() => ({}))
      .withAutoselectors(['_loadedProfile'])
      .withActions(({ _getLoadedProfile }) => {
        expectTypeOf(_getLoadedProfile).returns.toEqualTypeOf<
          { id: string; name: string } | undefined
        >();

        function hasLoadedProfile() {
          return !!_getLoadedProfile();
        }

        return {
          hasLoadedProfile
        };
      });

    expect('_getLoadedProfile' in store).toBe(false);
    expect(store.actions.hasLoadedProfile()).toBe(false);

    store.set({
      _loadedProfile: {
        id: 'profile-1',
        name: 'Ada'
      }
    });

    expect(store.actions.hasLoadedProfile()).toBe(true);
  });

  test('internal custom selector example keeps internal selector getters inside actions', () => {
    interface StoreState {
      activeTaskId: string | null;
      _pendingRequestIds: string[];
    }

    interface StoreActions {
      canStartRequest: () => boolean;
    }

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
        expectTypeOf(_getHasPendingRequests).returns.toEqualTypeOf<boolean>();
        expectTypeOf(_getPendingRequestIds).returns.toEqualTypeOf<string[]>();

        function canStartRequest() {
          return !_getHasPendingRequests() && _getPendingRequestIds().length === 0;
        }

        return {
          canStartRequest
        };
      });

    expect(store.getActiveTaskId()).toBeNull();
    expect('_getHasPendingRequests' in store).toBe(false);
    expect('_getPendingRequestIds' in store).toBe(false);
    expect(store.actions.canStartRequest()).toBe(true);

    store.set({ _pendingRequestIds: ['request-1'] });

    expect(store.actions.canStartRequest()).toBe(false);
  });

  test('defineErgoStoreSelector itemCount example applies custom equality to subscribers', () => {
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
    const listener = vi.fn();
    const unsubscribe = store.subscribeItemCount(listener);

    expect(store.getItemCount()).toBe(0);
    expect(listener).toHaveBeenCalledWith(0);

    store.set({ items: ['a'] });
    store.set({ items: ['b'] });
    store.set({ items: ['b', 'c'] });

    expect(store.getItemCount()).toBe(2);
    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenLastCalledWith(2);

    unsubscribe();
  });

  test('Object.is equality example only notifies when activeTaskId changes', () => {
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
    const listener = vi.fn();
    const unsubscribe = store.subscribeActiveTaskId(listener);

    expect(listener).toHaveBeenCalledWith(null);

    store.set({ activeTaskId: null });

    expect(listener).toHaveBeenCalledTimes(1);

    store.set({ activeTaskId: 'task-1' });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith('task-1');

    unsubscribe();
  });

  test('shallow equality example compares selector result entries', () => {
    const store = createErgoStore<{ count: number; label: string }>()
      .withInitialState(() => ({ count: 0, label: 'Ready' }))
      .withoutAutoselectors()
      .withSelectors({
        summary: defineErgoStoreSelector(
          (state: { count: number; label: string }) => ({
            count: state.count,
            label: state.label
          }),
          shallow
        )
      })
      .withoutActions();
    const listener = vi.fn();
    const unsubscribe = store.subscribeSummary(listener);

    expect(listener).toHaveBeenCalledWith({
      count: 0,
      label: 'Ready'
    });

    store.set({ count: 0 });
    store.set({ label: 'Ready' });

    expect(listener).toHaveBeenCalledTimes(1);

    store.set({ label: 'Done' });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith({
      count: 0,
      label: 'Done'
    });

    unsubscribe();
  });

  test('deep equality filter example ignores normalized equivalent filter order', () => {
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
    const listener = vi.fn();
    const unsubscribe = store.subscribeNormalizedFilters(listener);

    expect(listener).toHaveBeenCalledWith({
      statuses: [],
      tags: []
    });

    store.set({
      filters: {
        statuses: ['open', 'closed'],
        tags: ['urgent']
      }
    });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith({
      statuses: ['closed', 'open'],
      tags: ['urgent']
    });

    store.set({
      filters: {
        statuses: ['closed', 'open'],
        tags: ['urgent']
      }
    });

    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  test('deep equality layout example ignores normalized equivalent column order', () => {
    interface ViewState {
      layout: {
        columns: string[];
        density: 'compact' | 'comfortable';
      };
    }

    const store = createErgoStore<ViewState>()
      .withInitialState(() => ({
        layout: {
          columns: ['title', 'owner', 'status'],
          density: 'comfortable'
        }
      }))
      .withoutAutoselectors()
      .withSelectors({
        normalizedLayout: defineErgoStoreSelector(
          (state: ViewState) => ({
            columns: [...state.layout.columns].sort(),
            density: state.layout.density
          }),
          equals
        )
      })
      .withoutActions();
    const listener = vi.fn();
    const unsubscribe = store.subscribeNormalizedLayout(listener);

    expect(listener).toHaveBeenCalledWith({
      columns: ['owner', 'status', 'title'],
      density: 'comfortable'
    });

    store.set({
      layout: {
        columns: ['status', 'title', 'owner'],
        density: 'comfortable'
      }
    });

    expect(listener).toHaveBeenCalledTimes(1);

    store.set({
      layout: {
        columns: ['status', 'title', 'owner'],
        density: 'compact'
      }
    });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith({
      columns: ['owner', 'status', 'title'],
      density: 'compact'
    });

    unsubscribe();
  });

  test('domain equality example compares selected IDs by ordered values', () => {
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
    const listener = vi.fn();
    const unsubscribe = store.subscribeSelectedIds(listener);

    expect(listener).toHaveBeenCalledWith([]);

    store.set({ selectedIds: [] });

    expect(listener).toHaveBeenCalledTimes(1);

    store.set({ selectedIds: ['task-1'] });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(['task-1']);

    store.set({ selectedIds: ['task-1'] });

    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });
});
