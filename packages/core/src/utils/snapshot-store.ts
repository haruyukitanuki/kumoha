import type { KumohaConnectionMeta, KumohaSnapshot } from '../types.js';

export const emptySnapshot = (): KumohaSnapshot => ({
  connection: { connected: false, state: 'disconnected', connection: null },
  outputDataFrame: null,
  simProfile: null,
  userPrefs: {}
});

export interface SnapshotStore {
  getSnapshot: () => KumohaSnapshot;
  subscribe: (listener: () => void) => () => void;
  patch: (patch: Partial<KumohaSnapshot>) => void;
  patchConnection: (patch: Partial<KumohaConnectionMeta>) => void;
}

// The observable snapshot: one immutable value plus change listeners. getSnapshot keeps a stable
// reference between patches so useSyncExternalStore / zustand selectors don't loop.
export const createSnapshotStore = (): SnapshotStore => {
  let snapshot = emptySnapshot();
  const listeners = new Set<() => void>();

  const patch = (partial: Partial<KumohaSnapshot>): void => {
    snapshot = { ...snapshot, ...partial };
    listeners.forEach((listener) => listener());
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    patch,
    patchConnection: (partial) =>
      patch({ connection: { ...snapshot.connection, ...partial } })
  };
};
