import type { KumohaClient } from '@tanuden/kumoha';
import { useKumohaContext } from './use-kumoha-context';

export const useKumohaClient = (): KumohaClient | null =>
  useKumohaContext().client;
