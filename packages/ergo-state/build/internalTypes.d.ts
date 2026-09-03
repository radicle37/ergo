import type { Mutate, StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand/vanilla';
export type ErgoStoreEqualityFn<T> = (valueA: T, valueB: T) => boolean;
/**
 * Object-form selectors carry the same selector function as the shorthand form, plus the equality
 * function used by generated hooks and subscribers.
 */
export interface ErgoStoreSelectorDefinition<State, Selected> {
    readonly select: (state: State) => Selected;
    readonly equalityFn?: ErgoStoreEqualityFn<Selected>;
}
/**
 * Public selector input accepts a plain function for the common case, or the object form when the
 * selected value needs custom equality semantics.
 */
export type ErgoStoreSelectorInput<State, Selected> = ((state: State) => Selected) | ErgoStoreSelectorDefinition<State, Selected>;
export type ErgoStoreSelectorRecord<State> = Record<string, ErgoStoreSelectorInput<State, any>>;
type ErgoStoreSelectorArgument<State, Selectors> = Readonly<{
    [SelectorKey in keyof Selectors]: ErgoStoreSelectorInput<State, any>;
}>;
export type EmptyErgoStoreActions = Record<never, never>;
export type EmptyErgoStoreAutoselectors = readonly [];
export type EmptyErgoStoreMutators = [];
export type ErgoStoreMutators = [StoreMutatorIdentifier, unknown][];
export type ErgoStoreReadableApi<State> = Pick<StoreApi<State>, 'getInitialState' | 'getState' | 'subscribe'>;
export type ErgoStoreMiddlewareApi<State, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = Readonly<Omit<Mutate<StoreApi<State>, Mutators>, keyof StoreApi<State>>>;
/**
 * Zustand's types track middleware by adding small marker tuples to `StateCreator`.
 *
 * Most store authors should not need to think about those markers. Ergo keeps them here so
 * TypeScript knows when middleware has changed the store API. For example, `immer` changes `set` so
 * it accepts draft-mutating callbacks.
 *
 * `MiddlewareInputMutators` describe the `set/get/api` shape seen by the initial-state function.
 * `MiddlewareOutputMutators` describe the final Zustand store after middleware has wrapped it.
 */
export type ErgoStoreMiddleware<State extends object, MiddlewareInputMutators extends ErgoStoreMutators, MiddlewareOutputMutators extends ErgoStoreMutators> = (initializer: StateCreator<State, MiddlewareInputMutators, EmptyErgoStoreMutators>) => StateCreator<State, EmptyErgoStoreMutators, MiddlewareOutputMutators>;
type LowercaseAsciiLetter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
type SelectorApiKey = `${LowercaseAsciiLetter}${string}`;
type IsInternalSelectorApiKey<SelectorKey extends string> = SelectorKey extends `_${infer Rest}` ? Rest extends `${LowercaseAsciiLetter}${string}` ? true : Rest extends `_${string}` ? IsInternalSelectorApiKey<Rest> : false : false;
type PublicSelectorKey<Selectors> = Extract<{
    [SelectorKey in keyof Selectors]: SelectorKey extends string ? SelectorKey extends SelectorApiKey ? SelectorKey : never : never;
}[keyof Selectors], string>;
type InternalSelectorKey<Selectors> = Extract<{
    [SelectorKey in keyof Selectors]: SelectorKey extends string ? IsInternalSelectorApiKey<SelectorKey> extends true ? SelectorKey : never : never;
}[keyof Selectors], string>;
type SelectorRecordApiKey<SelectorKey extends string> = SelectorKey extends SelectorApiKey ? SelectorKey : IsInternalSelectorApiKey<SelectorKey> extends true ? SelectorKey : never;
type MergeSelectorMaps<Base, Override> = Omit<Base, keyof Override> & Override;
export type ErgoStoreApiMethodName<Prefix extends string, SelectorKey> = SelectorKey extends string ? `${Prefix}${Capitalize<SelectorKey>}` : never;
/**
 * Internal getter names preserve the leading underscore run and insert the prefix after it:
 * "_draftTasks" -> "_getDraftTasks", "__draft" -> "__getDraft".
 */
export type ErgoStoreInternalApiMethodName<Prefix extends string, SelectorKey> = SelectorKey extends string ? SelectorKey extends `_${infer Rest}` ? Rest extends `${LowercaseAsciiLetter}${string}` ? `_${Prefix}${Capitalize<Rest>}` : Rest extends `_${string}` ? `_${ErgoStoreInternalApiMethodName<Prefix, Rest>}` : never : never : never;
export type SelectorValue<State, Selector> = Selector extends ErgoStoreSelectorDefinition<State, infer Selected> ? Selected : Selector extends (state: State) => infer Selected ? Selected : never;
/**
 * Public autoselectors require state property names that can produce stable, ergonomic API names.
 * Internal `_` fields are handled separately so they can generate action-scope getters only.
 */
export type PublicStorePropertyKey<State> = Extract<{
    [PropertyKey in keyof State]: PropertyKey extends string ? PropertyKey extends SelectorApiKey ? PropertyKey extends `_${string}` ? never : PropertyKey : never : never;
}[keyof State], string>;
export type InternalStorePropertyKey<State> = Extract<{
    [PropertyKey in keyof State]: PropertyKey extends string ? IsInternalSelectorApiKey<PropertyKey> extends true ? PropertyKey : never : never;
}[keyof State], string>;
export type StorePropertyAutoselectorKey<State> = PublicStorePropertyKey<State> | InternalStorePropertyKey<State>;
type InvalidSelectorApiKey<Selectors> = Exclude<Extract<keyof Selectors, string>, SelectorRecordApiKey<Extract<keyof Selectors, string>>>;
/** @lintignore internal selector validation alias */
export type SelectorRecordWithValidApiKeys<Selectors> = InvalidSelectorApiKey<Selectors> extends never ? Selectors : never;
type WithValidSelectorApiKeys<Selectors, Result> = InvalidSelectorApiKey<Selectors> extends never ? Result : never;
export type ErgoStoreBindingMode = 'react' | 'vanilla';
export type ErgoStoreSelectorChoiceResult<State extends object, NextSelectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators, Mode extends ErgoStoreBindingMode = 'vanilla'> = WithValidSelectorApiKeys<NextSelectors, ErgoStoreActionChoiceBuilder<State, NextSelectors, AutoselectorKeys, Mutators, Mode>>;
type ErgoStoreSelectorChoiceWithActionsResult<State extends object, Actions extends object, NextSelectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators, Mode extends ErgoStoreBindingMode = 'vanilla'> = WithValidSelectorApiKeys<NextSelectors, ErgoStoreActionChoiceBuilderWithActions<State, Actions, NextSelectors, AutoselectorKeys, Mutators, Mode>>;
export type ErgoStoreAutoselectorKeys<State extends object> = readonly StorePropertyAutoselectorKey<State>[];
type PublicAutoselectorKey<State extends object, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>> = Extract<AutoselectorKeys[number], PublicStorePropertyKey<State>>;
type InternalAutoselectorKey<State extends object, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>> = Extract<AutoselectorKeys[number], InternalStorePropertyKey<State>>;
export type AutoselectorMap<State extends object, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>> = Readonly<{
    [PropertyKey in PublicAutoselectorKey<State, AutoselectorKeys>]: (state: State) => State[PropertyKey];
}>;
export type CustomSelectorMap<State, Selectors extends ErgoStoreSelectorRecord<State>> = Readonly<{
    [SelectorKey in PublicSelectorKey<Selectors>]: (state: State) => SelectorValue<State, Selectors[SelectorKey]>;
}>;
export type InternalAutoselectorMap<State extends object, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>> = Readonly<{
    [PropertyKey in InternalAutoselectorKey<State, AutoselectorKeys>]: (state: State) => State[PropertyKey];
}>;
export type InternalCustomSelectorMap<State, Selectors extends ErgoStoreSelectorRecord<State>> = Readonly<{
    [SelectorKey in InternalSelectorKey<Selectors>]: (state: State) => SelectorValue<State, Selectors[SelectorKey]>;
}>;
export type ErgoStoreSelectorMap<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>> = MergeSelectorMaps<AutoselectorMap<State, AutoselectorKeys>, CustomSelectorMap<State, Selectors>>;
export type ErgoStoreInternalSelectorMap<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>> = MergeSelectorMaps<InternalAutoselectorMap<State, AutoselectorKeys>, InternalCustomSelectorMap<State, Selectors>>;
export type StoreGetterMap<SelectorMap extends Record<string, (state: any) => unknown>> = Readonly<{
    [SelectorKey in keyof SelectorMap as ErgoStoreApiMethodName<'get', SelectorKey>]: () => ReturnType<SelectorMap[SelectorKey]>;
}>;
export type StoreSubscriberMap<SelectorMap extends Record<string, (state: any) => unknown>> = Readonly<{
    [SelectorKey in keyof SelectorMap as ErgoStoreApiMethodName<'subscribe', SelectorKey>]: (listener: (selectedValue: ReturnType<SelectorMap[SelectorKey]>) => void) => () => void;
}>;
export type StoreInternalGetterMap<SelectorMap extends Record<string, (state: any) => unknown>> = Readonly<{
    [SelectorKey in keyof SelectorMap as ErgoStoreInternalApiMethodName<'get', SelectorKey>]: () => ReturnType<SelectorMap[SelectorKey]>;
}>;
export type ErgoStoreApi<State, SelectorMap extends Record<string, (state: State) => unknown>, Actions, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = Readonly<{
    readonly actions: Actions;
    readonly middleware: ErgoStoreMiddlewareApi<State, Mutators>;
    readonly get: Mutate<StoreApi<State>, Mutators>['getState'];
    readonly set: Mutate<StoreApi<State>, Mutators>['setState'];
}> & StoreGetterMap<SelectorMap> & StoreSubscriberMap<SelectorMap>;
export type ErgoVanillaStoreApi<State, SelectorMap extends Record<string, (state: State) => unknown>, Actions, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreApi<State, SelectorMap, Actions, Mutators>;
type UseHookMap<SelectorMap extends Record<string, (state: any) => unknown>> = Readonly<{
    [SelectorKey in keyof SelectorMap as ErgoStoreApiMethodName<'use', SelectorKey>]: () => ReturnType<SelectorMap[SelectorKey]>;
}>;
export type ErgoStoreApiForMode<Mode extends ErgoStoreBindingMode, State, SelectorMap extends Record<string, (state: State) => unknown>, Actions, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreApi<State, SelectorMap, Actions, Mutators> & (Mode extends 'react' ? UseHookMap<SelectorMap> : unknown);
/**
 * Middleware can change the `set`, `get`, or `api` arguments received while initial state is
 * created. This type keeps those middleware-adjusted arguments available in `.withInitialState(...)`.
 */
export type ErgoStoreInitialStateGetter<State extends object, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = StateCreator<State, Mutators, EmptyErgoStoreMutators, State>;
/**
 * Action initializers receive the store facade before actions are attached. This avoids a circular
 * type where an action factory could accidentally depend on an action object that is still being
 * constructed.
 */
export type ErgoStoreActionsInitializerApiForMode<Mode extends ErgoStoreBindingMode, State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = Omit<ErgoStoreApiForMode<Mode, State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, EmptyErgoStoreActions, Mutators>, 'actions'> & StoreInternalGetterMap<ErgoStoreInternalSelectorMap<State, Selectors, AutoselectorKeys>>;
export type ErgoStoreActionsInitializerApi<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreActionsInitializerApiForMode<'vanilla', State, Selectors, AutoselectorKeys, Mutators>;
export type ErgoVanillaStoreActionsInitializerApi<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreActionsInitializerApi<State, Selectors, AutoselectorKeys, Mutators>;
export type ErgoStoreActionsInitializerForMode<Mode extends ErgoStoreBindingMode, State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = (store: ErgoStoreActionsInitializerApiForMode<Mode, State, Selectors, AutoselectorKeys, Mutators>) => Actions;
export type ErgoStoreActionsInitializer<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreActionsInitializerForMode<'vanilla', State, Actions, Selectors, AutoselectorKeys, Mutators>;
export type ErgoVanillaStoreActionsInitializer<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreActionsInitializer<State, Actions, Selectors, AutoselectorKeys, Mutators>;
export type InferredErgoStoreActionsInitializerForMode<Mode extends ErgoStoreBindingMode, State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = (store: ErgoStoreActionsInitializerApiForMode<Mode, State, Selectors, AutoselectorKeys, Mutators>) => Actions;
export type InferredErgoStoreActionsInitializer<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = InferredErgoStoreActionsInitializerForMode<'vanilla', State, Actions, Selectors, AutoselectorKeys, Mutators>;
/** @lintignore internal builder-stage alias */
export type InferredErgoVanillaStoreActionsInitializer<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = InferredErgoStoreActionsInitializer<State, Actions, Selectors, AutoselectorKeys, Mutators>;
/**
 * Internal options object used after the staged builder has collected each decision. Most callers
 * should use createErgoStore() so TypeScript can infer state, selectors, and actions in order.
 */
export interface CreateErgoStoreOptions<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, InitializerMutators extends ErgoStoreMutators = EmptyErgoStoreMutators, StoreMutators extends ErgoStoreMutators = EmptyErgoStoreMutators, Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly getInitialState: ErgoStoreInitialStateGetter<State, InitializerMutators>;
    readonly createActions?: ErgoStoreActionsInitializerForMode<Mode, State, Actions, Selectors, AutoselectorKeys, StoreMutators>;
    readonly middleware?: ErgoStoreMiddleware<State, InitializerMutators, StoreMutators>;
    readonly autoselectors?: AutoselectorKeys;
    readonly selectors?: Selectors;
}
export interface CreateErgoStoreFromOptions<Mode extends ErgoStoreBindingMode> {
    <State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, InitializerMutators extends ErgoStoreMutators = EmptyErgoStoreMutators, StoreMutators extends ErgoStoreMutators = EmptyErgoStoreMutators>(options: CreateErgoStoreOptions<State, Actions, Selectors, AutoselectorKeys, InitializerMutators, StoreMutators, Mode>): ErgoStoreApiForMode<Mode, State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, StoreMutators>;
}
export interface ErgoStoreInitialBuilder<State extends object, Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly withMiddleware: <MiddlewareInputMutators extends ErgoStoreMutators, MiddlewareOutputMutators extends ErgoStoreMutators>(middleware: ErgoStoreMiddleware<State, MiddlewareInputMutators, MiddlewareOutputMutators>) => ErgoStoreInitialBuilderWithMiddleware<State, MiddlewareInputMutators, MiddlewareOutputMutators, Mode>;
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State>) => ErgoStoreAutoselectorChoiceBuilder<State, EmptyErgoStoreMutators, Mode>;
}
export interface ErgoStoreInitialBuilderWithActions<State extends object, Actions extends object, Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly withMiddleware: <MiddlewareInputMutators extends ErgoStoreMutators, MiddlewareOutputMutators extends ErgoStoreMutators>(middleware: ErgoStoreMiddleware<State, MiddlewareInputMutators, MiddlewareOutputMutators>) => ErgoStoreInitialBuilderWithActionsAndMiddleware<State, Actions, MiddlewareInputMutators, MiddlewareOutputMutators, Mode>;
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State>) => ErgoStoreAutoselectorChoiceBuilderWithActions<State, Actions, EmptyErgoStoreMutators, Mode>;
}
export interface ErgoStoreStateInferredInitialBuilder<Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly withInitialState: <State extends object>(getInitialState: ErgoStoreInitialStateGetter<State>) => ErgoStoreAutoselectorChoiceBuilder<State, EmptyErgoStoreMutators, Mode>;
}
export interface ErgoStoreInitialBuilderWithMiddleware<State extends object, InitializerMutators extends ErgoStoreMutators, StoreMutators extends ErgoStoreMutators, Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State, InitializerMutators>) => ErgoStoreAutoselectorChoiceBuilder<State, StoreMutators, Mode>;
}
export interface ErgoStoreInitialBuilderWithActionsAndMiddleware<State extends object, Actions extends object, InitializerMutators extends ErgoStoreMutators, StoreMutators extends ErgoStoreMutators, Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State, InitializerMutators>) => ErgoStoreAutoselectorChoiceBuilderWithActions<State, Actions, StoreMutators, Mode>;
}
/**
 * The builder is intentionally staged: selecting autoselectors before custom selectors lets the
 * final API type be composed from the public state keys and any custom selector keys.
 */
