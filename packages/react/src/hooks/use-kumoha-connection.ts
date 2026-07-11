import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import type { KumohaConnectionMeta } from '@tanuden/kumoha';
import { useKumohaContext } from './use-kumoha-context';

export const useKumohaConnection = (): KumohaConnectionMeta => {
  const { store } = useKumohaContext();
  return useStoreWithEqualityFn(
    store,
    (snapshot) => snapshot.connection,
    shallow
  );
};
