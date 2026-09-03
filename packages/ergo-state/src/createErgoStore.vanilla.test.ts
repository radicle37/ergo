import { describe, expect, expectTypeOf, test, vi } from 'vitest';

import type { Mutate, StoreApi } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import type { PersistStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createErgoStore, defineErgoStoreSelector } from './index';

interface VanillaState {
  count: number;
  items: string[];
}

interface VanillaActions {
  increment: () => void;
  setItems: (items: string[]) => void;
}

type ImmerSetState<State extends object> = Mutate<
  StoreApi<State>,
  [['zustand/immer', never]]
>['setState'];

describe('createErgoStore vanilla entry', () => {
  test('creates generated getters and subscribers without generated hooks', () => {
    const store = createErgoStore<VanillaState, VanillaActions>()
      .withInitialState(() => ({
        count: 0,
        items: []
      }))
      .withAutoselectors(['count'])
      .withSelectors({
        itemCount: defineErgoStoreSelector((state: VanillaState) => state.items.length, Object.is)
      })
      .withActions(storeApi => {
        type ActionInitializerKeys = keyof typeof storeApi;
        type ActionInitializerHasCountHook = 'useCount' extends ActionInitializerKeys
          ? true
          : false;

        expectTypeOf<ActionInitializerHasCountHook>().toEqualTypeOf<false>();

        const assertNoActionInitializerHook = () => {
          // @ts-expect-error vanilla action initializers do not expose generated React hooks
          void storeApi.useCount;
        };

        void assertNoActionInitializerHook;

        return {
          increment: () => storeApi.set({ count: storeApi.getCount() + 1 }),
          setItems: items => storeApi.set({ items })
        };
      });

    type StoreApiKeys = keyof typeof store;
    type StoreHasCountHook = 'useCount' extends StoreApiKeys ? true : false;
    type StoreHasItemCountHook = 'useItemCount' extends StoreApiKeys ? true : false;

    expectTypeOf(store.getCount).returns.toEqualTypeOf<number>();
    expectTypeOf(store.getItemCount).returns.toEqualTypeOf<number>();
    expectTypeOf(store.subscribeCount).toEqualTypeOf<
      (listener: (selectedValue: number) => void) => () => void
    >();
    expectTypeOf<StoreHasCountHook>().toEqualTypeOf<false>();
    expectTypeOf<StoreHasItemCountHook>().toEqualTypeOf<false>();

    const assertNoHook = () => {
      // @ts-expect-error vanilla stores do not expose generated React hooks
      void store.useCount;
    };

    void assertNoHook;

    expect(store.getCount()).toBe(0);
    expect(store.getItemCount()).toBe(0);
    expect('useCount' in store).toBe(false);
    expect('useItemCount' in store).toBe(false);

    const countListener = vi.fn();
    const unsubscribe = store.subscribeCount(countListener);

    expect(countListener).toHaveBeenCalledWith(0);

    store.actions.increment();

    expect(store.getCount()).toBe(1);
    expect(countListener).toHaveBeenCalledTimes(2);
    expect(countListener).toHaveBeenLastCalledWith(1);

    store.actions.setItems(['a', 'b']);

    expect(store.getItemCount()).toBe(2);
    expect(countListener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  test('supports vanilla stores without selectors or actions', () => {
    const store = createErgoStore<{ count: number }>()
      .withInitialState(() => ({
        count: 0
      }))
      .withoutAutoselectors()
      .withoutActions();

    type StoreApiKeys = keyof typeof store;
    type HasCountGetter = 'getCount' extends StoreApiKeys ? true : false;
    type HasCountHook = 'useCount' extends StoreApiKeys ? true : false;

    expectTypeOf<HasCountGetter>().toEqualTypeOf<false>();
    expectTypeOf<HasCountHook>().toEqualTypeOf<false>();
    expectTypeOf(store.actions).toEqualTypeOf<Record<never, never>>();
    expect(store.actions).toEqual({});
    expect(store.middleware).toEqual({});
    expect('getCount' in store).toBe(false);
    expect('useCount' in store).toBe(false);
    expect(store.get()).toEqual({ count: 0 });

    store.set({ count: 2 });

    expect(store.get()).toEqual({ count: 2 });
  });

  test('supports custom selectors and inferred actions without autoselectors or hooks', () => {
    const store = createErgoStore()
      .withInitialState(() => ({
        items: ['a', 'b', 'c'],
        selectedIds: ['b']
      }))
      .withoutAutoselectors()
      .withSelectors({
        selectedItems: (state: { items: string[]; selectedIds: string[] }) =>
          state.items.filter(item => state.selectedIds.includes(item))
      })
      .withActions(({ get, getSelectedItems, set }) => ({
        clearSelection: () => set({ selectedIds: [] }),
        selectItem: (item: string) => {
          if (getSelectedItems().includes(item)) {
            return;
          }

          set({ selectedIds: [...get().selectedIds, item] });
        }
      }));

    type StoreApiKeys = keyof typeof store;
    type HasItemsGetter = 'getItems' extends StoreApiKeys ? true : false;
    type HasSelectedItemsHook = 'useSelectedItems' extends StoreApiKeys ? true : false;

    expectTypeOf<HasItemsGetter>().toEqualTypeOf<false>();
    expectTypeOf<HasSelectedItemsHook>().toEqualTypeOf<false>();
    expectTypeOf(store.getSelectedItems).returns.toEqualTypeOf<string[]>();
    expectTypeOf(store.actions.selectItem).toEqualTypeOf<(item: string) => void>();
    expect('getItems' in store).toBe(false);
    expect('useSelectedItems' in store).toBe(false);
    expect(store.getSelectedItems()).toEqual(['b']);

    store.actions.selectItem('a');

    expect(store.getSelectedItems()).toEqual(['a', 'b']);

    store.actions.selectItem('a');

    expect(store.getSelectedItems()).toEqual(['a', 'b']);

    store.actions.clearSelection();

    expect(store.getSelectedItems()).toEqual([]);
  });

  test('keeps internal selectors available only to vanilla action initializers', () => {
    interface InternalState {
      count: number;
      _items: string[];
      __sessionId: string;
    }

    interface InternalSummary {
      count: number;
      itemCount: number;
      items: string[];
      sessionId: string;
    }

    interface InternalActions {
      getInternalSummary: () => InternalSummary;
      setItems: (items: string[]) => void;
    }

    const store = createErgoStore<InternalState, InternalActions>()
      .withInitialState(() => ({
        count: 0,
        _items: ['a'],
        __sessionId: 'session-1'
      }))
      .withAutoselectors(['count', '_items', '__sessionId'])
      .withSelectors({
        _itemCount: (state: InternalState) => state._items.length
      })
      .withActions(({ __getSessionId, _getItemCount, _getItems, getCount, set }) => {
        expectTypeOf(__getSessionId).returns.toEqualTypeOf<string>();
        expectTypeOf(_getItemCount).returns.toEqualTypeOf<number>();
        expectTypeOf(_getItems).returns.toEqualTypeOf<string[]>();
        expectTypeOf(getCount).returns.toEqualTypeOf<number>();

        return {
          getInternalSummary: () => ({
            count: getCount(),
            itemCount: _getItemCount(),
            items: _getItems(),
            sessionId: __getSessionId()
          }),
          setItems: items => set({ _items: items })
        };
      });

    type StoreApiKeys = keyof typeof store;
    type ExposesInternalStateGetter = '_getItems' extends StoreApiKeys ? true : false;
    type ExposesInternalSelectorGetter = '_getItemCount' extends StoreApiKeys ? true : false;
    type ExposesDoubleUnderscoreGetter = '__getSessionId' extends StoreApiKeys ? true : false;
    type ExposesInternalHook = '_useItemCount' extends StoreApiKeys ? true : false;

    expectTypeOf<ExposesInternalStateGetter>().toEqualTypeOf<false>();
    expectTypeOf<ExposesInternalSelectorGetter>().toEqualTypeOf<false>();
    expectTypeOf<ExposesDoubleUnderscoreGetter>().toEqualTypeOf<false>();
    expectTypeOf<ExposesInternalHook>().toEqualTypeOf<false>();
    expect('_getItems' in store).toBe(false);
    expect('_getItemCount' in store).toBe(false);
    expect('__getSessionId' in store).toBe(false);
    expect('_useItemCount' in store).toBe(false);

    expect(store.actions.getInternalSummary()).toEqual({
      count: 0,
      itemCount: 1,
      items: ['a'],
      sessionId: 'session-1'
    });

    store.actions.setItems(['b', 'c']);

    expect(store.actions.getInternalSummary()).toEqual({
      count: 0,
      itemCount: 2,
      items: ['b', 'c'],
      sessionId: 'session-1'
    });
  });

  test('keeps middleware-mutated setter types on vanilla initializers, actions, and stores', () => {
    interface DraftState {
      label: string;
      nested: {
        count: number;
      };
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

    type StoreApiKeys = keyof typeof store;
    type HasNestedHook = 'useNested' extends StoreApiKeys ? true : false;

    expectTypeOf<HasNestedHook>().toEqualTypeOf<false>();
    expectTypeOf(store.set).toEqualTypeOf<ImmerSetState<DraftState>>();
    expectTypeOf(store.getNested).returns.toEqualTypeOf<{ count: number }>();
    expect('useNested' in store).toBe(false);

    store.actions.increment();

    expect(store.getNested()).toEqual({ count: 1 });

    store.set(state => {
      state.label = 'updated';
      state.nested.count += 1;
    });

    expect(store.get()).toEqual({
      label: 'updated',
      nested: {
        count: 2
      }
    });
  });

  test('exposes middleware APIs under a vanilla middleware namespace', async () => {
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

    const store = createErgoStore<PersistedState, PersistedActions>()
      .withMiddleware(initializer =>
        persist(initializer, {
          name: 'ergo-vanilla-test-store',
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

    type MiddlewareApi = typeof store.middleware;
    type StoreApiKeys = keyof typeof store;
    type MiddlewareApiKeys = keyof MiddlewareApi;
    type ExposesPersistAtTopLevel = 'persist' extends StoreApiKeys ? true : false;
    type ExposesRawSetStateInMiddleware = 'setState' extends MiddlewareApiKeys ? true : false;

    expectTypeOf<ExposesPersistAtTopLevel>().toEqualTypeOf<false>();
    expectTypeOf<ExposesRawSetStateInMiddleware>().toEqualTypeOf<false>();
    expectTypeOf(store.middleware.persist.rehydrate).toEqualTypeOf<() => Promise<void> | void>();

    expect('persist' in store).toBe(false);
    expect('setState' in store.middleware).toBe(false);
    expect(typeof store.middleware.persist.rehydrate).toBe('function');

    await store.actions.rehydrate();

    expect(store.getCount()).toBe(5);
  });
});
