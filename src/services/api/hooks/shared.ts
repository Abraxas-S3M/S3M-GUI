import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { backendWebSocket } from '../ws/backendWebSocket';

type SourceMode = 'backend' | 'mock';

interface UseBackendResourceOptions<T> {
  hookName: string;
  fetcher: () => Promise<T>;
  fallbackData: T;
  refreshMs?: number;
  wsTopics?: string[];
  onStoreSync?: (payload: T, source: SourceMode | 'websocket') => void;
  mapWsPayload?: (payload: unknown, current: T) => T | null;
}

export interface BackendHookState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  isFromBackend: boolean;
  refetch: () => Promise<void>;
}

function asErrorMessage(error: unknown, action: string): string {
  if (error instanceof Error) {
    return `${action}: ${error.message}`;
  }
  return `${action}: Unknown error`;
}

export function useBackendResource<T>({
  hookName,
  fetcher,
  fallbackData,
  refreshMs,
  wsTopics = [],
  onStoreSync,
  mapWsPayload
}: UseBackendResourceOptions<T>): BackendHookState<T> {
  const [data, setData] = useState<T>(fallbackData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromBackend, setIsFromBackend] = useState<boolean>(false);
  const sourceRef = useRef<SourceMode>('mock');

  const logSourceSwitch = useCallback(
    (next: SourceMode) => {
      if (sourceRef.current === next) {
        return;
      }
      sourceRef.current = next;
      console.info(`[${hookName}] Switched to ${next === 'backend' ? 'real backend data' : 'mock fallback data'}.`);
    },
    [hookName]
  );

  const syncPayload = useCallback(
    (payload: T, source: SourceMode | 'websocket') => {
      setData(payload);
      if (source === 'backend' || source === 'websocket') {
        setIsFromBackend(true);
      } else if (source === 'mock') {
        setIsFromBackend(false);
      }
      onStoreSync?.(payload, source);
    },
    [onStoreSync]
  );

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const backendPayload = await fetcher();
      setError(null);
      logSourceSwitch('backend');
      syncPayload(backendPayload, 'backend');
    } catch (err) {
      const message = asErrorMessage(err, 'Unable to fetch backend data');
      setError(message);
      logSourceSwitch('mock');
      syncPayload(fallbackData, 'mock');
      console.warn(`[${hookName}] ${message}`);
    } finally {
      setLoading(false);
    }
  }, [fallbackData, fetcher, hookName, logSourceSwitch, syncPayload]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!refreshMs) {
      return;
    }

    const timer = window.setInterval(() => {
      void refetch();
    }, refreshMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [refreshMs, refetch]);

  useEffect(() => {
    if (wsTopics.length === 0) {
      return;
    }

    const unsubscribers = wsTopics.map((topic) =>
      backendWebSocket.subscribe(topic, (payload) => {
        setLoading(false);
        try {
          const nextPayload = mapWsPayload ? mapWsPayload(payload, data) : (payload as T);
          if (!nextPayload) {
            return;
          }
          setError(null);
          syncPayload(nextPayload, 'websocket');
        } catch (err) {
          const message = asErrorMessage(err, `Failed to process websocket topic "${topic}"`);
          setError(message);
          console.warn(`[${hookName}] ${message}`);
        }
      })
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [data, hookName, mapWsPayload, syncPayload, wsTopics]);

  return useMemo(
    () => ({
      data,
      loading,
      error,
      isFromBackend,
      refetch
    }),
    [data, loading, error, isFromBackend, refetch]
  );
}

export function parseHookError(error: unknown, context: string): string {
  if (error instanceof Error) {
    return `${context}: ${error.message}`;
  }
  return `${context}: Unknown error`;
}
