type PlatformPos = number[];
type PlatformMultiPos = Record<number, number[]>;
type StopPos = PlatformPos | PlatformMultiPos | undefined;

export interface RouteROMData {
  id: number;
  japaneseName: string;
  japaneseNameDiagram?: string;
  name: string;
  kana: string;
  isPassengerStop: boolean;
  isTimeTaken: boolean;
  inboundData: {
    stopPositions: StopPos;
    markers: {
      type: string;
      remainingDistance: number;
    }[];
  };
  outboundData: {
    stopPositions: StopPos;
    markers: {
      type: string;
      remainingDistance: number;
    }[];
  };
}

export type RouteROMDataset = RouteROMData[];
