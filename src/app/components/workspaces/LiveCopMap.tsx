import { useMemo } from 'react';

type MapBounds = [[number, number], [number, number]];

type MapTrack = {
  id: string;
  type: string;
  coordinates?: [number, number];
};

type LiveTrack = {
  id: string;
  type: 'HOSTILE' | 'FRIENDLY' | 'UNKNOWN';
  xPercent: number;
  yPercent: number;
};

interface LiveCopMapProps {
  tracks: MapTrack[];
  mapBounds: MapBounds | null;
  dataSource: 'backend' | 'fallback';
  selectedTrackId: string | null;
  onTrackSelect: (trackId: string) => void;
  fallbackHostileTrackId: string;
  fallbackFriendlyTrackIds: string[];
  showFallbackUnknownTrack: boolean;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const normalizeTrackType = (trackType: string): 'HOSTILE' | 'FRIENDLY' | 'UNKNOWN' => {
  const normalized = trackType.toUpperCase();
  if (normalized.includes('HOSTILE')) {
    return 'HOSTILE';
  }
  if (normalized.includes('FRIENDLY')) {
    return 'FRIENDLY';
  }
  return 'UNKNOWN';
};

const toLiveTrack = (track: MapTrack, bounds: MapBounds): LiveTrack | null => {
  if (!track.coordinates) {
    return null;
  }

  const [lng, lat] = track.coordinates;
  const [southWest, northEast] = bounds;
  const [minLng, minLat] = southWest;
  const [maxLng, maxLat] = northEast;

  if (maxLng <= minLng || maxLat <= minLat) {
    return null;
  }

  const xPercent = clamp(((lng - minLng) / (maxLng - minLng)) * 100, 4, 96);
  const yPercent = clamp(100 - ((lat - minLat) / (maxLat - minLat)) * 100, 4, 96);

  return {
    id: track.id,
    type: normalizeTrackType(track.type),
    xPercent,
    yPercent,
  };
};

export function LiveCopMap({
  tracks,
  mapBounds,
  dataSource,
  selectedTrackId,
  onTrackSelect,
  fallbackHostileTrackId,
  fallbackFriendlyTrackIds,
  showFallbackUnknownTrack,
}: LiveCopMapProps) {
  const liveTracks = useMemo(() => {
    if (!mapBounds) {
      return [];
    }
    return tracks
      .map((track) => toLiveTrack(track, mapBounds))
      .filter((track): track is LiveTrack => track !== null);
  }, [mapBounds, tracks]);

  const canRenderLive = dataSource === 'backend' && liveTracks.length > 0;

  if (!canRenderLive) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute" style={{ top: '30%', left: '45%' }}>
          <svg width="30" height="30" className="relative">
            <circle
              cx="15"
              cy="15"
              r="13"
              fill="none"
              stroke="#FF3366"
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.5"
              style={{ filter: 'drop-shadow(0 0 8px rgba(255, 51, 102, 0.6))' }}
            />
            <path
              d="M 15 5 L 20 18 L 15 15 L 10 18 Z"
              fill="none"
              stroke="#FF3366"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 4px rgba(255, 51, 102, 0.8))' }}
            />
          </svg>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[15px] font-mono text-cyber-red whitespace-nowrap glow-red">
            {fallbackHostileTrackId || 'T-218'}
          </div>
        </div>

        {fallbackFriendlyTrackIds.map((trackId, i) => (
          <div key={`${trackId}_${i}`} className="absolute" style={{ top: `${35 + i * 10}%`, left: `${55 + i * 5}%` }}>
            <svg width="16" height="16">
              <circle
                cx="8"
                cy="8"
                r="6"
                fill="none"
                stroke="#05DF72"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 0 4px rgba(5, 223, 114, 0.6))' }}
              />
            </svg>
          </div>
        ))}

        {showFallbackUnknownTrack && (
          <div className="absolute" style={{ top: '55%', left: '35%' }}>
            <svg width="18" height="18">
              <rect
                x="4"
                y="4"
                width="10"
                height="10"
                fill="none"
                stroke="#FFB800"
                strokeWidth="2"
                transform="rotate(45 9 9)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(255, 184, 0, 0.6))' }}
              />
            </svg>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {liveTracks.map((track) => {
        const isSelected = selectedTrackId === track.id;
        const sharedPosition = {
          left: `${track.xPercent}%`,
          top: `${track.yPercent}%`,
          transform: 'translate(-50%, -50%)',
        } as const;

        if (track.type === 'HOSTILE') {
          return (
            <button
              key={track.id}
              type="button"
              className="absolute z-[1]"
              style={sharedPosition}
              onClick={(event) => {
                event.stopPropagation();
                onTrackSelect(track.id);
              }}
              title={track.id}
            >
              <svg width="30" height="30" className="relative">
                <circle
                  cx="15"
                  cy="15"
                  r="13"
                  fill="none"
                  stroke={isSelected ? '#FF6A8E' : '#FF3366'}
                  strokeWidth={isSelected ? '2' : '1'}
                  strokeDasharray="3,3"
                  opacity="0.7"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(255, 51, 102, 0.8))' }}
                />
                <path
                  d="M 15 5 L 20 18 L 15 15 L 10 18 Z"
                  fill="none"
                  stroke={isSelected ? '#FF6A8E' : '#FF3366'}
                  strokeWidth={isSelected ? '3' : '2'}
                  style={{ filter: 'drop-shadow(0 0 4px rgba(255, 51, 102, 0.9))' }}
                />
              </svg>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[15px] font-mono text-cyber-red whitespace-nowrap glow-red">
                {track.id}
              </div>
            </button>
          );
        }

        if (track.type === 'FRIENDLY') {
          return (
            <button
              key={track.id}
              type="button"
              className="absolute z-[1]"
              style={sharedPosition}
              onClick={(event) => {
                event.stopPropagation();
                onTrackSelect(track.id);
              }}
              title={track.id}
            >
              <svg width="16" height="16">
                <circle
                  cx="8"
                  cy="8"
                  r={isSelected ? '7' : '6'}
                  fill="none"
                  stroke={isSelected ? '#3DFF97' : '#05DF72'}
                  strokeWidth={isSelected ? '3' : '2'}
                  style={{ filter: 'drop-shadow(0 0 4px rgba(5, 223, 114, 0.8))' }}
                />
              </svg>
            </button>
          );
        }

        return (
          <button
            key={track.id}
            type="button"
            className="absolute z-[1]"
            style={sharedPosition}
            onClick={(event) => {
              event.stopPropagation();
              onTrackSelect(track.id);
            }}
            title={track.id}
          >
            <svg width="18" height="18">
              <rect
                x="4"
                y="4"
                width="10"
                height="10"
                fill="none"
                stroke={isSelected ? '#FFCA4A' : '#FFB800'}
                strokeWidth={isSelected ? '3' : '2'}
                transform="rotate(45 9 9)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(255, 184, 0, 0.8))' }}
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
