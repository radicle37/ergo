import { createErgoStoreApiMethodName } from './createErgoStoreApiMethodName';
export const createSelectorMethodMap = (prefix, selectorEntries, createMethod, createMethodName = createErgoStoreApiMethodName) => {
    // Runtime object construction cannot preserve the mapped type from types.ts, so callers cast the
    // result to the specific getter/hook/subscriber map after choosing the prefix.
    const selectorMethods = {};
    Object.entries(selectorEntries).forEach(([selectorName, selectorEntry]) => {
        const methodName = createMethodName(prefix, selectorName);
        selectorMethods[methodName] = createMethod(selectorEntry, methodName);
    });
    return selectorMethods;
};
//# sourceMappingURL=createSelectorMethodMap.js.map