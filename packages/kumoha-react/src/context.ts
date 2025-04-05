import { createContext } from "react";
import { KumohaArisuData } from "./hooks/use-init-kumoha";
import { KumohaEngine, KumohaState } from "@tanuden/kumoha";

export const KumohaDataContext = createContext<{
  client?: {
    connected: boolean;
    state: KumohaState;
    engine: KumohaEngine;
  };
  data?: KumohaArisuData;
} | null>(null);
