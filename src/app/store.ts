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
  }))
}));
