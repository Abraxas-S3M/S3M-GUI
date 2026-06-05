import { useCallback, useEffect, useMemo, useState } from 'react';

type WorldIntelligenceSource =
  | 'local_self_hosted'
  | 'external_live_fallback'
  | 'offline_safe';

type RuntimeHealth = 'online' | 'fallback' | 'offline';
type ActionMode = 'local' | 'training-safe';

const STATUS_POLL_INTERVAL_MS = 30_000;
const IFRAME_LOAD_TIMEOUT_MS = 15_000;
const KNOWN_SOURCES: WorldIntelligenceSource[] = [
  'local_self_hosted',
  'external_live_fallback',
  'offline_safe',
];

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const resolveApiBaseUrl = (): string => {
  const runtimeEnv = (
    (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {}
  ) as Record<string, unknown>;
  const configuredBaseUrl = runtimeEnv.VITE_S3M_API_URL;
  if (typeof configuredBaseUrl === 'string' && configuredBaseUrl.trim().length > 0) {
    return trimTrailingSlash(configuredBaseUrl.trim());
  }

  if (typeof window !== 'undefined' && typeof window.location?.origin === 'string') {
    return trimTrailingSlash(window.location.origin);
  }

  return '';
};

const readStringByKeys = (
  payload: unknown,
  keys: string[],
): string | undefined => {
  const root = asRecord(payload);
  if (!root) {
    return undefined;
  }

  const queue: Record<string, unknown>[] = [root];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    for (const key of keys) {
      const value = current[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }

    for (const value of Object.values(current)) {
      const nested = asRecord(value);
      if (nested) {
        queue.push(nested);
      }
    }
  }

  return undefined;
};

const readBooleanByKeys = (
  payload: unknown,
  keys: string[],
): boolean | undefined => {
  const root = asRecord(payload);
  if (!root) {
    return undefined;
  }

  const queue: Record<string, unknown>[] = [root];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    for (const key of keys) {
      const value = current[key];
      if (typeof value === 'boolean') {
        return value;
      }
    }

    for (const value of Object.values(current)) {
      const nested = asRecord(value);
      if (nested) {
        queue.push(nested);
      }
    }
  }

  return undefined;
};

const normalizeSource = (candidate: string | undefined): WorldIntelligenceSource => {
  if (!candidate) {
    return 'offline_safe';
  }

  const normalized = candidate.trim().toLowerCase();
  if ((KNOWN_SOURCES as string[]).includes(normalized)) {
    return normalized as WorldIntelligenceSource;
  }

  if (normalized.includes('local')) {
    return 'local_self_hosted';
  }
  if (normalized.includes('fallback') || normalized.includes('external')) {
    return 'external_live_fallback';
  }

  return 'offline_safe';
};

const parseSource = (
  sourcePayload: unknown,
  statusPayload: unknown,
): WorldIntelligenceSource => {
  const directCandidate = readStringByKeys(sourcePayload, [
    'source',
    'current_source',
    'currentSource',
    'mode',
    'runtime_source',
  ]);
  if (directCandidate) {
    return normalizeSource(directCandidate);
  }

  const statusCandidate = readStringByKeys(statusPayload, [
    'source',
    'current_source',
    'currentSource',
    'mode',
    'runtime_source',
  ]);
  return normalizeSource(statusCandidate);
};

const hasHealthySignal = (payload: unknown): boolean => {
  const booleanSignal = readBooleanByKeys(payload, [
    'healthy',
    'ok',
    'online',
    'active',
    'available',
    'is_healthy',
    'isHealthy',
  ]);

  if (booleanSignal === true) {
    return true;
  }

  const statusValue = readStringByKeys(payload, ['status', 'state', 'health']);
  if (!statusValue) {
    return false;
  }

  const normalized = statusValue.toLowerCase();
  return ['online', 'healthy', 'ok', 'up', 'active', 'available', 'ready'].some(
    (value) => normalized.includes(value),
  );
};

