import React, { ReactNode, useMemo } from "react";
import { KumohaData, useInitKumoha } from "../hooks/use-init-kumoha";
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

  const kumohaAPI = useInitKumoha({
    uri: kumohaUri,
    humanReadableRoomId: humanReadableRoomId,
    options: {
      socketOptions: {
        autoConnect: sampleData ? false : true,
      },
    },
  });

  const data: KumohaData = useMemo(() => {
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

export { KumohaDataProvider };
