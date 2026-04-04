import { useMemo } from 'react';
import { useAppStore } from '../../../app/store';
import { APIClient } from '../APIClient';
import { mockTracks } from '../mockData';
import type { ThreatTrack, TrackDomain } from '../types';
import { useBackendResource } from './shared';

const TRACK_TOPICS = ['tracks.updated', 'track.updated'];

interface UseTracksOptions {
  domain?: TrackDomain | 'all';
  minConfidence?: number;
  enableAutoRefresh?: boolean;
  refreshMs?: number;
}

function dedupeAndCorrelateTracks(rawTracks: ThreatTrack[]): ThreatTrack[] {
  const trackMap = new Map<string, ThreatTrack>();

  rawTracks.forEach((track) => {
    const existing = trackMap.get(track.id);
    if (!existing) {
      trackMap.set(track.id, {
        ...track,
        correlatedTrackIds: [...new Set(track.correlatedTrackIds)]
      });
      return;
    }

    const latestTrack = new Date(track.lastSeen).getTime() >= new Date(existing.lastSeen).getTime() ? track : existing;
    trackMap.set(track.id, {
      ...latestTrack,
      confidence: Math.max(existing.confidence, track.confidence),
      severity: Math.max(existing.severity, track.severity),
      correlatedTrackIds: [...new Set([...existing.correlatedTrackIds, ...track.correlatedTrackIds])]
    });
  });

  trackMap.forEach((track) => {
    track.correlatedTrackIds.forEach((correlatedId) => {
      const correlated = trackMap.get(correlatedId);
      if (!correlated) {
        return;
      }
      if (!correlated.correlatedTrackIds.includes(track.id)) {
        correlated.correlatedTrackIds = [...correlated.correlatedTrackIds, track.id];
      }
    });
  });

  return [...trackMap.values()].sort((a, b) => {
    if (a.severity !== b.severity) {
      return b.severity - a.severity;
    }
    return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
  });
}

function mergeTrackPayload(payload: unknown, current: ThreatTrack[]): ThreatTrack[] | null {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return dedupeAndCorrelateTracks(payload as ThreatTrack[]);
  }

  if (typeof payload === 'object' && payload !== null) {
    const track = payload as Partial<ThreatTrack>;
    if (!track.id) {
      return null;
    }
    const merged = current.some((entry) => entry.id === track.id)
      ? current.map((entry) => (entry.id === track.id ? { ...entry, ...track } as ThreatTrack : entry))
      : [...current, track as ThreatTrack];
    return dedupeAndCorrelateTracks(merged);
  }

  return null;
}

export function useTracks(options: UseTracksOptions = {}) {
  const setTracks = useAppStore((state) => state.setTracks);
  const { domain = 'all', minConfidence = 0, enableAutoRefresh = true, refreshMs = 30_000 } = options;

  const state = useBackendResource<ThreatTrack[]>({
    hookName: 'useTracks',
    fetcher: APIClient.getTracks,
    fallbackData: dedupeAndCorrelateTracks(mockTracks),
    refreshMs: enableAutoRefresh ? refreshMs : undefined,
    wsTopics: TRACK_TOPICS,
    mapWsPayload: mergeTrackPayload,
    onStoreSync: (payload, source) => {
      setTracks(payload, source === 'mock' ? 'mock' : source);
    }
  });

  const filteredTracks = useMemo(
    () =>
      state.data.filter((track) => {
        const domainMatch = domain === 'all' ? true : track.domain === domain;
        const confidenceMatch = track.confidence >= minConfidence;
        return domainMatch && confidenceMatch;
      }),
    [domain, minConfidence, state.data]
  );

  return useMemo(
    () => ({
      data: filteredTracks,
      loading: state.loading,
      error: state.error,
      isFromBackend: state.isFromBackend,
      refetch: state.refetch
    }),
    [filteredTracks, state]
  );
}
