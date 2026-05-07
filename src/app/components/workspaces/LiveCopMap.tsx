import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type MapBounds = [[number, number], [number, number]];

type MapTrack = {
  id: string;
  type: string;
  coordinates?: [number, number];
};

type NormalizedTrackType = 'HOSTILE' | 'FRIENDLY' | 'UNKNOWN';

type MappedTrack = {
  id: string;
  type: NormalizedTrackType;
  coordinates: [number, number];
};

type FeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: {
      id: string;
      type: NormalizedTrackType;
    };
  }>;
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

const MAP_SOURCE_ID = 'cop-tracks-source';
const TRACK_LAYER_ID = 'cop-tracks-layer';
const SELECTED_LAYER_ID = 'cop-selected-track-layer';

const DEFAULT_BOUNDS: MapBounds = [
  [44.5, 20.0],
  [57.5, 31.5],
];

const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'cop-background',
      type: 'background',
      paint: {
        'background-color': 'rgba(3, 8, 16, 0.75)',
      },
    },
  ],
};

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

const toMappedTrack = (track: MapTrack): MappedTrack | null => {
  if (!Array.isArray(track.coordinates) || track.coordinates.length < 2) {
    return null;
  }
  const longitude = Number(track.coordinates[0]);
  const latitude = Number(track.coordinates[1]);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }
  return {
    id: track.id,
    type: normalizeTrackType(track.type),
    coordinates: [longitude, latitude],
  };
};

const getCenter = (bounds: MapBounds): [number, number] => {
  const [southWest, northEast] = bounds;
  const [minLng, minLat] = southWest;
  const [maxLng, maxLat] = northEast;
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
};

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

const buildFallbackTracks = (
  bounds: MapBounds,
  fallbackHostileTrackId: string,
  fallbackFriendlyTrackIds: string[],
  showFallbackUnknownTrack: boolean
): MappedTrack[] => {
  const center = getCenter(bounds);
  const [southWest, northEast] = bounds;
  const lngSpan = Math.max(0.1, northEast[0] - southWest[0]);
  const latSpan = Math.max(0.1, northEast[1] - southWest[1]);
  const tracks: MappedTrack[] = [
    {
      id: fallbackHostileTrackId || 'T-218',
      type: 'HOSTILE',
      coordinates: [center[0] - lngSpan * 0.14, center[1] - latSpan * 0.1],
    },
  ];

  fallbackFriendlyTrackIds.slice(0, 4).forEach((trackId, index) => {
    tracks.push({
      id: trackId,
      type: 'FRIENDLY',
      coordinates: [
        center[0] + lngSpan * (0.05 + index * 0.04),
        center[1] + latSpan * (0.04 - index * 0.03),
      ],
    });
  });

  if (showFallbackUnknownTrack) {
    tracks.push({
      id: 'unknown_track',
      type: 'UNKNOWN',
      coordinates: [center[0] - lngSpan * 0.2, center[1] + latSpan * 0.12],
    });
  }

  return tracks;
};

