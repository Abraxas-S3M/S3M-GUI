import { useMemo } from 'react';
import { useAppStore } from '../../../app/store';
import { APIClient } from '../APIClient';
import { mockRiskData } from '../mockData';
import type { RiskData } from '../types';
import { useBackendResource } from './shared';

const RISK_TOPICS = ['risk.updated', 'risk.driver.updated'];

function mergeRiskPayload(payload: unknown, current: RiskData): RiskData | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as Partial<RiskData>;
  const hasRiskData =
    typeof candidate.composite === 'number' ||
    Array.isArray(candidate.domains) ||
    Array.isArray(candidate.forecast) ||
    Array.isArray(candidate.drivers);

  if (!hasRiskData) {
    return null;
  }

  return {
    composite: candidate.composite ?? current.composite,
    domains: candidate.domains ?? current.domains,
    forecast: candidate.forecast ?? current.forecast,
    drivers: candidate.drivers ?? current.drivers,
    updatedAt: candidate.updatedAt ?? new Date().toISOString()
  };
}

interface UseRiskOptions {
  enableAutoRefresh?: boolean;
  refreshMs?: number;
}

export function useRisk(options: UseRiskOptions = {}) {
  const { enableAutoRefresh = true, refreshMs = 60_000 } = options;
  const setRiskData = useAppStore((state) => state.setRiskData);

  const state = useBackendResource<RiskData>({
    hookName: 'useRisk',
    fetcher: APIClient.getRisk,
    fallbackData: mockRiskData,
    refreshMs: enableAutoRefresh ? refreshMs : undefined,
    wsTopics: RISK_TOPICS,
    mapWsPayload: mergeRiskPayload,
    onStoreSync: (payload, source) => {
      setRiskData(payload, source === 'mock' ? 'mock' : 'backend');
    }
  });

  return useMemo(
    () => ({
      data: state.data,
      composite: state.data.composite,
      domains: state.data.domains,
      forecast: state.data.forecast,
      drivers: state.data.drivers,
      loading: state.loading,
      error: state.error,
      isFromBackend: state.isFromBackend,
      refetch: state.refetch
    }),
    [state]
  );
}
