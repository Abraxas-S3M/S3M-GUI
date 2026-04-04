export type DecisionStatus = 'pending' | 'approved' | 'rejected';
export type DecisionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Decision {
  id: string;
  title: string;
  risk: number;
  confidence: number;
  description: string;
  status: DecisionStatus;
  severity: DecisionSeverity;
  updatedAt?: string;
  reviewerComment?: string;
}

export interface Threat {
  id: string;
  label: string;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  domain: 'kinetic' | 'cyber' | 'intel' | 'logistics';
  summary: string;
  updatedAt: string;
}

export interface Directive {
  id: string;
  title: string;
  authority: string;
  status: 'active' | 'draft' | 'expired';
  details: string;
  updatedAt: string;
}

export interface OperationalContextData {
  threats: Threat[];
  decisions: Decision[];
  directives: Directive[];
  updatedAt: string;
}

export interface DecisionAuditEntry {
  id: string;
  decisionId: string;
  action: 'approved' | 'rejected' | 'updated' | 'received';
  comment?: string;
  actor: string;
  source: 'backend' | 'mock' | 'ui' | 'websocket';
  timestamp: string;
}

export interface DomainRisk {
  domain: string;
  score: number;
  trend: 'up' | 'down' | 'steady';
}

export interface RiskForecastPoint {
  timestamp: string;
  score: number;
}

export interface RiskDriver {
  name: string;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface RiskData {
  composite: number;
  domains: DomainRisk[];
  forecast: RiskForecastPoint[];
  drivers: RiskDriver[];
  updatedAt: string;
}

export type TrackDomain = 'kinetic' | 'cyber' | 'intel';

export interface ThreatTrack {
  id: string;
  domain: TrackDomain;
  confidence: number;
  severity: number;
  correlatedTrackIds: string[];
  summary: string;
  lastSeen: string;
}

export interface ReadinessData {
  personnel: {
    available: number;
    deployed: number;
    onLeave: number;
  };
  equipment: {
    ready: number;
    maintenance: number;
    unavailable: number;
  };
  unitStatus: Array<{
    unitId: string;
    readiness: number;
    status: 'ready' | 'degraded' | 'critical';
  }>;
  updatedAt: string;
}

export interface SurveillanceAsset {
  id: string;
  type: string;
  status: 'active' | 'standby' | 'offline';
  location: string;
}

export interface SurveillanceTask {
  id: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  assignedAssetId?: string;
  status: 'queued' | 'in_progress' | 'done';
}

export interface SurveillanceTarget {
  id: string;
  designation: string;
  confidence: number;
  lastSeen: string;
}

export interface SurveillanceData {
  assets: SurveillanceAsset[];
  taskingQueue: SurveillanceTask[];
  targetBoard: SurveillanceTarget[];
  updatedAt: string;
}

export interface CommsMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  read: boolean;
  priority: 'flash' | 'priority' | 'routine';
  timestamp: string;
}

export interface CommsData {
  inbox: CommsMessage[];
  relayQueue: Array<{
    id: string;
    messageId: string;
    status: 'queued' | 'sent' | 'failed';
    updatedAt: string;
  }>;
  updatedAt: string;
}

export interface BackendEnvelope<T> {
  data: T;
  meta?: {
    source?: 'backend';
    updatedAt?: string;
  };
}

export type BackendDomain =
  | 'operationalContext'
  | 'decisions'
  | 'risk'
  | 'tracks'
  | 'readiness'
  | 'surveillance'
  | 'comms';
