import { type OpenTetsuData } from 'opentetsu';

export interface PluginConfiguration {
  uid: string;
  name: string;
  version: string;
  author: string;
  description?: string;
  __disableTrainCrew?: boolean;
}

export interface PluginState extends PluginConfiguration {
  pluginData?: object;
  gameData?: OpenTetsuData | undefined;
  lastUpdated?: Date;
}
