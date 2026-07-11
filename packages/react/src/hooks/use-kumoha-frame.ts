import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { OutputDataFrame } from '@tanuden/kumoha';
import { useKumohaContext } from './use-kumoha-context';

export type FrameSelector<T> = (outputDataFrame: OutputDataFrame | null) => T;

// Re-renders only when the selected value changes. Object.is by default; pass `shallow` for
// object/tuple selections so a selector that builds a fresh object doesn't re-render every frame.
export const useKumohaFrame = <T>(
  selector: FrameSelector<T>,
  equalityFn: (a: T, b: T) => boolean = Object.is
): T => {
  const { store } = useKumohaContext();
  return useStoreWithEqualityFn(
    store,
    (snapshot) => selector(snapshot.outputDataFrame),
    equalityFn
  );
};
