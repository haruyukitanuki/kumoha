import { createContext } from "react";
import { KumohaArisuData } from "./hooks/use-init-kumoha";
import { KumohaEngine } from "@tanuden/kumoha";

export const KumohaArisuDataContext = createContext<{
  client?: KumohaEngine;
  data?: KumohaArisuData;
} | null>(null);
