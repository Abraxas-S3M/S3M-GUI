import { create } from 'zustand';
import {
  mockCommsData,
  mockDecisions,
  mockOperationalContext,
  mockReadinessData,
  mockRiskData,
  mockSurveillanceData,
  mockTracks
} from '../services/api/mockData';
import type {
  BackendDomain,
  CommsData,
  CommsMessage,
  Decision,
  DecisionAuditEntry,
  OperationalContextData,
  ReadinessData,
  RiskData,
  SurveillanceData,
  ThreatTrack
} from '../services/api/types';

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
  operationalContext: OperationalContextData;
  riskData: RiskData;
  tracks: ThreatTrack[];
  readiness: ReadinessData;
  surveillance: SurveillanceData;
  comms: CommsData;
  decisionAuditTrail: DecisionAuditEntry[];
  backendSource: Record<BackendDomain, boolean>;

  setBackendSource: (domain: BackendDomain, isFromBackend: boolean) => void;
  setOperationalContext: (payload: OperationalContextData, source?: 'backend' | 'mock') => void;
  setDecisions: (payload: Decision[], source?: 'backend' | 'mock') => void;
  upsertDecision: (payload: Decision, source?: 'backend' | 'mock' | 'websocket') => void;
  updateDecisionStatus: (
    id: string,
    status: 'approved' | 'rejected',
    comment?: string,
    source?: 'backend' | 'mock' | 'ui' | 'websocket'
  ) => void;
  addDecisionAudit: (entry: DecisionAuditEntry) => void;
  setRiskData: (payload: RiskData, source?: 'backend' | 'mock') => void;
  setTracks: (payload: ThreatTrack[], source?: 'backend' | 'mock' | 'websocket') => void;
  setReadiness: (payload: ReadinessData, source?: 'backend' | 'mock') => void;
  setSurveillance: (payload: SurveillanceData, source?: 'backend' | 'mock') => void;
  setComms: (payload: CommsData, source?: 'backend' | 'mock') => void;
  upsertCommsMessage: (message: CommsMessage, source?: 'backend' | 'mock' | 'websocket') => void;
  markCommsMessageRead: (id: string, source?: 'backend' | 'mock' | 'websocket') => void;
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

  decisions: mockDecisions,
  operationalContext: mockOperationalContext,
  riskData: mockRiskData,
  tracks: mockTracks,
  readiness: mockReadinessData,
  surveillance: mockSurveillanceData,
  comms: mockCommsData,
  decisionAuditTrail: [],
  backendSource: {
    operationalContext: false,
    decisions: false,
    risk: false,
    tracks: false,
    readiness: false,
    surveillance: false,
    comms: false
  },

  setBackendSource: (domain, isFromBackend) =>
    set((state) => ({ backendSource: { ...state.backendSource, [domain]: isFromBackend } })),

  setOperationalContext: (payload, source = 'backend') =>
    set((state) => ({
      operationalContext: payload,
      decisions: payload.decisions.length > 0 ? payload.decisions : state.decisions,
      backendSource: {
        ...state.backendSource,
        operationalContext: source === 'backend',
        decisions: payload.decisions.length > 0 ? source === 'backend' : state.backendSource.decisions
      }
    })),

  setDecisions: (payload, source = 'backend') =>
    set((state) => ({
      decisions: payload,
      backendSource: { ...state.backendSource, decisions: source === 'backend' }
    })),

  upsertDecision: (payload, source = 'backend') =>
    set((state) => {
      const existing = state.decisions.find((decision) => decision.id === payload.id);
      const nextDecisions = existing
        ? state.decisions.map((decision) => (decision.id === payload.id ? { ...decision, ...payload } : decision))
        : [...state.decisions, payload];
      return {
        decisions: nextDecisions,
        backendSource: { ...state.backendSource, decisions: source === 'backend' || source === 'websocket' }
      };
    }),

  updateDecisionStatus: (id, status, comment, source = 'ui') =>
    set((state) => ({
      decisions: state.decisions.map((decision) =>
        decision.id === id
          ? {
              ...decision,
              status,
              reviewerComment: comment ?? decision.reviewerComment,
              updatedAt: new Date().toISOString()
            }
          : decision
      ),
      decisionAuditTrail: [
        {
          id: `AUD-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
          decisionId: id,
          action: status,
          comment,
          actor: source === 'ui' ? 'operator' : 'system',
          source,
          timestamp: new Date().toISOString()
        },
        ...state.decisionAuditTrail
      ]
    })),

  addDecisionAudit: (entry) =>
    set((state) => ({
      decisionAuditTrail: [entry, ...state.decisionAuditTrail]
    })),

  setRiskData: (payload, source = 'backend') =>
    set((state) => ({
      riskData: payload,
      backendSource: { ...state.backendSource, risk: source === 'backend' }
    })),

  setTracks: (payload, source = 'backend') =>
    set((state) => ({
      tracks: payload,
      backendSource: { ...state.backendSource, tracks: source === 'backend' || source === 'websocket' }
    })),

  setReadiness: (payload, source = 'backend') =>
    set((state) => ({
      readiness: payload,
      backendSource: { ...state.backendSource, readiness: source === 'backend' }
    })),

  setSurveillance: (payload, source = 'backend') =>
    set((state) => ({
      surveillance: payload,
      backendSource: { ...state.backendSource, surveillance: source === 'backend' }
    })),

  setComms: (payload, source = 'backend') =>
    set((state) => ({
      comms: payload,
      backendSource: { ...state.backendSource, comms: source === 'backend' }
    })),

  upsertCommsMessage: (message, source = 'backend') =>
    set((state) => {
      const existing = state.comms.inbox.find((entry) => entry.id === message.id);
      const nextInbox = existing
        ? state.comms.inbox.map((entry) => (entry.id === message.id ? { ...entry, ...message } : entry))
        : [message, ...state.comms.inbox];
      return {
        comms: { ...state.comms, inbox: nextInbox, updatedAt: new Date().toISOString() },
        backendSource: { ...state.backendSource, comms: source === 'backend' || source === 'websocket' }
      };
    }),

  markCommsMessageRead: (id, source = 'backend') =>
    set((state) => ({
      comms: {
        ...state.comms,
        inbox: state.comms.inbox.map((entry) => (entry.id === id ? { ...entry, read: true } : entry)),
        updatedAt: new Date().toISOString()
      },
      backendSource: { ...state.backendSource, comms: source === 'backend' || source === 'websocket' }
    }))
}));
