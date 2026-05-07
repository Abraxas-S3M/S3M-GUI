import { API_CONFIG } from './config';

type RuntimeEnv = Record<string, string | boolean | undefined>;

const runtimeEnv: RuntimeEnv = (
  (import.meta as unknown as { env?: RuntimeEnv }).env ?? {}
);

const R2_HOST_MARKERS = ['r2.cloudflarestorage.com', '.r2.dev'];
const DEFAULT_COP_TRACK = 'saudi_mod';

export type CopDataSource = 'backend' | 'fallback';

export interface CopTheater {
  id?: string;
  name?: string;
  region?: string;
  center?: [number, number];
  bounds?: [[number, number], [number, number]];
  [key: string]: unknown;
}

export interface CopMapLayer {
  id: string;
  name: string;
  enabled: boolean;
  color?: string;
  [key: string]: unknown;
}

export interface CopMapConfig {
  center: [number, number];
  bounds: [[number, number], [number, number]];
  zoom?: number;
  layers: CopMapLayer[];
  [key: string]: unknown;
}

export interface CopFeature {
  id: string;
  type: string;
  layer: string;
  label?: string;
  coordinates?: [number, number];
  geometry?: {
    type: string;
    coordinates?: unknown;
    [key: string]: unknown;
  };
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CopTrack {
  id: string;
  type: string;
  status: string;
  confidence: number;
  speed?: string;
  altitude?: string;
  sourceReliability?: string;
  hostileProbability?: number;
  friendlyProbability?: number;
  unknownProbability?: number;
  lastUpdate?: string;
  recommendedAction?: string;
  sensors?: string[];
  coordinates?: [number, number];
  [key: string]: unknown;
}

export interface CopAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  status?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface CopDecision {
  id: string;
  title: string;
  description?: string;
  status: string;
  severity?: string;
  confidence?: number;
  risk?: number;
  timestamp?: string;
  [key: string]: unknown;
}

export interface CopFeedItem {
  id: string;
  type: string;
  message: string;
  english?: string;
  arabic?: string;
  priority?: string;
  confidence?: number;
  timestamp?: string;
  [key: string]: unknown;
}

export interface CopPanelState {
  key: string;
  label: string;
  value: string | number;
  status?: string;
  trend?: string;
  [key: string]: unknown;
}

export interface CopState {
  theater?: CopTheater;
  map: CopMapConfig;
  features: CopFeature[];
  tracks: CopTrack[];
  alerts: CopAlert[];
  decisions: CopDecision[];
  feed: CopFeedItem[];
  panelState: CopPanelState[];
  systemStatus?: Record<string, unknown>;
  lastUpdate?: string;
  [key: string]: unknown;
}

export interface CopSocketEvent {
  type: string;
  payload: unknown;
  receivedAt: string;
  raw: unknown;
}

const DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [44.5, 20.0],
  [57.5, 31.5],
];
const DEFAULT_CENTER: [number, number] = [50.8, 25.6];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string'
    ? value
    : typeof value === 'number'
      ? String(value)
      : fallback;

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const toCoordinatePair = (value: unknown): [number, number] | null => {
  if (!Array.isArray(value) || value.length < 2) {
    return null;
  }
  const first = asNumber(value[0]);
  const second = asNumber(value[1]);
  if (first === null || second === null) {
    return null;
  }
  return [first, second];
};

const toBounds = (value: unknown): [[number, number], [number, number]] => {
  const direct = asArray(value);
  if (direct.length >= 2) {
    const first = toCoordinatePair(direct[0]);
    const second = toCoordinatePair(direct[1]);
    if (first && second) {
      return [first, second];
    }
  }

  const record = isRecord(value) ? value : null;
  if (record) {
    const southWest = toCoordinatePair(record.southwest);
    const northEast = toCoordinatePair(record.northeast);
    if (southWest && northEast) {
      return [southWest, northEast];
    }
  }

  return DEFAULT_BOUNDS;
};

const toTimestamp = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString();
};

const normalizeLayer = (value: unknown, index: number): CopMapLayer => {
  const record = isRecord(value) ? value : {};
  const id = asString(record.id || record.layer || record.name, `layer_${index + 1}`);
  return {
    id,
    name: asString(record.name, id),
    enabled: record.enabled !== false,
    color: asString(record.color, undefined),
    ...record,
  };
};

