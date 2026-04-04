export interface BackendConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
  requestTimeoutMs: number;
  enableMockBackend: boolean;
}

const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value == null) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const resolveWsBaseUrl = (apiBaseUrl: string): string => {
  if (apiBaseUrl.startsWith('https://')) {
    return apiBaseUrl.replace('https://', 'wss://');
  }

  if (apiBaseUrl.startsWith('http://')) {
    return apiBaseUrl.replace('http://', 'ws://');
  }

  return apiBaseUrl;
};

export const backendConfig: BackendConfig = {
  apiBaseUrl: import.meta.env.VITE_S3M_API_BASE_URL ?? 'http://localhost:8080/api',
  wsBaseUrl: import.meta.env.VITE_S3M_WS_BASE_URL ?? resolveWsBaseUrl(import.meta.env.VITE_S3M_API_BASE_URL ?? 'http://localhost:8080/ws'),
  requestTimeoutMs: Number(import.meta.env.VITE_S3M_REQUEST_TIMEOUT_MS ?? DEFAULT_REQUEST_TIMEOUT_MS),
  enableMockBackend: toBoolean(import.meta.env.VITE_S3M_ENABLE_MOCK_BACKEND, false),
};
