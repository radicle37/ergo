const createErgoStoreActionChoiceBuilder = (configuration, createStoreFromOptions) => ({
    // The final step is the first point where the generated selector API is complete enough to pass
    // into action initialization.
    withActions: (createActions) => createStoreFromOptions({
        ...configuration,
        createActions
    }),
    withoutActions: () => createStoreFromOptions(configuration)
});
const createErgoStoreSelectorChoiceBuilder = (configuration, createStoreFromOptions) => ({
    ...createErgoStoreActionChoiceBuilder(configuration, createStoreFromOptions),
    withSelectors: (selectors) => 
    // The valid-key wrapper is only needed at the public boundary. After that check, preserve the
    // original selector record type so the generated API keeps each selector's selected value.
    createErgoStoreActionChoiceBuilder({
        ...configuration,
        selectors
    }, createStoreFromOptions)
});
export const createErgoStoreAutoselectorChoiceBuilder = (configuration, createStoreFromOptions) => ({
    // From this point on, the public builder only needs the final store API type. The initializer API
    // type stays in `configuration` until `createErgoStoreFromOptions` applies the middleware.
    withAutoselectors: (autoselectors) => createErgoStoreSelectorChoiceBuilder({
        ...configuration,
        autoselectors
    }, createStoreFromOptions),
    withoutAutoselectors: () => createErgoStoreSelectorChoiceBuilder({
        ...configuration,
        autoselectors: []
    }, createStoreFromOptions)
});
//# sourceMappingURL=createErgoStoreBuilder.js.map