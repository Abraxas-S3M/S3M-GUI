import { useCallback, useEffect, useState } from 'react';
import { backendApiClient } from '../client';
import type { OperationalContextData } from '../types';

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Failed to load operational context';

export interface UseOperationalContextResult {
  operationalContext: OperationalContextData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useOperationalContext = (): UseOperationalContextResult => {
  const [operationalContext, setOperationalContext] = useState<OperationalContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextOperationalContext = await backendApiClient.getOperationalContext();
      setOperationalContext(nextOperationalContext);
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    operationalContext,
    loading,
    error,
    refresh
  };
};
