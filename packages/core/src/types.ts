import type { OutputDataFrame, SimulatorProfile } from '@tanuden/rudolf';
import type { ManagerOptions, SocketOptions } from 'socket.io-client';
import type { KumohaTransport } from './transport.js';

export type KumohaConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'not-authenticated'
  | 'authenticated'
  | 'auth-error'
  | 'error';

export type ButtonState = boolean | 'pulse';

export interface KumohaConnection {
  deviceId: string;
  roomId: string;
  humanReadableRoomId: string;
}

export interface KumohaConnectionMeta {
  connected: boolean;
  state: KumohaConnectionState;
  connection: KumohaConnection | null;
}

// Augment via `declare module '@tanuden/kumoha'` to type your theme's setting keys.
export interface KumohaUserPrefs {
  [key: string]: unknown;
}

export interface KumohaSnapshot {
  connection: KumohaConnectionMeta;
  outputDataFrame: OutputDataFrame | null;
  simProfile: SimulatorProfile | null;
  userPrefs: Partial<KumohaUserPrefs>;
}

export interface KumohaClientOptions {
  themeName: string;
  transport?: KumohaTransport;
  socketOptions?: Partial<ManagerOptions & SocketOptions>;
  autoConnect?: boolean;
  structuralSharing?: boolean;
}