const normalizeFeature = (value: unknown, index: number): CopFeature => {
  const record = isRecord(value) ? value : {};
  const geometry = isRecord(record.geometry) ? record.geometry : undefined;
  const directCoordinates =
    toCoordinatePair(record.coordinates) ??
    toCoordinatePair(record.position) ??
    toCoordinatePair(geometry?.coordinates);

  return {
    id: asString(record.id, `feature_${index + 1}`),
    type: asString(record.type || record.feature_type, 'feature'),
    layer: asString(record.layer || record.layer_id || record.category, 'units'),
    label: asString(record.label || record.name, undefined),
    coordinates: directCoordinates ?? undefined,
    geometry: geometry
      ? {
          type: asString(geometry.type, 'Point'),
          coordinates: geometry.coordinates,
          ...geometry,
        }
      : undefined,
    properties: isRecord(record.properties) ? record.properties : undefined,
    ...record,
  };
};

const normalizeTrack = (value: unknown, index: number): CopTrack => {
  const record = isRecord(value) ? value : {};
  const longitude =
    asNumber(record.longitude) ??
    asNumber(record.lng) ??
    asNumber(record.lon) ??
    asNumber(record.x);
  const latitude = asNumber(record.latitude) ?? asNumber(record.lat) ?? asNumber(record.y);
  const coordinates =
    longitude !== null && latitude !== null
      ? ([longitude, latitude] as [number, number])
      : toCoordinatePair(record.coordinates) ??
        toCoordinatePair(record.position) ??
        undefined;

  return {
    id: asString(record.id || record.track_id, `track_${index + 1}`),
    type: asString(record.type || record.classification, 'UNKNOWN'),
    status: asString(record.status, 'unknown'),
    confidence: asNumber(record.confidence ?? record.conf) ?? 0,
    speed: asString(record.speed, undefined),
    altitude: asString(record.altitude || record.alt, undefined),
    sourceReliability: asString(record.sourceReliability || record.source_reliability, undefined),
    hostileProbability: asNumber(record.hostileProbability ?? record.hostile_probability) ?? undefined,
    friendlyProbability:
      asNumber(record.friendlyProbability ?? record.friendly_probability) ?? undefined,
    unknownProbability: asNumber(record.unknownProbability ?? record.unknown_probability) ?? undefined,
    lastUpdate: asString(record.lastUpdate || record.last_update, undefined),
    recommendedAction: asString(record.recommendedAction || record.recommended_action, undefined),
    sensors: asArray(record.sensors).map((sensor) => asString(sensor)).filter(Boolean),
    coordinates,
    ...record,
  };
};

const normalizeAlert = (value: unknown, index: number): CopAlert => {
  const record = isRecord(value) ? value : {};
  return {
    id: asString(record.id, `alert_${index + 1}`),
    title: asString(record.title || record.subject, 'Alert'),
    message: asString(record.message || record.text, 'Alert received'),
    severity: asString(record.severity || record.priority, 'medium'),
    status: asString(record.status, undefined),
    timestamp: toTimestamp(record.timestamp || record.created_at || record.updated_at),
    ...record,
  };
};

const normalizeDecision = (value: unknown, index: number): CopDecision => {
  const record = isRecord(value) ? value : {};
  return {
    id: asString(record.id, `decision_${index + 1}`),
    title: asString(record.title || record.name, 'Decision'),
    description: asString(record.description || record.summary, undefined),
    status: asString(record.status, 'pending'),
    severity: asString(record.severity, undefined),
    confidence: asNumber(record.confidence) ?? undefined,
    risk: asNumber(record.risk) ?? undefined,
    timestamp: toTimestamp(record.timestamp || record.updated_at || record.created_at),
    ...record,
  };
};

const normalizeFeedItem = (value: unknown, index: number): CopFeedItem => {
  const record = isRecord(value) ? value : {};
  return {
    id: asString(record.id || record.event_id, `feed_${index + 1}`),
    type: asString(record.type || record.event_type, 'intel_feed'),
    message: asString(record.message || record.english || record.text, 'Feed update'),
    english: asString(record.english || record.content_en, undefined),
    arabic: asString(record.arabic || record.content_ar, undefined),
    priority: asString(record.priority || record.severity, undefined),
    confidence: asNumber(record.confidence) ?? undefined,
    timestamp: toTimestamp(record.timestamp || record.received_at || record.updated_at),
    ...record,
  };
};

const normalizePanelState = (value: unknown, index: number): CopPanelState => {
  const record = isRecord(value) ? value : {};
  const key = asString(record.key || record.id || record.label, `panel_${index + 1}`);
  return {
    key,
    label: asString(record.label || record.name, key),
    value: (record.value as string | number | undefined) ?? '--',
    status: asString(record.status, undefined),
    trend: asString(record.trend, undefined),
    ...record,
  };
};

