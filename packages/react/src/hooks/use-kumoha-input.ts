import { useMemo, useRef } from 'react';
import type { ButtonState, InputAction, Reverser } from '@tanuden/kumoha';
import { useKumohaContext } from './use-kumoha-context';

export interface KumohaInputApi {
  sendButton: (action: InputAction, active: ButtonState) => Promise<void>;
  sendNotch: (power: number, brake: number) => Promise<void>;
  sendBrakeSap: (kPa: number) => Promise<void>;
  sendReverser: (reverser: Reverser) => Promise<void>;
}

// Returns referentially stable callbacks (safe as effect deps / memo deps) that read the current
// client through a ref, so they keep working across reconnects without changing identity.
export const useKumohaInput = (): KumohaInputApi => {
  const { client } = useKumohaContext();
  const clientRef = useRef(client);
  clientRef.current = client;

  // async arrows so a not-ready client rejects rather than throwing synchronously.
  return useMemo<KumohaInputApi>(() => {
    const current = () => {
      const client = clientRef.current;
      if (!client) {
        throw new Error(
          'Kumoha client is not ready yet. クモハクライアントが未準備です。'
        );
      }
      return client;
    };
    return {
      sendButton: async (action, active) =>
        current().sendButton(action, active),
      sendNotch: async (power, brake) => current().sendNotch(power, brake),
      sendBrakeSap: async (kPa) => current().sendBrakeSap(kPa),
      sendReverser: async (reverser) => current().sendReverser(reverser)
    };
  }, []);
};
