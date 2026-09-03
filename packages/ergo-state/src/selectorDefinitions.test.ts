import { describe, expect, test, vi } from 'vitest';

import { defineErgoStoreSelector, normalizeSelectorInput } from './selectorDefinitions.js';

describe('defineErgoStoreSelector', () => {
  test('keeps the selector and optional equality function together', () => {
    const select = (state: { count: number }) => state.count;
    const equalityFn = vi.fn((left: number, right: number) => left === right);

    expect(defineErgoStoreSelector(select, equalityFn)).toEqual({
      equalityFn,
      select
    });
  });
});

describe('normalizeSelectorInput', () => {
  test('wraps shorthand selector functions', () => {
    const select = (state: { count: number }) => state.count;

    expect(normalizeSelectorInput(select)).toEqual({
      select
    });
  });

  test('returns object-form selector definitions unchanged', () => {
    const selectorDefinition = defineErgoStoreSelector(
      (state: { values: number[] }) => state.values,
      (left, right) => left.length === right.length
    );

    expect(normalizeSelectorInput(selectorDefinition)).toBe(selectorDefinition);
  });
});
