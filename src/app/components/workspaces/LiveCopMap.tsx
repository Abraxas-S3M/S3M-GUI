import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type MapBounds = [[number, number], [number, number]];
type CardinalBounds = {
  north: number;
  south: number;
  west: number;
  east: number;
};

type MapTrack = {
  id: string;
  callsign?: string;
  type: string;
  coordinates?: [number, number];
  speed?: string;
  altitude?: string;
  alt?: string;
  heading?: string | number;
  domain?: string;
  affiliation?: string;
};

type NormalizedTrackType = 'HOSTILE' | 'FRIENDLY' | 'UNKNOWN';

type MappedTrack = {
  id: string;
  label: string;
  callsign: string;
  affiliation: NormalizedTrackType;
  domain: string;
  speed: string;
  altitude: string;
  heading: string;
  longitude: number;
  latitude: number;
  x: number;
  y: number;
};

interface LiveCopMapProps {
  tracks: MapTrack[];
  mapBounds: MapBounds | null;
  mapCenter: [number, number] | null;
  dataSource: 'backend' | 'fallback';
  selectedTrackId: string | null;
  onTrackSelect: (trackId: string) => void;
  fallbackHostileTrackId: string;
  fallbackFriendlyTrackIds: string[];
  fallbackUnknownTrackId?: string;
  showFallbackUnknownTrack: boolean;
}

const DEFAULT_MAP_BOUNDS: MapBounds = [
  [34.0, 15.0],
  [57.5, 31.5],
];

const DEFAULT_BOUNDS: CardinalBounds = {
  north: 31.5,
  south: 15.0,
  west: 34.0,
  east: 57.5,
};

const MAPLIBRE_CENTER: [number, number] = [45.0792, 23.8859];
const MAPLIBRE_ZOOM = 4.7;
const MAPLIBRE_STYLE_URL = 'https://demotiles.maplibre.org/style.json';
const MAPLIBRE_MAX_BOUNDS: MapBounds = [
  [34.0, 15.0],
  [57.5, 31.5],
];

const normalizeTrackType = (trackType: string): NormalizedTrackType => {
  const normalized = trackType.toUpperCase();
  if (
    normalized.includes('HOSTILE') ||
    normalized.includes('THREAT') ||
    normalized.includes('ADVERSARY')
  ) {
    return 'HOSTILE';
  }
  if (
    normalized.includes('FRIENDLY') ||
    normalized.includes('ALLY') ||
    normalized.includes('BLUE')
  ) {
    return 'FRIENDLY';
  }
  return 'UNKNOWN';
};

const getCenter = (bounds: MapBounds): [number, number] => {
  const [southWest, northEast] = bounds;
  const [minLng, minLat] = southWest;
  const [maxLng, maxLat] = northEast;
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
};

const isValidCoordinate = (coordinate: [number, number] | null | undefined): coordinate is [number, number] =>
  Array.isArray(coordinate) &&
  coordinate.length >= 2 &&
  Number.isFinite(Number(coordinate[0])) &&
  Number.isFinite(Number(coordinate[1]));

const isValidBounds = (bounds: MapBounds): boolean => {
  const [southWest, northEast] = bounds;
  return (
    Number.isFinite(southWest[0]) &&
    Number.isFinite(southWest[1]) &&
    Number.isFinite(northEast[0]) &&
    Number.isFinite(northEast[1]) &&
    northEast[0] > southWest[0] &&
    northEast[1] > southWest[1]
  );
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toCardinalBounds = (mapBounds?: MapBounds | null): CardinalBounds => ({
  north: mapBounds?.[1]?.[1] ?? DEFAULT_BOUNDS.north,
  south: mapBounds?.[0]?.[1] ?? DEFAULT_BOUNDS.south,
  west: mapBounds?.[0]?.[0] ?? DEFAULT_BOUNDS.west,
  east: mapBounds?.[1]?.[0] ?? DEFAULT_BOUNDS.east,
});

const hashTrackId = (id: string): number =>
  id.split('').reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0);

const buildApproximateCoordinate = (trackId: string, bounds: MapBounds, index: number): [number, number] => {
  const center = getCenter(bounds);
  const [southWest, northEast] = bounds;
  const lngSpan = Math.max(0.08, northEast[0] - southWest[0]);
  const latSpan = Math.max(0.08, northEast[1] - southWest[1]);
  const hash = hashTrackId(trackId || `track-${index}`);
  const angle = ((hash % 360) * Math.PI) / 180;
  const radiusFactor = 0.08 + ((hash % 11) * 0.014);
  const longitude = center[0] + Math.cos(angle) * lngSpan * radiusFactor;
  const latitude = center[1] + Math.sin(angle) * latSpan * radiusFactor;
  return [
    clamp(longitude, southWest[0] + lngSpan * 0.02, northEast[0] - lngSpan * 0.02),
    clamp(latitude, southWest[1] + latSpan * 0.02, northEast[1] - latSpan * 0.02),
  ];
};

