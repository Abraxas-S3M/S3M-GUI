import { useEffect } from 'react';
import { API_CONFIG } from '../api/config';
import { useConnectionStore } from '../connectionStore';

const DEFAULT_POLL_MS = 45_000;
const HEALTHY_WS_POLL_MS = 120_000;

export function useWorkspaceSyncPolling(syncAction: () => Promise<void>): void {
  useEffect(() => {
    if (API_CONFIG.useMock) {
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    const run = async () => {
      try {
        await syncAction();
      } catch {
        // Errors are tracked in the app store.
      }

      if (cancelled) {
        return;
      }

      const delay = useConnectionStore.getState().isWsHealthy() ? HEALTHY_WS_POLL_MS : DEFAULT_POLL_MS;
      timer = window.setTimeout(() => {
        void run();
      }, delay);
    };

    void run();

    return () => {
      cancelled = true;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [syncAction]);
}
