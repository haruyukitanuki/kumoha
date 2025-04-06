import { KumohaArisuData } from "./use-init-kumoha";
import { useKumohaInternalStore } from "../store";

export const useKumohaData = (): KumohaArisuData => {
  const { data } = useKumohaInternalStore();
  return data;
};
