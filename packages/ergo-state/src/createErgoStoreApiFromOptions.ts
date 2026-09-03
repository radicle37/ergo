import { createStore } from 'zustand/vanilla';

import type { Mutate, StateCreator, StoreApi } from 'zustand/vanilla';

import { createErgoStoreInternalApiMethodName } from './createErgoStoreApiMethodName.js';
import { createErgoStoreSelectorEntries } from './createErgoStoreSelectorEntries.js';
import { createSelectorMethodMap } from './createSelectorMethodMap.js';
import { subscribeWithEqualityFn } from './subscribeWithEqualityFn.js';

import type {
  CreateErgoStoreOptions,
  EmptyErgoStoreMutators,
  ErgoStoreActionsInitializerApiForMode,
  ErgoStoreApiForMode,
  ErgoStoreAutoselectorKeys,
  ErgoStoreBindingMode,
  ErgoStoreInternalSelectorMap,
  ErgoStoreMiddlewareApi,
  ErgoStoreMutators,
  ErgoStoreSelectorDefinition,
  ErgoStoreSelectorMap,
  ErgoStoreSelectorRecord,
  StoreGetterMap,
  StoreInternalGetterMap,
  StoreSubscriberMap
} from './internalTypes.js';

const zustandStoreApiKeys = new Set<PropertyKey>([
  'getInitialState',
  'getState',
  'setState',
  'subscribe'
]);

// Own-keys are snapshotted once here. Middleware that installs its lifecycle namespace after this
// point (e.g. asynchronously, post-hydration) will not appear on `storeApi.middleware`. All
// Zustand built-ins (`persist`, `devtools`, `subscribeWithSelector`) attach synchronously during
// initializer execution, and Ergo requires the same of any middleware that expects its lifecycle
// APIs to be reachable through the generated facade.
const createMiddlewareApi = <
  State extends object,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
>(
  store: Mutate<StoreApi<State>, Mutators>
): ErgoStoreMiddlewareApi<State, Mutators> => {
  const middlewareApi = {};

  for (const key of Reflect.ownKeys(store)) {
    // Ergo's middleware surface is documented as string-keyed. Skip symbol markers Zustand or a
    // middleware attaches internally so they don't leak into the public facade.
    if (typeof key !== 'string' || zustandStoreApiKeys.has(key)) {
      continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(store, key);

    if (descriptor) {
      Object.defineProperty(middlewareApi, key, descriptor);
    }
  }

  return middlewareApi as ErgoStoreMiddlewareApi<State, Mutators>;
};

const createActionsInitializerApi = <
  Mode extends ErgoStoreBindingMode,
  State extends object,
  Actions extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  Mutators extends ErgoStoreMutators = EmptyErgoStoreMutators
>(
  api: ErgoStoreApiForMode<
    Mode,
    State,
    ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>,
    Actions,
    Mutators
  >,
  internalGetters: StoreInternalGetterMap<
    ErgoStoreInternalSelectorMap<State, Selectors, AutoselectorKeys>
  >
): ErgoStoreActionsInitializerApiForMode<Mode, State, Selectors, AutoselectorKeys, Mutators> => {
  // Actions are attached after the base API is assembled. Hiding `actions` from the initializer
  // prevents action factories from depending on a partially populated action object. Internal
  // getters are added only to this initializer API, so they do not leak to consumers.
  const { actions, ...apiWithoutActions } = api;
  void actions;

  return {
    ...apiWithoutActions,
    ...internalGetters
  };
};

interface CreateErgoStoreApiExtraContext<State extends object, Mutators extends ErgoStoreMutators> {
  readonly publicSelectorEntries: Record<string, ErgoStoreSelectorDefinition<State, unknown>>;
  readonly store: Mutate<StoreApi<State>, Mutators>;
}

export const createErgoStoreApiFromOptions = <
  Mode extends ErgoStoreBindingMode,
  State extends object,
  Actions extends object,
  Selectors extends ErgoStoreSelectorRecord<State>,
  AutoselectorKeys extends ErgoStoreAutoselectorKeys<State>,
  InitializerMutators extends ErgoStoreMutators = EmptyErgoStoreMutators,
  StoreMutators extends ErgoStoreMutators = EmptyErgoStoreMutators
>(
  options: CreateErgoStoreOptions<
    State,
    Actions,
    Selectors,
    AutoselectorKeys,
    InitializerMutators,
    StoreMutators,
    Mode
  >,
  createExtraApi: (
    context: CreateErgoStoreApiExtraContext<State, StoreMutators>
  ) => object = () => ({})
): ErgoStoreApiForMode<
  Mode,
  State,
  ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>,
  Actions,
  StoreMutators
> => {
  const { autoselectors, createActions, getInitialState, middleware, selectors } = options;
  type SelectorMap = ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>;
  type InternalSelectorMap = ErgoStoreInternalSelectorMap<State, Selectors, AutoselectorKeys>;

  // Middleware must wrap the user's initializer before Zustand creates the store. This keeps
  // middleware changes visible both while initial state is created and later through `store.set`.
  const initializer = middleware
    ? middleware(getInitialState)
    : (getInitialState as StateCreator<State, EmptyErgoStoreMutators, StoreMutators>);
  const store = createStore<State>()(initializer);
  const actions = {} as Actions;
  const { internalSelectorEntries, publicSelectorEntries } = createErgoStoreSelectorEntries(
    store,
    autoselectors,
    selectors
  );

  // Public selector entries generate the consumer-facing get/subscribe pair. React entry points add
  // hook methods through createExtraApi; vanilla entry points pass no extra methods.
  const getters = createSelectorMethodMap(
    'get',
    publicSelectorEntries,
    selectorEntry => () => selectorEntry.select(store.getState())
  ) as StoreGetterMap<SelectorMap>;

  const subscribers = createSelectorMethodMap(
    'subscribe',
    publicSelectorEntries,
    selectorEntry => (listener: (selectedValue: unknown) => void) =>
      subscribeWithEqualityFn(
        listener,
        store,
        selectorEntry.select,
        selectorEntry.equalityFn ?? Object.is
      )
  ) as StoreSubscriberMap<SelectorMap>;

  const internalGetters = createSelectorMethodMap(
    'get',
    internalSelectorEntries,
    selectorEntry => () => selectorEntry.select(store.getState()),
    createErgoStoreInternalApiMethodName
  ) as StoreInternalGetterMap<InternalSelectorMap>;

  const api = {
    actions,
    get: store.getState,
    middleware: createMiddlewareApi<State, StoreMutators>(store),
    // Middleware can change what `setState` accepts. Reuse Zustand's actual setter so Ergo's facade
    // behaves the same way as the wrapped store.
    set: store.setState,
    ...getters,
    ...createExtraApi({
      publicSelectorEntries,
      store
    }),
    ...subscribers
  } as ErgoStoreApiForMode<Mode, State, SelectorMap, Actions, StoreMutators>;

  if (createActions) {
    // Preserve the `actions` object identity that is already exposed on `api` while filling it with
    // the user-defined methods. This lets actions call generated getters/subscribers during setup
    // without creating a second facade object.
    Object.assign(actions, createActions(createActionsInitializerApi(api, internalGetters)));
  }

  return api;
};
