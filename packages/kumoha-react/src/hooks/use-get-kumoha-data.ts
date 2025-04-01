import { useContext } from "react";
import { KumohaDataContext } from "../context";
import { KumohaData, kumohaDataDefaults } from "./use-kumoha-api";

const useGetKumohaData = (): KumohaData => {
  const kumohaContext = useContext(KumohaDataContext);
  return kumohaContext?.data || kumohaDataDefaults;
};

export { useGetKumohaData };
