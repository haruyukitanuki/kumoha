import { createContext } from "react";
import { KumohaData } from "./hooks/use-kumoha-api";

export const KumohaDataContext = createContext<{
  data?: KumohaData;
} | null>(null);
