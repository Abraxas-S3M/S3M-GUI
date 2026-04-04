import type {
  DecisionUpdate,
  IncomingMessagePayload,
  RiskMetrics,
  ThreatTrack,
  TimelineEvent,
} from './types';

type StoreCallback<T> = (payload: T) => void;

const safeDispatch = <T>(label: string, callback: StoreCallback<T> | undefined, payload: T): void => {
  if (!callback) {
    return;
  }

  try {
    callback(payload);
  } catch (error) {
    console.error(`[WebSocketHandlers] Failed to dispatch ${label}`, error);
  }
};

export const handleDecisionUpdate =
  (onDecisionUpdate?: StoreCallback<DecisionUpdate>) =>
  (decision: DecisionUpdate): void => {
    safeDispatch('decision update', onDecisionUpdate, decision);
  };

export const handleThreatUpdate =
  (onThreatUpdate?: StoreCallback<ThreatTrack>) =>
  (track: ThreatTrack): void => {
    safeDispatch('threat update', onThreatUpdate, track);
  };

export const handleRiskUpdate =
  (onRiskUpdate?: StoreCallback<RiskMetrics>) =>
  (metrics: RiskMetrics): void => {
    safeDispatch('risk update', onRiskUpdate, metrics);
  };

export const handleTimelineEvent =
  (onTimelineEvent?: StoreCallback<TimelineEvent>) =>
  (event: TimelineEvent): void => {
    safeDispatch('timeline event', onTimelineEvent, event);
  };

export const handleMessageArrival =
  (onMessageArrival?: StoreCallback<IncomingMessagePayload>) =>
  (message: IncomingMessagePayload): void => {
    safeDispatch('message arrival', onMessageArrival, message);
  };

export interface StoreUpdateCallbacks {
  onDecisionUpdate?: StoreCallback<DecisionUpdate>;
  onThreatUpdate?: StoreCallback<ThreatTrack>;
  onRiskUpdate?: StoreCallback<RiskMetrics>;
  onTimelineEvent?: StoreCallback<TimelineEvent>;
  onMessageArrival?: StoreCallback<IncomingMessagePayload>;
}

export const createStoreUpdateHandlers = (callbacks: StoreUpdateCallbacks) => ({
  decisions: handleDecisionUpdate(callbacks.onDecisionUpdate),
  threats: handleThreatUpdate(callbacks.onThreatUpdate),
  risk: handleRiskUpdate(callbacks.onRiskUpdate),
  events: handleTimelineEvent(callbacks.onTimelineEvent),
  messages: handleMessageArrival(callbacks.onMessageArrival),
});
