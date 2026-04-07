import { create } from 'zustand';
import type { BackendCapabilities, SystemStatusData } from '../services/api/types';

type ApiStatus = SystemStatusData['api_status'] | 'unknown';

const defaultCapabilities: BackendCapabilities = {
  live_briefing: false,
  bilingual_summary: false,
  training_metrics: false,
  scenario_ingest: false,
};

interface ConnectionState {
  apiStatus: ApiStatus;
  apiError: string | null;
  statusEndpointAvailable: boolean;
  capabilities: BackendCapabilities;
  updateApiStatus: (status: ApiStatus) => void;
  recordApiError: (message: string) => void;
  clearApiError: () => void;
  setStatusEndpointAvailable: (available: boolean) => void;
  setCapabilities: (next: BackendCapabilities) => void;
  resetCapabilities: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  apiStatus: 'unknown',
  apiError: null,
  statusEndpointAvailable: true,
  capabilities: defaultCapabilities,
  updateApiStatus: (status) => set({ apiStatus: status }),
  recordApiError: (message) => set({ apiError: message }),
  clearApiError: () => set({ apiError: null }),
  setStatusEndpointAvailable: (available) => set({ statusEndpointAvailable: available }),
  setCapabilities: (next) => set({ capabilities: { ...next } }),
  resetCapabilities: () => set({ capabilities: defaultCapabilities }),
}));
