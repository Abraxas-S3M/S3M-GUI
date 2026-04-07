export type RequestLifecycleStatus = 'loading' | 'success' | 'error';
export type BackendSyncStatus = 'idle' | 'syncing' | 'ready' | 'error';

export type ClassificationLevel = 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET' | 'TS_SCI';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OperationalStatus = 'operational' | 'caution' | 'critical';
export type DataSource = 'mock' | 's3m-core';
export type TransportType = 'fetch' | 'axios';
export type BackendSyncStatus = 'idle' | 'syncing' | 'ready' | 'error';
export type DecisionStatus = 'pending' | 'approved' | 'rejected';

export interface Decision {
  id: string;
  title: string;
  risk: number;
  confidence: number;
  description: string;
  status: DecisionStatus;
  severity: SeverityLevel;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface BackendSnapshot {
  decisions: Decision[];
  risk?: Record<string, unknown>;
  readiness?: Record<string, unknown>;
  surveillance?: Record<string, unknown>;
  comms?: Record<string, unknown>;
  tracks?: Record<string, unknown>;
  operationalContext?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface APIErrorDetails {
  code?: string;
  message?: string;
  retriable?: boolean;
  details?: unknown;
}

export interface APIMetadata {
  source?: DataSource;
  requestId?: string;
  transport?: TransportType;
  latencyMs?: number;
  retries?: number;
  workspace?: string;
  [key: string]: unknown;
}

export interface APIResponseBase {
  requestStatus?: RequestLifecycleStatus;
  statusCode?: number;
  timestamp?: string;
  classification?: ClassificationLevel;
  metadata?: APIMetadata;
  error?: APIErrorDetails;
  [key: string]: unknown;
}

export interface DecisionRecord extends Decision {
  submittedBy?: string;
  recommendedAction?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export type Decision = DecisionRecord;
export type DecisionStatus = DecisionRecord['status'];

export interface DecisionQueueCounts {
  pending?: number;
  autoApproved?: number;
  humanApproved?: number;
  vetoed?: number;
  stale?: number;
}

export interface DecisionData extends APIResponseBase {
  decisions: DecisionRecord[];
  queueCounts?: DecisionQueueCounts;
}

export interface OperationalThreat {
  id: string;
  title?: string;
  source?: string;
  severity?: SeverityLevel;
  risk?: number;
  confidence?: number;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface OperationalRiskItem {
  id: string;
  title?: string;
  domain?: string;
  score?: number;
  trendDelta?: number;
  severity?: SeverityLevel;
  [key: string]: unknown;
}

export interface PendingItem {
  id: string;
  title?: string;
  type?: 'approval' | 'alert' | 'escalation';
  urgency?: 'ROUTINE' | 'PRIORITY' | 'IMMEDIATE';
  authority?: string;
  age?: string;
  [key: string]: unknown;
}

export interface OperationalDirective {
  id: string;
  title?: string;
  authority?: string;
  status?: string;
  details?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface OperationalContextData extends APIResponseBase {
  threats?: OperationalThreat[];
  risks?: OperationalRiskItem[];
  pendingItems?: PendingItem[];
  decisions?: Decision[];
  directives?: Record<string, unknown>[];
  updatedAt?: string;
  [key: string]: unknown;
}

export interface RiskDomainBreakdown {
  domain?: string;
  name?: string;
  score?: number;
  value?: number;
  change?: number;
  trend?: 'up' | 'down' | 'steady';
  severity?: OperationalStatus;
  [key: string]: unknown;
}

export interface RiskDriver {
  title?: string;
  name?: string;
  domain?: string;
  impact?: number;
  direction?: 'positive' | 'negative';
  description?: string;
  [key: string]: unknown;
}

export interface RiskProjection {
  label?: string;
  value?: number;
  timestamp?: string;
  score?: number;
  [key: string]: unknown;
}

export interface RiskMetricsData extends APIResponseBase {
  compositeRisk?: number;
  domainBreakdown?: RiskDomainBreakdown[];
  topDrivers?: RiskDriver[];
  forecast?: RiskProjection[];
  composite?: number;
  domains?: Record<string, unknown>[];
  drivers?: Record<string, unknown>[];
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ThreatTrack {
  id: string;
  type?: string;
  confidence?: number;
  status?: OperationalStatus;
  location?: string;
  speed?: string;
  altitude?: string;
  sourceReliability?: 'HIGH' | 'MEDIUM' | 'LOW';
  lastUpdate?: string;
  [key: string]: unknown;
}

export interface ThreatTrackData extends APIResponseBase {
  kinetic?: ThreatTrack[];
  cyber?: ThreatTrack[];
  intel?: ThreatTrack[];
  tracks?: ThreatTrack[];
  [key: string]: unknown;
}

export type TracksData = ThreatTrack[];

export interface UnitStatus {
  unit?: string;
  deployable?: number;
  nonDeployable?: number;
  readinessScore?: number;
  unitId?: string;
  readiness?: number;
  status?: string;
  [key: string]: unknown;
}

export interface ManningStatus {
  unit?: string;
  authorized?: number;
  assigned?: number;
  manningPercent?: number;
  criticalShortages?: number;
  [key: string]: unknown;
}

export interface EquipmentStatus {
  category?: string;
  available?: number;
  total?: number;
  readinessPercent?: number;
  [key: string]: unknown;
}

export interface ReadinessData extends APIResponseBase {
  unitStatus?: UnitStatus[];
  manning?: ManningStatus[];
  equipment?: EquipmentStatus[] | Record<string, unknown>;
  personnel?: Record<string, unknown>;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ISRAsset {
  id: string;
  name?: string;
  type?: string;
  status?: OperationalStatus | string;
  platform?: string;
  location?: string;
  coverage?: number;
  lastUpdate?: string;
  [key: string]: unknown;
}

export interface ISRAssetData extends APIResponseBase {
  uavAssets?: ISRAsset[];
  satelliteAssets?: ISRAsset[];
  groundSensorAssets?: ISRAsset[];
  assets?: Record<string, unknown>[];
  taskingQueue?: Record<string, unknown>[];
  targetBoard?: Record<string, unknown>[];
  updatedAt?: string;
  [key: string]: unknown;
}

export type SurveillanceData = ISRAssetData;

export interface MessageItem {
  id: string;
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  priority?: 'routine' | 'priority' | 'immediate' | 'emergency';
  status?: 'pending' | 'delivered' | 'acknowledged' | 'delayed' | 'dropped';
  sentAt?: string;
  read?: boolean;
  timestamp?: string;
  [key: string]: unknown;
}

export interface MessageData extends APIResponseBase {
  inbox: MessageItem[];
  pendingApprovals?: PendingItem[];
  relayQueue?: Record<string, unknown>[];
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CommsMessage extends MessageItem {}

export type CommsData = MessageData;
export type RiskData = RiskMetricsData;
export type TracksData = ThreatTrackData;
export type SurveillanceData = ISRAssetData;

export interface TimelineEvent {
  id: string;
  title?: string;
  category?: 'decision' | 'threat' | 'comms' | 'logistics' | 'intel';
  severity?: SeverityLevel;
  occurredAt?: string;
  details?: string;
  [key: string]: unknown;
}

export interface TimelineEventData extends APIResponseBase {
  events?: TimelineEvent[];
}

export interface BackendSnapshot {
  decisions?: Decision[];
  operationalContext?: OperationalContextData;
  threatTracks?: ThreatTrackData;
  tracks?: { tracks?: TracksData } | TracksData;
  riskMetrics?: RiskMetricsData;
  risk?: RiskMetricsData | Record<string, unknown>;
  readiness?: ReadinessData | Record<string, unknown>;
  surveillanceAssets?: ISRAssetData;
  surveillance?: ISRAssetData | Record<string, unknown>;
  messages?: MessageData;
  comms?: MessageData | Record<string, unknown>;
  timelineEvents?: TimelineEventData;
  [key: string]: unknown;
}

export interface SendMessagePayload {
  to: string;
  subject: string;
  body: string;
  priority?: 'routine' | 'priority' | 'immediate' | 'emergency';
  [key: string]: unknown;
}

export type RiskData = RiskMetricsData;

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
