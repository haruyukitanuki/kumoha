import { KumohaClientMeta } from "@tanuden/kumoha";
import { useKumohaInternalStore } from "../store";

export const useKumohaClientMeta = (): KumohaClientMeta => {
  const { clientMetadata } = useKumohaInternalStore();
  return clientMetadata;
};
