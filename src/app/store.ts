import { create } from 'zustand';

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

export interface Decision {
  id: string;
  title: string;
  risk: number;
  confidence: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
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

  decisions: Array<{
    id: string;
    title: string;
    risk: number;
    confidence: number;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }>;

  updateDecisionStatus: (id: string, status: 'approved' | 'rejected') => void;

  backendConfig: {
    apiBaseUrl: string;
    useBackend: boolean;
    useMockData: boolean;
    wsConnected: boolean;
    lastSync: Record<string, number>;
  };

  mockOperationalData: AppOperationalData;
  operationalData: AppOperationalData;

  setBackendUrl: (url: string) => void;
  enableBackend: (enable: boolean) => void;
  syncOperationalData: () => Promise<void>;
  updateDecisions: (decisions: Decision[]) => void;
  updateRiskMetrics: (risk: RiskMetrics) => void;
  updateTracks: (tracks: ThreatTrack[]) => void;
  updateReadinessStatus: (readinessStatus: ReadinessStatus) => void;
  updateMessages: (messages: Message[]) => void;
  updateTimelineEvents: (timelineEvents: TimelineEvent[]) => void;
  updateSurveillanceAssets: (surveillanceAssets: ISRAsset[]) => void;
  updateOperationalDirectives: (operationalDirectives: OperationalDirectives) => void;

  dataSource: Record<string, DataSourceType>;
  setDataSource: (dataType: string, source: DataSourceType) => void;
  getOperationalData: <K extends OperationalDataKey>(dataType: K) => AppOperationalData[K];
}

