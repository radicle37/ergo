import type { ErgoReactStoreInitialBuilder, ErgoReactStoreInitialBuilderWithActions, ErgoReactStoreStateInferredInitialBuilder } from './reactTypes';
export { defineErgoStoreSelector } from 'ergo-state';
export type { ErgoStoreEqualityFn, ErgoStoreInitialStateGetter, ErgoStoreMiddleware, ErgoStoreMiddlewareApi, ErgoStoreSelectorDefinition, ErgoStoreSelectorInput, ErgoStoreMutators } from 'ergo-state';
export type { ErgoReactStoreActionsInitializer, ErgoReactStoreActionsInitializerApi, ErgoReactStoreApi } from './reactTypes';
/**
 * Creates a small, typed facade around a vanilla Zustand store.
 *
 * The staged builder keeps store setup explicit:
 * initial state -> optional autoselectors -> optional selectors -> optional actions.
 * That order prevents partially configured APIs from leaking to callers.
 */
export declare function createErgoStore(): ErgoReactStoreStateInferredInitialBuilder;
export declare function createErgoStore<State extends object>(): ErgoReactStoreInitialBuilder<State>;
export declare function createErgoStore<State extends object, Actions extends object>(): ErgoReactStoreInitialBuilderWithActions<State, Actions>;
//# sourceMappingURL=createErgoStore.d.ts.map