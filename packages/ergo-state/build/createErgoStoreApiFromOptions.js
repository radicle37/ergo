import { createStore } from 'zustand/vanilla';
import { createErgoStoreInternalApiMethodName } from './createErgoStoreApiMethodName';
import { createErgoStoreSelectorEntries } from './createErgoStoreSelectorEntries';
import { createSelectorMethodMap } from './createSelectorMethodMap';
import { subscribeWithEqualityFn } from './subscribeWithEqualityFn';
const zustandStoreApiKeys = new Set([
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
const createMiddlewareApi = (store) => {
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
    return middlewareApi;
};
const createActionsInitializerApi = (api, internalGetters) => {
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
export const createErgoStoreApiFromOptions = (options, createExtraApi = () => ({})) => {
    const { autoselectors, createActions, getInitialState, middleware, selectors } = options;
    // Middleware must wrap the user's initializer before Zustand creates the store. This keeps
    // middleware changes visible both while initial state is created and later through `store.set`.
    const initializer = middleware
        ? middleware(getInitialState)
        : getInitialState;
    const store = createStore()(initializer);
    const actions = {};
    const { internalSelectorEntries, publicSelectorEntries } = createErgoStoreSelectorEntries(store, autoselectors, selectors);
    // Public selector entries generate the consumer-facing get/subscribe pair. React entry points add
    // hook methods through createExtraApi; vanilla entry points pass no extra methods.
    const getters = createSelectorMethodMap('get', publicSelectorEntries, selectorEntry => () => selectorEntry.select(store.getState()));
    const subscribers = createSelectorMethodMap('subscribe', publicSelectorEntries, selectorEntry => (listener) => subscribeWithEqualityFn(listener, store, selectorEntry.select, selectorEntry.equalityFn ?? Object.is));
    const internalGetters = createSelectorMethodMap('get', internalSelectorEntries, selectorEntry => () => selectorEntry.select(store.getState()), createErgoStoreInternalApiMethodName);
    const api = {
        actions,
        get: store.getState,
        middleware: createMiddlewareApi(store),
        // Middleware can change what `setState` accepts. Reuse Zustand's actual setter so Ergo's facade
        // behaves the same way as the wrapped store.
        set: store.setState,
        ...getters,
        ...createExtraApi({
            publicSelectorEntries,
            store
        }),
        ...subscribers
    };
    if (createActions) {
        // Preserve the `actions` object identity that is already exposed on `api` while filling it with
        // the user-defined methods. This lets actions call generated getters/subscribers during setup
        // without creating a second facade object.
        Object.assign(actions, createActions(createActionsInitializerApi(api, internalGetters)));
    }
    return api;
};
//# sourceMappingURL=createErgoStoreApiFromOptions.js.map