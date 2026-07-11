import type { OutputDataFrame, SimulatorProfile } from '@tanuden/rudolf';

import { EVENTS } from './events.js';
import type { KumohaTransport, KumohaTransportListener } from '../transport.js';
import type { KumohaUserPrefs } from '../types.js';

// An in-memory transport that drives a real KumohaClient with no socket. Register canned acks with
// `respond` and push broadcasts with `emit`; useful for offline theme development and previews.
export class MockTransport implements KumohaTransport {
  connected = false;

  private readonly _listeners = new Map<string, Set<KumohaTransportListener>>();
  private readonly _responders = new Map<
    string,
    (payload?: unknown) => unknown
  >();

  connect(): void {
    this.connected = true;
    this.emit('connect', undefined);
  }

  disconnect(): void {
    this.connected = false;
    this.emit('disconnect', undefined);
  }

  on(event: string, listener: KumohaTransportListener): void {
    const set =
      this._listeners.get(event) ?? new Set<KumohaTransportListener>();
    set.add(listener);
    this._listeners.set(event, set);
  }

  off(event: string, listener: KumohaTransportListener): void {
    this._listeners.get(event)?.delete(listener);
  }

  emitWithAck(event: string, payload?: unknown): Promise<unknown> {
    const responder = this._responders.get(event);
    return Promise.resolve(responder?.(payload));
  }

  respond(event: string, responder: (payload?: unknown) => unknown): void {
    this._responders.set(event, responder);
  }

  emit(event: string, payload: unknown): void {
    this._listeners.get(event)?.forEach((listener) => listener(payload));
  }

  listenerCount(event: string): number {
    return this._listeners.get(event)?.size ?? 0;
  }
}

// A static fixture standing in for a live console: one profile plus a single held frame or a sequence
// played on a loop. Import a .json file (the bundler parses it) and pass it straight in.
export interface KumohaMockData {
  simProfile?: SimulatorProfile | null;
  outputDataFrame?: OutputDataFrame;
  outputDataFrames?: OutputDataFrame[];
  userPrefs?: Partial<KumohaUserPrefs>;
}

export interface KumohaMockOptions {
  frameIntervalMs?: number;
  loop?: boolean;
  humanReadableRoomId?: string;
}

// Wires a MockTransport to serve `data`: acks login/profile/prefs, then plays the frame(s) once the
// client connects. A single frame is held static; a sequence advances every `frameIntervalMs`. The
// client fetches the profile only when a frame carries a new `scenarioId`, so give the fixture frame a
// `scenarioId` (as a real export has) — or fetch it explicitly, as the React provider does.
export const createMockTransport = (
  data: KumohaMockData,
  options: KumohaMockOptions = {}
): MockTransport => {
  const {
    frameIntervalMs = 100,
    loop = true,
    humanReadableRoomId = 'MOCK-0000'
  } = options;
  const transport = new MockTransport();
  const outputDataFrames =
    data.outputDataFrames ??
    (data.outputDataFrame ? [data.outputDataFrame] : []);

  transport.respond(EVENTS.login, () => ({
    deviceId: 'display',
    roomId: 'mock',
    humanReadableRoomId
  }));
  transport.respond(EVENTS.profile, () => ({
    simProfile: data.simProfile ?? null
  }));
  transport.respond(EVENTS.userPrefs, () => data.userPrefs ?? {});

  let timer: ReturnType<typeof setInterval> | null = null;

  transport.on('connect', () => {
    if (timer) clearInterval(timer);
    timer = null;
    if (!outputDataFrames.length) return;

    let index = 0;
    const emitNext = (): void => {
      const outputDataFrame = outputDataFrames[index];
      if (outputDataFrame) transport.emit(EVENTS.frame, outputDataFrame);
      index += 1;
      if (index < outputDataFrames.length) return;
      if (loop) {
        index = 0;
        return;
      }
      if (timer) clearInterval(timer);
      timer = null;
    };

    emitNext();
    if (outputDataFrames.length > 1)
      timer = setInterval(emitNext, frameIntervalMs);
  });

  transport.on('disconnect', () => {
    if (timer) clearInterval(timer);
    timer = null;
  });

  return transport;
};
