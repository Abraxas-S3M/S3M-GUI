type RuntimeEnv = Record<string, string | boolean | undefined>;

const runtimeEnv: RuntimeEnv = (
  (import.meta as unknown as { env?: RuntimeEnv }).env ?? {}
);

const readEnvString = (key: string, fallback: string): string => {
  const value = runtimeEnv[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return fallback;
};

const readEnvNumber = (key: string, fallback: number): number => {
  const value = runtimeEnv[key];
  if (typeof value !== 'string') {
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
    return value.toLowerCase() === 'true';
  }

  return fallback;
};

export const API_BASE_URL = readEnvString(
  'VITE_API_BASE_URL',
  'http://localhost:8080/api/v1',
);

const resolveWsUrl = (apiBaseUrl: string): string => {
  const explicitWsUrl = readEnvString('VITE_WS_URL', '');
  if (explicitWsUrl.length > 0) {
    return explicitWsUrl;
  }

  try {
    const parsed = new URL(apiBaseUrl);
    parsed.protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    parsed.pathname = '/ws';
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return 'ws://localhost:8080/ws';
  }
};

export const API_TRANSPORT = readEnvString('VITE_API_TRANSPORT', 'fetch')
  .toLowerCase() as 'fetch' | 'axios';

export const API_BACKEND_MODE = readEnvString('VITE_API_BACKEND_MODE', 'mock')
  .toLowerCase() as 'mock' | 'real';

export const USE_MOCK_BACKEND = readEnvBoolean(
  'VITE_USE_MOCK_BACKEND',
  API_BACKEND_MODE !== 'real',
);

export const API_RETRY_ATTEMPTS = readEnvNumber('VITE_API_RETRY_ATTEMPTS', 2);
export const API_RETRY_BASE_DELAY_MS = readEnvNumber(
  'VITE_API_RETRY_BASE_DELAY_MS',
  300,
);
export const API_TIMEOUT_MS = readEnvNumber('VITE_API_TIMEOUT_MS', 8000);
export const MOCK_API_LATENCY_MS = readEnvNumber('VITE_MOCK_API_LATENCY_MS', 350);
export const DEFAULT_BACKEND_SYNC_INTERVAL_MS = readEnvNumber('VITE_BACKEND_SYNC_INTERVAL_MS', 60_000);

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

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  wsUrl: resolveWsUrl(API_BASE_URL),
  useMock: USE_MOCK_BACKEND,
} as const;
