export const defineErgoStoreSelector = (select, equalityFn) => ({
    select,
    equalityFn
});
export const normalizeSelectorInput = (selectorInput) => {
    // Normalize the public shorthand into one internal shape so method generation never needs to
    // branch on whether equality was provided.
    if (typeof selectorInput === 'object' && selectorInput !== null && 'select' in selectorInput) {
        return selectorInput;
    }
    return {
        select: selectorInput
    };
};
//# sourceMappingURL=selectorDefinitions.js.map