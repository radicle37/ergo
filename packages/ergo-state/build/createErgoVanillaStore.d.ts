import type { ErgoVanillaStoreInitialBuilder, ErgoVanillaStoreInitialBuilderWithActions, ErgoVanillaStoreStateInferredInitialBuilder } from './internalTypes.js';
/**
 * Creates a small, typed facade around a vanilla Zustand store without generated React hooks.
 *
 * The staged builder keeps store setup explicit:
 * initial state -> optional autoselectors -> optional selectors -> optional actions.
 * That order prevents partially configured APIs from leaking to callers.
 */
export declare function createErgoStore(): ErgoVanillaStoreStateInferredInitialBuilder;
export declare function createErgoStore<State extends object>(): ErgoVanillaStoreInitialBuilder<State>;
export declare function createErgoStore<State extends object, Actions extends object>(): ErgoVanillaStoreInitialBuilderWithActions<State, Actions>;
//# sourceMappingURL=createErgoVanillaStore.d.ts.map