import { useContext } from "react";
import { KumohaDataContext } from "../context";
import { KumohaData } from "./use-kumoha-api";

const useGetKumohaData = (): KumohaData => {
  const kumohaContext = useContext(KumohaDataContext);
  return kumohaContext?.data || { connected: false };
};

export { useGetKumohaData };
