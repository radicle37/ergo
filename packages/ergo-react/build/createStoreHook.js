import { useStoreWithEqualityFn } from 'zustand/traditional';
export const createStoreHook = (store, selector, equalityFn = Object.is, hookName) => {
    // Always use the equality-aware hook so custom selectors and default selectors follow the same
    // subscription path. Object.is keeps the default behavior explicit and aligned with subscribers.
    const useSelectedStoreValue = () => useStoreWithEqualityFn(store, selector, equalityFn);
    // React DevTools reads `Function.name` to label hooks. Naming each generated hook after the
    // consumer-facing method (e.g. `useCount`) keeps every store slice distinguishable.
    if (hookName) {
        Object.defineProperty(useSelectedStoreValue, 'name', { configurable: true, value: hookName });
    }
    return useSelectedStoreValue;
};
//# sourceMappingURL=createStoreHook.js.map