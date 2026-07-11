import { useCallback, useRef } from 'react';
import type { KumohaConnection } from '@tanuden/kumoha';
import { useKumohaContext } from './use-kumoha-context';

export const useKumohaLogin = (): ((
  connectionCode?: string
) => Promise<KumohaConnection>) => {
  const { client } = useKumohaContext();
  const clientRef = useRef(client);
  clientRef.current = client;

  return useCallback(async (connectionCode?: string) => {
    const client = clientRef.current;
    if (!client) {
      throw new Error(
        'Kumoha client is not ready yet. クモハクライアントが未準備です。'
      );
    }
    return client.login(connectionCode);
  }, []);
};
