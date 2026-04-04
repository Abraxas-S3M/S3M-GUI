import { useMemo } from 'react';
import { useAppStore } from '../../../app/store';
import { APIClient } from '../APIClient';
import { mockReadinessData } from '../mockData';
import type { ReadinessData } from '../types';
import { useBackendResource } from './shared';

interface UseReadinessOptions {
  enableAutoRefresh?: boolean;
  refreshMs?: number;
}

export function useReadiness(options: UseReadinessOptions = {}) {
  const { enableAutoRefresh = true, refreshMs = 120_000 } = options;
  const setReadiness = useAppStore((state) => state.setReadiness);

  const state = useBackendResource<ReadinessData>({
    hookName: 'useReadiness',
    fetcher: APIClient.getReadiness,
    fallbackData: mockReadinessData,
    refreshMs: enableAutoRefresh ? refreshMs : undefined,
    onStoreSync: (payload, source) => {
      setReadiness(payload, source === 'mock' ? 'mock' : 'backend');
    }
  });

  return useMemo(
    () => ({
      data: state.data,
      loading: state.loading,
      error: state.error,
      isFromBackend: state.isFromBackend,
      refetch: state.refetch
    }),
    [state]
  );
}
