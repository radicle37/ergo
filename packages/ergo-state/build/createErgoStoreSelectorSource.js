import { createErgoStoreApiMethodName } from './createErgoStoreApiMethodName.js';
export const createErgoStoreSelectorSource = (storeApi, key) => {
    // Reuses the same name generator that builds the real get<Name>/subscribe<Name> methods
    // (createSelectorMethodMap.ts), so this can never drift from the actual naming convention, and
    // gets assertPublicSelectorKey's runtime validation for free.
    const getterName = createErgoStoreApiMethodName('get', key);
    const subscriberName = createErgoStoreApiMethodName('subscribe', key);
    const get = storeApi[getterName];
    const subscribe = storeApi[subscriberName];
    if (typeof get !== 'function' || typeof subscribe !== 'function') {
        // Defensive: only reachable if a caller bypasses the Key constraint with a cast, since
        // ErgoStoreSelectorMapOf and the real getter/subscriber maps are built from the same
        // already-merged SelectorMap and can't structurally disagree on which keys exist.
        throw new Error(`Ergo store has no selector named "${key}" (expected "${getterName}"/"${subscriberName}").`);
    }
    return { get, subscribe };
};
//# sourceMappingURL=createErgoStoreSelectorSource.js.map