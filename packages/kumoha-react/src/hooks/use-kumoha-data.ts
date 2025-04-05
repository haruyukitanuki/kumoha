import { useContext } from "react";
import { KumohaDataContext } from "../context";
import { KumohaData, kumohaDataDefaults } from "./use-init-kumoha";

export const useKumohaData = (): KumohaData => {
  const kumohaContext = useContext(KumohaDataContext);
  return kumohaContext?.data || kumohaDataDefaults;
};
