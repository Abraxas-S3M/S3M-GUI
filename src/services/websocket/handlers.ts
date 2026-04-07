import type {
  BackendSocketEvent,
  BackendSocketEventType,
  CapabilityChangedEvent,
  DecisionUpdatedEvent,
  BackendSnapshotEvent,
  BackendErrorEvent,
  BackendHeartbeatEvent,
  ScenarioIngestedEvent,
  TrainingCheckpointEvent,
  TrainingEvalCompleteEvent
} from './types';

export interface BackendSocketHandlers {
  onSnapshot?: (event: BackendSnapshotEvent) => void;
  onDecisionUpdated?: (event: DecisionUpdatedEvent) => void;
  onHeartbeat?: (event: BackendHeartbeatEvent) => void;
  onError?: (event: BackendErrorEvent) => void;
  onTrainingCheckpoint?: (event: TrainingCheckpointEvent) => void;
  onTrainingEvalComplete?: (event: TrainingEvalCompleteEvent) => void;
  onScenarioIngested?: (event: ScenarioIngestedEvent) => void;
  onCapabilityChanged?: (event: CapabilityChangedEvent) => void;
}

export const isBackendSocketEventType = (value: string): value is BackendSocketEventType =>
  value === 'backend.snapshot' ||
  value === 'decision.updated' ||
  value === 'backend.heartbeat' ||
  value === 'backend.error' ||
  value === 'training.checkpoint' ||
  value === 'training.eval_complete' ||
  value === 'scenario.ingested' ||
  value === 'capability.changed';

export const createBackendSocketHandler =
  (handlers: BackendSocketHandlers) =>
  (event: BackendSocketEvent): void => {
    switch (event.type) {
      case 'backend.snapshot':
        handlers.onSnapshot?.(event);
        return;
      case 'decision.updated':
        handlers.onDecisionUpdated?.(event);
        return;
      case 'backend.heartbeat':
        handlers.onHeartbeat?.(event);
        return;
      case 'backend.error':
        handlers.onError?.(event);
        return;
      case 'training.checkpoint':
        if (handlers.onTrainingCheckpoint) {
          handlers.onTrainingCheckpoint(event);
        } else {
          // eslint-disable-next-line no-console
          console.info('[S3M WS] training.checkpoint event received', event.payload);
        }
        return;
      case 'training.eval_complete':
        if (handlers.onTrainingEvalComplete) {
          handlers.onTrainingEvalComplete(event);
        } else {
          // eslint-disable-next-line no-console
          console.info('[S3M WS] training.eval_complete event received', event.payload);
        }
        return;
      case 'scenario.ingested':
        if (handlers.onScenarioIngested) {
          handlers.onScenarioIngested(event);
        } else {
          // eslint-disable-next-line no-console
          console.info('[S3M WS] scenario.ingested event received', event.payload);
        }
        return;
      case 'capability.changed':
        if (handlers.onCapabilityChanged) {
          handlers.onCapabilityChanged(event);
        } else {
          // eslint-disable-next-line no-console
          console.info('[S3M WS] capability.changed event received', event.payload);
        }
        return;
      default:
        return;
    }
  };
