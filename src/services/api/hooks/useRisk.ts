import { useCallback, useEffect, useState } from 'react';
import { backendApiClient } from '../client';
import type { RiskData } from '../types';

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Failed to load risk data';

export interface UseRiskResult {
  risk: RiskData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useRisk = (): UseRiskResult => {
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextRisk = await backendApiClient.getRisk();
      setRisk(nextRisk);
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
    risk,
    loading,
    error,
    refresh
  };
};
