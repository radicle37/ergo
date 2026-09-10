import type { EmptyErgoStoreMutators, ErgoStoreAutoselectorKeys, ErgoStoreInitialStateGetter, ErgoStoreMiddleware, ErgoStoreMutators, ErgoStoreSelectorChoiceResult, ErgoStoreSelectorInput, ErgoStoreSelectorMap, ErgoStoreSelectorRecord, ErgoVanillaStoreActionsInitializer, ErgoVanillaStoreApi, InferredErgoVanillaStoreActionsInitializer } from './internalTypes.js';
type EmptyErgoVanillaStoreActions = Record<never, never>;
type EmptyErgoVanillaStoreAutoselectors = readonly [];
type ErgoVanillaStoreSelectorArgument<State, Selectors> = Readonly<{
    [SelectorKey in keyof Selectors]: ErgoStoreSelectorInput<State, any>;
}>;
type ErgoVanillaStoreSelectorChoiceResult<State extends object, NextSelectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators> = ErgoStoreSelectorChoiceResult<State, NextSelectors, AutoselectorKeys, Mutators, 'vanilla'> extends never ? never : ErgoVanillaStoreActionChoiceBuilder<State, NextSelectors, AutoselectorKeys, Mutators>;
type ErgoVanillaStoreSelectorChoiceWithActionsResult<State extends object, Actions extends object, NextSelectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators> = ErgoStoreSelectorChoiceResult<State, NextSelectors, AutoselectorKeys, Mutators, 'vanilla'> extends never ? never : ErgoVanillaStoreActionChoiceBuilderWithActions<State, Actions, NextSelectors, AutoselectorKeys, Mutators>;
export interface ErgoVanillaStoreInitialBuilder<State extends object> {
    readonly withMiddleware: <MiddlewareInputMutators extends ErgoStoreMutators, MiddlewareOutputMutators extends ErgoStoreMutators>(middleware: ErgoStoreMiddleware<State, MiddlewareInputMutators, MiddlewareOutputMutators>) => ErgoVanillaStoreInitialBuilderWithMiddleware<State, MiddlewareInputMutators, MiddlewareOutputMutators>;
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State>) => ErgoVanillaStoreAutoselectorChoiceBuilder<State>;
}
export interface ErgoVanillaStoreInitialBuilderWithActions<State extends object, Actions extends object> {
    readonly withMiddleware: <MiddlewareInputMutators extends ErgoStoreMutators, MiddlewareOutputMutators extends ErgoStoreMutators>(middleware: ErgoStoreMiddleware<State, MiddlewareInputMutators, MiddlewareOutputMutators>) => ErgoVanillaStoreInitialBuilderWithActionsAndMiddleware<State, Actions, MiddlewareInputMutators, MiddlewareOutputMutators>;
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State>) => ErgoVanillaStoreAutoselectorChoiceBuilderWithActions<State, Actions>;
}
export interface ErgoVanillaStoreStateInferredInitialBuilder {
    readonly withInitialState: <State extends object>(getInitialState: ErgoStoreInitialStateGetter<State>) => ErgoVanillaStoreAutoselectorChoiceBuilder<State>;
}
interface ErgoVanillaStoreInitialBuilderWithMiddleware<State extends object, InitializerMutators extends ErgoStoreMutators, StoreMutators extends ErgoStoreMutators> {
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State, InitializerMutators>) => ErgoVanillaStoreAutoselectorChoiceBuilder<State, StoreMutators>;
}
interface ErgoVanillaStoreInitialBuilderWithActionsAndMiddleware<State extends object, Actions extends object, InitializerMutators extends ErgoStoreMutators, StoreMutators extends ErgoStoreMutators> {
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State, InitializerMutators>) => ErgoVanillaStoreAutoselectorChoiceBuilderWithActions<State, Actions, StoreMutators>;
}
interface ErgoVanillaStoreAutoselectorChoiceBuilder<State extends object, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withAutoselectors: <AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>>(autoselectors: AutoselectorKeys) => ErgoVanillaStoreSelectorChoiceBuilder<State, Record<never, never>, AutoselectorKeys, Mutators>;
    readonly withoutAutoselectors: () => ErgoVanillaStoreSelectorChoiceBuilder<State, Record<never, never>, EmptyErgoVanillaStoreAutoselectors, Mutators>;
}
interface ErgoVanillaStoreAutoselectorChoiceBuilderWithActions<State extends object, Actions extends object, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withAutoselectors: <AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>>(autoselectors: AutoselectorKeys) => ErgoVanillaStoreSelectorChoiceBuilderWithActions<State, Actions, Record<never, never>, AutoselectorKeys, Mutators>;
    readonly withoutAutoselectors: () => ErgoVanillaStoreSelectorChoiceBuilderWithActions<State, Actions, Record<never, never>, EmptyErgoVanillaStoreAutoselectors, Mutators>;
}
interface ErgoVanillaStoreSelectorChoiceBuilder<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withSelectors: <const NextSelectors extends ErgoVanillaStoreSelectorArgument<State, NextSelectors>>(selectors: NextSelectors) => ErgoVanillaStoreSelectorChoiceResult<State, NextSelectors, AutoselectorKeys, Mutators>;
    readonly withActions: <Actions extends object>(createActions: InferredErgoVanillaStoreActionsInitializer<State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoVanillaStoreApi<State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
    readonly withoutActions: () => ErgoVanillaStoreApi<State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, EmptyErgoVanillaStoreActions, Mutators>;
}
interface ErgoVanillaStoreSelectorChoiceBuilderWithActions<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withSelectors: <const NextSelectors extends ErgoVanillaStoreSelectorArgument<State, NextSelectors>>(selectors: NextSelectors) => ErgoVanillaStoreSelectorChoiceWithActionsResult<State, Actions, NextSelectors, AutoselectorKeys, Mutators>;
    readonly withActions: (createActions: ErgoVanillaStoreActionsInitializer<State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoVanillaStoreApi<State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
}
interface ErgoVanillaStoreActionChoiceBuilder<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withActions: <Actions extends object>(createActions: InferredErgoVanillaStoreActionsInitializer<State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoVanillaStoreApi<State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
    readonly withoutActions: () => ErgoVanillaStoreApi<State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, EmptyErgoVanillaStoreActions, Mutators>;
}
interface ErgoVanillaStoreActionChoiceBuilderWithActions<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withActions: (createActions: ErgoVanillaStoreActionsInitializer<State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoVanillaStoreApi<State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
}
export {};
//# sourceMappingURL=vanillaBuilderTypes.d.ts.map