const toPercentCoordinate = (
  longitude: number,
  latitude: number,
  bounds: MapBounds
): { x: number; y: number } => {
  const scopedBounds = toCardinalBounds(bounds);
  // Explicit emergency projection formula for deterministic rendering.
  const x = ((longitude - scopedBounds.west) / (scopedBounds.east - scopedBounds.west)) * 100;
  const y = ((scopedBounds.north - latitude) / (scopedBounds.north - scopedBounds.south)) * 100;
  return {
    x: clamp(x, 2, 98),
    y: clamp(y, 2, 98),
  };
};

const inferDomain = (track: MapTrack): string => {
  if (typeof track.domain === 'string' && track.domain.trim()) {
    return track.domain.toUpperCase();
  }
  const normalizedType = (track.type || '').toUpperCase();
  if (normalizedType.includes('SEA') || normalizedType.includes('MARITIME') || normalizedType.includes('SHIP')) {
    return 'MARITIME';
  }
  if (normalizedType.includes('GROUND') || normalizedType.includes('LAND')) {
    return 'GROUND';
  }
  return 'AIR';
};

const toMappedTrack = (track: MapTrack, bounds: MapBounds, index: number): MappedTrack => {
  const callsign = track.callsign?.trim() || track.id;
  const coordinates = isValidCoordinate(track.coordinates)
    ? [Number(track.coordinates[0]), Number(track.coordinates[1])]
    : buildApproximateCoordinate(callsign || track.id, bounds, index);
  const longitude = coordinates[0];
  const latitude = coordinates[1];
  const { x, y } = toPercentCoordinate(longitude, latitude, bounds);
  const affiliation = normalizeTrackType(track.type);
  return {
    id: track.id,
    label: callsign || track.id,
    callsign: callsign || track.id,
    affiliation,
    domain: inferDomain(track),
    speed: track.speed || '--',
    altitude: track.altitude || track.alt || '--',
    heading:
      typeof track.heading === 'number'
        ? `${Math.round(track.heading)}°`
        : track.heading?.toString() || '--',
    longitude,
    latitude,
    x,
    y,
  };
};

const buildFallbackTracks = (
  bounds: MapBounds,
  fallbackHostileTrackId: string,
  fallbackFriendlyTrackIds: string[],
  fallbackUnknownTrackId: string | undefined,
  showFallbackUnknownTrack: boolean
): MappedTrack[] => {
  const tracks: MappedTrack[] = [];
  const pushTrack = (
    id: string,
    affiliation: NormalizedTrackType,
    coordinates: [number, number],
    metadata: { domain: string; speed: string; altitude: string; heading: string }
  ) => {
    const { x, y } = toPercentCoordinate(coordinates[0], coordinates[1], bounds);
    tracks.push({
      id,
      label: id,
      callsign: id,
      affiliation,
      domain: metadata.domain,
      speed: metadata.speed,
      altitude: metadata.altitude,
      heading: metadata.heading,
      longitude: coordinates[0],
      latitude: coordinates[1],
      x,
      y,
    });
  };

  pushTrack(fallbackHostileTrackId || 'T-218', 'HOSTILE', [49.8, 24.7], {
    domain: 'AIR',
    speed: '420 kts',
    altitude: '15K ft',
    heading: '112°',
  });

  fallbackFriendlyTrackIds.slice(0, 4).forEach((trackId, index) => {
    pushTrack(trackId, 'FRIENDLY', [46.7 + index * 1.2, 25.8 - index * 0.6], {
      domain: 'AIR',
      speed: `${82 + index * 4} kts`,
      altitude: `${11 + index}K ft`,
      heading: `${35 + index * 14}°`,
    });
  });

  if (showFallbackUnknownTrack) {
    const unknownTrackId = fallbackUnknownTrackId || 'UNKNOWN-TRACK';
    pushTrack(unknownTrackId, 'UNKNOWN', [52.1, 26.4], {
      domain: 'MARITIME',
      speed: '180 kts',
      altitude: '8K ft',
      heading: '278°',
    });
  }

  return tracks;
};

