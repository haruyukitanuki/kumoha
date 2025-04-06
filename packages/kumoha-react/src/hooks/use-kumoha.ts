import { useKumohaInternalStore } from "../store";

export const useKumoha = () => {
  const { engine } = useKumohaInternalStore();
  return engine;
};