const hasFallbackSignal = (payload: unknown): boolean => {
  const fallbackBoolean = readBooleanByKeys(payload, [
    'fallback',
    'fallback_active',
    'fallbackActive',
    'using_fallback',
    'usingFallback',
  ]);

  if (fallbackBoolean === true) {
    return true;
  }

  const fallbackText = readStringByKeys(payload, [
    'status',
    'state',
    'mode',
    'runtime_health',
    'runtimeHealth',
  ]);
  if (!fallbackText) {
    return false;
  }

  const normalized = fallbackText.toLowerCase();
  return normalized.includes('fallback') || normalized.includes('degraded');
};

const parseRuntimeHealth = (
  statusPayload: unknown,
  healthPayload: unknown,
  fallbackHealthPayload: unknown,
): RuntimeHealth => {
  if (hasHealthySignal(healthPayload)) {
    return 'online';
  }

  if (hasHealthySignal(fallbackHealthPayload)) {
    return 'fallback';
  }

  if (hasFallbackSignal(statusPayload) || hasFallbackSignal(fallbackHealthPayload)) {
    return 'fallback';
  }

  return 'offline';
};

const requestJson = async (
  url: string,
  init?: RequestInit,
): Promise<unknown> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const raw = await response.text();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return {};
  }
};

const healthBadgeStyles: Record<RuntimeHealth, string> = {
  online:
    'text-cyber-green bg-cyber-green/15 border border-cyber-green/40',
  fallback:
    'text-s3m-warning bg-s3m-warning/15 border border-s3m-warning/40',
  offline:
    'text-s3m-critical bg-s3m-critical/15 border border-s3m-critical/40',
};

const sourceBadgeStyles: Record<WorldIntelligenceSource, string> = {
  local_self_hosted:
    'text-cyber-cyan bg-cyber-cyan/15 border border-cyber-cyan/35',
  external_live_fallback:
    'text-s3m-warning bg-s3m-warning/15 border border-s3m-warning/35',
  offline_safe:
    'text-s3m-text-secondary bg-s3m-elevated border border-s3m-border-default',
};