const getTrackColor = (
  affiliation: NormalizedTrackType
): { fill: string; stroke: string; glow: string; accent: string } => {
  switch (affiliation) {
    case 'HOSTILE':
      return {
        fill: '#FF4F8A',
        stroke: '#FF3366',
        glow: '0 0 0 2px rgba(255, 79, 138, 0.28), 0 0 14px rgba(255, 79, 138, 0.62)',
        accent: '#FFD6E5',
      };
    case 'FRIENDLY':
      return {
        fill: '#39F39C',
        stroke: '#00F0FF',
        glow: '0 0 0 2px rgba(57, 243, 156, 0.28), 0 0 14px rgba(57, 243, 156, 0.62)',
        accent: '#D8FFF0',
      };
    default:
      return {
        fill: '#FFC44D',
        stroke: '#FFB800',
        glow: '0 0 0 2px rgba(255, 196, 77, 0.26), 0 0 13px rgba(255, 196, 77, 0.58)',
        accent: '#FFF1D1',
      };
  }
};

const getReferenceLabelPosition = (
  latitude: number,
  longitude: number,
  bounds: MapBounds
): { left: string; top: string } => {
  const { x, y } = toPercentCoordinate(longitude, latitude, bounds);
  return { left: `${x}%`, top: `${y}%` };
};

