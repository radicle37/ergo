import type { ErgoStoreAutoselectorKeys, ErgoStoreReadableApi, ErgoStoreSelectorDefinition, ErgoStoreSelectorRecord } from './internalTypes.js';
interface ErgoStoreSelectorEntries<State> {
    readonly publicSelectorEntries: Record<string, ErgoStoreSelectorDefinition<State, unknown>>;
    readonly internalSelectorEntries: Record<string, ErgoStoreSelectorDefinition<State, unknown>>;
}
export declare const createErgoStoreSelectorEntries: <State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>>(store: Pick<ErgoStoreReadableApi<State>, 'getInitialState'>, autoselectors: AutoselectorKeys | undefined, selectors: Selectors | undefined) => ErgoStoreSelectorEntries<State>;
export {};
//# sourceMappingURL=createErgoStoreSelectorEntries.d.ts.map