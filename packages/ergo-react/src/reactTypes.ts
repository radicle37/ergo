import type {
  EmptyErgoStoreMutators,
  ErgoStoreActionChoiceBuilder,
  ErgoStoreActionChoiceBuilderWithActions,
  ErgoStoreActionsInitializerApiForMode,
  ErgoStoreActionsInitializerForMode,
  ErgoStoreApiForMode,
  ErgoStoreAutoselectorChoiceBuilder,
  ErgoStoreAutoselectorChoiceBuilderWithActions,
  ErgoStoreAutoselectorKeys,
  ErgoStoreInitialBuilder,
  ErgoStoreInitialBuilderWithActions,
  ErgoStoreInitialBuilderWithActionsAndMiddleware,
  ErgoStoreInitialBuilderWithMiddleware,
  ErgoStoreMutators,
  ErgoStoreSelectorChoiceBuilder,
  ErgoStoreSelectorChoiceBuilderWithActions,
  ErgoStoreSelectorRecord,
  ErgoStoreStateInferredInitialBuilder,
  InferredErgoStoreActionsInitializerForMode
} from 'ergo-state/adapter-internal';

export type ErgoReactStoreApi<
  State,
  SelectorMap extends Record<string, (state: State) => unknown>,
  Actions,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
> = ErgoStoreApiForMode<'react', State, SelectorMap, Actions, Mutators>;

export type ErgoReactStoreActionsInitializerApi<
  State extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
> = ErgoStoreActionsInitializerApiForMode<'react', State, Selectors, AutoselectorKeys, Mutators>;

export type ErgoReactStoreActionsInitializer<
  State extends object,
  Actions extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
> = ErgoStoreActionsInitializerForMode<
  'react',
  State,
  Actions,
  Selectors,
  AutoselectorKeys,
  Mutators
>;

/** @lintignore internal builder-stage alias */
export type InferredErgoReactStoreActionsInitializer<
  State extends object,
  Actions extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
> = InferredErgoStoreActionsInitializerForMode<
  'react',
  State,
  Actions,
  Selectors,
  AutoselectorKeys,
  Mutators
>;

export type ErgoReactStoreInitialBuilder<State extends object> = ErgoStoreInitialBuilder<
  State,
  'react'
>;

export type ErgoReactStoreInitialBuilderWithActions<
  State extends object,
  Actions extends object
> = ErgoStoreInitialBuilderWithActions<State, Actions, 'react'>;

export type ErgoReactStoreStateInferredInitialBuilder =
  ErgoStoreStateInferredInitialBuilder<'react'>;

/** @lintignore internal builder-stage alias */
export type ErgoReactStoreInitialBuilderWithMiddleware<
  State extends object,
  InitializerMutators extends ErgoStoreMutators,
  StoreMutators extends ErgoStoreMutators
> = ErgoStoreInitialBuilderWithMiddleware<State, InitializerMutators, StoreMutators, 'react'>;

/** @lintignore internal builder-stage alias */
export type ErgoReactStoreInitialBuilderWithActionsAndMiddleware<
  State extends object,
  Actions extends object,
  InitializerMutators extends ErgoStoreMutators,
  StoreMutators extends ErgoStoreMutators
> = ErgoStoreInitialBuilderWithActionsAndMiddleware<
  State,
  Actions,
  InitializerMutators,
  StoreMutators,
  'react'
>;

/** @lintignore internal builder-stage alias */
export type ErgoReactStoreAutoselectorChoiceBuilder<
  State extends object,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
> = ErgoStoreAutoselectorChoiceBuilder<State, Mutators, 'react'>;

/** @lintignore internal builder-stage alias */
export type ErgoReactStoreAutoselectorChoiceBuilderWithActions<
  State extends object,
  Actions extends object,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
> = ErgoStoreAutoselectorChoiceBuilderWithActions<State, Actions, Mutators, 'react'>;

/** @lintignore internal builder-stage alias */
export type ErgoReactStoreSelectorChoiceBuilder<
  State extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
> = ErgoStoreSelectorChoiceBuilder<State, Selectors, AutoselectorKeys, Mutators, 'react'>;

/** @lintignore internal builder-stage alias */
export type ErgoReactStoreSelectorChoiceBuilderWithActions<
  State extends object,
  Actions extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
> = ErgoStoreSelectorChoiceBuilderWithActions<
  State,
  Actions,
  Selectors,
  AutoselectorKeys,
  Mutators,
  'react'
>;

/** @lintignore internal builder-stage alias */
export type ErgoReactStoreActionChoiceBuilder<
  State extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
> = ErgoStoreActionChoiceBuilder<State, Selectors, AutoselectorKeys, Mutators, 'react'>;

/** @lintignore internal builder-stage alias */
export type ErgoReactStoreActionChoiceBuilderWithActions<
  State extends object,
  Actions extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
> = ErgoStoreActionChoiceBuilderWithActions<
  State,
  Actions,
  Selectors,
  AutoselectorKeys,
  Mutators,
  'react'
>;
