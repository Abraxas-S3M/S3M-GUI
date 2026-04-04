import { useCallback, useEffect, useState } from 'react';
import { backendApiClient } from '../client';
import type { ReadinessData } from '../types';

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Failed to load readiness data';

export interface UseReadinessResult {
  readiness: ReadinessData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useReadiness = (): UseReadinessResult => {
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextReadiness = await backendApiClient.getReadiness();
      setReadiness(nextReadiness);
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
    readiness,
    loading,
    error,
    refresh
  };
};
