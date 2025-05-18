import { type OpenTetsuData } from 'opentetsu';

export interface PluginMeta {
  uid: string;
  name: string;
  version: string;
  author: string;
  description?: string;
  __disableTrainCrew?: boolean;
}

export interface PluginState extends PluginMeta {
  data?: object;
  __overrideData?: OpenTetsuData | undefined;
  lastUpdated?: Date;
}

export interface PluginToken {
  uid: string;
  hashedToken: string;
}

// Used for API server request body
export interface PluginData {
  uid: string;
  data: object;
  __overrideData: OpenTetsuData | undefined;
}
