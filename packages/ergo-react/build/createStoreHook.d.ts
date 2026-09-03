import type { ErgoStoreEqualityFn, ErgoStoreReadableApi } from 'ergo/adapter-internal';
export declare const createStoreHook: <State extends object, Selected>(store: ErgoStoreReadableApi<State>, selector: (state: State) => Selected, equalityFn?: ErgoStoreEqualityFn<Selected>, hookName?: string) => () => Selected;
//# sourceMappingURL=createStoreHook.d.ts.map