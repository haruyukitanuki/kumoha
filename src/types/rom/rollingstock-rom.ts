import { type Direction, type PantographType } from 'opentetsu';

export interface RollingStockROMData {
  hasHoldBrake: boolean;
  pantographType: PantographType;
  pantographDirection: {
    [key: number]: (Direction | null)[];
  };
}

export type RollingStockROMDataset = Record<string, RollingStockROMData>;
