import { useCallback, useMemo } from 'react';
import { useAppStore } from '../../../app/store';
import { APIClient } from '../APIClient';
import { mockCommsData } from '../mockData';
import type { CommsData, CommsMessage } from '../types';
import { parseHookError, useBackendResource } from './shared';

const COMMS_TOPICS = ['comms.message.new', 'comms.message.updated'];

interface UseCommsOptions {
  enableAutoRefresh?: boolean;
  refreshMs?: number;
}

function mergeCommsPayload(payload: unknown, current: CommsData): CommsData | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('inbox' in payload) {
    const candidate = payload as Partial<CommsData>;
    return {
      inbox: candidate.inbox ?? current.inbox,
      relayQueue: candidate.relayQueue ?? current.relayQueue,
      updatedAt: candidate.updatedAt ?? new Date().toISOString()
    };
  }

  const message = payload as Partial<CommsMessage>;
  if (!message.id) {
    return null;
  }

  const existing = current.inbox.find((entry) => entry.id === message.id);
  const inbox = existing
    ? current.inbox.map((entry) => (entry.id === message.id ? { ...entry, ...message } as CommsMessage : entry))
    : [{ ...message, read: message.read ?? false } as CommsMessage, ...current.inbox];

  return {
    ...current,
    inbox,
    updatedAt: new Date().toISOString()
  };
}

export function useComms(options: UseCommsOptions = {}) {
  const { enableAutoRefresh = true, refreshMs = 30_000 } = options;
  const setComms = useAppStore((state) => state.setComms);
  const upsertCommsMessage = useAppStore((state) => state.upsertCommsMessage);
  const markCommsMessageRead = useAppStore((state) => state.markCommsMessageRead);

  const state = useBackendResource<CommsData>({
    hookName: 'useComms',
    fetcher: APIClient.getMessages,
    fallbackData: mockCommsData,
    refreshMs: enableAutoRefresh ? refreshMs : undefined,
    wsTopics: COMMS_TOPICS,
    mapWsPayload: mergeCommsPayload,
    onStoreSync: (payload, source) => {
      setComms(payload, source === 'mock' ? 'mock' : 'backend');
    }
  });

  const getMessages = useCallback(async () => {
    await state.refetch();
    return state.data;
  }, [state]);

  const sendMessage = useCallback(
    async (message: Omit<CommsMessage, 'id' | 'timestamp' | 'read'>) => {
      try {
        const created = await APIClient.sendMessage(message);
        upsertCommsMessage(created, 'backend');
        await state.refetch();
        return created;
      } catch (error) {
        throw new Error(parseHookError(error, 'Unable to send message'));
      }
    },
    [state, upsertCommsMessage]
  );

  const markRead = useCallback(
    async (id: string) => {
      try {
        const updated = await APIClient.markMessageRead(id);
        markCommsMessageRead(updated.id, 'backend');
        await state.refetch();
        return updated;
      } catch (error) {
        throw new Error(parseHookError(error, `Unable to mark message "${id}" as read`));
      }
    },
    [markCommsMessageRead, state]
  );

  return useMemo(
    () => ({
      data: state.data,
      loading: state.loading,
      error: state.error,
      isFromBackend: state.isFromBackend,
      refetch: state.refetch,
      getMessages,
      sendMessage,
      markRead
    }),
    [getMessages, markRead, sendMessage, state]
  );
}
