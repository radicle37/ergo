import { describe, expect, test } from 'vitest';

import {
  assertAutoselectorKey,
  assertSelectorKey,
  assertStorePropertyKey,
  isInternalSelectorKey
} from './selectorValidation.js';

describe('isInternalSelectorKey', () => {
  test('accepts underscore-prefixed names whose first public character is lowercase ascii', () => {
    expect(isInternalSelectorKey('_count')).toBe(true);
    expect(isInternalSelectorKey('__draftItems')).toBe(true);
  });

  test('rejects names without the internal selector shape', () => {
    expect(isInternalSelectorKey('count')).toBe(false);
    expect(isInternalSelectorKey('_')).toBe(false);
    expect(isInternalSelectorKey('_1count')).toBe(false);
    expect(isInternalSelectorKey('_Count')).toBe(false);
    // cspell:disable-next-line
    expect(isInternalSelectorKey('_åcount')).toBe(false);
  });
});

describe('assertStorePropertyKey', () => {
  test('allows public property names and valid internal property names', () => {
    expect(() => assertStorePropertyKey('count')).not.toThrow();
    expect(() => assertStorePropertyKey('_count')).not.toThrow();
    expect(() => assertStorePropertyKey('__draftItems')).not.toThrow();
  });

  test('rejects unsupported property keys', () => {
    expect(() => assertStorePropertyKey('')).toThrow(
      'Ergo store state property names must not be empty strings.'
    );
    expect(() => assertStorePropertyKey(Symbol('count'))).toThrow(
      'Ergo store state property keys must be strings. Received Symbol(count).'
    );
    expect(() => assertStorePropertyKey('_Count')).toThrow(
      'Ergo store internal state property names must start with one or more underscores followed by a lowercase letter from a-z. Received "_Count".'
    );
  });
});

describe('assertSelectorKey', () => {
  test('allows public selector names and valid internal selector names', () => {
    expect(() => assertSelectorKey('count')).not.toThrow();
    expect(() => assertSelectorKey('_count')).not.toThrow();
    expect(() => assertSelectorKey('__draftItems')).not.toThrow();
  });

  test('rejects unsupported selector keys', () => {
    expect(() => assertSelectorKey('')).toThrow(
      'Ergo store selector names must not be empty strings.'
    );
    expect(() => assertSelectorKey(Symbol('count'))).toThrow(
      'Ergo store selector keys must be strings. Received Symbol(count).'
    );
    expect(() => assertSelectorKey('Count')).toThrow(
      'Ergo store selector names must start with a lowercase letter from a-z. Received "Count".'
    );
    expect(() => assertSelectorKey('_Count')).toThrow(
      'Ergo store internal selector names must start with one or more underscores followed by a lowercase letter from a-z. Received "_Count".'
    );
  });
});

describe('assertAutoselectorKey', () => {
  const state = {
    actions: {},
    count: 1,
    reset: () => undefined,
    _items: ['a']
  };

  test('allows public, internal, actions, and function-valued state properties', () => {
    expect(() => assertAutoselectorKey('count', state)).not.toThrow();
    expect(() => assertAutoselectorKey('_items', state)).not.toThrow();
    expect(() => assertAutoselectorKey('actions', state)).not.toThrow();
    expect(() => assertAutoselectorKey('reset', state)).not.toThrow();
  });

  test('rejects unsupported autoselector keys', () => {
    expect(() => assertAutoselectorKey('', state)).toThrow(
      'Ergo store autoselector names must not be empty strings.'
    );
    expect(() => assertAutoselectorKey(Symbol('count'), state)).toThrow(
      'Ergo store autoselector keys must be strings. Received Symbol(count).'
    );
    expect(() => assertAutoselectorKey('Count', state)).toThrow(
      'Ergo store autoselector names must start with a lowercase letter from a-z. Received "Count".'
    );
    expect(() => assertAutoselectorKey('_Count', state)).toThrow(
      'Ergo store internal state property names must start with one or more underscores followed by a lowercase letter from a-z. Received "_Count".'
    );
  });
});
