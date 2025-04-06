// import React, { ReactNode, useMemo } from "react";
// import { KumohaArisuData, useKumoha } from "../hooks/use-kumoha";
// import { KumohaDataContext } from "../context";

// export const KumohaDataProvider = ({
//   kumohaUri,
//   sampleData,
//   manualHumanReadableRoomId,
//   children,
// }: {
//   kumohaUri: string;
//   sampleData?: KumohaArisuData;
//   manualHumanReadableRoomId?: string;
//   children: ReactNode;
// }): ReactNode => {
//   const humanReadableRoomId = useMemo(() => {
//     if (manualHumanReadableRoomId) {
//       return manualHumanReadableRoomId;
//     }

//     // read query parameter
//     const urlParams = new URLSearchParams(window.location.search);
//     return urlParams.get("room") || "";
//   }, []);

//   const kumohaAPI = useKumoha(kumohaUri, humanReadableRoomId, {
//     socketOptions: {
//       autoConnect: false,
//     },
//   });

//   const data: KumohaArisuData = useMemo(() => {
//     if (sampleData) {
//       return sampleData;
//     }

//     return kumohaAPI.data;
//   }, [sampleData, kumohaAPI.data]);

//   return (
//     <KumohaDataContext.Provider
//       value={{
//         client: kumohaAPI.client,
//         data,
//       }}
//     >
//       {children}
//     </KumohaDataContext.Provider>
//   );
// };
