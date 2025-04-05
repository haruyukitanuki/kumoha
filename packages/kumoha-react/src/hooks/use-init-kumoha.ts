import { useEffect, useMemo, useState } from "react";
import {
  GameDataState,
  Kumoha,
  KumohaEngine,
  KumohaEngineOptions,
  KumohaState,
} from "@tanuden/kumoha";

export interface KumohaData {
  connected: boolean;
  state: KumohaState;
  gameData: GameDataState["gameData"];
  gameState: GameDataState["gameState"];
  pluginData: GameDataState["pluginData"];
}

export const kumohaDataDefaults: KumohaData = {
  connected: false,
  state: "disconnected",
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
}): { client: KumohaEngine; data: KumohaData } => {
  const kumoha = useMemo(() => {
    const kumoha = Kumoha(uri, humanReadableRoomId, {
      ...options,
    });
    return kumoha;
  }, []);

  const [data, setData] = useState<KumohaData>(kumohaDataDefaults);

  useEffect(() => {
    console.log("Kumoha API using " + uri);

    const gameDataListener = kumoha.getGameData((gameData) => {
      setData({
        ...kumohaDataDefaults,
        connected: kumoha.isConnected(),
        state: kumoha.state,
        ...gameData,
      });
    });

    return () => {
      gameDataListener.off();
    };
  }, []);

  return { client: kumoha, data: data };
};
