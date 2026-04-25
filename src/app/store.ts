import { create } from 'zustand';
import { backendApiClient } from '../services/api/client';
import type { BackendSyncStatus, Decision } from '../services/api/types';

const getCurrentZuluTime = (): string => new Date().toISOString().substr(11, 8) + 'Z';
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Backend synchronization failed';
const DEMO_ROOM_SELECTION_STORAGE_KEY = 's3m_demo_room_selection';

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

export interface ThreatTrack {
  id: string;
  [key: string]: unknown;
}

export interface RiskMetrics {
  [key: string]: unknown;
}

export interface ReadinessStatus {
  [key: string]: unknown;
}

export interface Message {
  id: string;
  [key: string]: unknown;
}

export interface TimelineEvent {
  id: string;
  [key: string]: unknown;
}

export interface ISRAsset {
  id: string;
  [key: string]: unknown;
}

export interface OperationalDirectives {
  [key: string]: unknown;
}

export interface DemoRoomSelection {
  track: string;
  trackLabel: string;
  trackName: string;
  theater: string;
  pacing: string;
}

interface AppOperationalData {
  tracks: ThreatTrack[];
  decisions: Decision[];
  riskMetrics: RiskMetrics;
  readinessStatus: ReadinessStatus;
  messages: Message[];
  timelineEvents: TimelineEvent[];
  surveillanceAssets: ISRAsset[];
  operationalDirectives: OperationalDirectives;
}

type DataSourceType = 'backend' | 'mock';
type OperationalDataKey = keyof AppOperationalData;

const operationalDataKeys: OperationalDataKey[] = [
  'tracks',
  'decisions',
  'riskMetrics',
  'readinessStatus',
  'messages',
  'timelineEvents',
  'surveillanceAssets',
  'operationalDirectives'
];

const defaultDataSource: Record<string, DataSourceType> = operationalDataKeys.reduce((acc, key) => {
  acc[key] = 'mock';
  return acc;
}, {} as Record<string, DataSourceType>);

const mockOperationalData: AppOperationalData = {
  tracks: [],
  decisions: [
    {
      id: 'R001',
      title: 'ENGAGE UAV-02',
      risk: 82,
      confidence: 74,
      description: 'Weapons release Track 218',
      status: 'pending',
      severity: 'CRITICAL'
    },
    {
      id: 'R002',
      title: 'REROUTE CVY-A',
      risk: 45,
      confidence: 91,
      description: 'Reroute via Delta',
      status: 'pending',
      severity: 'MEDIUM'
    },
    {
      id: 'R003',
      title: 'ESCALATE SIG-01',
      risk: 67,
      confidence: 88,
      description: 'Escalate SIGINT to INTSUM',
      status: 'pending',
      severity: 'HIGH'
    }
  ],
  riskMetrics: {},
  readinessStatus: {},
  messages: [],
  timelineEvents: [],
  surveillanceAssets: [],
  operationalDirectives: {}
};

const emptyOperationalData: AppOperationalData = {
  tracks: [],
  decisions: [],
  riskMetrics: {},
  readinessStatus: {},
  messages: [],
  timelineEvents: [],
  surveillanceAssets: [],
  operationalDirectives: {}
};

