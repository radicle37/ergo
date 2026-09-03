import {
  createErgoStoreApiFromOptions,
  createSelectorMethodMap
} from 'ergo-state/adapter-internal';
import { createStoreHook } from './createStoreHook';

import type {
  CreateErgoStoreFromOptions,
  CreateErgoStoreOptions,
  EmptyErgoStoreMutators,
  ErgoStoreAutoselectorKeys,
  ErgoStoreMutators,
  ErgoStoreSelectorMap,
  ErgoStoreSelectorRecord
} from 'ergo-state/adapter-internal';
import type { ErgoReactStoreApi } from './reactTypes';

export const createErgoStoreFromOptions: CreateErgoStoreFromOptions<'react'> = <
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
    'react'
  >
): ErgoReactStoreApi<
  State,
  ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>,
  Actions,
  StoreMutators
> =>
  createErgoStoreApiFromOptions<
    'react',
    State,
    Actions,
    Selectors,
    AutoselectorKeys,
    InitializerMutators,
    StoreMutators
  >(options, ({ publicSelectorEntries, store }) =>
    createSelectorMethodMap('use', publicSelectorEntries, (selectorEntry, hookName) =>
      createStoreHook(store, selectorEntry.select, selectorEntry.equalityFn, hookName)
    )
  );
