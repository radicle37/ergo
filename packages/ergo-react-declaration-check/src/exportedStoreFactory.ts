import { createErgoStore } from 'ergo-react';

interface CounterState {
  count: number;
}

interface CounterActions {
  increment: () => void;
}

export function createCounterStoreApi() {
  return createErgoStore<CounterState, CounterActions>()
    .withInitialState(() => ({ count: 0 }))
    .withAutoselectors(['count'])
    .withActions(({ set }) => ({
      increment: () => set(state => ({ count: state.count + 1 }))
    }));
}

const store = createCounterStoreApi();

void (store.getCount satisfies () => number);
void (store.subscribeCount satisfies (listener: (count: number) => void) => () => void);
void (store.useCount satisfies () => number);
void (store.actions.increment satisfies () => void);
