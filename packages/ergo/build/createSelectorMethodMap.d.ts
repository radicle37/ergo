import { createErgoStoreApiMethodName } from './createErgoStoreApiMethodName';
import type { ErgoStoreSelectorDefinition } from './types';
export declare const createSelectorMethodMap: <State>(prefix: string, selectorEntries: Record<string, ErgoStoreSelectorDefinition<State, unknown>>, createMethod: (selectorEntry: ErgoStoreSelectorDefinition<State, unknown>, methodName: string) => unknown, createMethodName?: typeof createErgoStoreApiMethodName) => Record<string, unknown>;
//# sourceMappingURL=createSelectorMethodMap.d.ts.map