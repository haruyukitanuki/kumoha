import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import type { KumohaUserPrefs } from '@tanuden/kumoha';
import { useKumohaContext } from './use-kumoha-context';

export const useKumohaUserPrefs = (): Partial<KumohaUserPrefs> => {
  const { store } = useKumohaContext();
  return useStoreWithEqualityFn(
    store,
    (snapshot) => snapshot.userPrefs,
    shallow
  );
};
