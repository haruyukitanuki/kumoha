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
  socketOptions?: Partial<ManagerOptions & SocketOptions>;
};

export type GameDataState = {
  gameData: OpenTetsuData;
  gameState: GameState;
  pluginData: Record<string, PluginState>;
};

export type KumohaClientMeta = {
  connected: boolean;
  state: KumohaState;
  connection?: LoginResponse;
};

export type KumohaListener = {
  off: () => Socket | void;
};

export class KumohaEngine {
  public socket: Socket;
  public humanReadableRoomId?: string;
  public listeners: Array<(kumohaMeta: KumohaClientMeta) => void> = [];
  public state: KumohaState = 'disconnected';
  public connectionMetadata?: LoginResponse;

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

  constructor(uri: string, { socketOptions = {} }: KumohaEngineOptions) {
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
    if (data._error) {
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

    return response;
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
