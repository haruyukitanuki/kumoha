import { useEffect, useRef, useState } from 'react';
import type { FrameSelector } from './use-kumoha-frame';
import { useKumohaContext } from './use-kumoha-context';

export interface ThrottledFrameOptions<T> {
  throttleMs: number;
  equalityFn?: (a: T, b: T) => boolean;
}

// Trailing-edge sampled: keeps the latest value but re-renders at most once per `throttleMs`. Selector
// and equality are read through refs so the store subscription survives re-renders.
export const useKumohaFrameThrottled = <T>(
  selector: FrameSelector<T>,
  options: ThrottledFrameOptions<T>
): T => {
  const { store } = useKumohaContext();
  const { throttleMs, equalityFn = Object.is } = options;

  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const equalityRef = useRef(equalityFn);
  equalityRef.current = equalityFn;

  const [value, setValue] = useState<T>(() =>
    selector(store.getState().outputDataFrame)
  );
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const commit = () => {
      const next = selectorRef.current(store.getState().outputDataFrame);
      if (!equalityRef.current(valueRef.current, next)) {
        valueRef.current = next;
        setValue(next);
      }
    };

    commit();

    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = store.subscribe(() => {
      if (timer === null) {
        timer = setTimeout(() => {
          timer = null;
          commit();
        }, throttleMs);
      }
    });

    return () => {
      if (timer !== null) clearTimeout(timer);
      unsubscribe();
    };
  }, [store, throttleMs]);

  return value;
};
