import { useEffect, useMemo, useState } from "react";
import {
  GameDataState,
  Kumoha,
  KumohaEngine,
  KumohaEngineOptions,
  KumohaState,
} from "@tanuden/kumoha";

export interface KumohaArisuData {
  gameData: GameDataState["gameData"];
  gameState: GameDataState["gameState"];
  pluginData: GameDataState["pluginData"];
}

export interface KumohaClient {
  connected: boolean;
  state: KumohaState;
  engine: KumohaEngine;
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
}): { client: KumohaClient; data: KumohaArisuData } => {
  const kumoha = useMemo(() => {
    const kumoha = Kumoha(uri, humanReadableRoomId, {
      ...options,
    });
    return kumoha;
  }, []);

  const [data, setData] = useState<KumohaArisuData>(KumohaArisuDataDefaults);
  const [connected, setConnected] = useState<KumohaClient["connected"]>(false);
  const [connectionState, setConnectionState] =
    useState<KumohaClient["state"]>("not-logged-in");

  useEffect(() => {
    console.log("Kumoha API using " + uri);

    const gameDataListener = kumoha.getGameData((gameData) => {
      setData({
        ...KumohaArisuDataDefaults,
        ...gameData,
      });
    });

    const handleKumohaClientChanges = () => {
      setConnected(kumoha.socket.connected);
      setConnectionState(kumoha.state);
    };

    kumoha.socket.onAny(handleKumohaClientChanges);

    return () => {
      gameDataListener.off();
      kumoha.socket.offAny(handleKumohaClientChanges);
    };
  }, []);

  return {
    client: {
      connected: connected,
      state: connectionState,
      engine: kumoha,
    },
    data: data,
  };
};
