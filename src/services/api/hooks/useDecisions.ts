import { useCallback, useEffect, useState } from 'react';
import { backendApiClient } from '../client';
import type { Decision, DecisionStatus } from '../types';

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Failed to load decisions';

export interface UseDecisionsResult {
  decisions: Decision[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateDecisionStatus: (id: string, status: DecisionStatus) => Promise<void>;
}

export const useDecisions = (): UseDecisionsResult => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextDecisions = await backendApiClient.getDecisions();
      setDecisions(nextDecisions);
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDecisionStatus = useCallback(
    async (id: string, status: DecisionStatus) => {
      const updated = await backendApiClient.updateDecisionStatus(id, status);
      setDecisions((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
    },
    []
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    decisions,
    loading,
    error,
    refresh,
    updateDecisionStatus
  };
};
