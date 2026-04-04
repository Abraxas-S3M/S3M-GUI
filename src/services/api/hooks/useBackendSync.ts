import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { backendWebSocket, type WebSocketConnectionStatus } from '../ws/backendWebSocket';
import { useComms } from './useComms';
import { useDecisions } from './useDecisions';
import { useOperationalContext } from './useOperationalContext';
import { useReadiness } from './useReadiness';
import { useRisk } from './useRisk';
import { useSurveillance } from './useSurveillance';
import { useTracks } from './useTracks';

type EndpointKey =
  | 'operationalContext'
  | 'decisions'
  | 'risk'
  | 'tracks'
  | 'readiness'
  | 'surveillance'
  | 'comms';

const MAX_RETRY_DELAY_MS = 60_000;

export function useBackendSync() {
  const operationalContext = useOperationalContext({ enableAutoRefresh: false });
  const decisions = useDecisions();
  const risk = useRisk({ enableAutoRefresh: false });
  const tracks = useTracks({ enableAutoRefresh: false });
  const readiness = useReadiness({ enableAutoRefresh: false });
  const surveillance = useSurveillance({ enablePeriodicRefresh: false });
  const comms = useComms({ enableAutoRefresh: false });
  const [webSocketStatus, setWebSocketStatus] = useState<WebSocketConnectionStatus>(backendWebSocket.getStatus());
  const failureCountsRef = useRef<Record<EndpointKey, number>>({
    operationalContext: 0,
    decisions: 0,
    risk: 0,
    tracks: 0,
    readiness: 0,
    surveillance: 0,
    comms: 0
  });
  const retryTimersRef = useRef<Partial<Record<EndpointKey, number>>>({});

  useEffect(() => {
    backendWebSocket.connect();
    const unsubscribeStatus = backendWebSocket.onStatusChange((status) => {
      setWebSocketStatus(status);
    });

    return () => {
      unsubscribeStatus();
      backendWebSocket.disconnect();
    };
  }, []);

  const fastRefresh = useCallback(async () => {
    await Promise.all([
      operationalContext.refetch(),
      decisions.refetch(),
      tracks.refetch(),
      comms.refetch()
    ]);
  }, [comms.refetch, decisions.refetch, operationalContext.refetch, tracks.refetch]);

  const mediumRefresh = useCallback(async () => {
    await risk.refetch();
  }, [risk.refetch]);

  const slowRefresh = useCallback(async () => {
    await Promise.all([readiness.refetch(), surveillance.refetch()]);
  }, [readiness.refetch, surveillance.refetch]);

  useEffect(() => {
    const fastTimer = window.setInterval(() => {
      void fastRefresh();
    }, 30_000);

    const mediumTimer = window.setInterval(() => {
      void mediumRefresh();
    }, 60_000);

    const slowTimer = window.setInterval(() => {
      void slowRefresh();
    }, 120_000);

    return () => {
      window.clearInterval(fastTimer);
      window.clearInterval(mediumTimer);
      window.clearInterval(slowTimer);
    };
  }, [fastRefresh, mediumRefresh, slowRefresh]);

  const scheduleRetry = useCallback((endpoint: EndpointKey, reason: string, refetch: () => Promise<void>) => {
    if (retryTimersRef.current[endpoint]) {
      return;
    }

    const nextAttempt = failureCountsRef.current[endpoint] + 1;
    failureCountsRef.current[endpoint] = nextAttempt;
    const delay = Math.min(MAX_RETRY_DELAY_MS, 1_000 * 2 ** (nextAttempt - 1));

    console.warn(`[useBackendSync] ${endpoint} failed (${reason}). Retrying in ${delay}ms.`);
    retryTimersRef.current[endpoint] = window.setTimeout(() => {
      retryTimersRef.current[endpoint] = undefined;
      void refetch();
    }, delay);
  }, []);

  const clearRetry = useCallback((endpoint: EndpointKey) => {
    failureCountsRef.current[endpoint] = 0;
    const timer = retryTimersRef.current[endpoint];
    if (timer) {
      window.clearTimeout(timer);
      retryTimersRef.current[endpoint] = undefined;
    }
  }, []);

  useEffect(() => {
    if (operationalContext.error) {
      scheduleRetry('operationalContext', operationalContext.error, operationalContext.refetch);
    } else {
      clearRetry('operationalContext');
    }
  }, [clearRetry, operationalContext.error, operationalContext.refetch, scheduleRetry]);

  useEffect(() => {
    if (decisions.error) {
      scheduleRetry('decisions', decisions.error, decisions.refetch);
    } else {
      clearRetry('decisions');
    }
  }, [clearRetry, decisions.error, decisions.refetch, scheduleRetry]);

  useEffect(() => {
    if (risk.error) {
      scheduleRetry('risk', risk.error, risk.refetch);
    } else {
      clearRetry('risk');
    }
  }, [clearRetry, risk.error, risk.refetch, scheduleRetry]);

  useEffect(() => {
    if (tracks.error) {
      scheduleRetry('tracks', tracks.error, tracks.refetch);
    } else {
      clearRetry('tracks');
    }
  }, [clearRetry, scheduleRetry, tracks.error, tracks.refetch]);

  useEffect(() => {
    if (readiness.error) {
      scheduleRetry('readiness', readiness.error, readiness.refetch);
    } else {
      clearRetry('readiness');
    }
  }, [clearRetry, readiness.error, readiness.refetch, scheduleRetry]);

  useEffect(() => {
    if (surveillance.error) {
      scheduleRetry('surveillance', surveillance.error, surveillance.refetch);
    } else {
      clearRetry('surveillance');
    }
  }, [clearRetry, scheduleRetry, surveillance.error, surveillance.refetch]);

  useEffect(() => {
    if (comms.error) {
      scheduleRetry('comms', comms.error, comms.refetch);
    } else {
      clearRetry('comms');
    }
  }, [clearRetry, comms.error, comms.refetch, scheduleRetry]);

  useEffect(() => {
    return () => {
      const timers = retryTimersRef.current;
      (Object.keys(timers) as EndpointKey[]).forEach((endpoint) => {
        const timer = timers[endpoint];
        if (timer) {
          window.clearTimeout(timer);
        }
      });
    };
  }, []);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      operationalContext.refetch(),
      decisions.refetch(),
      risk.refetch(),
      tracks.refetch(),
      readiness.refetch(),
      surveillance.refetch(),
      comms.refetch()
    ]);
  }, [comms, decisions, operationalContext, readiness, risk, surveillance, tracks]);

  const data = useMemo(
    () => ({
      operationalContext: operationalContext.data,
      decisions: decisions.data,
      risk: risk.data,
      tracks: tracks.data,
      readiness: readiness.data,
      surveillance: surveillance.data,
      comms: comms.data
    }),
    [comms.data, decisions.data, operationalContext.data, readiness.data, risk.data, surveillance.data, tracks.data]
  );

  const loading =
    operationalContext.loading ||
    decisions.loading ||
    risk.loading ||
    tracks.loading ||
    readiness.loading ||
    surveillance.loading ||
    comms.loading;

  const errors = [
    operationalContext.error,
    decisions.error,
    risk.error,
    tracks.error,
    readiness.error,
    surveillance.error,
    comms.error
  ].filter(Boolean) as string[];

  const isFromBackend =
    operationalContext.isFromBackend &&
    decisions.isFromBackend &&
    risk.isFromBackend &&
    tracks.isFromBackend &&
    readiness.isFromBackend &&
    surveillance.isFromBackend &&
    comms.isFromBackend;

  return useMemo(
    () => ({
      data,
      loading,
      error: errors.length > 0 ? errors.join(' | ') : null,
      isFromBackend,
      webSocketStatus,
      refetch: refetchAll,
      refetchAll,
      operationalContext,
      decisions,
      risk,
      tracks,
      readiness,
      surveillance,
      comms
    }),
    [
      comms,
      data,
      decisions,
      errors,
      isFromBackend,
      loading,
      operationalContext,
      readiness,
      refetchAll,
      risk,
      surveillance,
      tracks,
      webSocketStatus
    ]
  );
}
