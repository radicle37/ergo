import { createStore } from 'zustand';
import { describe, expect, test, vi } from 'vitest';
import { subscribeWithEqualityFn } from './subscribeWithEqualityFn';

interface TestState {
  count: number;
  label: string;
  values: number[];
}

describe('subscribeWithEqualityFn', () => {
  test('notifies immediately and only when the selected value changes', () => {
    const store = createStore<TestState>(() => ({
      count: 1,
      label: 'initial',
      values: [1]
    }));
    const onCountChange = vi.fn<(count: number) => void>();

    const unsubscribe = subscribeWithEqualityFn(
      onCountChange,
      store,
      state => state.count,
      Object.is
    );

    store.setState({ label: 'updated label' });
    store.setState({ count: 2 });

    expect(onCountChange).toHaveBeenNthCalledWith(1, 1);
    expect(onCountChange).toHaveBeenNthCalledWith(2, 2);
    expect(onCountChange).toHaveBeenCalledTimes(2);

    unsubscribe();
    store.setState({ count: 3 });

    expect(onCountChange).toHaveBeenCalledTimes(2);
  });

  test('supports a custom equality function for derived values', () => {
    const store = createStore<TestState>(() => ({
      count: 1,
      label: 'initial',
      values: [1, 2]
    }));
    const onValuesChange = vi.fn<(values: number[]) => void>();

    subscribeWithEqualityFn(
      onValuesChange,
      store,
      state => state.values,
      (left: number[], right: number[]) =>
        left.length === right.length && left.every((value, index) => value === right[index])
    );

    store.setState({ values: [1, 2] });
    store.setState({ values: [1, 2, 3] });

    expect(onValuesChange).toHaveBeenNthCalledWith(1, [1, 2]);
    expect(onValuesChange).toHaveBeenNthCalledWith(2, [1, 2, 3]);
    expect(onValuesChange).toHaveBeenCalledTimes(2);
  });

  test('uses Object.is equality by default', () => {
    const store = createStore<TestState>(() => ({
      count: 1,
      label: 'initial',
      values: [1, 2]
    }));
    const stableValues = [1, 2];
    const onValuesChange = vi.fn<(values: number[]) => void>();

    subscribeWithEqualityFn(onValuesChange, store, state => state.values);

    store.setState({ label: 'updated label' });
    store.setState({ values: stableValues });
    store.setState({ values: stableValues });
    store.setState({ values: [1, 2] });

    expect(onValuesChange).toHaveBeenNthCalledWith(1, [1, 2]);
    expect(onValuesChange).toHaveBeenNthCalledWith(2, stableValues);
    expect(onValuesChange).toHaveBeenNthCalledWith(3, [1, 2]);
    expect(onValuesChange).toHaveBeenCalledTimes(3);
  });

  test('swallows a throwing initial callback and keeps the subscription live', () => {
    const store = createStore<TestState>(() => ({
      count: 1,
      label: 'initial',
      values: []
    }));
    const onCountChange = vi.fn<(count: number) => void>().mockImplementationOnce(() => {
      throw new Error('initial callback threw');
    });

    const unsubscribe = subscribeWithEqualityFn(onCountChange, store, state => state.count);

    expect(unsubscribe).toBeTypeOf('function');
    expect(onCountChange).toHaveBeenNthCalledWith(1, 1);

    store.setState({ count: 2 });

    expect(onCountChange).toHaveBeenNthCalledWith(2, 2);
    expect(onCountChange).toHaveBeenCalledTimes(2);

    unsubscribe();
    store.setState({ count: 3 });

    expect(onCountChange).toHaveBeenCalledTimes(2);
  });

  test('compares against the latest selected value after each accepted update', () => {
    const store = createStore<TestState>(() => ({
      count: 1,
      label: 'initial',
      values: []
    }));
    const onCountChange = vi.fn<(count: number) => void>();
    const equalityFn = vi.fn((left: number, right: number) => left === right);

    subscribeWithEqualityFn(onCountChange, store, state => state.count, equalityFn);

    store.setState({ count: 2 });
    store.setState({ count: 2, label: 'same selected value' });
    store.setState({ count: 3 });

    expect(equalityFn).toHaveBeenNthCalledWith(1, 2, 1);
    expect(equalityFn).toHaveBeenNthCalledWith(2, 2, 2);
    expect(equalityFn).toHaveBeenNthCalledWith(3, 3, 2);
    expect(onCountChange).toHaveBeenNthCalledWith(1, 1);
    expect(onCountChange).toHaveBeenNthCalledWith(2, 2);
    expect(onCountChange).toHaveBeenNthCalledWith(3, 3);
    expect(onCountChange).toHaveBeenCalledTimes(3);
  });
});
