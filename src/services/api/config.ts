type RuntimeEnv = Record<string, string | boolean | undefined>;

const runtimeEnv: RuntimeEnv = (
  (import.meta as unknown as { env?: RuntimeEnv }).env ?? {}
);

const readRawEnvString = (key: string): string | undefined => {
  const value = runtimeEnv[key];
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const readEnvString = (key: string, fallback: string): string =>
  readRawEnvString(key) ?? fallback;

const readEnvNumber = (key: string, fallback: number): number => {
  const value = readRawEnvString(key);
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readEnvBoolean = (key: string, fallback: boolean): boolean => {
  const value = runtimeEnv[key];
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return fallback;
};

const resolveWsUrl = (baseUrl: string): string => {
  if (baseUrl.startsWith('https://')) {
    return baseUrl.replace('https://', 'wss://');
  }

  if (baseUrl.startsWith('http://')) {
    return baseUrl.replace('http://', 'ws://');
  }

  return baseUrl;
};

export const API_BASE_URL = readEnvString(
  'VITE_API_BASE_URL',
  'http://localhost:8080/api/v1',
);

export const API_TRANSPORT = readEnvString('VITE_API_TRANSPORT', 'fetch')
  .toLowerCase() as 'fetch' | 'axios';

export const API_BACKEND_MODE = readEnvString('VITE_API_BACKEND_MODE', 'mock')
  .toLowerCase() as 'mock' | 'real';

const hasExplicitApiBaseUrl = readRawEnvString('VITE_API_BASE_URL') != null;
const useMockRawValue = runtimeEnv.VITE_USE_MOCK_BACKEND;
const useMockRawString = typeof useMockRawValue === 'string' ? useMockRawValue.trim().toLowerCase() : '';

if (
  runtimeEnv.PROD === true &&
  (!hasExplicitApiBaseUrl || useMockRawValue === true || useMockRawString === 'true')
) {
  throw new Error(
    '[S3M] FATAL: Production build requires VITE_API_BASE_URL and VITE_USE_MOCK_BACKEND=false',
  );
}

const apiBaseUrl = readEnvString('VITE_API_BASE_URL', 'http://localhost:8080/api/v1');

export const API_CONFIG = {
  baseUrl: apiBaseUrl,
  wsUrl: readEnvString('VITE_WS_URL', resolveWsUrl(apiBaseUrl)),
  useMock: readEnvBoolean('VITE_USE_MOCK_BACKEND', runtimeEnv.DEV === true),
  timeoutMs: readEnvNumber('VITE_API_TIMEOUT_MS', 8000),
  retryAttempts: 2,
  retryBaseDelayMs: 300,
  mockLatencyMs: 350,
} as const;

export const API_RETRY_ATTEMPTS = API_CONFIG.retryAttempts;
export const API_RETRY_BASE_DELAY_MS = API_CONFIG.retryBaseDelayMs;
export const API_TIMEOUT_MS = API_CONFIG.timeoutMs;
export const MOCK_API_LATENCY_MS = API_CONFIG.mockLatencyMs;

export const WORKSPACE_ENDPOINTS = {
  command: '/workspaces/command',
  cop: '/workspaces/cop',
  decisions: '/workspaces/decisions',
  risk: '/workspaces/risk',
  planning: '/workspaces/planning',
  sustainment: '/workspaces/sustainment',
  readiness: '/workspaces/readiness',
  cyber: '/workspaces/cyber',
  simulation: '/workspaces/simulation',
  communication: '/workspaces/communication',
  surveillance: '/workspaces/surveillance',
} as const;

export const COMMAND_ENDPOINTS = {
  operationalContext: `${WORKSPACE_ENDPOINTS.command}/operational-context`,
  timeline: `${WORKSPACE_ENDPOINTS.command}/timeline-events`,
} as const;

export const COP_ENDPOINTS = {
  tracks: `${WORKSPACE_ENDPOINTS.cop}/tracks`,
  threatTracks: `${WORKSPACE_ENDPOINTS.cop}/threat-tracks`,
} as const;

export const DECISION_ENDPOINTS = {
  list: `${WORKSPACE_ENDPOINTS.decisions}/queue`,
  approve: (id: string): string =>
    `${WORKSPACE_ENDPOINTS.decisions}/queue/${encodeURIComponent(id)}/approve`,
  reject: (id: string): string =>
    `${WORKSPACE_ENDPOINTS.decisions}/queue/${encodeURIComponent(id)}/reject`,
} as const;

export const RISK_ENDPOINTS = {
  metrics: `${WORKSPACE_ENDPOINTS.risk}/metrics`,
} as const;

export const PLANNING_ENDPOINTS = {
  phases: `${WORKSPACE_ENDPOINTS.planning}/phases`,
  coursesOfAction: `${WORKSPACE_ENDPOINTS.planning}/coas`,
} as const;

export const SUSTAINMENT_ENDPOINTS = {
  fleet: `${WORKSPACE_ENDPOINTS.sustainment}/fleet`,
  supply: `${WORKSPACE_ENDPOINTS.sustainment}/supply`,
} as const;

export const READINESS_ENDPOINTS = {
  summary: `${WORKSPACE_ENDPOINTS.readiness}/summary`,
} as const;

export const CYBER_ENDPOINTS = {
  incidents: `${WORKSPACE_ENDPOINTS.cyber}/incidents`,
  resilience: `${WORKSPACE_ENDPOINTS.cyber}/resilience`,
} as const;

export const SIMULATION_ENDPOINTS = {
  scenarios: `${WORKSPACE_ENDPOINTS.simulation}/scenarios`,
} as const;

export const COMMUNICATION_ENDPOINTS = {
  inbox: `${WORKSPACE_ENDPOINTS.communication}/messages`,
  send: `${WORKSPACE_ENDPOINTS.communication}/messages/send`,
} as const;

export const SURVEILLANCE_ENDPOINTS = {
  assets: `${WORKSPACE_ENDPOINTS.surveillance}/assets`,
} as const;

export const SYSTEM_ENDPOINTS = {
  status: '/system/status',
} as const;

