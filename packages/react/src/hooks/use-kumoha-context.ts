import { useContext } from 'react';
import { KumohaContext, type KumohaContextValue } from '../context';

export const useKumohaContext = (): KumohaContextValue => {
  const context = useContext(KumohaContext);
  if (!context) {
    throw new Error(
      'Kumoha hooks must be used inside <KumohaProvider>. フックは<KumohaProvider>内で使用してください。'
    );
  }
  return context;
};
