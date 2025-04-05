import { useContext } from "react";
import { KumohaArisuDataContext } from "../context";
import { KumohaEngine } from "@tanuden/kumoha";

export const useKumohaClient = (): KumohaEngine | undefined => {
  const kumohaContext = useContext(KumohaArisuDataContext);
  return kumohaContext?.client;
};
