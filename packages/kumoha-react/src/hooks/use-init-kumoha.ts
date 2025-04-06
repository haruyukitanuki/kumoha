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

export type InitializeKumohaOptions = KumohaEngineOptions & {
  sampleData?: KumohaArisuData;
};

export const useInitializeKumoha = (
  uri: string,
  options?: InitializeKumohaOptions
) => {
  const { engine, _setEngine, clientMetadata, setClientMetadata, setData } =
    useKumohaInternalStore();

  const kumoha = useMemo(() => {
    // Enforce single instance of KumohaEngine
    let kumohaEngine = engine;
    if (!kumohaEngine) {
      kumohaEngine = Kumoha(uri, options);
      _setEngine(kumohaEngine);
    } else {
      console.warn(
        "Usage of useInitializeKumoha more than once in an app is not supported and can result in unexpected behaviour. Use useKumoha if you need to access engine props. アプリ内でuseInitializeKumohaを複数回使用することは非常に危険で予期せぬ動作が起こる可能性が高いです。クモハエンジンのプロパティにアクセスする必要がある場合は、useKumohaを使用してください。"
      );
    }
    return kumohaEngine;
  }, []);

  useEffect(() => {
    console.info("Kumoha API using " + uri);

    if (options?.sampleData) {
      setData(options.sampleData);
    }

    const gameDataListener = kumoha.arisuListener((gameData) => {
      setData(options?.sampleData || gameData);
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
      gameDataListener?.off();
      clientMetaListener?.off();
      kumoha.dispose();
    };
  }, [options?.sampleData]);

  return kumoha;
};
