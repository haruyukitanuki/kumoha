import { createContext } from "react";
import { KumohaData } from "./hooks/use-init-kumoha";
import { KumohaEngine } from "@tanuden/kumoha";

export const KumohaDataContext = createContext<{
  client?: KumohaEngine;
  data?: KumohaData;
} | null>(null);
