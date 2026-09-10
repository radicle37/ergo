# ergo-state

## 0.2.1

### Patch Changes

- 23e544e: Export `ErgoStoreSelectorMap` so inferred store factory return types remain portable during declaration emit.

## 0.2.0

### Minor Changes

- ad74517: Add `createErgoStoreSelectorSource` for producing branded `{ get, subscribe }` selector-source pairs from an existing store selector, and export `ErgoStoreSelectorMapMarker` (plus the `ErgoStoreSelectorMapOf` type utility) to support external inference of a store's selector map.

## 0.1.1

### Patch Changes

- 0938d43: Emit Node-compatible ESM by using explicit `.js` extensions for package-local imports and exports.

## 0.1.0

### Minor Changes

- Initial public release of `ergo-state` and `ergo-react`.
