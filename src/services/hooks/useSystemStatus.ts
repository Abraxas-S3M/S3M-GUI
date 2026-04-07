import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConnectionStore } from '../../app/connectionStore';
import { APIClient, APIClientError } from '../api/client';
import type { SystemStatusData } from '../api/types';

const POLL_INTERVAL_MS = 30_000;
const STATUS_ENDPOINT_UNAVAILABLE = 'Backend status endpoint not available';
const systemStatusClient = new APIClient();

interface SystemStatusQueryState {
  data: SystemStatusData | null;
  isLoading: boolean;
  error: Error | null;
  endpointUnavailable: boolean;
}

export interface UseSystemStatusResult extends SystemStatusQueryState {
  refetch: () => Promise<void>;
}

const asError = (value: unknown, fallback: string): Error =>
  value instanceof Error ? value : new Error(fallback);

const isEndpointNotAvailable = (error: unknown): boolean =>
  error instanceof APIClientError && error.statusCode === 404;

export const useSystemStatus = (): UseSystemStatusResult => {
  const updateApiStatus = useConnectionStore((state) => state.updateApiStatus);
  const recordApiError = useConnectionStore((state) => state.recordApiError);
  const clearApiError = useConnectionStore((state) => state.clearApiError);
  const setStatusEndpointAvailable = useConnectionStore(
    (state) => state.setStatusEndpointAvailable,
  );
  const setCapabilities = useConnectionStore((state) => state.setCapabilities);
  const resetCapabilities = useConnectionStore((state) => state.resetCapabilities);
  const mountedRef = useRef(true);

  const [state, setState] = useState<SystemStatusQueryState>({
    data: null,
    isLoading: true,
    error: null,
    endpointUnavailable: false,
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!mountedRef.current) {
      return;
    }

    setState((current) => ({ ...current, isLoading: true, error: null }));

    try {
      const nextData = await systemStatusClient.getSystemStatus();
      if (!mountedRef.current) {
        return;
      }

      setState({
        data: nextData,
        isLoading: false,
        error: null,
        endpointUnavailable: false,
      });

      updateApiStatus(nextData.api_status);
      clearApiError();
      setStatusEndpointAvailable(true);
      setCapabilities(nextData.capabilities);
    } catch (requestError) {
      if (!mountedRef.current) {
        return;
      }

      if (isEndpointNotAvailable(requestError)) {
        const unavailableError = new Error(STATUS_ENDPOINT_UNAVAILABLE);
        setState({
          data: null,
          isLoading: false,
          error: unavailableError,
          endpointUnavailable: true,
        });
        updateApiStatus('unknown');
        recordApiError(STATUS_ENDPOINT_UNAVAILABLE);
        setStatusEndpointAvailable(false);
        resetCapabilities();
        return;
      }

      const error = asError(requestError, 'Failed to load backend status');
      setState((current) => ({
        ...current,
        isLoading: false,
        error,
        endpointUnavailable: false,
      }));

      updateApiStatus('degraded');
      recordApiError(error.message);
      setStatusEndpointAvailable(true);
    }
  }, [
    clearApiError,
    recordApiError,
    resetCapabilities,
    setCapabilities,
    setStatusEndpointAvailable,
    updateApiStatus,
  ]);

  useEffect(() => {
    void refetch();
    const timer = window.setInterval(() => {
      void refetch();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [refetch]);

  return useMemo(
    () => ({
      ...state,
      refetch,
    }),
    [refetch, state],
  );
};
