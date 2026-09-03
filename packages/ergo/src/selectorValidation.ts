import type { StorePropertyAutoselectorKey } from './internalTypes';

const startsWithLowercaseAsciiLetter = (value: string) => {
  const firstCharacterCode = value.charCodeAt(0);

  // Keep this intentionally ASCII-only to match the template literal type in internalTypes.ts and
  // to avoid locale-sensitive casing when generated method names are capitalized.
  return firstCharacterCode >= 97 && firstCharacterCode <= 122;
};

const getInternalNameSuffix = (name: string) => name.replace(/^_+/, '');

export const isInternalSelectorKey = (name: string) =>
  name.startsWith('_') && startsWithLowercaseAsciiLetter(getInternalNameSuffix(name));

const assertPublicSelectorApiKeyName = (kind: 'selector' | 'autoselector', name: string) => {
  if (!startsWithLowercaseAsciiLetter(name)) {
    throw new Error(
      `Ergo store ${kind} names must start with a lowercase letter from a-z. Received "${name}".`
    );
  }
};

const assertInternalSelectorApiKeyName = (kind: 'selector' | 'state property', name: string) => {
  if (!isInternalSelectorKey(name)) {
    throw new Error(
      `Ergo store internal ${kind} names must start with one or more underscores followed by a lowercase letter from a-z. Received "${name}".`
    );
  }
};

export function assertStorePropertyKey(property: PropertyKey): asserts property is string {
  // State can technically contain symbol keys, but Ergo only creates string-named API methods.
  if (typeof property !== 'string') {
    throw new Error(
      `Ergo store state property keys must be strings. Received ${String(property)}.`
    );
  }

  if (property === '') {
    throw new Error('Ergo store state property names must not be empty strings.');
  }

  if (property.startsWith('_')) {
    assertInternalSelectorApiKeyName('state property', property);
  }
}

export function assertSelectorKey(selectorName: PropertyKey): asserts selectorName is string {
  if (typeof selectorName !== 'string') {
    throw new Error(`Ergo store selector keys must be strings. Received ${String(selectorName)}.`);
  }

  if (selectorName === '') {
    throw new Error('Ergo store selector names must not be empty strings.');
  }

  if (selectorName.startsWith('_')) {
    assertInternalSelectorApiKeyName('selector', selectorName);
    return;
  }

  assertPublicSelectorApiKeyName('selector', selectorName);
}

export function assertPublicSelectorKey(selectorName: string) {
  assertPublicSelectorApiKeyName('selector', selectorName);
}

export function assertInternalSelectorKey(selectorName: string) {
  assertInternalSelectorApiKeyName('selector', selectorName);
}

export function assertAutoselectorKey<State extends object>(
  property: PropertyKey,
  _initialState: State
): asserts property is StorePropertyAutoselectorKey<State> {
  if (typeof property !== 'string') {
    throw new Error(`Ergo store autoselector keys must be strings. Received ${String(property)}.`);
  }

  if (property === '') {
    throw new Error('Ergo store autoselector names must not be empty strings.');
  }

  if (property.startsWith('_')) {
    assertInternalSelectorApiKeyName('state property', property);
  } else {
    assertPublicSelectorApiKeyName('autoselector', property);
  }
}
