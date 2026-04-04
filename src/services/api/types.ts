export type RequestLifecycleStatus = 'loading' | 'success' | 'error';

export type ClassificationLevel =
  | 'UNCLASSIFIED'
  | 'CONFIDENTIAL'
  | 'SECRET'
  | 'TOP_SECRET'
  | 'TS_SCI';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OperationalStatus = 'operational' | 'caution' | 'critical';
export type DataSource = 'mock' | 's3m-core';
export type TransportType = 'fetch' | 'axios';
export type BackendSyncStatus = 'idle' | 'syncing' | 'ready' | 'error';
export type DecisionStatus = 'pending' | 'approved' | 'rejected';
export type RiskSeverity = OperationalStatus;

export interface APIErrorDetails {
  code: string;
  message: string;
  retriable: boolean;
  details?: unknown;
}

export interface APIMetadata {
  source: DataSource;
  requestId: string;
  transport: TransportType;
  latencyMs: number;
  retries: number;
  workspace?: string;
  [key: string]: unknown;
}

export interface APIResponseBase {
  requestStatus: RequestLifecycleStatus;
  statusCode: number;
  timestamp: string;
  classification: ClassificationLevel;
  metadata: APIMetadata;
  error?: APIErrorDetails;
}

// Compatibility aliases consumed by existing service code.
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

export interface Decision {
  id: string;
  title: string;
  description: string;
  status: DecisionStatus;
  severity: SeverityLevel;
  risk: number;
  confidence: number;
  updatedAt?: string;
  submittedBy?: string;
  recommendedAction?: string;
}

export type DecisionRecord = Decision;

export interface DecisionQueueCounts {
  pending: number;
  autoApproved: number;
  humanApproved: number;
  vetoed: number;
  stale: number;
}

export interface DecisionData extends APIResponseBase {
  decisions: Decision[];
  queueCounts: DecisionQueueCounts;
}

export interface OperationalThreat {
  id: string;
  title?: string;
  label?: string;
  source?: string;
  domain?: string;
  severity?: SeverityLevel;
  level?: SeverityLevel;
  risk?: number;
  confidence?: number;
  summary?: string;
  updatedAt: string;
}

export interface OperationalRiskItem {
  id: string;
  title: string;
  domain: string;
  score: number;
  trendDelta: number;
  severity: SeverityLevel;
}

