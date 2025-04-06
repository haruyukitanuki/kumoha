import { useEffect, useMemo, useState } from "react";
import {
  GameDataState,
  Kumoha,
  KumohaClientMeta,
  KumohaEngineOptions,
  KumohaListener,
} from "@tanuden/kumoha";
import { updatedDiff } from "deep-object-diff";
import { useKumohaInternalStore } from "../store";

export interface KumohaArisuData {
  gameData: GameDataState["gameData"];
  gameState: GameDataState["gameState"];
  pluginData: GameDataState["pluginData"];
}

export const useKumoha = (uri: string, options?: KumohaEngineOptions) => {
  const [existingInitialized, setExistingInitialized] = useState(true);
  const { engine, _setEngine, clientMetadata, setClientMetadata, setData } =
    useKumohaInternalStore();

  const kumoha = useMemo(() => {
    // Enforce single instance of KumohaEngine
    let kumohaEngine = engine;
    if (!kumohaEngine) {
      kumohaEngine = Kumoha(uri, options);
      _setEngine(kumohaEngine);
      setExistingInitialized(false);
    }
    return kumohaEngine;
  }, []);

  useEffect(() => {
    let gameDataListener: KumohaListener;
    let clientMetaListener: KumohaListener;

    if (existingInitialized) {
      console.info("Kumoha API using " + uri);

      gameDataListener = kumoha.arisuListener((gameData) => {
        setData(gameData);
      });

      clientMetaListener = kumoha.clientMetaListener(
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
    }

    return () => {
      gameDataListener?.off();
      clientMetaListener?.off();
      _setEngine(undefined);
    };
  }, [existingInitialized]);

  return kumoha;
};
