import { describe, expect, test, vi } from 'vitest';

import { createSelectorMethodMap } from './createSelectorMethodMap';

interface TestState {
  count: number;
  label: string;
}

describe('createSelectorMethodMap', () => {
  test('creates one prefixed method for each selector entry', () => {
    const countSelector = {
      select: (state: TestState) => state.count
    };
    const labelSelector = {
      select: (state: TestState) => state.label
    };
    const createMethod = vi.fn(
      (selectorEntry: { select: (state: TestState) => unknown }) => selectorEntry.select
    );

    const methods = createSelectorMethodMap(
      'get',
      {
        count: countSelector,
        label: labelSelector
      },
      createMethod
    );

    expect(methods).toEqual({
      getCount: countSelector.select,
      getLabel: labelSelector.select
    });
    expect(createMethod).toHaveBeenNthCalledWith(1, countSelector, 'getCount');
    expect(createMethod).toHaveBeenNthCalledWith(2, labelSelector, 'getLabel');
  });

  test('supports a custom method-name factory', () => {
    const countSelector = {
      select: (state: TestState) => state.count
    };
    const createMethodName = vi.fn(
      (prefix: string, selectorName: string) => `${selectorName}:${prefix}`
    );

    const methods = createSelectorMethodMap(
      'read',
      {
        count: countSelector
      },
      selectorEntry => selectorEntry,
      createMethodName
    );

    expect(methods).toEqual({
      'count:read': countSelector
    });
    expect(createMethodName).toHaveBeenCalledWith('read', 'count');
  });
});
