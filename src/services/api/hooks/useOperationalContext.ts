import { useMemo } from 'react';
import { useAppStore } from '../../../app/store';
import { APIClient } from '../APIClient';
import { mockOperationalContext } from '../mockData';
import type { OperationalContextData } from '../types';
import { useBackendResource } from './shared';

const OPERATIONAL_CONTEXT_TOPICS = [
  'operational-context.updated',
  'threat.updated',
  'directive.updated',
  'decision.updated'
];

function mergeOperationalContextPayload(payload: unknown, current: OperationalContextData): OperationalContextData | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as Partial<OperationalContextData>;
  if (Array.isArray(candidate.threats) || Array.isArray(candidate.decisions) || Array.isArray(candidate.directives)) {
    return {
      threats: candidate.threats ?? current.threats,
      decisions: candidate.decisions ?? current.decisions,
      directives: candidate.directives ?? current.directives,
      updatedAt: candidate.updatedAt ?? new Date().toISOString()
    };
  }

  return null;
}

interface UseOperationalContextOptions {
  enableAutoRefresh?: boolean;
  refreshMs?: number;
}

export function useOperationalContext(options: UseOperationalContextOptions = {}) {
  const { enableAutoRefresh = true, refreshMs = 30_000 } = options;
  const setOperationalContext = useAppStore((state) => state.setOperationalContext);
  const setDecisions = useAppStore((state) => state.setDecisions);

  const state = useBackendResource<OperationalContextData>({
    hookName: 'useOperationalContext',
    fetcher: APIClient.getOperationalContext,
    fallbackData: mockOperationalContext,
    refreshMs: enableAutoRefresh ? refreshMs : undefined,
    wsTopics: OPERATIONAL_CONTEXT_TOPICS,
    mapWsPayload: mergeOperationalContextPayload,
    onStoreSync: (payload, source) => {
      const storeSource = source === 'mock' ? 'mock' : 'backend';
      setOperationalContext(payload, storeSource);
      setDecisions(payload.decisions, storeSource);
    }
  });

  return useMemo(
    () => ({
      data: state.data,
      loading: state.loading,
      error: state.error,
      refetch: state.refetch,
      isFromBackend: state.isFromBackend
    }),
    [state]
  );
}
