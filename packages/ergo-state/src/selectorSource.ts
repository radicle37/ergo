/**
 * Type-only brand keeping `ErgoStoreSelectorSource` nominal rather than structural. Without it,
 * any object with `get`/`subscribe` methods of the right shape (a hand-rolled object literal, a
 * wrapped third-party observable) would satisfy the type — including one that doesn't honor the
 * contract derived-value consumers rely on (firing `subscribe`'s listener immediately with a
 * current value, the way every Ergo-generated selector does). A source that doesn't do that can
 * make ready-gate-style logic wait forever, silently.
 *
 * Declared with no runtime value (`declare const`), so it compiles away entirely — this is a
 * compile-time guardrail against *accidental* structural matches, not a runtime check. The only
 * sanctioned way to produce a value of this type is `createErgoStoreSelectorSource`, whose
 * return type is trusted via an explicit, deliberate cast (see that file) rather than by
 * actually constructing this field.
 */
declare const ErgoStoreSelectorSourceBrand: unique symbol;

export type ErgoStoreSelectorSource<T> = {
  readonly get: () => T;
  readonly subscribe: (listener: (value: T) => void) => () => void;
  readonly [ErgoStoreSelectorSourceBrand]: true;
};
