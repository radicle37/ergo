import type { ErgoStoreEqualityFn, ErgoStoreSelectorDefinition, ErgoStoreSelectorInput } from './types';
export declare const defineErgoStoreSelector: <State, Selected>(select: (state: State) => Selected, equalityFn?: ErgoStoreEqualityFn<Selected>) => ErgoStoreSelectorDefinition<State, Selected>;
export declare const normalizeSelectorInput: <State, Selected>(selectorInput: ErgoStoreSelectorInput<State, Selected>) => ErgoStoreSelectorDefinition<State, Selected>;
//# sourceMappingURL=selectorDefinitions.d.ts.map