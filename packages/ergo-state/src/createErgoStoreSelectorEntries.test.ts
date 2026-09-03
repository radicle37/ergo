import { createStore } from 'zustand';
import { describe, expect, test, vi } from 'vitest';

import { createErgoStoreSelectorEntries } from './createErgoStoreSelectorEntries.js';
import { defineErgoStoreSelector } from './selectorDefinitions.js';

interface TestState {
  count: number;
  label: string;
  _items: string[];
}

describe('createErgoStoreSelectorEntries', () => {
  test('splits public and internal selector entries', () => {
    const equalityFn = vi.fn();
    const store = createStore<TestState>(() => ({
      count: 2,
      label: 'ready',
      _items: ['a', 'b']
    }));

    const entries = createErgoStoreSelectorEntries(store, ['count', '_items'], {
      itemCount: defineErgoStoreSelector((state: TestState) => state._items.length, equalityFn),
      upperLabel: (state: TestState) => state.label.toUpperCase()
    });

    expect(Object.keys(entries.publicSelectorEntries)).toEqual([
      'count',
      'itemCount',
      'upperLabel'
    ]);
    expect(Object.keys(entries.internalSelectorEntries)).toEqual(['_items']);
    expect(entries.publicSelectorEntries.count.select(store.getState())).toBe(2);
    expect(entries.publicSelectorEntries.itemCount.select(store.getState())).toBe(2);
    expect(entries.publicSelectorEntries.itemCount.equalityFn).toBe(equalityFn);
    expect(entries.publicSelectorEntries.upperLabel.select(store.getState())).toBe('READY');
    expect(entries.internalSelectorEntries._items.select(store.getState())).toEqual(['a', 'b']);
  });

  test('lets custom selectors override matching autoselectors', () => {
    const store = createStore<TestState>(() => ({
      count: 2,
      label: 'ready',
      _items: ['a', 'b']
    }));

    const entries = createErgoStoreSelectorEntries(store, ['count', '_items'], {
      _items: (state: TestState) => state._items.length,
      count: (state: TestState) => state.count * 10
    });

    expect(entries.publicSelectorEntries.count.select(store.getState())).toBe(20);
    expect(entries.internalSelectorEntries._items.select(store.getState())).toBe(2);
  });

  test('validates the complete initial state before exposing selectors', () => {
    const symbolProperty = Symbol('state');
    const store = createStore<TestState & { [symbolProperty]: string }>(() => ({
      count: 2,
      label: 'ready',
      _items: [],
      [symbolProperty]: 'invalid'
    }));

    expect(() => createErgoStoreSelectorEntries(store, ['count'], undefined)).toThrow(
      'Ergo store state property keys must be strings. Received Symbol(state).'
    );
  });
});
