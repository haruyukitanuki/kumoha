import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { SimulatorProfile } from '@tanuden/kumoha';
import { useKumohaContext } from './use-kumoha-context';

export const useKumohaProfile = (): SimulatorProfile | null => {
  const { store } = useKumohaContext();
  return useStoreWithEqualityFn(
    store,
    (snapshot) => snapshot.simProfile,
    Object.is
  );
};
