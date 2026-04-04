import { useCallback, useMemo } from 'react';
import { useAppStore } from '../../../app/store';
import { APIClient } from '../APIClient';
import { mockDecisions } from '../mockData';
import type { Decision } from '../types';
import { parseHookError, useBackendResource } from './shared';

const DECISION_TOPICS = ['decisions.updated', 'decision.updated', 'decision.created'];

function normalizeDecisionPayload(payload: unknown, current: Decision[]): Decision[] | null {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload as Decision[];
  }

  if (typeof payload === 'object' && payload !== null) {
    const candidate = payload as Partial<Decision>;
    if (!candidate.id) {
      return null;
    }

    const existing = current.find((item) => item.id === candidate.id);
    if (existing) {
      return current.map((item) => (item.id === candidate.id ? { ...item, ...candidate } as Decision : item));
    }

    return [...current, candidate as Decision];
  }

  return null;
}

function createAuditEntry(
  decisionId: string,
  action: 'approved' | 'rejected' | 'updated' | 'received',
  source: 'backend' | 'mock' | 'ui' | 'websocket',
  comment?: string
) {
  return {
    id: `AUD-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
    decisionId,
    action,
    comment,
    actor: source === 'ui' ? 'operator' : 'system',
    source,
    timestamp: new Date().toISOString()
  } as const;
}

export function useDecisions() {
  const setDecisions = useAppStore((state) => state.setDecisions);
  const updateDecisionStatusInStore = useAppStore((state) => state.updateDecisionStatus);
  const addDecisionAudit = useAppStore((state) => state.addDecisionAudit);

  const state = useBackendResource<Decision[]>({
    hookName: 'useDecisions',
    fetcher: APIClient.getDecisions,
    fallbackData: mockDecisions,
    wsTopics: DECISION_TOPICS,
    mapWsPayload: normalizeDecisionPayload,
    onStoreSync: (payload, source) => {
      const storeSource = source === 'mock' ? 'mock' : 'backend';
      setDecisions(payload, storeSource);

      if (source === 'websocket') {
        payload.forEach((decision) => {
          addDecisionAudit(createAuditEntry(decision.id, 'received', 'websocket', 'Decision stream update'));
        });
      }
    }
  });

  const applyDecisionAction = useCallback(
    async (id: string, status: 'approved' | 'rejected', comment?: string): Promise<Decision | null> => {
      try {
        const decision =
          status === 'approved'
            ? await APIClient.approveDecision(id, comment)
            : await APIClient.rejectDecision(id, comment);
        updateDecisionStatusInStore(id, status, comment, 'backend');
        addDecisionAudit(createAuditEntry(id, status, 'backend', comment));
        await state.refetch();
        return decision;
      } catch (error) {
        const message = parseHookError(
          error,
          `Unable to ${status === 'approved' ? 'approve' : 'reject'} decision "${id}"`
        );
        addDecisionAudit(createAuditEntry(id, 'updated', 'mock', message));
        throw new Error(message);
      }
    },
    [addDecisionAudit, state, updateDecisionStatusInStore]
  );

  const getDecisions = useCallback(async () => {
    await state.refetch();
    return state.data;
  }, [state]);

  const approveDecision = useCallback(
    async (id: string, comment?: string) => applyDecisionAction(id, 'approved', comment),
    [applyDecisionAction]
  );

  const rejectDecision = useCallback(
    async (id: string, comment?: string) => applyDecisionAction(id, 'rejected', comment),
    [applyDecisionAction]
  );

  return useMemo(
    () => ({
      data: state.data,
      loading: state.loading,
      error: state.error,
      isFromBackend: state.isFromBackend,
      refetch: state.refetch,
      getDecisions,
      approveDecision,
      rejectDecision
    }),
    [approveDecision, getDecisions, rejectDecision, state]
  );
}
