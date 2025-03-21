import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { KumohaError } from "./errors.js";
import { OpenTetsuData } from "opentetsu";
import { GameState } from "./types/opentetsu-additions/game-state.js";
import { PluginMeta } from "./types/console/plugin-meta.js";

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
  pluginData: Record<string, PluginMeta>;
};

class KumohaEngine {
  public socket: Socket;
  public metadata?: LoginResponse;
  public humanReadableRoomId?: string;

  constructor(
    uri: string,
    humanReadableRoomId: string,
    { socketOptions = {} }: KumohaEngineOptions
  ) {
    this.humanReadableRoomId = humanReadableRoomId;

    this.socket = io(uri, {
      autoConnect: true,
      extraHeaders: {
        "X-Device-Type": "display",
      },
      ...socketOptions,
    }).prependAny((_event, data) => {
      this._catchAckErrors(data);
    });

    this._authInit().then((response) => {
      this.metadata = response;
    });
  }

  private _catchAckErrors(data: Record<string, string>) {
    if (data._error) {
      throw new KumohaError(data.because!);
    }
  }

  private async _authInit(): Promise<LoginResponse> {
    const response = await this.socket.emitWithAck("auth:login", {
      trafficRoomId: undefined,
      humanReadableRoomId: this.humanReadableRoomId,
    });

    this._catchAckErrors(response);

    return response;
  }

  isConnected() {
    return this.socket.connected;
  }

  getGameData(callback: (data: GameDataState) => void) {
    console.log("Listener active: getGameData");
    // return this.socket.on("data:post", callback);

    return {
      listener: this.socket.on("data:post", callback),
      off: () => this.socket.off("data:post", callback),
    };
  }

  dispose() {
    this.socket.disconnect();
  }
}

const Kumoha = (
  uri: string,
  humanReadableRoomId: string,
  options?: KumohaEngineOptions
) => {
  const kumohaEngine = new KumohaEngine(uri, humanReadableRoomId, {
    ...options,
  });
  return kumohaEngine;
};

export { Kumoha, KumohaEngine };
