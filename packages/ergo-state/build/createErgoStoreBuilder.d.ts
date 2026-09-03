import type { CreateErgoStoreFromOptions, EmptyErgoStoreMutators, ErgoStoreAutoselectorChoiceBuilder, ErgoStoreBindingMode, ErgoStoreInitialStateGetter, ErgoStoreMiddleware, ErgoStoreMutators } from './internalTypes.js';
interface ErgoStoreBuilderBaseConfiguration<State extends object, InitializerMutators extends ErgoStoreMutators, StoreMutators extends ErgoStoreMutators> {
    readonly getInitialState: ErgoStoreInitialStateGetter<State, InitializerMutators>;
    readonly middleware?: ErgoStoreMiddleware<State, InitializerMutators, StoreMutators>;
}
export declare const createErgoStoreAutoselectorChoiceBuilder: <Mode extends ErgoStoreBindingMode, State extends object, InitializerMutators extends ErgoStoreMutators = EmptyErgoStoreMutators, StoreMutators extends ErgoStoreMutators = EmptyErgoStoreMutators>(configuration: ErgoStoreBuilderBaseConfiguration<State, InitializerMutators, StoreMutators>, createStoreFromOptions: CreateErgoStoreFromOptions<Mode>) => ErgoStoreAutoselectorChoiceBuilder<State, StoreMutators, Mode>;
export {};
//# sourceMappingURL=createErgoStoreBuilder.d.ts.map