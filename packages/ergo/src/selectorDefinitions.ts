import type {
  ErgoStoreEqualityFn,
  ErgoStoreSelectorDefinition,
  ErgoStoreSelectorInput
} from './types';

export const defineErgoStoreSelector = <State, Selected>(
  select: (state: State) => Selected,
  equalityFn?: ErgoStoreEqualityFn<Selected>
): ErgoStoreSelectorDefinition<State, Selected> => ({
  select,
  equalityFn
});

export const normalizeSelectorInput = <State, Selected>(
  selectorInput: ErgoStoreSelectorInput<State, Selected>
): ErgoStoreSelectorDefinition<State, Selected> => {
  // Normalize the public shorthand into one internal shape so method generation never needs to
  // branch on whether equality was provided.
  if (typeof selectorInput === 'object' && selectorInput !== null && 'select' in selectorInput) {
    return selectorInput;
  }

  return {
    select: selectorInput
  };
};