export function WorldIntelligenceWorkspace() {
  const apiBaseUrl = useMemo(() => resolveApiBaseUrl(), []);
  const runtimeUrl = useMemo(
    () => `${apiBaseUrl}/world-intelligence/runtime/`,
    [apiBaseUrl],
  );
  const buildApiUrl = useCallback(
    (path: string) => `${apiBaseUrl}${path}`,
    [apiBaseUrl],
  );

  const [source, setSource] = useState<WorldIntelligenceSource>('offline_safe');
  const [runtimeHealth, setRuntimeHealth] = useState<RuntimeHealth>('offline');
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ActionMode | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeLoadError, setIframeLoadError] = useState(false);
  const [iframeLoadTimedOut, setIframeLoadTimedOut] = useState(false);

  const refreshStatus = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoadingStatus(true);
      }

      const [sourceResult, statusResult, healthResult, fallbackHealthResult] =
        await Promise.allSettled([
          requestJson(buildApiUrl('/api/world-intelligence/source')),
          requestJson(buildApiUrl('/api/world-intelligence/status')),
          requestJson(buildApiUrl('/api/world-intelligence/health')),
          requestJson(buildApiUrl('/api/world-intelligence/fallback/health')),
        ]);

      const sourcePayload =
        sourceResult.status === 'fulfilled' ? sourceResult.value : undefined;
      const statusPayload =
        statusResult.status === 'fulfilled' ? statusResult.value : undefined;
      const healthPayload =
        healthResult.status === 'fulfilled' ? healthResult.value : undefined;
      const fallbackHealthPayload =
        fallbackHealthResult.status === 'fulfilled'
          ? fallbackHealthResult.value
          : undefined;

      setSource(parseSource(sourcePayload, statusPayload));
      setRuntimeHealth(
        parseRuntimeHealth(statusPayload, healthPayload, fallbackHealthPayload),
      );

      if (
        sourceResult.status === 'rejected' &&
        statusResult.status === 'rejected' &&
        healthResult.status === 'rejected' &&
        fallbackHealthResult.status === 'rejected'
      ) {
        setStatusError(
          'Status update delayed. Showing last known World Intelligence state.',
        );
      } else {
        setStatusError(null);
      }

      setIsLoadingStatus(false);
    },
    [buildApiUrl],
  );

  useEffect(() => {
    void refreshStatus(false);

    const intervalId = window.setInterval(() => {
      void refreshStatus(true);
    }, STATUS_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshStatus]);

  useEffect(() => {
    setIframeLoaded(false);
    setIframeLoadError(false);
    setIframeLoadTimedOut(false);

    const timeoutId = window.setTimeout(() => {
      setIframeLoadTimedOut(true);
    }, IFRAME_LOAD_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [runtimeUrl, source]);

  const runModeAction = useCallback(
    async (mode: ActionMode) => {
      setActiveAction(mode);
      setStatusError(null);

      try {
        const endpoint =
          mode === 'local'
            ? '/api/world-intelligence/mode/local'
            : '/api/world-intelligence/mode/training-safe';
        await requestJson(buildApiUrl(endpoint), { method: 'POST' });
      } catch {
        setStatusError(
          'Unable to switch mode right now. Backend fallback remains active if configured.',
        );
      } finally {
        await refreshStatus(false);
        setActiveAction(null);
      }
    },
    [buildApiUrl, refreshStatus],
  );

  const runtimeUnavailable =
    runtimeHealth === 'offline' || iframeLoadError || iframeLoadTimedOut;
  const showIframeLoading = !runtimeUnavailable && !iframeLoaded;

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      <div className="bg-s3m-card border border-s3m-border-default rounded-lg p-3 flex flex-wrap items-center gap-3">
        <div className="text-xs uppercase tracking-[0.08em] text-cyber-cyan font-semibold">
          WORLD INTELLIGENCE
        </div>

        <div className="h-5 w-px bg-s3m-border-default" />

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-s3m-text-tertiary">
            Current Source
          </span>
          <span
            className={`text-xs uppercase tracking-wider font-semibold px-2 py-1 rounded ${sourceBadgeStyles[source]}`}
          >
            {source}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-s3m-text-tertiary">
            Runtime Health
          </span>
          <span
            className={`text-xs uppercase tracking-wider font-semibold px-2 py-1 rounded ${healthBadgeStyles[runtimeHealth]}`}
          >
            {runtimeHealth}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void runModeAction('local');
            }}
            disabled={activeAction !== null}
            className="px-3 py-1.5 rounded text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 hover:bg-cyber-cyan/30"
          >
            {activeAction === 'local' ? 'Switching…' : 'Use Local Runtime'}
          </button>
          <button
            type="button"
            onClick={() => {
              void runModeAction('training-safe');
            }}
            disabled={activeAction !== null}
            className="px-3 py-1.5 rounded text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-s3m-warning/20 text-s3m-warning border border-s3m-warning/40 hover:bg-s3m-warning/30"
          >
            {activeAction === 'training-safe'
              ? 'Switching…'
              : 'Training-Safe Fallback'}
          </button>
        </div>
      </div>

      {statusError && (
        <div className="text-xs text-s3m-text-tertiary bg-s3m-elevated border border-s3m-border-default rounded px-3 py-2">
          {statusError}
        </div>
      )}

      <div className="flex-1 min-h-0 bg-s3m-card border border-s3m-border-default rounded-lg overflow-hidden relative">
        {runtimeUnavailable ? (
          <div className="h-full w-full min-h-[calc(100vh-220px)] flex items-center justify-center p-6 text-center text-s3m-text-secondary">
            World Intelligence is temporarily unavailable. Backend fallback remains active if configured.
          </div>
        ) : (
          <>
            {showIframeLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-s3m-text-tertiary bg-s3m-card/95">
                {isLoadingStatus
                  ? 'Loading World Intelligence status...'
                  : 'Loading World Intelligence dashboard...'}
              </div>
            )}
            <iframe
              title="World Intelligence Runtime Dashboard"
              src={runtimeUrl}
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 220px)' }}
              onLoad={() => {
                setIframeLoaded(true);
                setIframeLoadTimedOut(false);
                setIframeLoadError(false);
              }}
              onError={() => {
                setIframeLoadError(true);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
