import { useContext } from "react";
import { KumohaDataContext } from "../context";
import { KumohaEngine } from "@tanuden/kumoha";

export const useKumohaClient = (): KumohaEngine | undefined => {
  const kumohaContext = useContext(KumohaDataContext);
  return kumohaContext?.client;
};
