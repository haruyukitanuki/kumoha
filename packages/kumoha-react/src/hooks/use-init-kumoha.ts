import { useEffect, useMemo, useState } from "react";
import {
  GameDataState,
  Kumoha,
  KumohaEngine,
  KumohaEngineOptions,
} from "@tanuden/kumoha";

export interface KumohaArisuData {
  gameData: GameDataState["gameData"];
  gameState: GameDataState["gameState"];
  pluginData: GameDataState["pluginData"];
}

export const KumohaArisuDataDefaults: KumohaArisuData = {
  gameData: {} as GameDataState["gameData"],
  gameState: {} as GameDataState["gameState"],
  pluginData: {} as GameDataState["pluginData"],
};

export const useInitKumoha = ({
  uri,
  humanReadableRoomId,
  options,
}: {
  uri: string;
  humanReadableRoomId: string;
  options?: KumohaEngineOptions;
}): { client: KumohaEngine; data: KumohaArisuData } => {
  const kumoha = useMemo(() => {
    const kumoha = Kumoha(uri, humanReadableRoomId, {
      ...options,
    });
    return kumoha;
  }, []);

  const [data, setData] = useState<KumohaArisuData>(KumohaArisuDataDefaults);

  useEffect(() => {
    console.log("Kumoha API using " + uri);

    const gameDataListener = kumoha.getGameData((gameData) => {
      setData({
        ...KumohaArisuDataDefaults,
        ...gameData,
      });
    });

    return () => {
      gameDataListener.off();
    };
  }, []);

  return { client: kumoha, data: data };
};
