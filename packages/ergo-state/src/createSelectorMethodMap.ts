import { createErgoStoreApiMethodName } from './createErgoStoreApiMethodName';

import type { ErgoStoreSelectorDefinition } from './types';

export const createSelectorMethodMap = <State>(
  prefix: string,
  selectorEntries: Record<string, ErgoStoreSelectorDefinition<State, unknown>>,
  createMethod: (
    selectorEntry: ErgoStoreSelectorDefinition<State, unknown>,
    methodName: string
  ) => unknown,
  createMethodName = createErgoStoreApiMethodName
) => {
  // Runtime object construction cannot preserve the mapped type from types.ts, so callers cast the
  // result to the specific getter/hook/subscriber map after choosing the prefix.
  const selectorMethods: Record<string, unknown> = {};

  Object.entries(selectorEntries).forEach(([selectorName, selectorEntry]) => {
    const methodName = createMethodName(prefix, selectorName);
    selectorMethods[methodName] = createMethod(selectorEntry, methodName);
  });

  return selectorMethods;
};
