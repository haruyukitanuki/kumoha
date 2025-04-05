import React, { ReactNode, useMemo } from "react";
import { KumohaArisuData, useInitKumoha } from "../hooks/use-init-kumoha";
import { KumohaDataContext } from "../context";

export const KumohaDataProvider = ({
  kumohaUri,
  humanReadableRoomId: manualHumanReadableRoomId,
  sampleData,
  children,
}: {
  kumohaUri: string;
  humanReadableRoomId?: string;
  sampleData?: KumohaArisuData;
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

  const kumohaAPI = useInitKumoha({
    uri: kumohaUri,
    humanReadableRoomId: humanReadableRoomId,
    options: {
      socketOptions: {
        autoConnect: sampleData ? false : true,
      },
    },
  });

  const data: KumohaArisuData = useMemo(() => {
    if (sampleData) {
      return sampleData;
    }

    return kumohaAPI.data;
  }, [sampleData, kumohaAPI.data]);

  return (
    <KumohaDataContext.Provider
      value={{
        client: kumohaAPI.client,
        data,
      }}
    >
      {children}
    </KumohaDataContext.Provider>
  );
};
