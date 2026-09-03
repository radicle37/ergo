import { createErgoStoreAutoselectorChoiceBuilder } from 'ergo/adapter-internal';
import { createErgoStoreFromOptions } from './createErgoStoreFromOptions';

import type { ErgoStoreInitialStateGetter, ErgoStoreMiddleware, ErgoStoreMutators } from 'ergo';
import type {
  ErgoReactStoreInitialBuilder,
  ErgoReactStoreInitialBuilderWithActions,
  ErgoReactStoreStateInferredInitialBuilder
} from './reactTypes';

export { defineErgoStoreSelector } from 'ergo';
export type {
  ErgoStoreEqualityFn,
  ErgoStoreInitialStateGetter,
  ErgoStoreMiddleware,
  ErgoStoreMiddlewareApi,
  ErgoStoreSelectorDefinition,
  ErgoStoreSelectorInput,
  ErgoStoreMutators
} from 'ergo';
export type {
  ErgoReactStoreActionsInitializer,
  ErgoReactStoreActionsInitializerApi,
  ErgoReactStoreApi
} from './reactTypes';

/**
 * Creates a small, typed facade around a vanilla Zustand store.
 *
 * The staged builder keeps store setup explicit:
 * initial state -> optional autoselectors -> optional selectors -> optional actions.
 * That order prevents partially configured APIs from leaking to callers.
 */
export function createErgoStore(): ErgoReactStoreStateInferredInitialBuilder;
export function createErgoStore<State extends object>(): ErgoReactStoreInitialBuilder<State>;
export function createErgoStore<
  State extends object,
  Actions extends object
>(): ErgoReactStoreInitialBuilderWithActions<State, Actions>;
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
        createErgoStoreFromOptions
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
