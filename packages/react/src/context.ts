import { createContext } from 'react';
import type { KumohaClient, KumohaSnapshot } from '@tanuden/kumoha';
import type { StoreApi } from 'zustand/vanilla';

export interface KumohaContextValue {
  store: StoreApi<KumohaSnapshot>;
  client: KumohaClient | null;
}

export const KumohaContext = createContext<KumohaContextValue | null>(null);
