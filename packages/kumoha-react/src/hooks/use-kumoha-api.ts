import { useEffect, useMemo, useState } from "react";
import { GameDataState, Kumoha, KumohaEngineOptions } from "@tanuden/kumoha";

export interface KumohaData {
  connected: boolean;
  gameData: GameDataState["gameData"];
  gameState: GameDataState["gameState"];
  pluginData: GameDataState["pluginData"];
}

const useKumohaAPI = ({
  uri,
  humanReadableRoomId,
  options,
}: {
  uri: string;
  humanReadableRoomId: string;
  options?: KumohaEngineOptions;
}): KumohaData => {
  const kumoha = useMemo(() => {
    const kumoha = Kumoha(uri, humanReadableRoomId, {
      ...options,
    });
    return kumoha;
  }, []);

  const [data, setData] = useState<KumohaData>({
    connected: false,
    gameData: {} as GameDataState["gameData"],
    gameState: {} as GameDataState["gameState"],
    pluginData: {} as GameDataState["pluginData"],
  });

  useEffect(() => {
    console.log("Kumoha API using " + uri);

    const gameDataListener = kumoha.getGameData((gameData) => {
      setData({
        connected: kumoha.isConnected(),
        ...gameData,
      });
    });

    return () => {
      gameDataListener.off();
    };
  }, []);

  return data;
};

export { useKumohaAPI };
