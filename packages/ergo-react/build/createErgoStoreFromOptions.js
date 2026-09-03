import { createErgoStoreApiFromOptions, createSelectorMethodMap } from 'ergo-state/adapter-internal';
import { createStoreHook } from './createStoreHook.js';
export const createErgoStoreFromOptions = (options) => createErgoStoreApiFromOptions(options, ({ publicSelectorEntries, store }) => createSelectorMethodMap('use', publicSelectorEntries, (selectorEntry, hookName) => createStoreHook(store, selectorEntry.select, selectorEntry.equalityFn, hookName)));
//# sourceMappingURL=createErgoStoreFromOptions.js.map