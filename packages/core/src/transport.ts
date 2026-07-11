import {
  io,
  type ManagerOptions,
  type Socket,
  type SocketOptions
} from 'socket.io-client';

export interface KumohaAckError {
  _error: true;
  because: string;
  message?: string;
}

export const isAckError = (value: unknown): value is KumohaAckError =>
  typeof value === 'object' &&
  value !== null &&
  (value as { _error?: unknown })._error === true;

export type KumohaTransportListener = (payload: unknown) => void;

// The seam between the client and the wire. The default is Socket.io against the local console; a
// MockTransport drives the same client in tests, and a future cloud plane can implement this too.
// Payloads and acks cross the wire untyped; the client narrows them where it reads them.
export interface KumohaTransport {
  readonly connected: boolean;
  connect: () => void;
  disconnect: () => void;
  on: (event: string, listener: KumohaTransportListener) => void;
  off: (event: string, listener: KumohaTransportListener) => void;
  emitWithAck: (event: string, payload?: unknown) => Promise<unknown>;
}

export interface SocketIOTransportOptions {
  deviceType?: string;
  socketOptions?: Partial<ManagerOptions & SocketOptions>;
  autoConnect?: boolean;
}

export class SocketIOTransport implements KumohaTransport {
  private readonly _socket: Socket;

  constructor(uri: string, options: SocketIOTransportOptions = {}) {
    const {
      deviceType = 'display',
      socketOptions = {},
      autoConnect = true
    } = options;
    this._socket = io(uri, {
      autoConnect,
      extraHeaders: { 'X-Device-Type': deviceType },
      ...socketOptions
    });
  }

  get connected(): boolean {
    return this._socket.connected;
  }

  connect(): void {
    this._socket.connect();
  }

  disconnect(): void {
    this._socket.close();
  }

  on(event: string, listener: KumohaTransportListener): void {
    this._socket.on(event, listener as (...args: unknown[]) => void);
  }

  off(event: string, listener: KumohaTransportListener): void {
    this._socket.off(event, listener as (...args: unknown[]) => void);
  }

  emitWithAck(event: string, payload?: unknown): Promise<unknown> {
    return this._socket.emitWithAck(event, payload);
  }
}
