import { useCallback, useEffect } from 'react';
import { useAppStore } from '../../../app/store';
import { DEFAULT_BACKEND_SYNC_INTERVAL_MS } from '../config';

export interface UseBackendSyncOptions {
  enabled?: boolean;
  intervalMs?: number;
  syncOnMount?: boolean;
}

export interface UseBackendSyncResult {
  syncStatus: ReturnType<typeof useAppStore.getState>['backendSyncStatus'];
  syncError: string | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  syncNow: () => Promise<void>;
}

export const useBackendSync = (options: UseBackendSyncOptions = {}): UseBackendSyncResult => {
  const { enabled = true, intervalMs = DEFAULT_BACKEND_SYNC_INTERVAL_MS, syncOnMount = true } = options;

  const syncNow = useAppStore((state) => state.syncDecisionsFromBackend);
  const syncStatus = useAppStore((state) => state.backendSyncStatus);
  const syncError = useAppStore((state) => state.backendSyncError);
  const lastSyncedAt = useAppStore((state) => state.lastBackendSyncAt);

  const triggerSync = useCallback(async () => {
    await syncNow();
  }, [syncNow]);

  useEffect(() => {
    if (!enabled || !syncOnMount) {
      return;
    }

    void triggerSync();
  }, [enabled, syncOnMount, triggerSync]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) {
      return;
    }

    const timer = setInterval(() => {
      void triggerSync();
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [enabled, intervalMs, triggerSync]);

  return {
    syncStatus,
    syncError,
    lastSyncedAt,
    isSyncing: syncStatus === 'syncing',
    syncNow: triggerSync
  };
};