const normalizePanelStateCollection = (value: unknown): CopPanelState[] => {
  if (Array.isArray(value)) {
    return value.map((item, index) => normalizePanelState(item, index));
  }
  if (isRecord(value)) {
    return Object.entries(value).map(([key, panelValue], index) =>
      normalizePanelState({ key, value: panelValue }, index)
    );
  }
  return [];
};

const normalizeMapConfig = (value: unknown): CopMapConfig => {
  const record = isRecord(value) ? value : {};
  const bounds = toBounds(record.bounds || record.extent);
  const center = toCoordinatePair(record.center) ?? [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2,
  ];
  const layers = asArray(record.layers).map(normalizeLayer);

  return {
    center,
    bounds,
    zoom: asNumber(record.zoom) ?? undefined,
    layers,
    ...record,
  };
};

const normalizeTheater = (value: unknown): CopTheater | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }
  return {
    ...value,
    id: asString(value.id || value.code, undefined),
    name: asString(value.name || value.label, undefined),
    region: asString(value.region, undefined),
    center: toCoordinatePair(value.center) ?? undefined,
    bounds: toBounds(value.bounds),
  };
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const stripApiSuffix = (value: string): string => value.replace(/\/api(\/v\d+)?$/i, '');

const normalizeCopTrack = (track: string | undefined): string => {
  if (typeof track !== 'string') {
    return DEFAULT_COP_TRACK;
  }
  const normalized = track.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  return normalized || DEFAULT_COP_TRACK;
};

const getCopPathPrefix = (track: string | undefined): string =>
  `/api/cop/${encodeURIComponent(normalizeCopTrack(track))}`;

const readCopApiBaseUrl = (): string => {
  const rawValue = runtimeEnv.VITE_S3M_API_URL;
  if (typeof rawValue === 'string' && rawValue.trim().length > 0) {
    return trimTrailingSlash(stripApiSuffix(rawValue.trim()));
  }
  return trimTrailingSlash(stripApiSuffix(API_CONFIG.baseUrl));
};

const validateNonR2Target = (baseUrl: string): void => {
  const url = new URL(baseUrl);
  const hostname = url.hostname.toLowerCase();
  if (R2_HOST_MARKERS.some((marker) => hostname.includes(marker))) {
    throw new Error('COP client cannot target Cloudflare R2 hosts');
  }
};

export const COP_API_BASE_URL = readCopApiBaseUrl();

const buildCopUrl = (path: string): string => {
  validateNonR2Target(COP_API_BASE_URL);
  return `${COP_API_BASE_URL}${path}`;
};

const toWsUrl = (httpUrl: string): string => {
  const parsed = new URL(httpUrl);
  if (parsed.protocol === 'https:') {
    parsed.protocol = 'wss:';
  } else if (parsed.protocol === 'http:') {
    parsed.protocol = 'ws:';
  }
  return trimTrailingSlash(parsed.toString());
};

const fetchJson = async (path: string): Promise<unknown> => {
  const response = await fetch(buildCopUrl(path), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`COP API request failed (${response.status})`);
  }

  return response.json();
};

export const getSaudiModCopWsUrl = (): string => {
  return getCopWsUrl(DEFAULT_COP_TRACK);
};

export const getCopWsUrl = (track = DEFAULT_COP_TRACK): string => {
  validateNonR2Target(COP_API_BASE_URL);
  return `${toWsUrl(COP_API_BASE_URL)}/ws/cop/${encodeURIComponent(normalizeCopTrack(track))}`;
};

export const connectCopWebSocket = (track = DEFAULT_COP_TRACK): WebSocket =>
  new WebSocket(getCopWsUrl(track));

export const parseCopSocketEvent = (rawMessage: string): CopSocketEvent | null => {
  try {
    const parsed = JSON.parse(rawMessage) as Record<string, unknown>;
    const eventType = asString(parsed.event_type || parsed.type || parsed.kind, 'unknown');
    const payload = parsed.payload ?? parsed.data ?? parsed;
    const payloadRecord = isRecord(payload) ? payload : {};
    const receivedAt =
      toTimestamp(
        parsed.timestamp ||
          parsed.last_update ||
          parsed.updated_at ||
          payloadRecord.timestamp ||
          payloadRecord.last_update ||
          payloadRecord.updated_at
      ) ?? new Date().toISOString();

    return {
      type: eventType,
      payload,
      raw: parsed,
      receivedAt,
    };
  } catch {
    return null;
  }
};

