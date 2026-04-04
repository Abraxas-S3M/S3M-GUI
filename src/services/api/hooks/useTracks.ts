import { useCallback, useEffect, useState } from 'react';
import { backendApiClient } from '../client';
import type { TracksData } from '../types';

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Failed to load track data';

export interface UseTracksResult {
  tracks: TracksData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useTracks = (): UseTracksResult => {
  const [tracks, setTracks] = useState<TracksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextTracks = await backendApiClient.getTracks();
      setTracks(nextTracks);
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    tracks,
    loading,
    error,
    refresh
  };
};
