import { describe, expect, test } from 'vitest';

import {
  createErgoStoreApiMethodName,
  createErgoStoreInternalApiMethodName
} from './createErgoStoreApiMethodName.js';

describe('createErgoStoreApiMethodName', () => {
  test('prefixes public selector names and capitalizes the first selector character', () => {
    expect(createErgoStoreApiMethodName('get', 'count')).toBe('getCount');
    expect(createErgoStoreApiMethodName('use', 'itemCount')).toBe('useItemCount');
    expect(createErgoStoreApiMethodName('subscribe', 'x')).toBe('subscribeX');
  });

  test('throws for invalid public selector names', () => {
    expect(() => createErgoStoreApiMethodName('get', '')).toThrow(
      'Ergo store selector names must start with a lowercase letter from a-z. Received "".'
    );
    expect(() => createErgoStoreApiMethodName('get', 'Count')).toThrow(
      'Ergo store selector names must start with a lowercase letter from a-z. Received "Count".'
    );
    expect(() => createErgoStoreApiMethodName('get', '_count')).toThrow(
      'Ergo store selector names must start with a lowercase letter from a-z. Received "_count".'
    );
  });
});

describe('createErgoStoreInternalApiMethodName', () => {
  test('inserts the prefix after the leading underscore run', () => {
    expect(createErgoStoreInternalApiMethodName('get', '_count')).toBe('_getCount');
    expect(createErgoStoreInternalApiMethodName('get', '__draftItems')).toBe('__getDraftItems');
    expect(createErgoStoreInternalApiMethodName('subscribe', '___itemCount')).toBe(
      '___subscribeItemCount'
    );
  });

  test('throws for invalid internal selector names', () => {
    expect(() => createErgoStoreInternalApiMethodName('get', 'count')).toThrow(
      'Ergo store internal selector names must start with one or more underscores followed by a lowercase letter from a-z. Received "count".'
    );
    expect(() => createErgoStoreInternalApiMethodName('get', '_Count')).toThrow(
      'Ergo store internal selector names must start with one or more underscores followed by a lowercase letter from a-z. Received "_Count".'
    );
  });
});
