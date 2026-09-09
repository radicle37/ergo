import type { EmptyErgoStoreMutators, ErgoStoreActionsInitializerApiForMode, ErgoStoreActionsInitializerForMode, ErgoStoreApiForMode, ErgoStoreAutoselectorKeys, ErgoStoreInitialStateGetter, ErgoStoreMiddleware, ErgoStoreMutators, ErgoStoreSelectorChoiceResult, ErgoStoreSelectorInput, ErgoStoreSelectorMap, ErgoStoreSelectorRecord, InferredErgoStoreActionsInitializerForMode } from 'ergo-state/adapter-internal';
type EmptyErgoReactStoreActions = Record<never, never>;
type EmptyErgoReactStoreAutoselectors = readonly [];
type ErgoReactStoreSelectorArgument<State, Selectors> = Readonly<{
    [SelectorKey in keyof Selectors]: ErgoStoreSelectorInput<State, any>;
}>;
type ErgoReactStoreSelectorChoiceResult<State extends object, NextSelectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators> = ErgoStoreSelectorChoiceResult<State, NextSelectors, AutoselectorKeys, Mutators, 'react'> extends never ? never : ErgoReactStoreActionChoiceBuilder<State, NextSelectors, AutoselectorKeys, Mutators>;
type ErgoReactStoreSelectorChoiceWithActionsResult<State extends object, Actions extends object, NextSelectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators> = ErgoStoreSelectorChoiceResult<State, NextSelectors, AutoselectorKeys, Mutators, 'react'> extends never ? never : ErgoReactStoreActionChoiceBuilderWithActions<State, Actions, NextSelectors, AutoselectorKeys, Mutators>;
export type ErgoReactStoreSelectorMap<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>> = ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>;
export type ErgoReactStoreApi<State, SelectorMap extends Record<string, (state: State) => unknown>, Actions, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreApiForMode<'react', State, SelectorMap, Actions, Mutators>;
export type ErgoReactStoreActionsInitializerApi<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreActionsInitializerApiForMode<'react', State, Selectors, AutoselectorKeys, Mutators>;
export type ErgoReactStoreActionsInitializer<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreActionsInitializerForMode<'react', State, Actions, Selectors, AutoselectorKeys, Mutators>;
/** @lintignore internal builder-stage alias */
export type InferredErgoReactStoreActionsInitializer<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = InferredErgoStoreActionsInitializerForMode<'react', State, Actions, Selectors, AutoselectorKeys, Mutators>;
export interface ErgoReactStoreInitialBuilder<State extends object> {
    readonly withMiddleware: <MiddlewareInputMutators extends ErgoStoreMutators, MiddlewareOutputMutators extends ErgoStoreMutators>(middleware: ErgoStoreMiddleware<State, MiddlewareInputMutators, MiddlewareOutputMutators>) => ErgoReactStoreInitialBuilderWithMiddleware<State, MiddlewareInputMutators, MiddlewareOutputMutators>;
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State>) => ErgoReactStoreAutoselectorChoiceBuilder<State>;
}
export interface ErgoReactStoreInitialBuilderWithActions<State extends object, Actions extends object> {
    readonly withMiddleware: <MiddlewareInputMutators extends ErgoStoreMutators, MiddlewareOutputMutators extends ErgoStoreMutators>(middleware: ErgoStoreMiddleware<State, MiddlewareInputMutators, MiddlewareOutputMutators>) => ErgoReactStoreInitialBuilderWithActionsAndMiddleware<State, Actions, MiddlewareInputMutators, MiddlewareOutputMutators>;
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State>) => ErgoReactStoreAutoselectorChoiceBuilderWithActions<State, Actions>;
}
export interface ErgoReactStoreStateInferredInitialBuilder {
    readonly withInitialState: <State extends object>(getInitialState: ErgoStoreInitialStateGetter<State>) => ErgoReactStoreAutoselectorChoiceBuilder<State>;
}
/** @lintignore internal builder-stage alias */
export interface ErgoReactStoreInitialBuilderWithMiddleware<State extends object, InitializerMutators extends ErgoStoreMutators, StoreMutators extends ErgoStoreMutators> {
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State, InitializerMutators>) => ErgoReactStoreAutoselectorChoiceBuilder<State, StoreMutators>;
}
/** @lintignore internal builder-stage alias */
export interface ErgoReactStoreInitialBuilderWithActionsAndMiddleware<State extends object, Actions extends object, InitializerMutators extends ErgoStoreMutators, StoreMutators extends ErgoStoreMutators> {
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State, InitializerMutators>) => ErgoReactStoreAutoselectorChoiceBuilderWithActions<State, Actions, StoreMutators>;
}
/** @lintignore internal builder-stage alias */
export interface ErgoReactStoreAutoselectorChoiceBuilder<State extends object, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withAutoselectors: <AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>>(autoselectors: AutoselectorKeys) => ErgoReactStoreSelectorChoiceBuilder<State, Record<never, never>, AutoselectorKeys, Mutators>;
    readonly withoutAutoselectors: () => ErgoReactStoreSelectorChoiceBuilder<State, Record<never, never>, EmptyErgoReactStoreAutoselectors, Mutators>;
}
/** @lintignore internal builder-stage alias */
export interface ErgoReactStoreAutoselectorChoiceBuilderWithActions<State extends object, Actions extends object, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withAutoselectors: <AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>>(autoselectors: AutoselectorKeys) => ErgoReactStoreSelectorChoiceBuilderWithActions<State, Actions, Record<never, never>, AutoselectorKeys, Mutators>;
    readonly withoutAutoselectors: () => ErgoReactStoreSelectorChoiceBuilderWithActions<State, Actions, Record<never, never>, EmptyErgoReactStoreAutoselectors, Mutators>;
}
/** @lintignore internal builder-stage alias */
export interface ErgoReactStoreSelectorChoiceBuilder<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withSelectors: <const NextSelectors extends ErgoReactStoreSelectorArgument<State, NextSelectors>>(selectors: NextSelectors) => ErgoReactStoreSelectorChoiceResult<State, NextSelectors, AutoselectorKeys, Mutators>;
    readonly withActions: <Actions extends object>(createActions: InferredErgoReactStoreActionsInitializer<State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoReactStoreApi<State, ErgoReactStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
    readonly withoutActions: () => ErgoReactStoreApi<State, ErgoReactStoreSelectorMap<State, Selectors, AutoselectorKeys>, EmptyErgoReactStoreActions, Mutators>;
}
/** @lintignore internal builder-stage alias */
export interface ErgoReactStoreSelectorChoiceBuilderWithActions<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withSelectors: <const NextSelectors extends ErgoReactStoreSelectorArgument<State, NextSelectors>>(selectors: NextSelectors) => ErgoReactStoreSelectorChoiceWithActionsResult<State, Actions, NextSelectors, AutoselectorKeys, Mutators>;
    readonly withActions: (createActions: ErgoReactStoreActionsInitializer<State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoReactStoreApi<State, ErgoReactStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
}
/** @lintignore internal builder-stage alias */
export interface ErgoReactStoreActionChoiceBuilder<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withActions: <Actions extends object>(createActions: InferredErgoReactStoreActionsInitializer<State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoReactStoreApi<State, ErgoReactStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
    readonly withoutActions: () => ErgoReactStoreApi<State, ErgoReactStoreSelectorMap<State, Selectors, AutoselectorKeys>, EmptyErgoReactStoreActions, Mutators>;
}
/** @lintignore internal builder-stage alias */
export interface ErgoReactStoreActionChoiceBuilderWithActions<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> {
    readonly withActions: (createActions: ErgoReactStoreActionsInitializer<State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoReactStoreApi<State, ErgoReactStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
}
export {};
//# sourceMappingURL=reactTypes.d.ts.map