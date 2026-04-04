import { useCallback, useEffect, useState } from 'react';
import { backendApiClient } from '../client';
import type { CommsData } from '../types';

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Failed to load communications data';

export interface UseCommsResult {
  comms: CommsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useComms = (): UseCommsResult => {
  const [comms, setComms] = useState<CommsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextComms = await backendApiClient.getComms();
      setComms(nextComms);
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
    comms,
    loading,
    error,
    refresh
  };
};
