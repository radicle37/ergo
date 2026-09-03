import { describe, expect, expectTypeOf, test, vi } from 'vitest';

import type { Mutate, StoreApi } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PersistStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createErgoStore, defineErgoStoreSelector } from './index.js';

interface TestInternalState {
  count: number;
  items: string[];
  _internalStatus: string;
  calculateInternalStatus: () => string;
  actions: {
    increment: () => void;
    setItems: (items: string[]) => void;
  };
}

interface TestErgoState {
  count: number;
  items: string[];
}

interface TestErgoActions {
  increment: () => void;
  incrementTwice: () => void;
  getCountFromErgoStore: () => number;
  setItems: (items: string[]) => void;
}

type UnsafeSelectorBuilder<State extends object> = {
  readonly withSelectors: (selectors: Record<string, (state: State) => unknown>) => {
    readonly withoutActions: () => unknown;
  };
};

type ImmerSetState<State extends object> = Mutate<
  StoreApi<State>,
  [['zustand/immer', never]]
>['setState'];

const createStoreWithUncheckedSelectors = <State extends object>(
  builder: unknown,
  selectors: Record<string, (state: State) => unknown>
) => (builder as UnsafeSelectorBuilder<State>).withSelectors(selectors).withoutActions();

describe('createErgoStore', () => {
  test('creates a typed store api with actions outside the state', () => {
    let actionInitializerReceivedActions = false;

    const store = createErgoStore<TestErgoState, TestErgoActions>()
      .withInitialState(() => ({
        count: 0,
        items: []
      }))
      .withAutoselectors(['count', 'items'])
      .withSelectors({
        itemCount: defineErgoStoreSelector((state: TestErgoState) => state.items.length, Object.is)
      })
      .withActions(storeApi => {
        type ActionInitializerHasActions = 'actions' extends keyof typeof storeApi ? true : false;

        expectTypeOf<ActionInitializerHasActions>().toEqualTypeOf<false>();
        actionInitializerReceivedActions = 'actions' in storeApi;

        const { get, getCount, set } = storeApi;

        return {
          getCountFromErgoStore: () => getCount(),
          increment: () => set({ count: get().count + 1 }),
          incrementTwice: () => set(state => ({ count: state.count + 2 })),
          setItems: items => set({ items })
        };
      });

    expectTypeOf(store.getCount).returns.toEqualTypeOf<number>();
    expectTypeOf(store.getItems).returns.toEqualTypeOf<string[]>();
    expectTypeOf(store.getItemCount).returns.toEqualTypeOf<number>();
    expectTypeOf(store.get).returns.toEqualTypeOf<TestErgoState>();
    expectTypeOf(store.set).toEqualTypeOf<StoreApi<TestErgoState>['setState']>();
    expectTypeOf(store.middleware).toEqualTypeOf<Readonly<Record<never, never>>>();
    expectTypeOf(store.actions.getCountFromErgoStore).toEqualTypeOf<() => number>();
    expectTypeOf(store.actions.increment).toEqualTypeOf<() => void>();
    expectTypeOf(store.actions.incrementTwice).toEqualTypeOf<() => void>();
    expectTypeOf(store.actions.setItems).toEqualTypeOf<(items: string[]) => void>();

    type StoreApiKeys = keyof typeof store;
    type ExposesZustandStore = 'zustand' extends StoreApiKeys ? true : false;

    expectTypeOf<ExposesZustandStore>().toEqualTypeOf<false>();
    expect(store.getCount()).toBe(0);
    expect(store.get().count).toBe(0);
    expect(actionInitializerReceivedActions).toBe(false);
    expect('zustand' in store).toBe(false);
    expect(store.middleware).toEqual({});
    expect(store.get()).not.toHaveProperty('actions');

    store.set({ count: 2 });

    expect(store.getCount()).toBe(2);

    store.actions.increment();

    expect(store.getCount()).toBe(3);
    expect(store.get().count).toBe(3);
    expect(store.actions.getCountFromErgoStore()).toBe(3);

    store.actions.incrementTwice();

    expect(store.getCount()).toBe(5);

    const listener = vi.fn();
    const unsubscribe = store.subscribeItemCount(listener);

    expect(listener).toHaveBeenCalledWith(0);

    store.actions.setItems(['a']);
    store.actions.setItems(['b']);
    store.actions.setItems(['b', 'c']);

    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenLastCalledWith(2);

    unsubscribe();
    store.actions.setItems(['d', 'e', 'f']);

    expect(listener).toHaveBeenCalledTimes(3);
  });

  test('only creates direct property methods for requested autoselectors', () => {
    interface OptionalState {
      label: string;
      optionalCount?: number;
      skipped?: string;
    }

    const store = createErgoStore<OptionalState>()
      .withInitialState(() => ({
        label: 'ready'
      }))
      .withAutoselectors(['label', 'optionalCount'])
      .withoutActions();

    type StoreApiKeys = keyof typeof store;
    type HasSkippedGetter = 'getSkipped' extends StoreApiKeys ? true : false;

    expectTypeOf(store.getLabel).returns.toEqualTypeOf<string>();
    expectTypeOf(store.getOptionalCount).returns.toEqualTypeOf<number | undefined>();
    expectTypeOf<HasSkippedGetter>().toEqualTypeOf<false>();
    expect(store.getLabel()).toBe('ready');
    expect(store.getOptionalCount()).toBeUndefined();
    expect('getSkipped' in store).toBe(false);

    store.set({ optionalCount: 2 });

    expect(store.getOptionalCount()).toBe(2);
  });

  test('allows repeated autoselector entries', () => {
    const store = createErgoStore<{ count: number }>()
      .withInitialState(() => ({
        count: 0
      }))
      .withAutoselectors(['count', 'count'])
      .withoutActions();

    expect(store.getCount()).toBe(0);

    store.set({ count: 1 });

    expect(store.getCount()).toBe(1);
  });

  test('makes one-time builder choices explicit', () => {
    const autoselectorChoiceBuilder = createErgoStore<{ count: number }>().withInitialState(() => ({
      count: 0
    }));
    const selectorChoiceBuilder = autoselectorChoiceBuilder.withAutoselectors(['count']);

    type SelectorChoiceBuilderKeys = keyof typeof selectorChoiceBuilder;
    type CanChooseAutoselectorsAgain = 'withAutoselectors' extends SelectorChoiceBuilderKeys
      ? true
      : false;
    type CanSkipAutoselectorsAfterChoosing =
      'withoutAutoselectors' extends SelectorChoiceBuilderKeys ? true : false;

    expectTypeOf<CanChooseAutoselectorsAgain>().toEqualTypeOf<false>();
    expectTypeOf<CanSkipAutoselectorsAfterChoosing>().toEqualTypeOf<false>();
    expect('withAutoselectors' in selectorChoiceBuilder).toBe(false);
    expect('withoutAutoselectors' in selectorChoiceBuilder).toBe(false);

    const actionChoiceBuilder = selectorChoiceBuilder.withSelectors({
      countLabel: (state: { count: number }) => `${state.count}`
    });

    type ActionChoiceBuilderKeys = keyof typeof actionChoiceBuilder;
    type CanAddSelectorsAgain = 'withSelectors' extends ActionChoiceBuilderKeys ? true : false;

    expectTypeOf<CanAddSelectorsAgain>().toEqualTypeOf<false>();
    expect('withSelectors' in actionChoiceBuilder).toBe(false);

    const store = actionChoiceBuilder.withoutActions();

    expect(store.getCount()).toBe(0);
    expect(store.getCountLabel()).toBe('0');
  });

  test('infers state and action types from the builder chain', () => {
    const store = createErgoStore()
      .withInitialState(() => ({
        label: 'ready'
      }))
      .withAutoselectors(['label'])
      .withActions(({ get, set }) => ({
        updateLabel: (label: string) => set({ label: `${get().label}:${label}` })
      }));

    expectTypeOf(store.getLabel).returns.toEqualTypeOf<string>();
    expectTypeOf(store.actions.updateLabel).toEqualTypeOf<(label: string) => void>();

    store.actions.updateLabel('done');

    expect(store.getLabel()).toBe('ready:done');
  });

  test('requires an explicit state type before choosing middleware', () => {
    const assertMiddlewareRequiresExplicitState = () => {
      // @ts-expect-error middleware needs an explicit State generic so TypeScript knows the state shape
      createErgoStore().withMiddleware(immer);
    };

    void assertMiddlewareRequiresExplicitState;
  });

  test('keeps immer set types on the initializer, actions, and returned store', () => {
    interface DraftState {
      nested: {
        count: number;
      };
      label: string;
    }

    interface DraftActions {
      increment: () => void;
    }

    const store = createErgoStore<DraftState, DraftActions>()
      .withMiddleware(immer)
      .withInitialState(set => {
        // Compile-time regression check only: `set` should be the immer-mutated setter here.
        void (set satisfies ImmerSetState<DraftState>);

        return {
          label: 'ready',
          nested: {
            count: 0
          }
        };
      })
      .withAutoselectors(['nested'])
      .withActions(({ set }) => ({
        increment: () =>
          set(state => {
            state.nested.count += 1;
          })
      }));

    expectTypeOf(store.getNested).returns.toEqualTypeOf<{ count: number }>();

    store.actions.increment();

    expect(store.getNested()).toEqual({ count: 1 });

    store.set(state => {
      state.nested.count += 1;
      state.label = 'updated';
    });

    expect(store.get()).toEqual({
      label: 'updated',
      nested: {
        count: 2
      }
    });
  });

  test('exposes store APIs added by middleware under a middleware namespace', async () => {
    interface PersistedState {
      count: number;
      label: string;
    }

    interface PersistedActions {
      rehydrate: () => Promise<void> | void;
    }

    const storage: PersistStorage<Pick<PersistedState, 'count'>> = {
      getItem: vi.fn(() => ({
        state: {
          count: 5
        }
      })),
      removeItem: vi.fn(),
      setItem: vi.fn()
    };

    const storeApi = createErgoStore<PersistedState, PersistedActions>()
      .withMiddleware(initializer =>
        persist(initializer, {
          name: 'ergo-test-store',
          partialize: state => ({
            count: state.count
          }),
          skipHydration: true,
          storage
        })
      )
      .withInitialState(() => ({
        count: 0,
        label: 'ready'
      }))
      .withAutoselectors(['count'])
      .withActions(({ middleware }) => ({
        rehydrate: () => middleware.persist.rehydrate()
      }));

    type MiddlewareApi = typeof storeApi.middleware;
    type StoreApiKeys = keyof typeof storeApi;
    type MiddlewareApiKeys = keyof MiddlewareApi;
    type ExposesPersistAtTopLevel = 'persist' extends StoreApiKeys ? true : false;
    type ExposesRawSetStateInMiddleware = 'setState' extends MiddlewareApiKeys ? true : false;

    expectTypeOf<ExposesPersistAtTopLevel>().toEqualTypeOf<false>();
    expectTypeOf<ExposesRawSetStateInMiddleware>().toEqualTypeOf<false>();
    expectTypeOf(storeApi.middleware.persist.rehydrate).toEqualTypeOf<() => Promise<void> | void>();

    expect('persist' in storeApi).toBe(false);
    expect('setState' in storeApi.middleware).toBe(false);
    expect(typeof storeApi.middleware.persist.rehydrate).toBe('function');

    await storeApi.actions.rehydrate();

    expect(storeApi.getCount()).toBe(5);
  });

  test('keeps devtools cleanup typed under the middleware namespace', () => {
    interface DevtoolsState {
      count: number;
    }

    const unsubscribe = vi.fn();
    const connect = vi.fn(() => ({
      init: vi.fn(),
      send: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe
    }));
    const windowWithDevtools = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect
      }
    } as unknown as Window & {
      __REDUX_DEVTOOLS_EXTENSION__?: {
        connect: typeof connect;
      };
    };
    vi.stubGlobal('window', windowWithDevtools);

    try {
      const storeApi = createErgoStore<DevtoolsState>()
        .withMiddleware(initializer => devtools(initializer, { name: 'ergo-devtools-test' }))
        .withInitialState(() => ({
          count: 0
        }))
        .withAutoselectors(['count'])
        .withoutActions();

      expectTypeOf(storeApi.middleware.devtools.cleanup).toEqualTypeOf<() => void>();
      expect('devtools' in storeApi).toBe(false);
      expect(typeof storeApi.middleware.devtools.cleanup).toBe('function');

      storeApi.middleware.devtools.cleanup();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('does not expose unselected internal or public state properties', () => {
    const storeApi = createErgoStore<
      TestInternalState,
      Pick<TestErgoActions, 'increment' | 'setItems'>
    >()
      .withInitialState(() => ({
        count: 0,
        items: [],
        _internalStatus: 'ready',
        calculateInternalStatus: () => 'ready',
        actions: {
          increment: () => undefined,
          setItems: () => undefined
        }
      }))
      .withAutoselectors(['count', 'items'])
      .withSelectors({
        itemCount: defineErgoStoreSelector(
          (state: TestInternalState) => state.items.length,
          Object.is
        )
      })
      .withActions(({ set }) => ({
        increment: () => set(state => ({ count: state.count + 1 })),
        setItems: items => set({ items })
      }));

    expect(storeApi.getCount()).toBe(0);
    expect(storeApi.getItems()).toEqual([]);
    expect(storeApi.getItemCount()).toBe(0);
    expect('select' in storeApi).toBe(false);
    expect('selectorEntries' in storeApi).toBe(false);
    expect('get_internalStatus' in storeApi).toBe(false);
    expect('getCalculateInternalStatus' in storeApi).toBe(false);
    expect('getActions' in storeApi).toBe(false);
    expect('useCount' in storeApi).toBe(false);
    expect('useItems' in storeApi).toBe(false);
    expect('useItemCount' in storeApi).toBe(false);
    expect('use_internalStatus' in storeApi).toBe(false);
    expect('useCalculateInternalStatus' in storeApi).toBe(false);
    expect('useActions' in storeApi).toBe(false);

    storeApi.actions.increment();

    expect(storeApi.getCount()).toBe(1);

    const listener = vi.fn();
    const unsubscribe = storeApi.subscribeItemCount(listener);

    expect(listener).toHaveBeenCalledWith(0);

    storeApi.actions.setItems(['a']);
    storeApi.actions.setItems(['b']);
    storeApi.actions.setItems(['b', 'c']);

    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenLastCalledWith(2);

    unsubscribe();
    storeApi.actions.setItems(['d', 'e', 'f']);

    expect(listener).toHaveBeenCalledTimes(3);
  });

  test('allows actions and function-valued state properties as autoselectors', () => {
    interface FunctionState {
      actions: {
        save: () => string;
      };
      reset: () => string;
      _internalReset: () => string;
    }

    interface FunctionActions {
      callInternalReset: () => string;
    }

    const stateActions = {
      save: () => 'saved'
    };
    const reset = () => 'reset';
    const internalReset = () => 'internal-reset';

    const storeApi = createErgoStore<FunctionState, FunctionActions>()
      .withInitialState(() => ({
        actions: stateActions,
        reset,
        _internalReset: internalReset
      }))
      .withAutoselectors(['actions', 'reset', '_internalReset'])
      .withActions(({ _getInternalReset }) => {
        expectTypeOf(_getInternalReset).returns.toEqualTypeOf<() => string>();

        return {
          callInternalReset: () => _getInternalReset()()
        };
      });

    expectTypeOf(storeApi.getActions).returns.toEqualTypeOf<{ save: () => string }>();
    expectTypeOf(storeApi.getReset).returns.toEqualTypeOf<() => string>();
    expect(storeApi.getActions()).toBe(stateActions);
    expect(storeApi.getReset()).toBe(reset);
    expect(storeApi.getActions().save()).toBe('saved');
    expect(storeApi.getReset()()).toBe('reset');
    expect(storeApi.actions.callInternalReset()).toBe('internal-reset');
    expect('_getInternalReset' in storeApi).toBe(false);
  });

  test('makes underscore-prefixed state and selectors available as action-only getters', () => {
    interface InternalActionState {
      count: number;
      _items: string[];
      __sessionId: string;
    }

    interface InternalActionSummary {
      count: number;
      itemCount: number;
      items: string[];
      sessionId: string;
    }

    interface InternalActions {
      getInternalSummary: () => InternalActionSummary;
      setItems: (items: string[]) => void;
    }

    const storeApi = createErgoStore<InternalActionState, InternalActions>()
      .withInitialState(() => ({
        count: 0,
        _items: ['a'],
        __sessionId: 'session-1'
      }))
      .withAutoselectors(['count', '_items', '__sessionId'])
      .withSelectors({
        _itemCount: (state: InternalActionState) => state._items.length
      })
      .withActions(({ __getSessionId, _getItemCount, _getItems, getCount, set }) => {
        expectTypeOf(__getSessionId).returns.toEqualTypeOf<string>();
        expectTypeOf(_getItemCount).returns.toEqualTypeOf<number>();
        expectTypeOf(_getItems).returns.toEqualTypeOf<string[]>();
        expectTypeOf(getCount).returns.toEqualTypeOf<number>();

        function getInternalSummary() {
          return {
            count: getCount(),
            itemCount: _getItemCount(),
            items: _getItems(),
            sessionId: __getSessionId()
          };
        }

        function setItems(items: string[]) {
          set({ _items: items });
        }

        return {
          getInternalSummary,
          setItems
        };
      });

    type StoreApiKeys = keyof typeof storeApi;
    type ExposesInternalStateGetter = '_getItems' extends StoreApiKeys ? true : false;
    type ExposesInternalSelectorGetter = '_getItemCount' extends StoreApiKeys ? true : false;
    type ExposesDoubleUnderscoreGetter = '__getSessionId' extends StoreApiKeys ? true : false;

    expectTypeOf<ExposesInternalStateGetter>().toEqualTypeOf<false>();
    expectTypeOf<ExposesInternalSelectorGetter>().toEqualTypeOf<false>();
    expectTypeOf<ExposesDoubleUnderscoreGetter>().toEqualTypeOf<false>();
    expect('_getItems' in storeApi).toBe(false);
    expect('_getItemCount' in storeApi).toBe(false);
    expect('__getSessionId' in storeApi).toBe(false);

    expect(storeApi.actions.getInternalSummary()).toEqual({
      count: 0,
      itemCount: 1,
      items: ['a'],
      sessionId: 'session-1'
    });

    storeApi.actions.setItems(['b', 'c']);

    expect(storeApi.actions.getInternalSummary()).toEqual({
      count: 0,
      itemCount: 2,
      items: ['b', 'c'],
      sessionId: 'session-1'
    });
  });

  test('supports optional internal autoselectors that are absent from the initial state', () => {
    interface OptionalInternalState {
      _maybeLoaded?: {
        id: string;
      };
    }

    interface OptionalInternalActions {
      getLoadedId: () => string | undefined;
      setLoadedId: (id: string) => void;
    }

    const storeApi = createErgoStore<OptionalInternalState, OptionalInternalActions>()
      .withInitialState(() => ({}))
      .withAutoselectors(['_maybeLoaded'])
      .withActions(({ _getMaybeLoaded, set }) => {
        expectTypeOf(_getMaybeLoaded).returns.toEqualTypeOf<{ id: string } | undefined>();

        function getLoadedId() {
          return _getMaybeLoaded()?.id;
        }

        function setLoadedId(id: string) {
          set({ _maybeLoaded: { id } });
        }

        return {
          getLoadedId,
          setLoadedId
        };
      });

    expect('_getMaybeLoaded' in storeApi).toBe(false);
    expect(storeApi.actions.getLoadedId()).toBeUndefined();

    storeApi.actions.setLoadedId('loaded-1');

    expect(storeApi.actions.getLoadedId()).toBe('loaded-1');
  });

  test('allows state property getters without colliding with full-state access', () => {
    const storeApi = createErgoStore<{ state: string }>()
      .withInitialState(() => ({
        state: 'ready'
      }))
      .withAutoselectors(['state'])
      .withoutActions();

    expectTypeOf(storeApi.getState).returns.toEqualTypeOf<string>();
    expectTypeOf(storeApi.get).returns.toEqualTypeOf<{ state: string }>();
    expectTypeOf(storeApi.set).toEqualTypeOf<StoreApi<{ state: string }>['setState']>();
    expect(storeApi.getState()).toBe('ready');
    expect(storeApi.get()).toEqual({ state: 'ready' });

    storeApi.set({ state: 'done' });

    expect(storeApi.getState()).toBe('done');
    expect(storeApi.get()).toEqual({ state: 'done' });
  });

  test('supports custom selectors and actions without autoselectors', () => {
    interface SelectorOnlyState {
      items: string[];
      selectedIds: string[];
    }

    interface SelectorOnlyActions {
      clearSelection: () => void;
      selectItem: (item: string) => void;
    }

    const storeApi = createErgoStore<SelectorOnlyState, SelectorOnlyActions>()
      .withInitialState(() => ({
        items: ['a', 'b', 'c'],
        selectedIds: ['b']
      }))
      .withoutAutoselectors()
      .withSelectors({
        selectedItems: (state: SelectorOnlyState) =>
          state.items.filter(item => state.selectedIds.includes(item))
      })
      .withActions(({ get, getSelectedItems, set }) => {
        expectTypeOf(getSelectedItems).returns.toEqualTypeOf<string[]>();

        return {
          clearSelection: () => set({ selectedIds: [] }),
          selectItem: item => {
            if (getSelectedItems().includes(item)) {
              return;
            }

            set({ selectedIds: [...get().selectedIds, item] });
          }
        };
      });

    type StoreApiKeys = keyof typeof storeApi;
    type HasItemsGetter = 'getItems' extends StoreApiKeys ? true : false;

    expectTypeOf<HasItemsGetter>().toEqualTypeOf<false>();
    expect('getItems' in storeApi).toBe(false);
    expect(storeApi.getSelectedItems()).toEqual(['b']);

    storeApi.actions.selectItem('a');

    expect(storeApi.getSelectedItems()).toEqual(['a', 'b']);

    storeApi.actions.selectItem('a');

    expect(storeApi.getSelectedItems()).toEqual(['a', 'b']);

    storeApi.actions.clearSelection();

    expect(storeApi.getSelectedItems()).toEqual([]);
  });

  test('uses Object.is for generated subscribers unless a selector defines custom equality', () => {
    interface SubscriptionState {
      count: number;
      label: string;
    }

    const summaryListener = vi.fn();
    const stableSummaryListener = vi.fn();
    const storeApi = createErgoStore<SubscriptionState>()
      .withInitialState(() => ({
        count: 0,
        label: 'initial'
      }))
      .withoutAutoselectors()
      .withSelectors({
        stableSummary: defineErgoStoreSelector(
          (state: SubscriptionState) => ({
            count: state.count
          }),
          (left, right) => left.count === right.count
        ),
        summary: (state: SubscriptionState) => ({
          count: state.count
        })
      })
      .withoutActions();

    const unsubscribeSummary = storeApi.subscribeSummary(summaryListener);
    const unsubscribeStableSummary = storeApi.subscribeStableSummary(stableSummaryListener);

    expect(summaryListener).toHaveBeenCalledWith({ count: 0 });
    expect(stableSummaryListener).toHaveBeenCalledWith({ count: 0 });

    storeApi.set({ label: 'updated' });

    expect(summaryListener).toHaveBeenCalledTimes(2);
    expect(stableSummaryListener).toHaveBeenCalledTimes(1);

    storeApi.set({ count: 1 });

    expect(summaryListener).toHaveBeenCalledTimes(3);
    expect(summaryListener).toHaveBeenLastCalledWith({ count: 1 });
    expect(stableSummaryListener).toHaveBeenCalledTimes(2);
    expect(stableSummaryListener).toHaveBeenLastCalledWith({ count: 1 });

    unsubscribeSummary();
    unsubscribeStableSummary();
  });

  test('prefers a custom internal selector when it duplicates an internal autoselector', () => {
    interface InternalOverrideState {
      _items: string[];
    }

    interface InternalOverrideActions {
      getInternalItemCount: () => number;
      setItems: (items: string[]) => void;
    }

    const storeApi = createErgoStore<InternalOverrideState, InternalOverrideActions>()
      .withInitialState(() => ({
        _items: ['a', 'b']
      }))
      .withAutoselectors(['_items'])
      .withSelectors({
        _items: (state: InternalOverrideState) => state._items.length
      })
      .withActions(({ _getItems, set }) => {
        expectTypeOf(_getItems).returns.toEqualTypeOf<number>();

        return {
          getInternalItemCount: _getItems,
          setItems: items => set({ _items: items })
        };
      });

    type StoreApiKeys = keyof typeof storeApi;
    type ExposesInternalGetter = '_getItems' extends StoreApiKeys ? true : false;

    expectTypeOf<ExposesInternalGetter>().toEqualTypeOf<false>();
    expect('_getItems' in storeApi).toBe(false);
    expect(storeApi.actions.getInternalItemCount()).toBe(2);

    storeApi.actions.setItems(['c']);

    expect(storeApi.actions.getInternalItemCount()).toBe(1);
  });

  test('throws when a store state property name is empty', () => {
    expect(() =>
      createErgoStore<{ '': string }>()
        .withInitialState(() => ({
          '': 'invalid'
        }))
        .withoutAutoselectors()
        .withoutActions()
    ).toThrow('Ergo store state property names must not be empty strings.');
  });

  test('throws when a store state property key is not a string', () => {
    const symbolProperty = Symbol('internal');
    type SymbolState = {
      count: number;
      [symbolProperty]: string;
    };
    expect(() =>
      createErgoStore<SymbolState>()
        .withInitialState(() => ({
          count: 0,
          [symbolProperty]: 'invalid'
        }))
        .withoutAutoselectors()
        .withoutActions()
    ).toThrow('Ergo store state property keys must be strings. Received Symbol(internal).');
  });

  test('throws when a selector name is empty', () => {
    expect(() =>
      createStoreWithUncheckedSelectors(
        createErgoStore<{ count: number }>()
          .withInitialState(() => ({
            count: 0
          }))
          .withoutAutoselectors(),
        {
          '': (state: { count: number }) => state.count
        }
      )
    ).toThrow('Ergo store selector names must not be empty strings.');
  });

  test('throws when a selector name does not start with a lowercase ascii letter', () => {
    const selectors = {
      Count: (state: { count: number }) => state.count
    } as unknown as Record<string, (state: { count: number }) => number>;

    expect(() =>
      createStoreWithUncheckedSelectors(
        createErgoStore<{ count: number }>()
          .withInitialState(() => ({
            count: 0
          }))
          .withoutAutoselectors(),
        selectors
      )
    ).toThrow(
      'Ergo store selector names must start with a lowercase letter from a-z. Received "Count".'
    );
  });

  test('throws when an internal selector name is not followed by lowercase ascii', () => {
    const selectors = {
      _Count: (state: { count: number }) => state.count
    } as unknown as Record<string, (state: { count: number }) => number>;

    expect(() =>
      createStoreWithUncheckedSelectors(
        createErgoStore<{ count: number }>()
          .withInitialState(() => ({
            count: 0
          }))
          .withoutAutoselectors(),
        selectors
      )
    ).toThrow(
      'Ergo store internal selector names must start with one or more underscores followed by a lowercase letter from a-z. Received "_Count".'
    );
  });

  test('throws when an internal state property name is not followed by lowercase ascii', () => {
    expect(() =>
      createErgoStore<{ _Count: number }>()
        .withInitialState(() => ({
          _Count: 0
        }))
        .withoutAutoselectors()
        .withoutActions()
    ).toThrow(
      'Ergo store internal state property names must start with one or more underscores followed by a lowercase letter from a-z. Received "_Count".'
    );
  });

  test('throws when an internal autoselector name is not followed by lowercase ascii', () => {
    expect(() =>
      createErgoStore<{ _count: number }>()
        .withInitialState(() => ({
          _count: 0
        }))
        .withAutoselectors(['_Count' as '_count'])
        .withoutActions()
    ).toThrow(
      'Ergo store internal state property names must start with one or more underscores followed by a lowercase letter from a-z. Received "_Count".'
    );
  });

  test('throws when an autoselector name is empty', () => {
    expect(() =>
      createErgoStore<{ count: number }>()
        .withInitialState(() => ({
          count: 0
        }))
        .withAutoselectors(['' as 'count'])
        .withoutActions()
    ).toThrow('Ergo store autoselector names must not be empty strings.');
  });

  test('throws when an autoselector name does not start with a lowercase ascii letter', () => {
    expect(() =>
      createErgoStore<{ count: number }>()
        .withInitialState(() => ({
          count: 0
        }))
        .withAutoselectors(['Count' as 'count'])
        .withoutActions()
    ).toThrow(
      'Ergo store autoselector names must start with a lowercase letter from a-z. Received "Count".'
    );
  });

  test('throws when an autoselector key is not a string', () => {
    const symbolAutoselector = Symbol('count');

    expect(() =>
      createErgoStore<{ count: number }>()
        .withInitialState(() => ({
          count: 0
        }))
        .withAutoselectors([symbolAutoselector as unknown as 'count'])
        .withoutActions()
    ).toThrow('Ergo store autoselector keys must be strings. Received Symbol(count).');
  });

  test('prefers a custom selector when it duplicates an autoselector', () => {
    const listener = vi.fn();

    const storeApi = createErgoStore<{ count: number }>()
      .withInitialState(() => ({
        count: 0
      }))
      .withAutoselectors(['count'])
      .withSelectors({
        count: defineErgoStoreSelector((state: { count: number }) => state.count % 2, Object.is)
      })
      .withoutActions();

    expect(storeApi.getCount()).toBe(0);

    const unsubscribe = storeApi.subscribeCount(listener);

    expect(listener).toHaveBeenCalledWith(0);

    storeApi.set({ count: 2 });

    expect(listener).toHaveBeenCalledTimes(1);

    storeApi.set({ count: 3 });

    expect(storeApi.getCount()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(1);

    unsubscribe();
  });

  test('throws when a selector key is not a string', () => {
    const symbolSelector = Symbol('count');
    const selectors = {
      [symbolSelector]: (state: { count: number }) => state.count
    } as unknown as Record<string, (state: { count: number }) => number>;

    expect(() =>
      createStoreWithUncheckedSelectors(
        createErgoStore<{ count: number }>()
          .withInitialState(() => ({
            count: 0
          }))
          .withoutAutoselectors(),
        selectors
      )
    ).toThrow('Ergo store selector keys must be strings. Received Symbol(count).');
  });
});
