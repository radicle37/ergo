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
  ErgoStoreSelectorInput
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
  ErgoStoreSelectorInput<PublicState, number>
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

// @ts-expect-error selector-map composition types are internal implementation details
type HiddenRootSelectorMap = RootErgo.ErgoStoreSelectorMap<
  PublicState,
  PublicSelectors,
  PublicAutoselectors
>;
const hiddenRootSelectorMap = null as HiddenRootSelectorMap | null;
void hiddenRootSelectorMap;

// @ts-expect-error react builder-stage types are internal implementation details
type HiddenReactBuilder = ReactErgo.ErgoStoreInitialBuilder<PublicState>;
const hiddenReactBuilder = null as HiddenReactBuilder | null;
void hiddenReactBuilder;