export interface ErgoStoreAutoselectorChoiceBuilder<State extends object, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators, Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly withAutoselectors: <AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>>(autoselectors: AutoselectorKeys) => ErgoStoreSelectorChoiceBuilder<State, Record<never, never>, AutoselectorKeys, Mutators, Mode>;
    readonly withoutAutoselectors: () => ErgoStoreSelectorChoiceBuilder<State, Record<never, never>, EmptyErgoStoreAutoselectors, Mutators, Mode>;
}
export interface ErgoStoreAutoselectorChoiceBuilderWithActions<State extends object, Actions extends object, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators, Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly withAutoselectors: <AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>>(autoselectors: AutoselectorKeys) => ErgoStoreSelectorChoiceBuilderWithActions<State, Actions, Record<never, never>, AutoselectorKeys, Mutators, Mode>;
    readonly withoutAutoselectors: () => ErgoStoreSelectorChoiceBuilderWithActions<State, Actions, Record<never, never>, EmptyErgoStoreAutoselectors, Mutators, Mode>;
}
export interface ErgoStoreSelectorChoiceBuilder<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators, Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly withSelectors: <const NextSelectors extends ErgoStoreSelectorArgument<State, NextSelectors>>(selectors: NextSelectors) => ErgoStoreSelectorChoiceResult<State, NextSelectors, AutoselectorKeys, Mutators, Mode>;
    readonly withActions: <Actions extends object>(createActions: InferredErgoStoreActionsInitializerForMode<Mode, State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoStoreApiForMode<Mode, State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
    readonly withoutActions: () => ErgoStoreApiForMode<Mode, State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, EmptyErgoStoreActions, Mutators>;
}
export interface ErgoStoreSelectorChoiceBuilderWithActions<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators, Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly withSelectors: <const NextSelectors extends ErgoStoreSelectorArgument<State, NextSelectors>>(selectors: NextSelectors) => ErgoStoreSelectorChoiceWithActionsResult<State, Actions, NextSelectors, AutoselectorKeys, Mutators, Mode>;
    readonly withActions: (createActions: ErgoStoreActionsInitializerForMode<Mode, State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoStoreApiForMode<Mode, State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
}
export interface ErgoStoreActionChoiceBuilder<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators, Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly withActions: <Actions extends object>(createActions: InferredErgoStoreActionsInitializerForMode<Mode, State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoStoreApiForMode<Mode, State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
    readonly withoutActions: () => ErgoStoreApiForMode<Mode, State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, EmptyErgoStoreActions, Mutators>;
}
export interface ErgoStoreActionChoiceBuilderWithActions<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators, Mode extends ErgoStoreBindingMode = 'vanilla'> {
    readonly withActions: (createActions: ErgoStoreActionsInitializerForMode<Mode, State, Actions, Selectors, AutoselectorKeys, Mutators>) => ErgoStoreApiForMode<Mode, State, ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>, Actions, Mutators>;
}
export type ErgoVanillaStoreInitialBuilder<State extends object> = ErgoStoreInitialBuilder<State, 'vanilla'>;
export type ErgoVanillaStoreInitialBuilderWithActions<State extends object, Actions extends object> = ErgoStoreInitialBuilderWithActions<State, Actions, 'vanilla'>;
export type ErgoVanillaStoreStateInferredInitialBuilder = ErgoStoreStateInferredInitialBuilder<'vanilla'>;
/** @lintignore internal builder-stage alias */
export type ErgoVanillaStoreInitialBuilderWithMiddleware<State extends object, InitializerMutators extends ErgoStoreMutators, StoreMutators extends ErgoStoreMutators> = ErgoStoreInitialBuilderWithMiddleware<State, InitializerMutators, StoreMutators, 'vanilla'>;
/** @lintignore internal builder-stage alias */
export type ErgoVanillaStoreInitialBuilderWithActionsAndMiddleware<State extends object, Actions extends object, InitializerMutators extends ErgoStoreMutators, StoreMutators extends ErgoStoreMutators> = ErgoStoreInitialBuilderWithActionsAndMiddleware<State, Actions, InitializerMutators, StoreMutators, 'vanilla'>;
/** @lintignore internal builder-stage alias */
export type ErgoVanillaStoreAutoselectorChoiceBuilder<State extends object, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreAutoselectorChoiceBuilder<State, Mutators, 'vanilla'>;
/** @lintignore internal builder-stage alias */
export type ErgoVanillaStoreAutoselectorChoiceBuilderWithActions<State extends object, Actions extends object, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreAutoselectorChoiceBuilderWithActions<State, Actions, Mutators, 'vanilla'>;
/** @lintignore internal builder-stage alias */
export type ErgoVanillaStoreSelectorChoiceBuilder<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreSelectorChoiceBuilder<State, Selectors, AutoselectorKeys, Mutators, 'vanilla'>;
/** @lintignore internal builder-stage alias */
export type ErgoVanillaStoreSelectorChoiceBuilderWithActions<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreSelectorChoiceBuilderWithActions<State, Actions, Selectors, AutoselectorKeys, Mutators, 'vanilla'>;
/** @lintignore internal builder-stage alias */
export type ErgoVanillaStoreActionChoiceBuilder<State extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreActionChoiceBuilder<State, Selectors, AutoselectorKeys, Mutators, 'vanilla'>;
/** @lintignore internal builder-stage alias */
export type ErgoVanillaStoreActionChoiceBuilderWithActions<State extends object, Actions extends object, Selectors extends ErgoStoreSelectorRecord<State>, AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>, Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators> = ErgoStoreActionChoiceBuilderWithActions<State, Actions, Selectors, AutoselectorKeys, Mutators, 'vanilla'>;
export {};
//# sourceMappingURL=internalTypes.d.ts.map