const loadDemoRoomSelection = (): DemoRoomSelection | null => {
  if (typeof window === 'undefined') return null;

  try {
    const rawValue = window.localStorage.getItem(DEMO_ROOM_SELECTION_STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<DemoRoomSelection>;
    if (
      typeof parsed.track !== 'string' ||
      typeof parsed.trackLabel !== 'string' ||
      typeof parsed.trackName !== 'string' ||
      typeof parsed.theater !== 'string' ||
      typeof parsed.pacing !== 'string'
    ) {
      return null;
    }

    return {
      track: parsed.track,
      trackLabel: parsed.trackLabel,
      trackName: parsed.trackName,
      theater: parsed.theater,
      pacing: parsed.pacing
    };
  } catch {
    return null;
  }
};

const persistDemoRoomSelection = (selection: DemoRoomSelection | null): void => {
  if (typeof window === 'undefined') return;

  try {
    if (selection) {
      window.localStorage.setItem(DEMO_ROOM_SELECTION_STORAGE_KEY, JSON.stringify(selection));
      return;
    }

    window.localStorage.removeItem(DEMO_ROOM_SELECTION_STORAGE_KEY);
  } catch {
    // Local storage can be blocked in restrictive browser contexts.
  }
};

interface AppState {
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (workspace: WorkspaceType) => void;

  aiPanelOpen: boolean;
  toggleAiPanel: () => void;
  setAiPanelOpen: (open: boolean) => void;
  backendEvolutionPanelOpen: boolean;
  toggleBackendEvolutionPanel: () => void;
  setBackendEvolutionPanelOpen: (open: boolean) => void;

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

  selectedDemoRoomSelection: DemoRoomSelection | null;
  setSelectedDemoRoomSelection: (selection: DemoRoomSelection) => void;

  decisions: Decision[];
  setDecisions: (decisions: Decision[]) => void;

  backendSyncStatus: BackendSyncStatus;
  backendSyncError: string | null;
  lastBackendSyncAt: string | null;
  operationalContext: unknown | null;
  tracks: ThreatTrack[];
  riskMetrics: RiskMetrics;
  readinessStatus: ReadinessStatus;
  syncDecisionsFromBackend: () => Promise<void>;
  syncOperationalContext: () => Promise<void>;
  syncThreatTracks: () => Promise<void>;
  syncRiskMetrics: () => Promise<void>;
  syncReadiness: () => Promise<void>;

  updateDecisionStatus: (id: string, status: 'approved' | 'rejected') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeWorkspace: 'command',
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  aiPanelOpen: true,
  toggleAiPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),

  backendEvolutionPanelOpen: false,
  toggleBackendEvolutionPanel: () =>
    set((state) => ({ backendEvolutionPanelOpen: !state.backendEvolutionPanelOpen })),
  setBackendEvolutionPanelOpen: (open) => set({ backendEvolutionPanelOpen: open }),

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

  selectedDemoRoomSelection: loadDemoRoomSelection(),
  setSelectedDemoRoomSelection: (selection) => {
    persistDemoRoomSelection(selection);
    set({ selectedDemoRoomSelection: selection });
  },

  decisions: [],
  setDecisions: (decisions) => set({ decisions }),

  backendSyncStatus: 'idle',
  backendSyncError: null,
  lastBackendSyncAt: null,
  operationalContext: null,
  tracks: [],
  riskMetrics: {},
  readinessStatus: {},
  syncDecisionsFromBackend: async () => {
    set({ backendSyncStatus: 'syncing', backendSyncError: null });

    try {
      const decisionData = await backendApiClient.getDecisions();
      set({
        decisions: decisionData.decisions ?? [],
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
  syncOperationalContext: async () => {
    set({ backendSyncStatus: 'syncing', backendSyncError: null });

    try {
      const operationalContext = await backendApiClient.getOperationalContext();
      set({
        operationalContext,
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
  syncThreatTracks: async () => {
    set({ backendSyncStatus: 'syncing', backendSyncError: null });

    try {
      const threatTracks = await backendApiClient.getThreatTracks();
      const tracks = [
        ...(threatTracks.kinetic ?? []),
        ...(threatTracks.cyber ?? []),
        ...(threatTracks.intel ?? []),
      ].map((track) => ({ ...track })) as ThreatTrack[];
      set({
        tracks,
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
  syncRiskMetrics: async () => {
    set({ backendSyncStatus: 'syncing', backendSyncError: null });

    try {
      const riskMetrics = await backendApiClient.getRiskMetrics();
      set({
        riskMetrics: riskMetrics as unknown as RiskMetrics,
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
  syncReadiness: async () => {
    set({ backendSyncStatus: 'syncing', backendSyncError: null });

    try {
      const readinessStatus = await backendApiClient.getReadinessSummary();
      set({
        readinessStatus: readinessStatus as unknown as ReadinessStatus,
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
