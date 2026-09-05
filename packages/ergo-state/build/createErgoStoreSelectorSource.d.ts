import type { ErgoStoreApi, ErgoStoreSelectorMapOf } from './types.js';
import type { ErgoStoreSelectorSource } from './selectorSource.js';
export declare const createErgoStoreSelectorSource: <StoreApi extends ErgoStoreApi<any, any, any, any>, Key extends keyof ErgoStoreSelectorMapOf<StoreApi> & string>(storeApi: StoreApi, key: Key) => ErgoStoreSelectorSource<ReturnType<ErgoStoreSelectorMapOf<StoreApi>[Key]>>;
//# sourceMappingURL=createErgoStoreSelectorSource.d.ts.map