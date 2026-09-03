import { createErgoStoreAutoselectorChoiceBuilder } from './createErgoStoreBuilder.js';
import { createErgoVanillaStoreFromOptions } from './createErgoVanillaStoreFromOptions.js';

import type {
  ErgoStoreInitialStateGetter,
  ErgoStoreMiddleware,
  ErgoStoreMutators,
  ErgoVanillaStoreInitialBuilder,
  ErgoVanillaStoreInitialBuilderWithActions,
  ErgoVanillaStoreStateInferredInitialBuilder
} from './internalTypes.js';

/**
 * Creates a small, typed facade around a vanilla Zustand store without generated React hooks.
 *
 * The staged builder keeps store setup explicit:
 * initial state -> optional autoselectors -> optional selectors -> optional actions.
 * That order prevents partially configured APIs from leaking to callers.
 */
export function createErgoStore(): ErgoVanillaStoreStateInferredInitialBuilder;
export function createErgoStore<State extends object>(): ErgoVanillaStoreInitialBuilder<State>;
export function createErgoStore<
  State extends object,
  Actions extends object
>(): ErgoVanillaStoreInitialBuilderWithActions<State, Actions>;
export function createErgoStore(): any {
  // At runtime, `createErgoStore()` and `createErgoStore<State>()` are the same zero-argument call.
  // The overloads above hide `withMiddleware` from the no-generic type, but the returned object still
  // includes it so explicit-state calls can share this implementation.
  const createInitialBuilder = <
    State extends object,
    InitializerMutators extends ErgoStoreMutators,
    StoreMutators extends ErgoStoreMutators
  >(
    middleware?: ErgoStoreMiddleware<State, InitializerMutators, StoreMutators>
  ) => ({
    withInitialState: (getInitialState: ErgoStoreInitialStateGetter<State, InitializerMutators>) =>
      createErgoStoreAutoselectorChoiceBuilder(
        {
          getInitialState,
          middleware
        },
        createErgoVanillaStoreFromOptions
      )
  });

  return {
    ...createInitialBuilder(),
    withMiddleware: <
      State extends object,
      InitializerMutators extends ErgoStoreMutators,
      StoreMutators extends ErgoStoreMutators
    >(
      middleware: ErgoStoreMiddleware<State, InitializerMutators, StoreMutators>
    ) => createInitialBuilder(middleware)
  };
}
