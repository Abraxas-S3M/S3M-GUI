import type { BackendSnapshot, Decision, DecisionStatus } from '../api/types';

export type BackendSocketEventType =
  | 'backend.snapshot'
  | 'decision.updated'
  | 'backend.heartbeat'
  | 'backend.error'
  | 'training.checkpoint'
  | 'training.eval_complete'
  | 'scenario.ingested'
  | 'capability.changed';

export interface SocketEnvelope<TType extends BackendSocketEventType, TPayload> {
  type: TType;
  payload: TPayload;
  timestamp: string;
}

export type BackendSnapshotEvent = SocketEnvelope<'backend.snapshot', BackendSnapshot>;

export interface DecisionUpdatedPayload {
  id: string;
  status: DecisionStatus;
  decision?: Decision;
}

export type DecisionUpdatedEvent = SocketEnvelope<'decision.updated', DecisionUpdatedPayload>;

export type BackendHeartbeatEvent = SocketEnvelope<'backend.heartbeat', { status: 'ok' }>;

export type BackendErrorEvent = SocketEnvelope<'backend.error', { message: string; code?: string }>;

export type TrainingCheckpointEvent = SocketEnvelope<'training.checkpoint', Record<string, unknown>>;
export type TrainingEvalCompleteEvent = SocketEnvelope<'training.eval_complete', Record<string, unknown>>;
export type ScenarioIngestedEvent = SocketEnvelope<'scenario.ingested', Record<string, unknown>>;
export type CapabilityChangedEvent = SocketEnvelope<'capability.changed', Record<string, unknown>>;

export type BackendSocketEvent =
  | BackendSnapshotEvent
  | DecisionUpdatedEvent
  | BackendHeartbeatEvent
  | BackendErrorEvent
  | TrainingCheckpointEvent
  | TrainingEvalCompleteEvent
  | ScenarioIngestedEvent
  | CapabilityChangedEvent;

export type BackendSocketListener = (event: BackendSocketEvent) => void;
