/**
 * Phantom marker letting external code `infer` a store's resolved `SelectorMap` back out of an
 * `ErgoStoreApi` value (see `ErgoStoreSelectorMapOf`). `StoreGetterMap`/`StoreSubscriberMap`
 * key-remap `SelectorMap`'s keys (`itemCount` -> `getItemCount`), and TypeScript cannot `infer`
 * a type parameter back out through a key-remapped mapped type
 * (https://github.com/microsoft/TypeScript/issues/40619) — this field is a plain, non-remapped
 * property, so it sidesteps that limitation entirely. Keyed on a real, exported `unique symbol`
 * rather than a plain string so it never occupies a name in `ErgoStoreApi`'s string-keyed
 * namespace and isn't reachable via dot notation; the field itself is never populated on any
 * actual store.
 */
export const ErgoStoreSelectorMapMarker = Symbol('ErgoStoreSelectorMapMarker');
//# sourceMappingURL=internalTypes.js.map