export const normalizeCopState = (payload: unknown): CopState => {
  const root = isRecord(payload) ? payload : {};
  const mapConfig = normalizeMapConfig(root.map || root.map_config);
  const mapRecord = isRecord(root.map) ? root.map : {};

  return {
    ...root,
    theater: normalizeTheater(root.theater || root.theater_info),
    map: mapConfig,
    features: asArray(root.features || mapRecord.features).map((entry, index) =>
      normalizeFeature(entry, index)
    ),
    tracks: asArray(root.tracks || root.track_list).map((entry, index) =>
      normalizeTrack(entry, index)
    ),
    alerts: asArray(root.alerts).map((entry, index) => normalizeAlert(entry, index)),
    decisions: asArray(root.decisions).map((entry, index) => normalizeDecision(entry, index)),
    feed: asArray(root.feed || root.intel_feed).map((entry, index) => normalizeFeedItem(entry, index)),
    panelState: normalizePanelStateCollection(root.panel_state || root.panels || root.summaries),
    systemStatus: isRecord(root.system_status) ? root.system_status : undefined,
    lastUpdate: toTimestamp(root.last_update || root.updated_at || root.timestamp),
  };
};

export const normalizeCopMap = (payload: unknown): CopMapConfig => normalizeMapConfig(payload);
export const normalizeCopFeatures = (payload: unknown): CopFeature[] =>
  asArray(isRecord(payload) ? payload.features || payload.items || payload : payload).map(
    (entry, index) => normalizeFeature(entry, index)
  );
export const normalizeCopTracks = (payload: unknown): CopTrack[] =>
  asArray(isRecord(payload) ? payload.tracks || payload.items || payload : payload).map(
    (entry, index) => normalizeTrack(entry, index)
  );
export const normalizeCopAlerts = (payload: unknown): CopAlert[] =>
  asArray(isRecord(payload) ? payload.alerts || payload.items || payload : payload).map(
    (entry, index) => normalizeAlert(entry, index)
  );
export const normalizeCopDecisions = (payload: unknown): CopDecision[] =>
  asArray(isRecord(payload) ? payload.decisions || payload.items || payload : payload).map(
    (entry, index) => normalizeDecision(entry, index)
  );
export const normalizeCopFeed = (payload: unknown): CopFeedItem[] =>
  asArray(isRecord(payload) ? payload.feed || payload.items || payload : payload).map(
    (entry, index) => normalizeFeedItem(entry, index)
  );
export const normalizeCopPanelStates = (payload: unknown): CopPanelState[] =>
  normalizePanelStateCollection(payload);

export const copClient = {
  async getCopState(track = DEFAULT_COP_TRACK): Promise<CopState> {
    const payload = await fetchJson(`${getCopPathPrefix(track)}/state`);
    return normalizeCopState(payload);
  },

  async getCopMap(track = DEFAULT_COP_TRACK): Promise<CopMapConfig> {
    const payload = await fetchJson(`${getCopPathPrefix(track)}/map`);
    return normalizeCopMap(payload);
  },

  async getCopTracks(track = DEFAULT_COP_TRACK): Promise<CopTrack[]> {
    const payload = await fetchJson(`${getCopPathPrefix(track)}/tracks`);
    return normalizeCopTracks(payload);
  },

  async getCopAlerts(track = DEFAULT_COP_TRACK): Promise<CopAlert[]> {
    const payload = await fetchJson(`${getCopPathPrefix(track)}/alerts`);
    return normalizeCopAlerts(payload);
  },

  async getCopDecisions(track = DEFAULT_COP_TRACK): Promise<CopDecision[]> {
    const payload = await fetchJson(`${getCopPathPrefix(track)}/decisions`);
    return normalizeCopDecisions(payload);
  },

  async getCopFeed(track = DEFAULT_COP_TRACK): Promise<CopFeedItem[]> {
    const payload = await fetchJson(`${getCopPathPrefix(track)}/feed`);
    return normalizeCopFeed(payload);
  },

  connectCopWebSocket(track = DEFAULT_COP_TRACK): WebSocket {
    return connectCopWebSocket(track);
  },

  async getState(): Promise<CopState> {
    return copClient.getCopState(DEFAULT_COP_TRACK);
  },

  async getMap(): Promise<CopMapConfig> {
    return copClient.getCopMap(DEFAULT_COP_TRACK);
  },

  async getTracks(): Promise<CopTrack[]> {
    return copClient.getCopTracks(DEFAULT_COP_TRACK);
  },

  async getAlerts(): Promise<CopAlert[]> {
    return copClient.getCopAlerts(DEFAULT_COP_TRACK);
  },

  async getDecisions(): Promise<CopDecision[]> {
    return copClient.getCopDecisions(DEFAULT_COP_TRACK);
  },

  async getFeed(): Promise<CopFeedItem[]> {
    return copClient.getCopFeed(DEFAULT_COP_TRACK);
  },
};
