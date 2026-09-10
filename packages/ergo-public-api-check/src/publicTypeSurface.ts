import { ErgoStoreSelectorMapMarker } from 'ergo-state';
import type {
  ErgoStoreActionsInitializer,
  ErgoStoreActionsInitializerApi,
  ErgoStoreApi,
  ErgoStoreEqualityFn,
  ErgoStoreInitialStateGetter,
  ErgoStoreMiddleware,
  ErgoStoreMiddlewareApi,
  ErgoStoreMutators,
  ErgoStoreSelectorDefinition,
  ErgoStoreSelectorInput,
  ErgoStoreSelectorMap,
  ErgoStoreSelectorMapOf
} from 'ergo-state';
import type * as RootErgo from 'ergo-state';
import type {
  ErgoReactStoreActionsInitializer,
  ErgoReactStoreActionsInitializerApi,
  ErgoReactStoreApi
} from 'ergo-react';
import type * as ReactErgo from 'ergo-react';

interface PublicState {
  count: number;
}

interface PublicActions {
  increment: () => void;
}

type PublicSelectors = {
  countLabel: (state: PublicState) => string;
};
type PublicAutoselectors = readonly ['count'];
type PublicSelectorMap = {
  count: (state: PublicState) => number;
  countLabel: (state: PublicState) => string;
};

type PublicRootTypes = [
  ErgoStoreActionsInitializer<PublicState, PublicActions, PublicSelectors, PublicAutoselectors>,
  ErgoStoreActionsInitializerApi<PublicState, PublicSelectors, PublicAutoselectors>,
  ErgoStoreApi<PublicState, PublicSelectorMap, PublicActions>,
  ErgoStoreEqualityFn<number>,
  ErgoStoreInitialStateGetter<PublicState>,
  ErgoStoreMiddleware<PublicState, [], []>,
  ErgoStoreMiddlewareApi<PublicState>,
  ErgoStoreMutators,
  ErgoStoreSelectorDefinition<PublicState, number>,
  ErgoStoreSelectorInput<PublicState, number>,
  ErgoStoreSelectorMap<PublicState, PublicSelectors, PublicAutoselectors>
];
type PublicReactTypes = [
  ErgoReactStoreActionsInitializer<
    PublicState,
    PublicActions,
    PublicSelectors,
    PublicAutoselectors
  >,
  ErgoReactStoreActionsInitializerApi<PublicState, PublicSelectors, PublicAutoselectors>,
  ErgoReactStoreApi<PublicState, PublicSelectorMap, PublicActions>
];

const publicRootTypes = null as PublicRootTypes | null;
const publicReactTypes = null as PublicReactTypes | null;

void publicRootTypes;
void publicReactTypes;

// Confirms the phantom-marker escape hatch is reachable and resolves to the store's actual
// resolved selector map (keys and value types) — this reachability is intentional, in contrast
// with `HiddenRootSelectorMap` just below, which confirms the internal composition type itself
// stays unreachable by name. Only the resolved shape is exposed, not the machinery that built it.
const publicSelectorMapMarker = ErgoStoreSelectorMapMarker;
void publicSelectorMapMarker;

type PublicResolvedSelectorMap = ErgoStoreSelectorMapOf<
  ErgoStoreApi<PublicState, PublicSelectorMap, PublicActions>
>;
const publicResolvedSelectorMap = null as PublicResolvedSelectorMap | null;
void (publicResolvedSelectorMap satisfies PublicSelectorMap | null);

// @ts-expect-error mode helpers are internal implementation details
type HiddenRootBindingMode = RootErgo.ErgoStoreBindingMode;
const hiddenRootBindingMode = null as HiddenRootBindingMode | null;
void hiddenRootBindingMode;

// @ts-expect-error generated API-name helpers are internal implementation details
type HiddenRootApiMethodName = RootErgo.ErgoStoreApiMethodName;
const hiddenRootApiMethodName = null as HiddenRootApiMethodName | null;
void hiddenRootApiMethodName;

// @ts-expect-error builder-stage types are internal implementation details
type HiddenRootBuilder = RootErgo.ErgoStoreInitialBuilder<PublicState>;
const hiddenRootBuilder = null as HiddenRootBuilder | null;
void hiddenRootBuilder;

// @ts-expect-error react builder-stage types are internal implementation details
type HiddenReactBuilder = ReactErgo.ErgoStoreInitialBuilder<PublicState>;
const hiddenReactBuilder = null as HiddenReactBuilder | null;
void hiddenReactBuilder;
