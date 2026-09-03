import { normalizeSelectorInput } from './selectorDefinitions';
import { assertAutoselectorKey, assertSelectorKey, assertStorePropertyKey, isInternalSelectorKey } from './selectorValidation';
export const createErgoStoreSelectorEntries = (store, autoselectors, selectors) => {
    const publicSelectorEntries = {};
    const internalSelectorEntries = {};
    const initialState = store.getInitialState();
    // Validate all state keys up front so consumers get a deterministic error during store setup,
    // even for properties that are not currently exposed as autoselectors.
    Reflect.ownKeys(initialState).forEach(property => {
        assertStorePropertyKey(property);
    });
    (autoselectors ?? []).forEach(property => {
        assertAutoselectorKey(property, initialState);
        const selectorEntry = {
            select: (state) => state[property]
        };
        if (isInternalSelectorKey(property)) {
            internalSelectorEntries[property] = selectorEntry;
            return;
        }
        publicSelectorEntries[property] = selectorEntry;
    });
    const selectorInputs = selectors ?? {};
    Reflect.ownKeys(selectorInputs).forEach(selectorName => {
        assertSelectorKey(selectorName);
        const selectorEntry = normalizeSelectorInput(selectorInputs[selectorName]);
        if (isInternalSelectorKey(selectorName)) {
            // Internal selectors intentionally win over internal state-property getters with the same
            // key, mirroring how public custom selectors can override public autoselectors.
            internalSelectorEntries[selectorName] = selectorEntry;
            return;
        }
        // Custom selectors intentionally win over autoselectors with the same public API name. This
        // allows a store author to start with an autoselector and later replace it with equivalent
        // derived behavior without forcing consumer call sites to change.
        publicSelectorEntries[selectorName] = selectorEntry;
    });
    return {
        publicSelectorEntries,
        internalSelectorEntries
    };
};
//# sourceMappingURL=createErgoStoreSelectorEntries.js.map