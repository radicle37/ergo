const startsWithLowercaseAsciiLetter = (value) => {
    const firstCharacterCode = value.charCodeAt(0);
    // Keep this intentionally ASCII-only to match the template literal type in internalTypes.ts and
    // to avoid locale-sensitive casing when generated method names are capitalized.
    return firstCharacterCode >= 97 && firstCharacterCode <= 122;
};
const getInternalNameSuffix = (name) => name.replace(/^_+/, '');
export const isInternalSelectorKey = (name) => name.startsWith('_') && startsWithLowercaseAsciiLetter(getInternalNameSuffix(name));
const assertPublicSelectorApiKeyName = (kind, name) => {
    if (!startsWithLowercaseAsciiLetter(name)) {
        throw new Error(`Ergo store ${kind} names must start with a lowercase letter from a-z. Received "${name}".`);
    }
};
const assertInternalSelectorApiKeyName = (kind, name) => {
    if (!isInternalSelectorKey(name)) {
        throw new Error(`Ergo store internal ${kind} names must start with one or more underscores followed by a lowercase letter from a-z. Received "${name}".`);
    }
};
export function assertStorePropertyKey(property) {
    // State can technically contain symbol keys, but Ergo only creates string-named API methods.
    if (typeof property !== 'string') {
        throw new Error(`Ergo store state property keys must be strings. Received ${String(property)}.`);
    }
    if (property === '') {
        throw new Error('Ergo store state property names must not be empty strings.');
    }
    if (property.startsWith('_')) {
        assertInternalSelectorApiKeyName('state property', property);
    }
}
export function assertSelectorKey(selectorName) {
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
export function assertPublicSelectorKey(selectorName) {
    assertPublicSelectorApiKeyName('selector', selectorName);
}
export function assertInternalSelectorKey(selectorName) {
    assertInternalSelectorApiKeyName('selector', selectorName);
}
export function assertAutoselectorKey(property, _initialState) {
    if (typeof property !== 'string') {
        throw new Error(`Ergo store autoselector keys must be strings. Received ${String(property)}.`);
    }
    if (property === '') {
        throw new Error('Ergo store autoselector names must not be empty strings.');
    }
    if (property.startsWith('_')) {
        assertInternalSelectorApiKeyName('state property', property);
    }
    else {
        assertPublicSelectorApiKeyName('autoselector', property);
    }
}
//# sourceMappingURL=selectorValidation.js.map