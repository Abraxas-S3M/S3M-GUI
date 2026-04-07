export type RequestLifecycleStatus = 'loading' | 'success' | 'error';
export type BackendSyncStatus = 'idle' | 'syncing' | 'ready' | 'error';

export type ClassificationLevel = 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET' | 'TS_SCI';
export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OperationalStatus = 'operational' | 'caution' | 'critical';
export type DataSource = 'mock' | 's3m-core';
export type TransportType = 'fetch' | 'axios';

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

export interface DecisionRecord {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  severity: SeverityLevel;
  risk: number;
  confidence: number;
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
  label?: string;
  source?: string;
  severity?: SeverityLevel;
  level?: SeverityLevel;
  domain?: string;
  risk?: number;
  confidence?: number;
  summary?: string;
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
  directives?: OperationalDirective[];
  updatedAt?: string;
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
  composite?: number;
  domains?: RiskDomainBreakdown[];
  domainBreakdown?: RiskDomainBreakdown[];
  topDrivers?: RiskDriver[];
  drivers?: RiskDriver[];
  forecast?: RiskProjection[];
}

export interface ThreatTrack {
  id: string;
  type?: string;
  domain?: string;
  confidence?: number;
  severity?: number;
  status?: OperationalStatus;
  location?: string;
  speed?: string;
  altitude?: string;
  sourceReliability?: 'HIGH' | 'MEDIUM' | 'LOW';
  correlatedTrackIds?: string[];
  summary?: string;
  lastUpdate?: string;
  lastSeen?: string;
  [key: string]: unknown;
}

export interface ThreatTrackData extends APIResponseBase {
  kinetic?: ThreatTrack[];
  cyber?: ThreatTrack[];
  intel?: ThreatTrack[];
}

export type TracksData = ThreatTrack[];

export interface UnitStatus {
  unit?: string;
  unitId?: string;
  deployable?: number;
  nonDeployable?: number;
  readinessScore?: number;
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
  equipment?: EquipmentStatus[] | Record<string, number>;
  personnel?: Record<string, unknown>;
  forecast?: Record<string, unknown>;
  deployable?: number;
  nonDeployable?: number;
  total?: number;
  updatedAt?: string;
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
  assets?: ISRAsset[];
  taskingQueue?: Record<string, unknown>[];
  targetBoard?: Record<string, unknown>[];
  updatedAt?: string;
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
  timestamp?: string;
  read?: boolean;
  [key: string]: unknown;
}

export interface MessageData extends APIResponseBase {
  inbox?: MessageItem[];
  pendingApprovals?: PendingItem[];
  relayQueue?: Record<string, unknown>[];
  updatedAt?: string;
}

export type CommsData = MessageData;
export type CommsMessage = MessageItem;

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

export interface BackendCapabilities {
  live_briefing: boolean;
  bilingual_summary: boolean;
  training_metrics: boolean;
  scenario_ingest: boolean;
  [key: string]: boolean;
}

export interface SystemStatusData extends APIResponseBase {
  api_status: 'healthy' | 'degraded' | 'unavailable';
  active_track: string;
  promoted_checkpoint: string;
  uptime_seconds: number;
  trainer_status: 'idle' | 'training' | 'evaluating';
  last_checkpoint_at: string;
  last_eval_score: number;
  eval_trend: number[];
  last_scenario_pack: string;
  last_error: string | null;
  capabilities: BackendCapabilities;
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
  getSystemStatus(): Promise<SystemStatusData>;
}
