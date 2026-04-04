import { create } from 'zustand';
import { backendApiClient } from '../services/api/client';
import { mockBackendData } from '../services/mock/data';
import type { BackendSyncStatus, Decision } from '../services/api/types';

const getCurrentZuluTime = (): string => new Date().toISOString().substr(11, 8) + 'Z';
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Backend synchronization failed';
const cloneSeedDecisions = (): Decision[] => mockBackendData.decisions.map((decision) => ({ ...decision }));

export type WorkspaceType =
  | 'command'
  | 'cop'
  | 'decisions'
  | 'risk'
  | 'planning'
  | 'sustainment'
  | 'readiness'
  | 'cyber'
  | 'simulation'
  | 'communication'
  | 'surveillance';

interface AppState {
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (workspace: WorkspaceType) => void;

  aiPanelOpen: boolean;
  toggleAiPanel: () => void;
  setAiPanelOpen: (open: boolean) => void;

  alertsOpen: boolean;
  toggleAlerts: () => void;

  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;

  currentTime: string;
  updateTime: () => void;

  language: 'EN' | 'AR';
  setLanguage: (lang: 'EN' | 'AR') => void;

  coalition: string;
  setCoalition: (coalition: string) => void;

  mode: string;
  setMode: (mode: string) => void;

  decisions: Decision[];
  setDecisions: (decisions: Decision[]) => void;

  backendSyncStatus: BackendSyncStatus;
  backendSyncError: string | null;
  lastBackendSyncAt: string | null;
  syncDecisionsFromBackend: () => Promise<void>;

  updateDecisionStatus: (id: string, status: 'approved' | 'rejected') => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeWorkspace: 'command',
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  aiPanelOpen: true,
  toggleAiPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),

  alertsOpen: false,
  toggleAlerts: () => set((state) => ({ alertsOpen: !state.alertsOpen, aiPanelOpen: state.alertsOpen ? state.aiPanelOpen : false })),

  commandPaletteOpen: false,
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  currentTime: getCurrentZuluTime(),
  updateTime: () => set({ currentTime: getCurrentZuluTime() }),

  language: 'EN',
  setLanguage: (lang) => set({ language: lang }),

  coalition: 'KSA/GCC/NATO',
  setCoalition: (coalition) => set({ coalition }),

  mode: 'CMD',
  setMode: (mode) => set({ mode }),

  decisions: cloneSeedDecisions(),
  setDecisions: (decisions) => set({ decisions }),

  backendSyncStatus: 'idle',
  backendSyncError: null,
  lastBackendSyncAt: null,
  syncDecisionsFromBackend: async () => {
    set({ backendSyncStatus: 'syncing', backendSyncError: null });

    try {
      const decisions = await backendApiClient.getDecisions();
      set({
        decisions,
        backendSyncStatus: 'ready',
        backendSyncError: null,
        lastBackendSyncAt: new Date().toISOString()
      });
    } catch (error) {
      set({
        backendSyncStatus: 'error',
        backendSyncError: getErrorMessage(error)
      });
    }
  },

  updateDecisionStatus: (id, status) => {
    set((state) => ({
      decisions: state.decisions.map((decision) => (decision.id === id ? { ...decision, status } : decision))
    }));

    void backendApiClient
      .updateDecisionStatus(id, status)
      .then((updatedDecision) => {
        set((state) => ({
          decisions: state.decisions.map((decision) =>
            decision.id === updatedDecision.id ? updatedDecision : decision
          ),
          backendSyncStatus: 'ready',
          backendSyncError: null,
          lastBackendSyncAt: new Date().toISOString()
        }));
      })
      .catch((error) => {
        set({
          backendSyncStatus: 'error',
          backendSyncError: getErrorMessage(error)
        });
      });
  }
}));
