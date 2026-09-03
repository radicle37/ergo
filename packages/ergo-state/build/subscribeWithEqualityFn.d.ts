import type { ErgoStoreReadableApi } from './internalTypes.js';
/**
 * Zustand's `useStoreWithEqualityFn`, but for non-React consumers:
 * https://zustand.docs.pmnd.rs/hooks/use-store-with-equality-fn
 *
 * Use this when one vanilla store or service needs to react to a selected slice of another store
 * without re-running on every state update.
 *
 * The callback is called once during subscription with the current selected value. After that it
 * only runs when the selected value changes according to `equalityFn`. Defaults to `Object.is` so
 * the behavior matches the generated `subscribe<Name>` methods on an Ergo store; pass `shallow`
 * (or another comparator) when the selector returns a new reference on every read.
 *
 * The returned unsubscribe function is registered before the initial callback fires, and errors
 * from the initial callback are swallowed. Callers therefore always receive a usable unsubscribe
 * handle, and a throwing initial call does not tear down the subscription — subsequent changes
 * still notify normally.
 *
 * @param {(selectedValue: T) => void} onSelectedValueChange - a callback function that is called with the selected value when it changes
 * @param {StoreApi<S>} store - a Zustand store instance
 * @param {(storeState: S) => T} selectorFn - a function that selects a value from the store state
 * @param {<T>(valueA: T, valueB: T) => boolean} equalityFn - an optional function that checks if two values are equal (defaults to `Object.is`)
 */
export declare const subscribeWithEqualityFn: <S, T>(onSelectedValueChange: (selectedValue: T) => void, store: Pick<ErgoStoreReadableApi<S>, 'getState' | 'subscribe'>, selectorFn: (storeState: S) => T, equalityFn?: (valueA: T, valueB: T) => boolean) => (() => void);
//# sourceMappingURL=subscribeWithEqualityFn.d.ts.map