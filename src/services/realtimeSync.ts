import { useAppStore } from '../app/store';
import { API_CONFIG } from './api/config';
import { useConnectionStore } from './connectionStore';
import { useSystemStatusStore } from './hooks/useSystemStatus';
import { createBackendSocketHandler } from './websocket/handlers';
import { backendWebSocketClient } from './websocket/client';

let initialized = false;
let unsubscribe: (() => void) | null = null;

const syncAllBackendData = (): void => {
  const appStore = useAppStore.getState();
  void appStore.syncDecisionsFromBackend();
  void appStore.syncOperationalContext();
  void appStore.syncThreatTracks();
  void appStore.syncRiskMetrics();
  void appStore.syncReadiness();
};

export function initializeRealtimeSync(): void {
  if (initialized || API_CONFIG.useMock) {
    return;
  }

  initialized = true;

  const handler = createBackendSocketHandler({
    onSnapshot: (event) => {
      const payload = event.payload as Record<string, unknown>;
      if (payload?._reconnected) {
        syncAllBackendData();
        return;
      }

      if (Array.isArray(payload?.decisions)) {
        useAppStore.setState({ decisions: payload.decisions as any[] });
      }

      if (payload?.capabilities && typeof payload.capabilities === 'object') {
        useSystemStatusStore.getState().setCapabilities(payload.capabilities as Record<string, boolean>);
      }
    },
    onDecisionUpdated: (event) => {
      const { id, status } = event.payload;
      if (!id || !status) {
        return;
      }

      useAppStore.setState((state) => ({
        decisions: state.decisions.map((decision) =>
          decision.id === id ? { ...decision, status } : decision
        ),
      }));
    },
    onHeartbeat: () => {
      useConnectionStore.getState().recordWsMessage();
    },
    onError: (event) => {
      // eslint-disable-next-line no-console
      console.warn('[S3M WS] Backend error:', event.payload.message);
    },
    onCapabilityChanged: (event) => {
      useSystemStatusStore.getState().mergeCapabilities(event.payload as Record<string, boolean>);
    },
  });

  unsubscribe = backendWebSocketClient.subscribe(handler);
  backendWebSocketClient.connect(API_CONFIG.wsUrl);

  syncAllBackendData();
}

export function teardownRealtimeSync(): void {
  unsubscribe?.();
  unsubscribe = null;
  backendWebSocketClient.disconnect();
  initialized = false;
}
