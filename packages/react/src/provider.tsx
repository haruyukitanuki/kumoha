import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  createKumohaClient,
  createMockTransport,
  emptySnapshot,
  type KumohaClient,
  type KumohaClientOptions,
  type KumohaMockData,
  type KumohaMockOptions,
  type KumohaSnapshot
} from '@tanuden/kumoha';
import { createStore } from 'zustand/vanilla';
import { KumohaContext, type KumohaContextValue } from './context';

export interface KumohaProviderProps {
  uri?: string;
  options: KumohaClientOptions;
  mock?: KumohaMockData;
  mockOptions?: KumohaMockOptions;
  children: ReactNode;
}

export const KumohaProvider = ({
  uri,
  options,
  mock,
  mockOptions,
  children
}: KumohaProviderProps) => {
  const [store] = useState(() =>
    createStore<KumohaSnapshot>(() => emptySnapshot())
  );
  const [client, setClient] = useState<KumohaClient | null>(null);

  // Consumers pass `options` as a fresh object each render, so read it through a ref to avoid
  // rebuilding the client on that churn. `uri`/`mock` ARE the connection identity — a change rebuilds.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const transport = mock
      ? createMockTransport(mock, mockOptions)
      : optionsRef.current.transport;

    const nextClient = createKumohaClient(uri ?? '', {
      ...optionsRef.current,
      transport,
      autoConnect: false
    });
    const unsubscribe = nextClient.subscribe(() =>
      store.setState(nextClient.getSnapshot(), true)
    );
    store.setState(nextClient.getSnapshot(), true);
    nextClient.connect();
    // A mock has no auth handshake, so log in and pull the profile immediately: the screen then
    // behaves as if a console were attached, even for a scenario-less or profile-only fixture.
    if (mock) {
      void nextClient
        .login(mockOptions?.humanReadableRoomId)
        .catch((error) =>
          console.error('kumoha: mock auto-login failed', error)
        );
      void nextClient
        .fetchProfile()
        .catch((error) =>
          console.error('kumoha: mock profile load failed', error)
        );
    }
    setClient(nextClient);

    return () => {
      unsubscribe();
      nextClient.dispose();
      setClient(null);
      store.setState(emptySnapshot(), true);
    };
  }, [uri, store, mock, mockOptions]);

  const value = useMemo<KumohaContextValue>(
    () => ({ store, client }),
    [store, client]
  );

  return (
    <KumohaContext.Provider value={value}>{children}</KumohaContext.Provider>
  );
};
