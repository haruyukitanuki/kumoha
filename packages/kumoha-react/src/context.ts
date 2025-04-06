import { createContext } from "react";
import { KumohaArisuData } from "./hooks/use-kumoha";
import { KumohaClientMeta, KumohaEngine } from "@tanuden/kumoha";

export const KumohaDataContext = createContext<{
  client: KumohaClientMeta;
  engine: KumohaEngine;
  data: KumohaArisuData;
} | null>(null);
