import {
  io,
  type ManagerOptions,
  Socket,
  type SocketOptions
} from 'socket.io-client';
import { KumohaError } from './errors.js';
import { type OpenTetsuData } from 'opentetsu';
import { type GameState } from './types/opentetsu-additions/game-state.js';
import { type PluginState } from './types/console/plugin-meta.js';
import type { RollingStockROMDataset } from './types/rom/rollingstock-rom.js';
import type { RouteROMDataset } from './types/rom/route-rom.js';

export type KumohaState =
  | 'ok'
  | 'not-logged-in'
  | 'auth-error'
  | 'unknown-error'
  | 'disconnected';

type LoginResponse = {
  deviceId: string;
  roomId: string;
  humanReadableRoomId: string;
  trafficRoomId: string;
};

export type KumohaEngineOptions = {
  themeName?: string;
  socketOptions?: Partial<ManagerOptions & SocketOptions>;
};

export type GameDataState = {
  gameData: OpenTetsuData;
  gameState: GameState;
  pluginData: Record<string, PluginState>;
};

export type KumohaROMDataset = {
  rollingstock: RollingStockROMDataset;
  route: RouteROMDataset;
};

export type KumohaClientMeta = {
  connected: boolean;
  state: KumohaState;
  connection?: LoginResponse;
};

export type KumohaListener = {
  off: () => Socket | void;
};

export interface KumohaThemeUserPrefs {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export class KumohaEngine {
  public socket: Socket;
  /** @internal */
  public humanReadableRoomId?: string;
  /** @internal */
  public listeners: Array<(kumohaMeta: KumohaClientMeta) => void> = []; // This does not contain listeners for socket
  /** @internal */
  public state: KumohaState = 'disconnected';
  /** @internal */
  public connectionMetadata?: LoginResponse;
  /** @internal */
  public themeName?: string;

  private _pushClientMeta() {
    const kumohaMeta: KumohaClientMeta = {
      connected: this.socket.connected,
      state: this.state,
      connection: this.connectionMetadata
    };

    this.listeners.forEach((listener) => {
      listener(kumohaMeta);
    });
  }

  private _setConnectionMeta(connectionMetadata?: LoginResponse) {
    this.connectionMetadata = connectionMetadata;
    this._pushClientMeta();
  }

  private _setState(state: KumohaState) {
    this.state = state;
    this._pushClientMeta();
  }

  constructor(
    uri: string,
    { themeName, socketOptions = {} }: KumohaEngineOptions
  ) {
    this.themeName = themeName;
    this.socket = io(uri, {
      autoConnect: true,
      extraHeaders: {
        'X-Device-Type': 'display'
      },
      ...socketOptions
    }).prependAny((_event, data) => {
      this._catchAckErrors(data);
    });

    this.socket.on('connect', () => {
      console.log('Connected to KumohaEngine.');
      this._setState('not-logged-in');
    });

    this.socket.on('disconnect', () => {
      this._setState('disconnected');
    });

    this.socket.on('connect_error', () => {
      this._setState('disconnected');
    });
  }

  private _catchAckErrors(data: Record<string, string>) {
    if (data?._error) {
      throw new KumohaError(data.because!, data?.message);
    }
  }

  private _handleAckErrors(error: unknown) {
    if (!(error instanceof KumohaError)) {
      this._setState('unknown-error');
      throw error;
    }

    if (error.name === 'AUTHENTICATION_ERROR') {
      this._setState('auth-error');
    }

    throw error;
  }

  async login(roomId?: string): Promise<LoginResponse> {
    if (roomId) {
      this.humanReadableRoomId = roomId;
    }

    const response = await this.socket.emitWithAck('auth:login', {
      trafficRoomId: undefined,
      humanReadableRoomId: this.humanReadableRoomId
    });

    try {
      this._catchAckErrors(response);
    } catch (error) {
      this._handleAckErrors(error);
    }

    this._setState('ok');
    this._setConnectionMeta(response);

    return response;
  }

  async sendButtonAction(action: string, active: boolean | 'pulse') {
    const response = await this.socket.emitWithAck('data:post-button', {
      action,
      active
    });

    try {
      this._catchAckErrors(response);
    } catch (error) {
      this._handleAckErrors(error);
    }

    return response as {
      action: string;
      active: boolean | 'pulse';
    };
  }

  async sendReverser(reverser: number) {
    const response = await this.socket.emitWithAck('data:post-reverser', {
      reverser
    });

    try {
      this._catchAckErrors(response);
    } catch (error) {
      this._handleAckErrors(error);
    }

    return response as {
      reverser: number;
    };
  }

  async sendNotch(
    power: number,
    brake: number,
    type: 'notch' | 'sap' = 'notch'
  ) {
    const response = await this.socket.emitWithAck('data:post-notch', {
      power,
      brake,
      type
    });

    try {
      this._catchAckErrors(response);
    } catch (error) {
      this._handleAckErrors(error);
    }

    return response as {
      power: number;
      brake: number;
    };
  }

  arisuListener(callback: (data: GameDataState) => void): KumohaListener {
    this.socket.on('data:post', callback);
    return {
      off: () => this.socket.off('data:post', callback)
    };
  }

  clientMetaListener(
    callback: (kumohaMeta: KumohaClientMeta) => void
  ): KumohaListener {
    this.listeners.push(callback);

    return {
      off: () => {
        this.listeners = this.listeners.filter(
          (listener) => listener !== callback
        );
      }
    };
  }

  async getROM(): Promise<KumohaROMDataset> {
    const romData = await this.socket.emitWithAck('data:rom', undefined);

    try {
      this._catchAckErrors(romData as Record<string, string>);
    } catch (error) {
      this._handleAckErrors(error);
    }

    return romData as KumohaROMDataset;
  }

  async getUserPrefs(): Promise<KumohaThemeUserPrefs> {
    const userPrefs = await this.socket.emitWithAck('data:user-prefs', {
      themeName: this.themeName
    });

    try {
      this._catchAckErrors(userPrefs as Record<string, string>);
    } catch (error) {
      this._handleAckErrors(error);
    }

    return userPrefs as KumohaThemeUserPrefs;
  }

  userPrefsListener(
    callback: (userPrefs: KumohaThemeUserPrefs) => void
  ): KumohaListener {
    const callbackWithFilter = ({
      themeName,
      userPrefs
    }: {
      themeName: string | undefined;
      userPrefs: KumohaThemeUserPrefs;
    }) => {
      try {
        this._catchAckErrors(userPrefs as Record<string, string>);
      } catch (error) {
        this._handleAckErrors(error);
      }

      if (themeName === this.themeName) {
        callback(userPrefs);
      }
    };

    this.socket.on('data:update-user-prefs', callbackWithFilter);
    return {
      off: () => this.socket.off('data:update-user-prefs', callbackWithFilter)
    };
  }

  dispose() {
    this._setConnectionMeta(undefined);
    this._setState('disconnected');
    this._pushClientMeta();
    this.listeners = [];
    this.socket.close();
  }
}

export const Kumoha = (
  uri: string,
  options?: KumohaEngineOptions
): KumohaEngine => {
  const kumohaEngine = new KumohaEngine(uri, {
    ...options
  });
  return kumohaEngine;
};
