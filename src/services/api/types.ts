export type BackendSyncStatus = 'idle' | 'syncing' | 'ready' | 'error';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  requestId?: string;
  timestamp?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
  error?: ApiError;
}

export type DecisionStatus = 'pending' | 'approved' | 'rejected';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Decision {
  id: string;
  title: string;
  risk: number;
  confidence: number;
  description: string;
  status: DecisionStatus;
  severity: SeverityLevel;
}

export type RiskSeverity = 'operational' | 'caution' | 'critical';

export interface RiskDomainSummary {
  name: string;
  value: number;
  change: number;
  color: string;
  severity: RiskSeverity;
}

export interface RiskData {
  domains: RiskDomainSummary[];
}

export interface ReadinessForecastSlice {
  overallReadiness: number;
  trend: number;
}

export interface ReadinessData {
  deployable: number;
  nonDeployable: number;
  total: number;
  forecast: Record<'7day' | '30day' | '90day', ReadinessForecastSlice>;
}

export interface SurveillanceTarget {
  id: string;
  name: string;
  type: string;
  location: string;
  threat: SeverityLevel;
  confidence: number;
}

export interface SurveillanceData {
  targets: SurveillanceTarget[];
}

export interface CommsChannel {
  channel: string;
  confidence: number;
}

export interface CommsData {
  channels: CommsChannel[];
}

export interface TrackHistory {
  splits: number;
  merges: number;
  deception: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Track {
  id: string;
  type: 'HOSTILE' | 'UNKNOWN' | 'FRIENDLY';
  conf: number;
  status: RiskSeverity;
  speed: string;
  alt: string;
  identityConf: number;
  hostileProbability: number;
  friendlyProbability: number;
  unknownProbability: number;
  sourceReliability: 'HIGH' | 'MEDIUM' | 'LOW';
  lastUpdate: string;
  recommendedAction: string;
  sensors: string[];
  trackHistory: TrackHistory;
}

export interface TracksData {
  tracks: Track[];
}

export interface OperationalMetric {
  label: string;
  value: string;
  color: string;
  sublabel: string;
}

export interface OperationalPriority {
  id: string;
  title: string;
  severity: SeverityLevel;
  source?: string;
  risk?: string;
}

export interface OperationalContextData {
  metrics: OperationalMetric[];
  priorities: OperationalPriority[];
}

export interface BackendSnapshot {
  decisions: Decision[];
  risk: RiskData;
  readiness: ReadinessData;
  surveillance: SurveillanceData;
  comms: CommsData;
  tracks: TracksData;
  operationalContext: OperationalContextData;
}
