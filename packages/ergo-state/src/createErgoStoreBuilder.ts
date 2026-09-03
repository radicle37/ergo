import type {
  CreateErgoStoreFromOptions,
  EmptyErgoStoreAutoselectors,
  EmptyErgoStoreMutators,
  ErgoStoreActionChoiceBuilder,
  ErgoStoreAutoselectorChoiceBuilder,
  ErgoStoreAutoselectorKeys,
  ErgoStoreBindingMode,
  ErgoStoreInitialStateGetter,
  ErgoStoreMiddleware,
  ErgoStoreMutators,
  ErgoStoreSelectorInput,
  ErgoStoreSelectorChoiceBuilder,
  ErgoStoreSelectorChoiceResult,
  ErgoStoreSelectorRecord,
  InferredErgoStoreActionsInitializerForMode
} from './internalTypes.js';

interface ErgoStoreBuilderBaseConfiguration<
  State extends object,
  InitializerMutators extends ErgoStoreMutators,
  StoreMutators extends ErgoStoreMutators
> {
  // Keep both middleware type markers in the builder configuration. The initial-state function and
  // the final store can see different `set/get/api` shapes, so the final assembly step needs both.
  readonly getInitialState: ErgoStoreInitialStateGetter<State, InitializerMutators>;
  readonly middleware?: ErgoStoreMiddleware<State, InitializerMutators, StoreMutators>;
}

interface ErgoStoreBuilderConfiguration<
  State extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  InitializerMutators extends ErgoStoreMutators,
  StoreMutators extends ErgoStoreMutators
> {
  // Zustand middleware can change the API received by the initial-state function and the API exposed
  // by the final store. These two type parameters preserve both while the builder collects
  // selectors and actions.
  readonly getInitialState: ErgoStoreInitialStateGetter<State, InitializerMutators>;
  readonly middleware?: ErgoStoreMiddleware<State, InitializerMutators, StoreMutators>;
  readonly autoselectors?: AutoselectorKeys;
  readonly selectors?: Selectors;
}

const createErgoStoreActionChoiceBuilder = <
  Mode extends ErgoStoreBindingMode,
  State extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  InitializerMutators extends ErgoStoreMutators,
  StoreMutators extends ErgoStoreMutators
>(
  configuration: ErgoStoreBuilderConfiguration<
    State,
    Selectors,
    AutoselectorKeys,
    InitializerMutators,
    StoreMutators
  >,
  createStoreFromOptions: CreateErgoStoreFromOptions<Mode>
): ErgoStoreActionChoiceBuilder<State, Selectors, AutoselectorKeys, StoreMutators, Mode> => ({
  // The final step is the first point where the generated selector API is complete enough to pass
  // into action initialization.
  withActions: <Actions extends object>(
    createActions: InferredErgoStoreActionsInitializerForMode<
      Mode,
      State,
      Actions,
      Selectors,
      AutoselectorKeys,
      StoreMutators
    >
  ) =>
    createStoreFromOptions({
      ...configuration,
      createActions
    }),
  withoutActions: () => createStoreFromOptions(configuration)
});

const createErgoStoreSelectorChoiceBuilder = <
  Mode extends ErgoStoreBindingMode,
  State extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  InitializerMutators extends ErgoStoreMutators,
  StoreMutators extends ErgoStoreMutators
>(
  configuration: ErgoStoreBuilderConfiguration<
    State,
    Selectors,
    AutoselectorKeys,
    InitializerMutators,
    StoreMutators
  >,
  createStoreFromOptions: CreateErgoStoreFromOptions<Mode>
): ErgoStoreSelectorChoiceBuilder<State, Selectors, AutoselectorKeys, StoreMutators, Mode> => ({
  ...createErgoStoreActionChoiceBuilder(configuration, createStoreFromOptions),
  withSelectors: <
    const NextSelectors extends Readonly<{
      [SelectorKey in keyof NextSelectors]: ErgoStoreSelectorInput<State, any>;
    }>
  >(
    selectors: NextSelectors
  ) =>
    // The valid-key wrapper is only needed at the public boundary. After that check, preserve the
    // original selector record type so the generated API keeps each selector's selected value.
    createErgoStoreActionChoiceBuilder<
      Mode,
      State,
      NextSelectors,
      AutoselectorKeys,
      InitializerMutators,
      StoreMutators
    >(
      {
        ...configuration,
        selectors
      },
      createStoreFromOptions
    ) as ErgoStoreSelectorChoiceResult<State, NextSelectors, AutoselectorKeys, StoreMutators, Mode>
});

export const createErgoStoreAutoselectorChoiceBuilder = <
  Mode extends ErgoStoreBindingMode,
  State extends object,
  InitializerMutators extends ErgoStoreMutators = EmptyErgoStoreMutators,
  StoreMutators extends ErgoStoreMutators = EmptyErgoStoreMutators
>(
  configuration: ErgoStoreBuilderBaseConfiguration<State, InitializerMutators, StoreMutators>,
  createStoreFromOptions: CreateErgoStoreFromOptions<Mode>
): ErgoStoreAutoselectorChoiceBuilder<State, StoreMutators, Mode> => ({
  // From this point on, the public builder only needs the final store API type. The initializer API
  // type stays in `configuration` until `createErgoStoreFromOptions` applies the middleware.
  withAutoselectors: <AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>>(
    autoselectors: AutoselectorKeys
  ) =>
    createErgoStoreSelectorChoiceBuilder<
      Mode,
      State,
      Record<never, never>,
      AutoselectorKeys,
      InitializerMutators,
      StoreMutators
    >(
      {
        ...configuration,
        autoselectors
      },
      createStoreFromOptions
    ),
  withoutAutoselectors: () =>
    createErgoStoreSelectorChoiceBuilder<
      Mode,
      State,
      Record<never, never>,
      EmptyErgoStoreAutoselectors,
      InitializerMutators,
      StoreMutators
    >(
      {
        ...configuration,
        autoselectors: []
      },
      createStoreFromOptions
    )
});
