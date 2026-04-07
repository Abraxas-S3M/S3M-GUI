import type {
  BackendSocketEvent,
  BackendSocketEventType,
  DecisionUpdatedEvent,
  BackendSnapshotEvent,
  BackendErrorEvent,
  BackendHeartbeatEvent
} from './types';

export interface BackendSocketHandlers {
  onSnapshot?: (event: BackendSnapshotEvent) => void;
  onSnapshotRefetch?: () => void;
  onDecisionUpdated?: (event: DecisionUpdatedEvent) => void;
  onHeartbeat?: (event: BackendHeartbeatEvent) => void;
  onError?: (event: BackendErrorEvent) => void;
}

const isReconnectSnapshot = (event: BackendSnapshotEvent): boolean =>
  event.payload._reconnected === true;

export const isBackendSocketEventType = (value: string): value is BackendSocketEventType =>
  value === 'backend.snapshot' ||
  value === 'decision.updated' ||
  value === 'backend.heartbeat' ||
  value === 'backend.error';

export const createBackendSocketHandler =
  (handlers: BackendSocketHandlers) =>
  (event: BackendSocketEvent): void => {
    switch (event.type) {
      case 'backend.snapshot':
        if (isReconnectSnapshot(event)) {
          handlers.onSnapshotRefetch?.();
          return;
        }
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
      default:
        return;
    }
  };
