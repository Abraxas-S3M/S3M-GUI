import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type MapBounds = [[number, number], [number, number]];

type MapTrack = {
  id: string;
  callsign?: string;
  type: string;
  coordinates?: [number, number];
};

type NormalizedTrackType = 'HOSTILE' | 'FRIENDLY' | 'UNKNOWN';

type MappedTrack = {
  id: string;
  label: string;
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
      label: string;
      type: NormalizedTrackType;
    };
  }>;
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

const MAP_SOURCE_ID = 'cop-tracks-source';
const BASEMAP_SOURCE_ID = 'cop-basemap-source';
const TRACK_LAYER_ID = 'cop-tracks-layer';
const SELECTED_LAYER_ID = 'cop-selected-track-layer';

const DEFAULT_BOUNDS: MapBounds = [
  [44.5, 20.0],
  [57.5, 31.5],
];
const DEFAULT_CENTER: [number, number] = [50.8, 25.6];

const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    [BASEMAP_SOURCE_ID]: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '',
    },
  },
  layers: [
    {
      id: 'cop-background',
      type: 'background',
      paint: {
        'background-color': '#030810',
      },
    },
    {
      id: 'cop-basemap-layer',
      type: 'raster',
      source: BASEMAP_SOURCE_ID,
      paint: {
        'raster-opacity': 0.85,
        'raster-saturation': -0.35,
        'raster-contrast': 0.2,
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

const toMappedTrack = (track: MapTrack, bounds: MapBounds, index: number): MappedTrack => {
  const label = track.callsign?.trim() || track.id;
  const coordinates = isValidCoordinate(track.coordinates)
    ? [Number(track.coordinates[0]), Number(track.coordinates[1])]
    : buildApproximateCoordinate(label || track.id, bounds, index);
  return {
    id: track.id,
    label: label || track.id,
    type: normalizeTrackType(track.type),
    coordinates,
  };
};

const buildFallbackTracks = (
  bounds: MapBounds,
  fallbackHostileTrackId: string,
  fallbackFriendlyTrackIds: string[],
  fallbackUnknownTrackId: string | undefined,
  showFallbackUnknownTrack: boolean
): MappedTrack[] => {
  const center = getCenter(bounds);
  const [southWest, northEast] = bounds;
  const lngSpan = Math.max(0.1, northEast[0] - southWest[0]);
  const latSpan = Math.max(0.1, northEast[1] - southWest[1]);
  const tracks: MappedTrack[] = [
    {
      id: fallbackHostileTrackId || 'T-218',
      label: fallbackHostileTrackId || 'T-218',
      type: 'HOSTILE',
      coordinates: [center[0] - lngSpan * 0.14, center[1] - latSpan * 0.1],
    },
  ];

  fallbackFriendlyTrackIds.slice(0, 4).forEach((trackId, index) => {
    tracks.push({
      id: trackId,
      label: trackId,
      type: 'FRIENDLY',
      coordinates: [
        center[0] + lngSpan * (0.05 + index * 0.04),
        center[1] + latSpan * (0.04 - index * 0.03),
      ],
    });
  });

  if (showFallbackUnknownTrack) {
    const unknownTrackId = fallbackUnknownTrackId || 'UNKNOWN-TRACK';
    tracks.push({
      id: unknownTrackId,
      label: unknownTrackId,
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
      label: track.label,
      type: track.type,
    },
  })),
});

const getTrackColor = (type: NormalizedTrackType): string => {
  switch (type) {
    case 'HOSTILE':
      return '#FF4F8A';
    case 'FRIENDLY':
      return '#39F39C';
    default:
      return '#FFC44D';
  }
};

const buildTrackPopup = (track: MappedTrack): string => {
  const trackColor = getTrackColor(track.type);
  return `
    <div style="background: rgba(3, 8, 16, 0.94); border: 1px solid ${trackColor}88; border-radius: 8px; padding: 6px 8px; color: #E6F1FF; min-width: 104px; box-shadow: 0 0 14px ${trackColor}44;">
      <div style="font-size: 10px; color: ${trackColor}; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700;">${track.type}</div>
      <div style="font-size: 12px; color: #FFFFFF; font-weight: 600; margin-top: 2px;">${track.label || track.id}</div>
    </div>
  `;
};

export function LiveCopMap({
  tracks,
  mapBounds,
  mapCenter,
  dataSource,
  selectedTrackId,
  onTrackSelect,
  fallbackHostileTrackId,
  fallbackFriendlyTrackIds,
  fallbackUnknownTrackId,
  showFallbackUnknownTrack,
}: LiveCopMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hoverPopupRef = useRef<maplibregl.Popup | null>(null);
  const selectedPopupRef = useRef<maplibregl.Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  const effectiveBounds = useMemo<MapBounds>(
    () => (mapBounds && isValidBounds(mapBounds) ? mapBounds : DEFAULT_BOUNDS),
    [mapBounds]
  );

  const effectiveCenter = useMemo<[number, number]>(
    () => (isValidCoordinate(mapCenter) ? mapCenter : getCenter(effectiveBounds)),
    [effectiveBounds, mapCenter]
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
  const trackCollection = useMemo(() => toFeatureCollection(activeTracks), [activeTracks]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLE,
        center: DEFAULT_CENTER,
        zoom: 5.4,
        attributionControl: false,
      });

      map.doubleClickZoom.disable();
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();
      mapRef.current = map;

      map.on('load', () => {
        if (!map.getSource(MAP_SOURCE_ID)) {
          map.addSource(MAP_SOURCE_ID, {
            type: 'geojson',
            data: trackCollection as unknown as GeoJSON.FeatureCollection,
          });
        }

        if (!map.getLayer(TRACK_LAYER_ID)) {
          map.addLayer({
            id: TRACK_LAYER_ID,
            type: 'circle',
            source: MAP_SOURCE_ID,
            paint: {
              'circle-radius': [
                'case',
                ['==', ['get', 'type'], 'HOSTILE'],
                8.8,
                ['==', ['get', 'type'], 'FRIENDLY'],
                6.8,
                7.6,
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
              'circle-opacity': 0.92,
            },
          });
        }

        if (!map.getLayer(SELECTED_LAYER_ID)) {
          map.addLayer({
            id: SELECTED_LAYER_ID,
            type: 'circle',
            source: MAP_SOURCE_ID,
            filter: ['==', ['get', 'id'], selectedTrackId ?? '__none__'],
            paint: {
              'circle-radius': 14.5,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#00F0FF',
              'circle-color': 'rgba(0, 240, 255, 0.12)',
            },
          });
        }

        setMapReady(true);
      });

      map.on('error', () => {
        setMapFailed(true);
      });
    } catch {
      setMapFailed(true);
    }

    return () => {
      hoverPopupRef.current?.remove();
      selectedPopupRef.current?.remove();
      hoverPopupRef.current = null;
      selectedPopupRef.current = null;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }
    if (isValidBounds(effectiveBounds)) {
      map.fitBounds(effectiveBounds, { padding: 32, duration: 0, maxZoom: 8.8 });
      return;
    }
    map.easeTo({ center: effectiveCenter, zoom: 5.6, duration: 0 });
  }, [effectiveBounds, effectiveCenter, mapReady]);

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

    if (!selectedTrackId) {
      selectedPopupRef.current?.remove();
      selectedPopupRef.current = null;
      return;
    }

    const selectedTrack = tracksById.get(selectedTrackId);
    if (!selectedTrack) {
      return;
    }

    if (!selectedPopupRef.current) {
      selectedPopupRef.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: [0, -12],
      });
    }
    selectedPopupRef.current
      .setLngLat(selectedTrack.coordinates)
      .setHTML(buildTrackPopup(selectedTrack))
      .addTo(map);
    map.easeTo({ center: selectedTrack.coordinates, duration: 380, essential: true });
  }, [mapReady, selectedTrackId, tracksById]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    const getFeatureTrack = (feature: maplibregl.MapGeoJSONFeature | undefined): MappedTrack | null => {
      const featureId = feature?.properties?.id;
      if (typeof featureId !== 'string') {
        return null;
      }
      return tracksById.get(featureId) ?? null;
    };

    const handleTrackClick = (event: maplibregl.MapLayerMouseEvent) => {
      const clickedTrack = getFeatureTrack(event.features?.[0]);
      if (clickedTrack) {
        onTrackSelect(clickedTrack.id);
      }
    };

    const handleTrackHover = (event: maplibregl.MapLayerMouseEvent) => {
      const hoveredTrack = getFeatureTrack(event.features?.[0]);
      if (!hoveredTrack) {
        return;
      }
      if (!hoverPopupRef.current) {
        hoverPopupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -10],
        });
      }
      hoverPopupRef.current
        .setLngLat(hoveredTrack.coordinates)
        .setHTML(buildTrackPopup(hoveredTrack))
        .addTo(map);
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
      hoverPopupRef.current?.remove();
      hoverPopupRef.current = null;
    };

    map.on('click', TRACK_LAYER_ID, handleTrackClick);
    map.on('mousemove', TRACK_LAYER_ID, handleTrackHover);
    map.on('mouseleave', TRACK_LAYER_ID, handleMouseLeave);

    return () => {
      map.off('click', TRACK_LAYER_ID, handleTrackClick);
      map.off('mousemove', TRACK_LAYER_ID, handleTrackHover);
      map.off('mouseleave', TRACK_LAYER_ID, handleMouseLeave);
      hoverPopupRef.current?.remove();
      hoverPopupRef.current = null;
    };
  }, [mapReady, onTrackSelect, tracksById]);

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
    <div className="absolute inset-0 z-0">
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
