import { useEffect, useMemo } from "react";
import {
  GameDataState,
  Kumoha,
  KumohaClientMeta,
  KumohaEngineOptions,
} from "@tanuden/kumoha";
import { updatedDiff } from "deep-object-diff";
import { useKumohaInternalStore } from "../store";

export interface KumohaArisuData {
  gameData: GameDataState["gameData"];
  gameState: GameDataState["gameState"];
  pluginData: GameDataState["pluginData"];
}

export const useKumoha = (uri: string, options?: KumohaEngineOptions) => {
  const { engine, _setEngine, clientMetadata, setClientMetadata, setData } =
    useKumohaInternalStore();

  const kumoha = useMemo(() => {
    // Enforce single instance of KumohaEngine
    let kumohaEngine = engine;
    if (!kumohaEngine) {
      kumohaEngine = Kumoha(uri, options);
      _setEngine(kumohaEngine);
    }
    return kumohaEngine;
  }, []);

  useEffect(() => {
    console.log("Kumoha API using " + uri);

    const gameDataListener = kumoha.arisuListener((gameData) => {
      setData(gameData);
    });

    const clientMetaListener = kumoha.clientMetaListener(
      (incomingClientMetadata) => {
        const diff = updatedDiff(
          clientMetadata || {},
          incomingClientMetadata
        ) as KumohaClientMeta;

        if (Object.keys(diff).length > 0) {
          setClientMetadata({
            ...clientMetadata,
            ...diff,
          });
        }
      }
    );

    return () => {
      gameDataListener.off();
      clientMetaListener.off();
    };
  }, []);

  return kumoha;
};