export const useAppStore = create<AppState>((set, get) => ({
  activeWorkspace: 'command',
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  aiPanelOpen: true,
  toggleAiPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),

  alertsOpen: false,
  toggleAlerts: () => set((state) => ({ alertsOpen: !state.alertsOpen, aiPanelOpen: state.alertsOpen ? state.aiPanelOpen : false })),

  commandPaletteOpen: false,
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  currentTime: new Date().toISOString().substr(11, 8) + 'Z',
  updateTime: () => set({ currentTime: new Date().toISOString().substr(11, 8) + 'Z' }),

  language: 'EN',
  setLanguage: (lang) => set({ language: lang }),

  coalition: 'KSA/GCC/NATO',
  setCoalition: (coalition) => set({ coalition }),

  mode: 'CMD',
  setMode: (mode) => set({ mode }),

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

  updateDecisionStatus: (id, status) => set((state) => ({
    decisions: state.decisions.map(d =>
      d.id === id ? { ...d, status } : d
    )
  })),

  backendConfig: {
    apiBaseUrl: '/api',
    useBackend: false,
    useMockData: true,
    wsConnected: false,
    lastSync: {}
  },

  mockOperationalData,
  operationalData: emptyOperationalData,

  setBackendUrl: (url) => set((state) => ({
    backendConfig: {
      ...state.backendConfig,
      apiBaseUrl: url
    }
  })),

  enableBackend: (enable) => set((state) => ({
    backendConfig: {
      ...state.backendConfig,
      useBackend: enable,
      wsConnected: enable ? state.backendConfig.wsConnected : false
    },
    dataSource: enable ? state.dataSource : { ...defaultDataSource }
  })),

  syncOperationalData: async () => {
    const state = get();

    if (!state.backendConfig.useBackend) {
      return;
    }

    const sanitizedBaseUrl = state.backendConfig.apiBaseUrl.replace(/\/+$/, '');
    const endpoint = `${sanitizedBaseUrl}/operational-data`;

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to sync operational data: ${response.status}`);
      }

      const payload = (await response.json()) as Partial<AppOperationalData>;

      set((currentState) => {
        const nextOperationalData: AppOperationalData = { ...currentState.operationalData };
        const nextDataSource: Record<string, DataSourceType> = { ...currentState.dataSource };
        const nextLastSync: Record<string, number> = { ...currentState.backendConfig.lastSync };
        const now = Date.now();

        operationalDataKeys.forEach((key) => {
          const value = payload[key];
          if (value !== undefined) {
            (nextOperationalData[key] as AppOperationalData[typeof key]) = value as AppOperationalData[typeof key];
            nextDataSource[key] = 'backend';
            nextLastSync[key] = now;
          } else if (currentState.backendConfig.useMockData) {
            nextDataSource[key] = 'mock';
          }
        });

        return {
          operationalData: nextOperationalData,
          dataSource: nextDataSource,
          backendConfig: {
            ...currentState.backendConfig,
            wsConnected: true,
            lastSync: nextLastSync
          }
        };
      });
    } catch {
      set((currentState) => ({
        backendConfig: {
          ...currentState.backendConfig,
          wsConnected: false
        },
        dataSource: currentState.backendConfig.useMockData ? { ...defaultDataSource } : currentState.dataSource
      }));
    }
  },

  updateDecisions: (decisions) => set((state) => ({
    operationalData: {
      ...state.operationalData,
      decisions
    },
    dataSource: {
      ...state.dataSource,
      decisions: 'backend'
    },
    backendConfig: {
      ...state.backendConfig,
      lastSync: {
        ...state.backendConfig.lastSync,
        decisions: Date.now()
      }
    }
  })),

  updateRiskMetrics: (riskMetrics) => set((state) => ({
    operationalData: {
      ...state.operationalData,
      riskMetrics
    },
    dataSource: {
      ...state.dataSource,
      riskMetrics: 'backend'
    },
    backendConfig: {
      ...state.backendConfig,
      lastSync: {
        ...state.backendConfig.lastSync,
        riskMetrics: Date.now()
      }
    }
  })),

  updateTracks: (tracks) => set((state) => ({
    operationalData: {
      ...state.operationalData,
      tracks
    },
    dataSource: {
      ...state.dataSource,
      tracks: 'backend'
    },
    backendConfig: {
      ...state.backendConfig,
      lastSync: {
        ...state.backendConfig.lastSync,
        tracks: Date.now()
      }
    }
  })),

  updateReadinessStatus: (readinessStatus) => set((state) => ({
    operationalData: {
      ...state.operationalData,
      readinessStatus
    },
    dataSource: {
      ...state.dataSource,
      readinessStatus: 'backend'
    },
    backendConfig: {
      ...state.backendConfig,
      lastSync: {
        ...state.backendConfig.lastSync,
        readinessStatus: Date.now()
      }
    }
  })),

  updateMessages: (messages) => set((state) => ({
    operationalData: {
      ...state.operationalData,
      messages
    },
    dataSource: {
      ...state.dataSource,
      messages: 'backend'
    },
    backendConfig: {
      ...state.backendConfig,
      lastSync: {
        ...state.backendConfig.lastSync,
        messages: Date.now()
      }
    }
  })),

  updateTimelineEvents: (timelineEvents) => set((state) => ({
    operationalData: {
      ...state.operationalData,
      timelineEvents
    },
    dataSource: {
      ...state.dataSource,
      timelineEvents: 'backend'
    },
    backendConfig: {
      ...state.backendConfig,
      lastSync: {
        ...state.backendConfig.lastSync,
        timelineEvents: Date.now()
      }
    }
  })),

  updateSurveillanceAssets: (surveillanceAssets) => set((state) => ({
    operationalData: {
      ...state.operationalData,
      surveillanceAssets
    },
    dataSource: {
      ...state.dataSource,
      surveillanceAssets: 'backend'
    },
    backendConfig: {
      ...state.backendConfig,
      lastSync: {
        ...state.backendConfig.lastSync,
        surveillanceAssets: Date.now()
      }
    }
  })),

  updateOperationalDirectives: (operationalDirectives) => set((state) => ({
    operationalData: {
      ...state.operationalData,
      operationalDirectives
    },
    dataSource: {
      ...state.dataSource,
      operationalDirectives: 'backend'
    },
    backendConfig: {
      ...state.backendConfig,
      lastSync: {
        ...state.backendConfig.lastSync,
        operationalDirectives: Date.now()
      }
    }
  })),

  dataSource: { ...defaultDataSource },
  setDataSource: (dataType, source) => set((state) => ({
    dataSource: {
      ...state.dataSource,
      [dataType]: source
    }
  })),

  getOperationalData: (dataType) => {
    const state = get();
    const source = state.dataSource[dataType] ?? 'mock';
    return source === 'backend' ? state.operationalData[dataType] : state.mockOperationalData[dataType];
  }
}));