export interface PendingItem {
  id: string;
  title: string;
  type: 'approval' | 'alert' | 'escalation';
  urgency: 'ROUTINE' | 'PRIORITY' | 'IMMEDIATE';
  authority: string;
  age: string;
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

export interface OperationalDirective {
  id: string;
  title: string;
  authority: string;
  status: string;
  details: string;
  updatedAt: string;
}

export interface OperationalContextData extends Partial<APIResponseBase> {
  threats?: OperationalThreat[];
  risks?: OperationalRiskItem[];
  pendingItems?: PendingItem[];
  decisions?: Decision[];
  directives?: OperationalDirective[];
  metrics?: OperationalMetric[];
  priorities?: OperationalPriority[];
  updatedAt?: string;
}

export interface RiskDomainBreakdown {
  domain: string;
  score: number;
  change: number;
  severity: OperationalStatus;
}

export interface RiskProjection {
  label: string;
  value: number;
}

export interface RiskDriver {
  title?: string;
  name?: string;
  domain?: string;
  impact: number;
  direction?: 'positive' | 'negative' | 'steady';
  description?: string;
}

export interface RiskDomainSummary {
  name: string;
  value: number;
  change: number;
  color: string;
  severity: RiskSeverity;
}

export interface RiskData extends Partial<APIResponseBase> {
  composite?: number;
  domains?: RiskDomainSummary[];
  forecast?: Array<{
    timestamp?: string;
    label?: string;
    value?: number;
    score?: number;
    color?: string;
  }>;
  drivers?: RiskDriver[];
  updatedAt?: string;
}

export interface RiskMetricsData extends APIResponseBase {
  compositeRisk: number;
  domainBreakdown: RiskDomainBreakdown[];
  topDrivers: RiskDriver[];
  forecast: RiskProjection[];
}

export interface TrackHistory {
  splits: number;
  merges: number;
  deception: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ThreatTrack {
  id: string;
  type?: string;
  domain?: string;
  confidence: number;
  severity?: number;
  status?: OperationalStatus;
  location?: string;
  speed?: string;
  altitude?: string;
  sourceReliability?: 'HIGH' | 'MEDIUM' | 'LOW';
  lastUpdate?: string;
  summary?: string;
  correlatedTrackIds?: string[];
  lastSeen?: string;
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

export interface TracksData extends Partial<APIResponseBase> {
  tracks: Track[];
}

export interface ThreatTrackData extends APIResponseBase {
  kinetic: ThreatTrack[];
  cyber: ThreatTrack[];
  intel: ThreatTrack[];
}

export interface ReadinessForecastSlice {
  overallReadiness: number;
  trend: number;
}

export interface UnitStatus {
  unit?: string;
  unitId?: string;
  deployable?: number;
  nonDeployable?: number;
  readinessScore?: number;
  readiness?: number;
  status?: string;
}

export interface ManningStatus {
  unit: string;
  authorized: number;
  assigned: number;
  manningPercent: number;
  criticalShortages: number;
}

export interface EquipmentStatus {
  category: string;
  available: number;
  total: number;
  readinessPercent: number;
}

export interface ReadinessData extends Partial<APIResponseBase> {
  deployable?: number;
  nonDeployable?: number;
  total?: number;
  forecast?: Record<'7day' | '30day' | '90day', ReadinessForecastSlice>;
  personnel?: {
    available: number;
    deployed: number;
    onLeave: number;
  };
  equipment?:
    | EquipmentStatus[]
    | {
        ready: number;
        maintenance: number;
        unavailable: number;
      };
  unitStatus?: UnitStatus[];
  manning?: ManningStatus[];
  updatedAt?: string;
}

export interface ISRAsset {
  id: string;
  name: string;
  status: OperationalStatus;
  platform: string;
  coverage: number;
  lastUpdate: string;
}

export interface ISRAssetData extends APIResponseBase {
  uavAssets: ISRAsset[];
  satelliteAssets: ISRAsset[];
  groundSensorAssets: ISRAsset[];
}

export interface SurveillanceTarget {
  id: string;
  name: string;
  type: string;
  location: string;
  threat: SeverityLevel;
  confidence: number;
}

export interface SurveillanceData extends Partial<APIResponseBase> {
  assets?: Array<{
    id: string;
    type: string;
    status: string;
    location: string;
  }>;
  taskingQueue?: Array<{
    id: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    assignedAssetId?: string;
    status: 'queued' | 'in_progress' | 'completed';
  }>;
  targetBoard?: Array<{
    id: string;
    designation: string;
    confidence: number;
    lastSeen: string;
  }>;
  targets?: SurveillanceTarget[];
  updatedAt?: string;
}

export interface CommsChannel {
  channel: string;
  confidence: number;
}

export interface CommsMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  read: boolean;
  priority: 'routine' | 'priority' | 'immediate' | 'emergency';
  timestamp: string;
}

export interface CommsData extends Partial<APIResponseBase> {
  channels?: CommsChannel[];
  inbox?: CommsMessage[];
  relayQueue?: Array<{
    id: string;
    messageId: string;
    status: 'queued' | 'sent' | 'failed';
    updatedAt: string;
  }>;
  updatedAt?: string;
}

export interface MessageItem {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  priority: 'routine' | 'priority' | 'immediate' | 'emergency';
  status: 'pending' | 'delivered' | 'acknowledged' | 'delayed' | 'dropped';
  sentAt: string;
}

export interface MessageData extends APIResponseBase {
  inbox: MessageItem[];
  pendingApprovals: PendingItem[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  category: 'decision' | 'threat' | 'comms' | 'logistics' | 'intel';
  severity: SeverityLevel;
  occurredAt: string;
  details: string;
}

export interface TimelineEventData extends APIResponseBase {
  events: TimelineEvent[];
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

export interface SendMessagePayload {
  to: string;
  subject: string;
  body: string;
  priority?: 'routine' | 'priority' | 'immediate' | 'emergency';
}

export interface APIService {
  getOperationalContext(): Promise<OperationalContextData>;
  getDecisions(): Promise<DecisionData>;
  approveDecision(id: string, comment: string): Promise<DecisionData>;
  rejectDecision(id: string, comment: string): Promise<DecisionData>;
  getRiskMetrics(): Promise<RiskMetricsData>;
  getThreatTracks(): Promise<ThreatTrackData>;
  getReadinessSummary(): Promise<ReadinessData>;
  getSurveillanceAssets(): Promise<ISRAssetData>;
  getMessages(): Promise<MessageData>;
  sendMessage(message: SendMessagePayload): Promise<MessageData>;
  getTimelineEvents(): Promise<TimelineEventData>;
}
