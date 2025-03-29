import React, { ReactNode, useMemo } from "react";
import { KumohaData, useKumohaAPI } from "../hooks/use-kumoha-api";
import { KumohaDataContext } from "../context";

const KumohaDataProvider = ({
  kumohaUri,
  humanReadableRoomId: manualHumanReadableRoomId,
  sampleData,
  children,
}: {
  kumohaUri: string;
  humanReadableRoomId?: string;
  sampleData?: KumohaData;
  children: ReactNode;
}): ReactNode => {
  const humanReadableRoomId = useMemo(() => {
    if (manualHumanReadableRoomId) {
      return manualHumanReadableRoomId;
    }

    // read query parameter
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("room") || "";
  }, []);

  const kumohaAPI = useKumohaAPI({
    uri: kumohaUri,
    humanReadableRoomId: humanReadableRoomId,
    options: {
      socketOptions: {
        autoConnect: sampleData ? false : true,
      },
    },
  });

  const data = useMemo(() => {
    if (sampleData) {
      return sampleData;
    }

    return kumohaAPI;
  }, [sampleData, kumohaAPI.gameData]);

  return (
    <KumohaDataContext.Provider
      value={{
        data,
      }}
    >
      {children}
    </KumohaDataContext.Provider>
  );
};

export { KumohaDataProvider };
