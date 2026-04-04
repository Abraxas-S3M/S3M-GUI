import { useCallback, useMemo } from 'react';
import { useAppStore } from '../../../app/store';
import { APIClient } from '../APIClient';
import { mockSurveillanceData } from '../mockData';
import type { SurveillanceData } from '../types';
import { useBackendResource } from './shared';

interface UseSurveillanceOptions {
  enablePeriodicRefresh?: boolean;
  periodicMs?: number;
}

export function useSurveillance(options: UseSurveillanceOptions = {}) {
  const { enablePeriodicRefresh = true, periodicMs = 90_000 } = options;
  const setSurveillance = useAppStore((state) => state.setSurveillance);

  const state = useBackendResource<SurveillanceData>({
    hookName: 'useSurveillance',
    fetcher: APIClient.getSurveillance,
    fallbackData: mockSurveillanceData,
    refreshMs: enablePeriodicRefresh ? periodicMs : undefined,
    onStoreSync: (payload, source) => {
      setSurveillance(payload, source === 'mock' ? 'mock' : 'backend');
    }
  });

  const requestRefresh = useCallback(async () => {
    await state.refetch();
  }, [state]);

  return useMemo(
    () => ({
      data: state.data,
      loading: state.loading,
      error: state.error,
      isFromBackend: state.isFromBackend,
      refetch: state.refetch,
      requestRefresh
    }),
    [requestRefresh, state]
  );
}
