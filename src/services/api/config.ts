const rawEnv = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const toNumber = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const API_CONFIG = {
  baseUrl: rawEnv.VITE_API_BASE_URL ?? '/api',
  wsUrl: rawEnv.VITE_WS_URL ?? 'ws://localhost:8080/ws',
  timeoutMs: toNumber(rawEnv.VITE_API_TIMEOUT_MS, 10_000),
  useMockBackend: toBoolean(rawEnv.VITE_USE_MOCK_BACKEND, true)
} as const;

export const API_ENDPOINTS = {
  decisions: '/decisions',
  risk: '/risk',
  readiness: '/readiness',
  surveillance: '/surveillance',
  comms: '/comms',
  tracks: '/tracks',
  operationalContext: '/operational-context',
  snapshot: '/snapshot'
} as const;

export const DEFAULT_BACKEND_SYNC_INTERVAL_MS = toNumber(rawEnv.VITE_SYNC_INTERVAL_MS, 30_000);

export const buildApiUrl = (endpoint: string): string => {
  if (/^https?:\/\//.test(endpoint)) {
    return endpoint;
  }

  return `${API_CONFIG.baseUrl}${endpoint}`;
};
