import { create } from 'zustand';

export type ApiStatus = 'healthy' | 'degraded' | 'unavailable' | 'unknown';
export type WsStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';
export type BackendEnvironment = 'local' | 'preview' | 'production';

interface ConnectionState {
  apiStatus: ApiStatus;
  wsStatus: WsStatus;
  lastApiResponseAt: string | null;
  lastWsMessageAt: string | null;
  lastApiLatencyMs: number | null;
  backendEnvironment: BackendEnvironment;
  apiErrorCount: number;

  setApiStatus: (status: ApiStatus) => void;
  setWsStatus: (status: WsStatus) => void;
  recordApiResponse: (latencyMs: number) => void;
  recordApiError: () => void;
  recordWsMessage: () => void;
  resetApiErrors: () => void;
}

function detectEnvironment(): BackendEnvironment {
  const url = import.meta.env.VITE_API_BASE_URL || '';
  if (url.includes('localhost') || url.includes('127.0.0.1')) return 'local';
  if (url.includes('staging') || url.includes('preview')) return 'preview';
  return 'production';
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  apiStatus: 'unknown',
  wsStatus: 'disconnected',
  lastApiResponseAt: null,
  lastWsMessageAt: null,
  lastApiLatencyMs: null,
  backendEnvironment: detectEnvironment(),
  apiErrorCount: 0,

  setApiStatus: (status) => set({ apiStatus: status }),
  setWsStatus: (status) => set({ wsStatus: status }),
  recordApiResponse: (latencyMs) =>
    set({
      lastApiResponseAt: new Date().toISOString(),
      lastApiLatencyMs: latencyMs,
      apiStatus: 'healthy',
      apiErrorCount: 0,
    }),
  recordApiError: () =>
    set((s) => {
      const count = s.apiErrorCount + 1;
      return {
        apiErrorCount: count,
        apiStatus: count >= 3 ? 'unavailable' : 'degraded',
      };
    }),
  recordWsMessage: () =>
    set({
      lastWsMessageAt: new Date().toISOString(),
      wsStatus: 'connected',
    }),
  resetApiErrors: () => set({ apiErrorCount: 0, apiStatus: 'healthy' }),
}));
