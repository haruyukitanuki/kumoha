import { useEffect, useMemo } from "react";
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

export type InitializeKumohaOptions = KumohaEngineOptions & {
  testData?: KumohaArisuData;
};

export const useInitializeKumoha = (
  uri: string,
  options?: InitializeKumohaOptions
) => {
  // const [alreadyInit, setAlreadyInit] = useState(true); // Intentional default to true. Don't attempt to trigger anything until we confirm that there is an engine.
  const {
    _setEngine,
    _disposeEngine,
    clientMetadata,
    setClientMetadata,
    setData,
  } = useKumohaInternalStore();

  const kumoha = useMemo(() => {
    // Enforce single instance of KumohaEngine
    const kumohaEngine = Kumoha(uri, {
      socketOptions: {
        autoConnect: options?.testData ? false : true,
        forceNew: true,
      },
    });
    _setEngine(kumohaEngine);

    return kumohaEngine;
  }, [options, uri, _setEngine]);

  useEffect(() => {
    let gameDataListener: KumohaListener;
    let clientMetaListener: KumohaListener;

    if (options?.testData) {
      console.info(
        `Kumoha is in test mode. No connection will be made. クモハエンジンはテストモードです。サーバーに接続は行われません。`
      );
      setData(options.testData);

      return;
    }

    gameDataListener = kumoha.arisuListener((gameData) => {
      setData(options?.testData || gameData);
    });

    clientMetaListener = kumoha.clientMetaListener((incomingClientMetadata) => {
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
    });
    // }

    return () => {
      gameDataListener?.off();
      clientMetaListener?.off();
      _disposeEngine();
    };
  }, [options, kumoha]);

  return kumoha;
};
