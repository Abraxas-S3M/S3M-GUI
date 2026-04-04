import { useCallback, useEffect, useState } from 'react';
import { backendApiClient } from '../client';
import type { SurveillanceData } from '../types';

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Failed to load surveillance data';

export interface UseSurveillanceResult {
  surveillance: SurveillanceData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useSurveillance = (): UseSurveillanceResult => {
  const [surveillance, setSurveillance] = useState<SurveillanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextSurveillance = await backendApiClient.getSurveillance();
      setSurveillance(nextSurveillance);
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
    surveillance,
    loading,
    error,
    refresh
  };
};
