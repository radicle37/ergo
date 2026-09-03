import { createElement } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { createErgoStore, defineErgoStoreSelector } from './index.js';

interface HookState {
  count: number;
  items: string[];
  label: string;
}

interface HookActions {
  increment: () => void;
  setItems: (items: string[]) => void;
  setLabel: (label: string) => void;
}

describe('createErgoStore generated React hooks', () => {
  test('render selected values and rerender only when selected values change', () => {
    const renderListener = vi.fn();
    const store = createErgoStore<HookState, HookActions>()
      .withInitialState(() => ({
        count: 0,
        items: [],
        label: 'initial'
      }))
      .withAutoselectors(['count'])
      .withSelectors({
        itemSummary: defineErgoStoreSelector(
          (state: HookState) => ({
            count: state.count,
            itemCount: state.items.length
          }),
          (left, right) => left.count === right.count && left.itemCount === right.itemCount
        )
      })
      .withActions(({ get, set }) => ({
        increment: () => set({ count: get().count + 1 }),
        setItems: items => set({ items }),
        setLabel: label => set({ label })
      }));

    function Summary() {
      const count = store.useCount();
      const itemSummary = store.useItemSummary();

      renderListener({ count, itemSummary });

      return createElement(
        'output',
        {
          'data-testid': 'summary'
        },
        `${count}:${itemSummary.itemCount}`
      );
    }

    render(createElement(Summary));

    expect(screen.getByTestId('summary')).toHaveTextContent('0:0');
    expect(renderListener).toHaveBeenCalledTimes(1);
    expect(renderListener).toHaveBeenLastCalledWith({
      count: 0,
      itemSummary: {
        count: 0,
        itemCount: 0
      }
    });

    act(() => {
      store.actions.setLabel('updated');
    });

    expect(screen.getByTestId('summary')).toHaveTextContent('0:0');
    expect(renderListener).toHaveBeenCalledTimes(1);

    act(() => {
      store.actions.setItems(['a']);
    });

    expect(screen.getByTestId('summary')).toHaveTextContent('0:1');
    expect(renderListener).toHaveBeenCalledTimes(2);

    act(() => {
      store.actions.setItems(['b']);
    });

    expect(screen.getByTestId('summary')).toHaveTextContent('0:1');
    expect(renderListener).toHaveBeenCalledTimes(2);

    act(() => {
      store.actions.increment();
    });

    expect(screen.getByTestId('summary')).toHaveTextContent('1:1');
    expect(renderListener).toHaveBeenCalledTimes(3);
    expect(renderListener).toHaveBeenLastCalledWith({
      count: 1,
      itemSummary: {
        count: 1,
        itemCount: 1
      }
    });
  });

  test('README TaskToolbar example renders generated hooks and updates through exported actions', () => {
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

    const {
      actions: taskListActions,
      useActiveTaskId,
      useCompletedTaskCount,
      useTaskCount
    } = taskListStoreApi;

    function TaskToolbar() {
      const activeTaskId = useActiveTaskId();
      const completedTaskCount = useCompletedTaskCount();
      const taskCount = useTaskCount();

      return createElement(
        'button',
        {
          disabled: !activeTaskId,
          onClick: () => {
            if (activeTaskId) {
              taskListActions.completeTask(activeTaskId);
            }
          }
        },
        `${completedTaskCount} / ${taskCount} complete`
      );
    }

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

    render(createElement(TaskToolbar));

    const button = screen.getByRole('button', {
      name: '0 / 2 complete'
    });

    expect(button).toBeEnabled();

    fireEvent.click(button);

    expect(
      screen.getByRole('button', {
        name: '1 / 2 complete'
      })
    ).toBeEnabled();
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
  });
});
