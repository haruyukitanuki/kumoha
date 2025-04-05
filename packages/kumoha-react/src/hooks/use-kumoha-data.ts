import { useContext } from "react";
import { KumohaDataContext } from "../context";
import { KumohaArisuData, KumohaArisuDataDefaults } from "./use-init-kumoha";

export const useKumohaData = (): KumohaArisuData => {
  const kumohaContext = useContext(KumohaDataContext);
  return kumohaContext?.data || KumohaArisuDataDefaults;
};
