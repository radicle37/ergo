import type { Mutate, StoreApi } from 'zustand/vanilla';
import type { CreateErgoStoreOptions, EmptyErgoStoreMutators, ErgoStoreApiForMode, ErgoStoreAutoselectorKeys, ErgoStoreBindingMode, ErgoStoreMutators, ErgoStoreSelectorDefinition, ErgoStoreSelectorMap, ErgoStoreSelectorRecord } from './internalTypes.js';
interface CreateErgoStoreApiExtraContext<State extends object, Mutators extends ErgoStoreMutators> {
    readonly publicSelectorEntries: Record<string, ErgoStoreSelectorDefinition<State, unknown>>;
    readonly store: Mutate<StoreApi<State>, Mutators>;
}
export declare const createErgoStoreApiFromOptions: <Mode extends ErgoStoreBindingMode, State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, InitializerMutators extends ErgoStoreMutators = EmptyErgoStoreMutators, StoreMutators extends ErgoStoreMutators = EmptyErgoStoreMutators>(options: CreateErgoStoreOptions<State, Actions, Selectors, AutoselectorKeys, InitializerMutators, StoreMutators, Mode>, createExtraApi?: (context: CreateErgoStoreApiExtraContext<State, StoreMutators>) => object) => ErgoStoreApiForMode<Mode, State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, StoreMutators>;
export {};
//# sourceMappingURL=createErgoStoreApiFromOptions.d.ts.map