import { useCallback, useEffect, useState } from 'react';
import { backendApiClient } from '../client';
import type { OperationalContextData } from '../types';

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Failed to load operational context';

export interface UseOperationalContextResult {
  operationalContext: OperationalContextData | null;
  data: OperationalContextData | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface LegacyHookClient {
  get?: (path: string) => Promise<{ data: OperationalContextData }>;
}

interface UseOperationalContextOptions {
  refreshIntervalMs?: number;
}

export const useOperationalContext = (
  legacyClient?: LegacyHookClient,
  options: UseOperationalContextOptions = {}
): UseOperationalContextResult => {
  const [operationalContext, setOperationalContext] = useState<OperationalContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshIntervalMs } = options;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextOperationalContext = legacyClient && typeof (legacyClient as LegacyHookClient).get === 'function'
        ? (await (legacyClient as LegacyHookClient).get!('/operational-context')).data
        : await backendApiClient.getOperationalContext();
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

  useEffect(() => {
    if (!refreshIntervalMs || refreshIntervalMs <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      void refresh();
    }, refreshIntervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [refresh, refreshIntervalMs]);

  return {
    operationalContext,
    data: operationalContext,
    loading,
    isLoading: loading,
    error,
    refresh
  };
};