const toFeatureCollection = (tracks: MappedTrack[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features: tracks.map((track) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: track.coordinates,
    },
    properties: {
      id: track.id,
      type: track.type,
    },
  })),
});

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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  const effectiveBounds = useMemo<MapBounds>(
    () => (mapBounds && isValidBounds(mapBounds) ? mapBounds : DEFAULT_BOUNDS),
    [mapBounds]
  );

  const backendTracks = useMemo(
    () =>
      tracks
        .map((track) => toMappedTrack(track))
        .filter((track): track is MappedTrack => track !== null),
    [tracks]
  );

  const activeTracks = useMemo(() => {
    if (dataSource === 'backend' && backendTracks.length > 0) {
      return backendTracks;
    }
    return buildFallbackTracks(
      effectiveBounds,
      fallbackHostileTrackId,
      fallbackFriendlyTrackIds,
      showFallbackUnknownTrack
    );
  }, [
    backendTracks,
    dataSource,
    effectiveBounds,
    fallbackFriendlyTrackIds,
    fallbackHostileTrackId,
    showFallbackUnknownTrack,
  ]);

  const trackCollection = useMemo(() => toFeatureCollection(activeTracks), [activeTracks]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLE,
        center: getCenter(effectiveBounds),
        zoom: 5.4,
        attributionControl: false,
      });

      map.doubleClickZoom.disable();
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();
      mapRef.current = map;

      map.on('load', () => {
        map.addSource(MAP_SOURCE_ID, {
          type: 'geojson',
          data: trackCollection as unknown as GeoJSON.FeatureCollection,
        });

        map.addLayer({
          id: TRACK_LAYER_ID,
          type: 'circle',
          source: MAP_SOURCE_ID,
          paint: {
            'circle-radius': [
              'case',
              ['==', ['get', 'type'], 'HOSTILE'],
              8.5,
              ['==', ['get', 'type'], 'FRIENDLY'],
              6.5,
              7.5,
            ],
            'circle-color': [
              'match',
              ['get', 'type'],
              'HOSTILE',
              '#FF4F8A',
              'FRIENDLY',
              '#39F39C',
              '#FFC44D',
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': [
              'match',
              ['get', 'type'],
              'HOSTILE',
              '#FF3366',
              'FRIENDLY',
              '#00F0FF',
              '#FFB800',
            ],
            'circle-opacity': 0.9,
          },
        });

        map.addLayer({
          id: SELECTED_LAYER_ID,
          type: 'circle',
          source: MAP_SOURCE_ID,
          filter: ['==', ['get', 'id'], selectedTrackId ?? '__none__'],
          paint: {
            'circle-radius': 14,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#00F0FF',
            'circle-color': 'rgba(0, 240, 255, 0.12)',
          },
        });

        setMapReady(true);
      });

      map.on('error', () => {
        setMapFailed(true);
      });
    } catch {
      setMapFailed(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, [effectiveBounds, selectedTrackId, trackCollection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }
    if (isValidBounds(effectiveBounds)) {
      map.fitBounds(effectiveBounds, { padding: 30, duration: 0, maxZoom: 8.5 });
    }
  }, [effectiveBounds, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }
    const source = map.getSource(MAP_SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(trackCollection as unknown as GeoJSON.FeatureCollection);
  }, [mapReady, trackCollection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !map.getLayer(SELECTED_LAYER_ID)) {
      return;
    }
    map.setFilter(SELECTED_LAYER_ID, ['==', ['get', 'id'], selectedTrackId ?? '__none__']);
  }, [mapReady, selectedTrackId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    const handleTrackClick = (event: maplibregl.MapLayerMouseEvent) => {
      const clickedFeature = event.features?.[0];
      const trackId = clickedFeature?.properties?.id;
      if (typeof trackId === 'string') {
        onTrackSelect(trackId);
      }
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('click', TRACK_LAYER_ID, handleTrackClick);
    map.on('mouseenter', TRACK_LAYER_ID, handleMouseEnter);
    map.on('mouseleave', TRACK_LAYER_ID, handleMouseLeave);

    return () => {
      map.off('click', TRACK_LAYER_ID, handleTrackClick);
      map.off('mouseenter', TRACK_LAYER_ID, handleMouseEnter);
      map.off('mouseleave', TRACK_LAYER_ID, handleMouseLeave);
    };
  }, [mapReady, onTrackSelect]);

  if (mapFailed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute" style={{ top: '30%', left: '45%', opacity: 0.9 }}>
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
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div ref={mapContainerRef} className="absolute inset-0" />
      {dataSource !== 'backend' && (
        <div
          className="absolute bottom-4 left-4 px-2 py-1 rounded text-[10px] uppercase tracking-wider"
          style={{
            color: '#00F0FF',
            background: 'rgba(0, 240, 255, 0.12)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
          }}
        >
          FALLBACK TRACK VIEW
        </div>
      )}
    </div>
  );
}
