import { useEffect, useRef } from 'react';
import type { FrameSelector } from './use-kumoha-frame';
import { useKumohaContext } from './use-kumoha-context';

// Invokes `onChange` on change WITHOUT a React render, so a consumer can write to a ref/canvas/DOM
// directly. Selector/onChange/equality are read through refs to keep the subscription stable.
export const useKumohaSubscription = <T>(
  selector: FrameSelector<T>,
  onChange: (value: T) => void,
  equalityFn: (a: T, b: T) => boolean = Object.is
): void => {
  const { store } = useKumohaContext();

  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const equalityRef = useRef(equalityFn);
  equalityRef.current = equalityFn;

  useEffect(() => {
    let current = selectorRef.current(store.getState().outputDataFrame);
    onChangeRef.current(current);

    return store.subscribe((snapshot) => {
      const next = selectorRef.current(snapshot.outputDataFrame);
      if (!equalityRef.current(current, next)) {
        current = next;
        onChangeRef.current(next);
      }
    });
  }, [store]);
};
