import { createErgoStoreAutoselectorChoiceBuilder } from './createErgoStoreBuilder.js';
import { createErgoVanillaStoreFromOptions } from './createErgoVanillaStoreFromOptions.js';
export function createErgoStore() {
    // At runtime, `createErgoStore()` and `createErgoStore<State>()` are the same zero-argument call.
    // The overloads above hide `withMiddleware` from the no-generic type, but the returned object still
    // includes it so explicit-state calls can share this implementation.
    const createInitialBuilder = (middleware) => ({
        withInitialState: (getInitialState) => createErgoStoreAutoselectorChoiceBuilder({
            getInitialState,
            middleware
        }, createErgoVanillaStoreFromOptions)
    });
    return {
        ...createInitialBuilder(),
        withMiddleware: (middleware) => createInitialBuilder(middleware)
    };
}
//# sourceMappingURL=createErgoVanillaStore.js.map