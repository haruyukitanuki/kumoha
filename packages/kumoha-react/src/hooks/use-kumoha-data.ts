import { KumohaArisuData } from "./use-kumoha";
import { useKumohaInternalStore } from "../store";

export const useKumohaData = (): KumohaArisuData => {
  const { data } = useKumohaInternalStore();
  return data;
};
