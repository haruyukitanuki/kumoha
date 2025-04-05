import { useContext } from "react";
import { KumohaArisuDataContext } from "../context";
import { KumohaArisuData, KumohaArisuDataDefaults } from "./use-init-kumoha";

export const useKumohaArisuData = (): KumohaArisuData => {
  const kumohaContext = useContext(KumohaArisuDataContext);
  return kumohaContext?.data || KumohaArisuDataDefaults;
};