export function LiveCopMap({
  tracks,
  mapBounds,
  mapCenter: _mapCenter,
  dataSource,
  selectedTrackId,
  onTrackSelect,
  fallbackHostileTrackId,
  fallbackFriendlyTrackIds,
  fallbackUnknownTrackId,
  showFallbackUnknownTrack,
}: LiveCopMapProps) {
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
  const [mapLibreFailed, setMapLibreFailed] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [focusedTrackScreenPosition, setFocusedTrackScreenPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  const effectiveBounds = useMemo<MapBounds>(
    () => (mapBounds && isValidBounds(mapBounds) ? mapBounds : DEFAULT_MAP_BOUNDS),
    [mapBounds]
  );

  const backendTracks = useMemo(
    () => tracks.map((track, index) => toMappedTrack(track, effectiveBounds, index)),
    [effectiveBounds, tracks]
  );

  const activeTracks = useMemo(() => {
    if (dataSource === 'backend' && tracks.length > 0) {
      return backendTracks;
    }
    return buildFallbackTracks(
      effectiveBounds,
      fallbackHostileTrackId,
      fallbackFriendlyTrackIds,
      fallbackUnknownTrackId,
      showFallbackUnknownTrack
    );
  }, [
    backendTracks,
    dataSource,
    effectiveBounds,
    fallbackFriendlyTrackIds,
    fallbackHostileTrackId,
    fallbackUnknownTrackId,
    showFallbackUnknownTrack,
    tracks.length,
  ]);

  const tracksById = useMemo(
    () => new Map(activeTracks.map((track) => [track.id, track])),
    [activeTracks]
  );
  const focusedTrack = tracksById.get(hoveredTrackId ?? selectedTrackId ?? '');
  const riyadhLabel = getReferenceLabelPosition(24.7136, 46.6753, effectiveBounds);
  const jubailLabel = getReferenceLabelPosition(27.0174, 49.6225, effectiveBounds);
  const arabianGulfLabel = getReferenceLabelPosition(26.2, 51.5, effectiveBounds);
  const redSeaLabel = getReferenceLabelPosition(22.7, 38.4, effectiveBounds);
  const hormuzLabel = getReferenceLabelPosition(26.6, 56.3, effectiveBounds);
  const showSvgFallback = mapLibreFailed;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || mapLibreFailed) {
      return;
    }

    let didLoad = false;
    let map: maplibregl.Map;

    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAPLIBRE_STYLE_URL,
        center: MAPLIBRE_CENTER,
        zoom: MAPLIBRE_ZOOM,
        maxBounds: MAPLIBRE_MAX_BOUNDS,
      });
    } catch (_error) {
      setMapLibreFailed(true);
      return;
    }

    mapRef.current = map;

    const handleLoad = () => {
      didLoad = true;
      setMapLoaded(true);
    };

    const handleInitError = () => {
      if (didLoad) {
        return;
      }
      setMapLoaded(false);
      map.off('error', handleInitError);
      setMapLibreFailed(true);
    };

    map.once('load', handleLoad);
    map.on('error', handleInitError);

    return () => {
      map.off('error', handleInitError);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map.remove();
      if (mapRef.current === map) {
        mapRef.current = null;
      }
    };
  }, [mapLibreFailed]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || mapLibreFailed) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    activeTracks.forEach((track) => {
      if (!Number.isFinite(track.longitude) || !Number.isFinite(track.latitude)) {
        return;
      }

      const isSelected = selectedTrackId === track.id;
      const colors = getTrackColor(track.affiliation);
      const markerButton = document.createElement('button');
      markerButton.type = 'button';
      markerButton.className =
        'relative h-4 w-4 rounded-sm focus:outline-none focus:ring-2 focus:ring-cyber-cyan';
      markerButton.style.background = colors.fill;
      markerButton.style.border = `1px solid ${colors.stroke}`;
      markerButton.style.boxShadow = isSelected ? colors.glow : '0 0 8px rgba(0, 0, 0, 0.45)';
      markerButton.style.transform = `rotate(${track.affiliation === 'HOSTILE' ? 45 : 0}deg) scale(${isSelected ? 1.18 : 1})`;
      markerButton.style.transition = 'transform 150ms ease';
      markerButton.style.cursor = 'pointer';
      markerButton.setAttribute('aria-label', `${track.callsign} ${track.affiliation}`);
      markerButton.onclick = () => onTrackSelect(track.id);
      markerButton.onmouseenter = () => setHoveredTrackId(track.id);
      markerButton.onmouseleave = () => setHoveredTrackId(null);
      markerButton.onfocus = () => setHoveredTrackId(track.id);
      markerButton.onblur = () => setHoveredTrackId(null);

      const markerCenter = document.createElement('span');
      markerCenter.style.position = 'absolute';
      markerCenter.style.left = '50%';
      markerCenter.style.top = '50%';
      markerCenter.style.width = '6px';
      markerCenter.style.height = '6px';
      markerCenter.style.transform = 'translate(-50%, -50%)';
      markerCenter.style.borderRadius = '9999px';
      markerCenter.style.background = colors.accent;
      markerCenter.style.opacity = '0.9';
      markerButton.appendChild(markerCenter);

      const marker = new maplibregl.Marker({
        element: markerButton,
        anchor: 'center',
      })
        .setLngLat([track.longitude, track.latitude])
        .addTo(map);

      markersRef.current.set(track.id, marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
    };
  }, [activeTracks, mapLibreFailed, mapLoaded, onTrackSelect, selectedTrackId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || mapLibreFailed || !focusedTrack) {
      setFocusedTrackScreenPosition(null);
      return;
    }

    const updateFocusedTrackPosition = () => {
      const point = map.project([focusedTrack.longitude, focusedTrack.latitude]);
      setFocusedTrackScreenPosition({
        left: point.x,
        top: point.y,
      });
    };

    updateFocusedTrackPosition();
    map.on('move', updateFocusedTrackPosition);

    return () => {
      map.off('move', updateFocusedTrackPosition);
    };
  }, [focusedTrack, mapLibreFailed, mapLoaded]);

  const focusedTrackTooltipStyle = focusedTrack
    ? showSvgFallback
      ? {
          left: `calc(${focusedTrack.x}% + 14px)`,
          top: `calc(${focusedTrack.y}% - 12px)`,
        }
      : focusedTrackScreenPosition
        ? {
            left: `calc(${focusedTrackScreenPosition.left}px + 14px)`,
            top: `calc(${focusedTrackScreenPosition.top}px - 12px)`,
          }
        : null
    : null;

  return (
    <div className="absolute inset-0 z-0">
      <div ref={mapContainerRef} className="absolute inset-0" />

      {showSvgFallback && (
        <>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="copSeaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#081622" />
                <stop offset="100%" stopColor="#030810" />
              </linearGradient>
              <linearGradient id="copLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1A2A32" />
                <stop offset="100%" stopColor="#0E1A24" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#copSeaGradient)" />
            {Array.from({ length: 9 }).map((_, index) => (
              <line
                key={`v-grid-${index}`}
                x1={index * 12.5}
                y1="0"
                x2={index * 12.5}
                y2="100"
                stroke="rgba(0, 240, 255, 0.08)"
                strokeWidth="0.25"
              />
            ))}
            {Array.from({ length: 7 }).map((_, index) => (
              <line
                key={`h-grid-${index}`}
                x1="0"
                y1={index * 16.66}
                x2="100"
                y2={index * 16.66}
                stroke="rgba(0, 240, 255, 0.08)"
                strokeWidth="0.25"
              />
            ))}

            {/* Saudi + Gulf tactical landmass silhouette */}
            <path
              d="M 8 16 L 12 18 L 15 26 L 18 34 L 20 48 L 21 63 L 23 78 L 28 88 L 38 91 L 51 89 L 60 84 L 68 75 L 73 66 L 78 54 L 85 42 L 88 31 L 85 22 L 80 20 L 71 22 L 64 30 L 58 33 L 55 40 L 50 46 L 44 49 L 37 47 L 29 40 L 24 31 L 19 22 Z"
              fill="url(#copLandGradient)"
              stroke="rgba(0, 240, 255, 0.35)"
              strokeWidth="0.45"
            />
            <path
              d="M 64 30 L 70 31 L 77 30 L 83 27 L 89 24 L 92 21 L 95 24 L 95 37 L 92 46 L 87 49 L 84 46 L 80 44 L 76 39 L 71 35 Z"
              fill="#10212D"
              stroke="rgba(0, 240, 255, 0.28)"
              strokeWidth="0.35"
            />
            <path
              d="M 84 43 L 88 44 L 92 42 L 96 37"
              fill="none"
              stroke="rgba(0, 240, 255, 0.5)"
              strokeWidth="0.5"
              strokeDasharray="1.2 1.2"
            />
          </svg>

          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute text-[11px] uppercase tracking-wider text-cyber-cyan/90" style={riyadhLabel}>
              Riyadh
            </span>
            <span className="absolute text-[11px] uppercase tracking-wider text-cyber-cyan/90" style={jubailLabel}>
              Jubail
            </span>
            <span className="absolute text-[11px] uppercase tracking-wider text-cyber-cyan/80" style={arabianGulfLabel}>
              Arabian Gulf
            </span>
            <span className="absolute text-[11px] uppercase tracking-wider text-cyber-cyan/75" style={redSeaLabel}>
              Red Sea
            </span>
            <span className="absolute text-[11px] uppercase tracking-wider text-cyber-cyan/95" style={hormuzLabel}>
              Strait of Hormuz
            </span>
          </div>

          <div className="absolute inset-0">
            {activeTracks.map((track) => {
              const isSelected = selectedTrackId === track.id;
              const colors = getTrackColor(track.affiliation);
              return (
                <button
                  key={track.id}
                  type="button"
                  className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-sm transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
                  style={{
                    left: `${track.x}%`,
                    top: `${track.y}%`,
                    background: colors.fill,
                    border: `1px solid ${colors.stroke}`,
                    boxShadow: isSelected ? colors.glow : '0 0 8px rgba(0, 0, 0, 0.45)',
                    transform: `translate(-50%, -50%) rotate(${track.affiliation === 'HOSTILE' ? 45 : 0}deg) scale(${isSelected ? 1.18 : 1})`,
                  }}
                  onClick={() => onTrackSelect(track.id)}
                  onMouseEnter={() => setHoveredTrackId(track.id)}
                  onMouseLeave={() => setHoveredTrackId(null)}
                  onFocus={() => setHoveredTrackId(track.id)}
                  onBlur={() => setHoveredTrackId(null)}
                  aria-label={`${track.callsign} ${track.affiliation}`}
                >
                  <span
                    className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ background: colors.accent, opacity: 0.9 }}
                  />
                </button>
              );
            })}
          </div>
        </>
      )}

      {focusedTrack && focusedTrackTooltipStyle && (
        <div
          className="absolute z-20 min-w-[190px] rounded-md border px-3 py-2 text-[11px] uppercase tracking-wider pointer-events-none"
          style={{
            left: focusedTrackTooltipStyle.left,
            top: focusedTrackTooltipStyle.top,
            borderColor: getTrackColor(focusedTrack.affiliation).stroke,
            background: 'rgba(3, 8, 16, 0.95)',
            color: '#D9E9F5',
            boxShadow: '0 0 18px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="mb-1 font-semibold" style={{ color: getTrackColor(focusedTrack.affiliation).fill }}>
            {focusedTrack.callsign}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span>Domain</span>
            <span className="text-right">{focusedTrack.domain}</span>
            <span>Affiliation</span>
            <span className="text-right">{focusedTrack.affiliation}</span>
            <span>Speed</span>
            <span className="text-right">{focusedTrack.speed}</span>
            <span>Altitude</span>
            <span className="text-right">{focusedTrack.altitude}</span>
            <span>Heading</span>
            <span className="text-right">{focusedTrack.heading}</span>
          </div>
        </div>
      )}

      {dataSource !== 'backend' && (
        <div
          className="absolute bottom-4 left-4 px-2 py-1 rounded text-[10px] uppercase tracking-wider"
          style={{
            color: '#00F0FF',
            background: 'rgba(0, 240, 255, 0.12)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
          }}
        >
          SIM TRACK VIEW
        </div>
      )}
    </div>
  );
}
