import { useContext } from "react";
import { KumohaDataContext } from "../context";
import { KumohaClient } from "./use-init-kumoha";

export const useKumohaClient = (): KumohaClient | undefined => {
  const kumohaContext = useContext(KumohaDataContext);
  return kumohaContext?.client;
};
