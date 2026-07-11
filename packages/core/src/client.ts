import type {
  InputAction,
  OutputDataFrame,
  Reverser,
  SimulatorProfile
} from '@tanuden/rudolf';

import { EVENTS } from './utils/events.js';
import { KumohaError } from './utils/errors.js';
import {
  createSnapshotStore,
  type SnapshotStore
} from './utils/snapshot-store.js';
import { shareStructure } from './utils/structural-sharing.js';
import {
  SocketIOTransport,
  isAckError,
  type KumohaTransport
} from './transport.js';
import type {
  ButtonState,
  KumohaClientOptions,
  KumohaConnection,
  KumohaConnectionState,
  KumohaSnapshot,
  KumohaUserPrefs
} from './types.js';

export class KumohaClient {
  private readonly _transport: KumohaTransport;
  private readonly _themeName: string;
  private readonly _structuralSharing: boolean;
  private readonly _store: SnapshotStore = createSnapshotStore();

  private _scenarioId: string | null = null;
  private _connectionCode?: string;

  private readonly _onConnect = (): void => {
    this._store.patchConnection({
      connected: true,
      state: 'not-authenticated'
    });
    // Room membership is per-socket: a reconnect lands on a fresh socket, so re-authenticate once a
    // code is known, or the display silently stops receiving telemetry.
    if (this._connectionCode !== undefined) {
      void this.login(this._connectionCode).catch((error) =>
        console.error('kumoha: re-authentication after reconnect failed', error)
      );
    }
  };

  private readonly _onDisconnect = (): void => {
    this._store.patchConnection({
      connected: false,
      state: 'disconnected',
      connection: null
    });
  };

  private readonly _onConnectError = (): void => {
    this._store.patchConnection({ connected: false, state: 'error' });
  };

  private readonly _onFrame = (payload: unknown): void => {
    const outputDataFrame = payload as OutputDataFrame;
    const previous = this._store.getSnapshot().outputDataFrame;
    const next = this._structuralSharing
      ? shareStructure(previous, outputDataFrame)
      : outputDataFrame;
    if (next !== previous) this._store.patch({ outputDataFrame: next });

    // The profile is scenario-scoped: refetch when the sim loads a new scenario.
    if (
      outputDataFrame.scenarioId &&
      outputDataFrame.scenarioId !== this._scenarioId
    ) {
      this._scenarioId = outputDataFrame.scenarioId;
      void this.fetchProfile().catch((error) =>
        console.error('kumoha: failed to fetch profile', error)
      );
    }
  };

  private readonly _onPrefsUpdate = (payload: unknown): void => {
    const { themeName, userPrefs } = (payload ?? {}) as {
      themeName?: string;
      userPrefs?: Partial<KumohaUserPrefs>;
    };
    if (themeName !== this._themeName) return;
    this._store.patch({ userPrefs: userPrefs ?? {} });
  };

  constructor(uri: string, options: KumohaClientOptions) {
    const {
      themeName,
      transport,
      socketOptions,
      autoConnect = true,
      structuralSharing = true
    } = options;

    this._themeName = themeName;
    this._structuralSharing = structuralSharing;
    this._transport =
      transport ??
      new SocketIOTransport(uri, {
        deviceType: 'display',
        socketOptions,
        autoConnect
      });

    this._transport.on(EVENTS.frame, this._onFrame);
    this._transport.on(EVENTS.userPrefsUpdate, this._onPrefsUpdate);
    this._transport.on('connect', this._onConnect);
    this._transport.on('disconnect', this._onDisconnect);
    this._transport.on('connect_error', this._onConnectError);
  }

  getSnapshot(): KumohaSnapshot {
    return this._store.getSnapshot();
  }

  subscribe(listener: () => void): () => void {
    return this._store.subscribe(listener);
  }

  connect(): void {
    this._transport.connect();
  }

  async login(connectionCode?: string): Promise<KumohaConnection> {
    this._connectionCode = connectionCode;
    this._store.patchConnection({ state: 'connecting' });

    try {
      const connection = await this._request<KumohaConnection>(EVENTS.login, {
        humanReadableRoomId: connectionCode
      });
      this._store.patchConnection({
        connected: true,
        state: 'authenticated',
        connection
      });
      void this.fetchUserPrefs().catch((error) =>
        console.error('kumoha: failed to fetch user prefs', error)
      );
      return connection;
    } catch (error) {
      this._store.patchConnection({ state: this._stateForError(error) });
      throw error;
    }
  }

  dispose(): void {
    this._transport.off(EVENTS.frame, this._onFrame);
    this._transport.off(EVENTS.userPrefsUpdate, this._onPrefsUpdate);
    this._transport.off('connect', this._onConnect);
    this._transport.off('disconnect', this._onDisconnect);
    this._transport.off('connect_error', this._onConnectError);
    this._transport.disconnect();
  }

  async fetchProfile(): Promise<SimulatorProfile | null> {
    const { simProfile } = await this._request<{
      simProfile: SimulatorProfile | null;
    }>(EVENTS.profile);
    this._store.patch({ simProfile });
    return simProfile;
  }

  async fetchUserPrefs<T = Partial<KumohaUserPrefs>>(): Promise<T> {
    const userPrefs = await this._request<T>(EVENTS.userPrefs, {
      themeName: this._themeName
    });
    this._store.patch({ userPrefs: userPrefs as Partial<KumohaUserPrefs> });
    return userPrefs;
  }

  // Cab input. Two-handle notch only (the console has no single-handle path); acks are echoes, not
  // applied-state confirmations.
  async sendButton(action: InputAction, active: ButtonState): Promise<void> {
    await this._request(EVENTS.button, { action, active });
  }

  async sendNotch(power: number, brake: number): Promise<void> {
    await this._request(EVENTS.notch, { power, brake, type: 'notch' });
  }

  async sendBrakeSap(kPa: number): Promise<void> {
    await this._request(EVENTS.notch, { power: 0, brake: kPa, type: 'sap' });
  }

  async sendReverser(reverser: Reverser): Promise<void> {
    await this._request(EVENTS.reverser, { reverser });
  }

  private async _request<Res>(event: string, payload?: unknown): Promise<Res> {
    const response = await this._transport.emitWithAck(event, payload);
    if (isAckError(response)) {
      throw new KumohaError(response.because, response.message);
    }
    return response as Res;
  }

  private _stateForError(error: unknown): KumohaConnectionState {
    if (
      error instanceof KumohaError &&
      error.reason === 'AUTHENTICATION_ERROR'
    ) {
      return 'auth-error';
    }
    return 'error';
  }
}

export const createKumohaClient = (
  uri: string,
  options: KumohaClientOptions
): KumohaClient => new KumohaClient(uri, options);
