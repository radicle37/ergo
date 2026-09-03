import type { StorePropertyAutoselectorKey } from './internalTypes.js';
export declare const isInternalSelectorKey: (name: string) => boolean;
export declare function assertStorePropertyKey(property: PropertyKey): asserts property is string;
export declare function assertSelectorKey(selectorName: PropertyKey): asserts selectorName is string;
export declare function assertPublicSelectorKey(selectorName: string): void;
export declare function assertInternalSelectorKey(selectorName: string): void;
export declare function assertAutoselectorKey<State extends object>(property: PropertyKey, _initialState: State): asserts property is StorePropertyAutoselectorKey<State>;
//# sourceMappingURL=selectorValidation.d.ts.map