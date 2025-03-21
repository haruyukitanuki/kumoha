import React, { ReactNode, useMemo } from "react";
import { useKumohaAPI } from "../hooks/use-kumoha-api";
import { KumohaDataContext } from "../context";

const KumohaDataProvider = ({
  kumohaUri,
  humanReadableRoomId: manualHumanReadableRoomId,
  children,
}: {
  kumohaUri: string;
  humanReadableRoomId?: string;
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
  });

  const data = useMemo(() => {
    return kumohaAPI;
  }, [kumohaAPI.gameData]);

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
