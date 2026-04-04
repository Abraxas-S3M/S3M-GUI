import type { Decision } from './types';

export interface BackendSyncState {
  backendConnected: boolean;
  backendLastSyncAt: string | null;
  backendSyncError: string | null;
  backendDecisions: Decision[];
}

export interface BackendSyncMethods {
  setBackendConnected: (connected: boolean) => void;
  setBackendSyncError: (message: string | null) => void;
  syncDecisionsFromBackend: (decisions: Decision[]) => void;
}

export type BackendSyncStore = BackendSyncState & BackendSyncMethods;

export const createBackendSyncInitialState = (): BackendSyncState => ({
  backendConnected: false,
  backendLastSyncAt: null,
  backendSyncError: null,
  backendDecisions: [],
});

export const createBackendSyncMethods = (
  set: (updater: (state: BackendSyncState) => BackendSyncState) => void,
): BackendSyncMethods => ({
  setBackendConnected: (connected) =>
    set((state) => ({
      ...state,
      backendConnected: connected,
    })),
  setBackendSyncError: (message) =>
    set((state) => ({
      ...state,
      backendSyncError: message,
    })),
  syncDecisionsFromBackend: (decisions) =>
    set((state) => ({
      ...state,
      backendDecisions: decisions,
      backendLastSyncAt: new Date().toISOString(),
      backendSyncError: null,
    })),
});
