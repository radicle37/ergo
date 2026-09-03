import { createErgoStoreApiFromOptions } from './createErgoStoreApiFromOptions.js';

import type {
  CreateErgoStoreFromOptions,
  CreateErgoStoreOptions,
  EmptyErgoStoreMutators,
  ErgoStoreAutoselectorKeys,
  ErgoStoreMutators,
  ErgoStoreSelectorMap,
  ErgoStoreSelectorRecord,
  ErgoVanillaStoreApi
} from './internalTypes.js';

export const createErgoVanillaStoreFromOptions: CreateErgoStoreFromOptions<'vanilla'> = <
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
    'vanilla'
  >
): ErgoVanillaStoreApi<
  State,
  ErgoStoreSelectorMap<State, Selectors, AutoselectorKeys>,
  Actions,
  StoreMutators
> =>
  createErgoStoreApiFromOptions<
    'vanilla',
    State,
    Actions,
    Selectors,
    AutoselectorKeys,
    InitializerMutators,
    StoreMutators
  >(options);
