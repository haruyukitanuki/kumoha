import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { KumohaError } from "./errors.js";
import { OpenTetsuData } from "opentetsu";
import { GameState } from "./types/opentetsu-additions/game-state.js";
import { PluginState } from "./types/console/plugin-meta.js";

export type KumohaState =
  | "ok"
  | "not-logged-in"
  | "auth-error"
  | "unknown-error"
  | "disconnected";

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
  public state: KumohaState = "disconnected";
  public connectionMetadata?: LoginResponse;

  private _pushClientMeta() {
    const kumohaMeta: KumohaClientMeta = {
      connected: this.socket.connected,
      state: this.state,
      connection: this.connectionMetadata,
    };

    this.listeners.forEach((listener) => {
      listener(kumohaMeta);
    });
  }

  private _setConnectionMeta(connectionMetadata: LoginResponse) {
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
        "X-Device-Type": "display",
      },
      ...socketOptions,
    }).prependAny((_event, data) => {
      this._catchAckErrors(data);
    });

    this.socket.on("connect", () => {
      this._setState("not-logged-in");
    });

    this.socket.on("disconnect", () => {
      this._setState("disconnected");
    });

    this.socket.on("connect_error", () => {
      this._setState("disconnected");
    });
  }

  private _catchAckErrors(data: Record<string, string>) {
    if (data._error) {
      throw new KumohaError(data.because!);
    }
  }

  async login(roomId?: string): Promise<LoginResponse> {
    if (roomId) {
      this.humanReadableRoomId = roomId;
    }

    const response = await this.socket.emitWithAck("auth:login", {
      trafficRoomId: undefined,
      humanReadableRoomId: this.humanReadableRoomId,
    });

    try {
      this._catchAckErrors(response);
    } catch (error) {
      if (!(error instanceof KumohaError) || error.name !== "KumohaError") {
        this._setState("unknown-error");
        throw error;
      }

      if (error.message === "AUTHENTICATION_ERROR") {
        this._setState("auth-error");
      }

      throw error;
    }

    this._setState("ok");
    this._setConnectionMeta(response);

    return response;
  }

  arisuListener(callback: (data: GameDataState) => void): KumohaListener {
    return {
      off: () => this.socket.off("data:post", callback),
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
      },
    };
  }

  dispose() {
    this.socket.disconnect();
  }
}

export const Kumoha = (
  uri: string,
  options?: KumohaEngineOptions
): KumohaEngine => {
  const kumohaEngine = new KumohaEngine(uri, {
    ...options,
  });
  return kumohaEngine;
};
