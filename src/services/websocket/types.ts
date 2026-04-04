export const WS_CHANNELS = ['decisions', 'threats', 'risk', 'events', 'messages'] as const;

export type SubscriptionChannel = (typeof WS_CHANNELS)[number];

export interface BaseWebSocketMessage<
  TType extends string,
  TChannel extends SubscriptionChannel | 'system',
  TData,
> {
  type: TType;
  channel: TChannel;
  data: TData;
  timestamp: string;
}

export interface DecisionUpdate {
  id: string;
  title?: string;
  status?: 'pending' | 'approved' | 'rejected';
  risk?: number;
  confidence?: number;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  [key: string]: unknown;
}

export interface ThreatTrack {
  track_id: string;
  location: string | { lat: number; lon: number; alt?: number };
  iff_status: string;
  speed?: number;
  heading?: number;
  [key: string]: unknown;
}

export interface RiskMetrics {
  score?: number;
  level?: 'low' | 'medium' | 'high' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  [key: string]: unknown;
}

export interface TimelineEvent {
  id: string;
  title?: string;
  description?: string;
  severity?: string;
  [key: string]: unknown;
}

export interface IncomingMessagePayload {
  id?: string;
  from?: string;
  content: string;
  priority?: string;
  [key: string]: unknown;
}

export type DecisionUpdatedMessage = BaseWebSocketMessage<'decision_updated', 'decisions', DecisionUpdate>;
export type ThreatUpdatedMessage = BaseWebSocketMessage<'threat_updated', 'threats', ThreatTrack>;
export type RiskUpdatedMessage = BaseWebSocketMessage<'risk_updated', 'risk', RiskMetrics>;
export type TimelineEventMessage = BaseWebSocketMessage<'timeline_event', 'events', TimelineEvent>;
export type MessageArrivalMessage = BaseWebSocketMessage<'message_arrival', 'messages', IncomingMessagePayload>;

export type PongMessage = BaseWebSocketMessage<'pong', 'system', { nonce?: string }>;
export type ServerErrorMessage = BaseWebSocketMessage<
  'error',
  'system',
  { message: string; code?: string }
>;

export type IncomingWebSocketMessage =
  | DecisionUpdatedMessage
  | ThreatUpdatedMessage
  | RiskUpdatedMessage
  | TimelineEventMessage
  | MessageArrivalMessage
  | PongMessage
  | ServerErrorMessage;

export interface AuthMessage {
  type: 'auth';
  token: string;
  timestamp: string;
}

export interface SubscribeMessage {
  type: 'subscribe';
  channel: SubscriptionChannel;
  timestamp: string;
}

export interface UnsubscribeMessage {
  type: 'unsubscribe';
  channel: SubscriptionChannel;
  timestamp: string;
}

export interface PingMessage {
  type: 'ping';
  channel: 'system';
  data: { nonce: string };
  timestamp: string;
}

export interface ClientDataMessage {
  type: 'message';
  channel: SubscriptionChannel;
  data: unknown;
  timestamp: string;
}

export type OutgoingWebSocketMessage =
  | AuthMessage
  | SubscribeMessage
  | UnsubscribeMessage
  | PingMessage
  | ClientDataMessage;

export type WebSocketMessage = IncomingWebSocketMessage | OutgoingWebSocketMessage;

export const isSubscriptionChannel = (value: unknown): value is SubscriptionChannel =>
  typeof value === 'string' && (WS_CHANNELS as readonly string[]).includes(value);
