import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CommandCard } from '../CommandCard';
import { ConfidenceBadge } from '../ConfidenceBadge';
import { StatusIndicator } from '../StatusIndicator';
import { CornerBrackets } from '../CornerBrackets';
import {
  Maximize2,
  Zap,
  Shield,
  Target,
  Radio,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  Layers,
  Eye,
  Radar,
  Satellite,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../../store';
import {
  type CopAlert,
  copClient,
  type CopMapConfig,
  type CopDecision,
  type CopFeedItem,
  getSaudiModCopWsUrl,
  normalizeCopAlerts,
  normalizeCopDecisions,
  normalizeCopFeed,
  normalizeCopMap,
  normalizeCopTracks,
  parseCopSocketEvent,
  type CopTrack,
} from '../../../services/api/copClient';
import { LiveCopMap } from './LiveCopMap';

type EnvironmentType = 'AIR' | 'GROUND' | 'MARITIME' | 'CYBER';

type MissionLayer = {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
};

type TrackHistory = {
  splits: number;
  merges: number;
  deception: string;
};

type WorkspaceTrack = {
  id: string;
  callsign: string;
  type: string;
  conf: number;
  status: string;
  speed: string;
  alt: string;
  identityConf: number;
  hostileProbability: number;
  friendlyProbability: number;
  unknownProbability: number;
  sourceReliability: string;
  lastUpdate: string;
  recommendedAction: string;
  sensors: string[];
  trackHistory: TrackHistory;
  coordinates?: [number, number];
};

const FALLBACK_TRACKS: WorkspaceTrack[] = [
  {
    id: 'T-218',
    callsign: 'T-218',
    type: 'HOSTILE',
    conf: 89,
    status: 'critical',
    speed: '420 kts',
    alt: '15K ft',
    identityConf: 89,
    hostileProbability: 94,
    friendlyProbability: 2,
    unknownProbability: 4,
    sourceReliability: 'HIGH',
    lastUpdate: '12s ago',
    recommendedAction: 'Immediate visual ID required',
    sensors: ['EO/IR', 'Radar', 'SIGINT'],
    trackHistory: { splits: 0, merges: 0, deception: 'LOW' },
  },
  {
    id: 'T-331',
    callsign: 'T-331',
    type: 'UNKNOWN',
    conf: 67,
    status: 'caution',
    speed: '180 kts',
    alt: '8K ft',
    identityConf: 67,
    hostileProbability: 35,
    friendlyProbability: 22,
    unknownProbability: 43,
    sourceReliability: 'MEDIUM',
    lastUpdate: '45s ago',
    recommendedAction: 'Continue tracking, request additional sensors',
    sensors: ['Radar', 'AIS'],
    trackHistory: { splits: 1, merges: 0, deception: 'MEDIUM' },
  },
  {
    id: 'UAV-01',
    callsign: 'UAV-01',
    type: 'FRIENDLY',
    conf: 98,
    status: 'operational',
    speed: '85 kts',
    alt: '12K ft',
    identityConf: 98,
    hostileProbability: 1,
    friendlyProbability: 98,
    unknownProbability: 1,
    sourceReliability: 'HIGH',
    lastUpdate: '3s ago',
    recommendedAction: 'Nominal operations',
    sensors: ['EO/IR', 'Radar', 'HUMINT', 'Datalink'],
    trackHistory: { splits: 0, merges: 0, deception: 'NONE' },
  },
  {
    id: 'UAV-02',
    callsign: 'UAV-02',
    type: 'FRIENDLY',
    conf: 95,
    status: 'operational',
    speed: '90 kts',
    alt: '14K ft',
    identityConf: 95,
    hostileProbability: 2,
    friendlyProbability: 95,
    unknownProbability: 3,
    sourceReliability: 'HIGH',
    lastUpdate: '5s ago',
    recommendedAction: 'Nominal operations',
    sensors: ['Radar', 'Datalink'],
    trackHistory: { splits: 0, merges: 0, deception: 'NONE' },
  },
  {
    id: 'UAV-04',
    callsign: 'UAV-04',
    type: 'FRIENDLY',
    conf: 72,
    status: 'caution',
    speed: '45 kts',
    alt: '3K ft',
    identityConf: 72,
    hostileProbability: 8,
    friendlyProbability: 72,
    unknownProbability: 20,
    sourceReliability: 'MEDIUM',
    lastUpdate: '2m 14s ago',
    recommendedAction: 'IFF interrogation recommended - signal degraded',
    sensors: ['Radar'],
    trackHistory: { splits: 0, merges: 1, deception: 'MEDIUM' },
  },
];

const FALLBACK_MISSION_LAYERS: MissionLayer[] = [
  { id: 'units', name: 'Tasked Units', enabled: true, color: '#05DF72' },
  { id: 'objectives', name: 'Objective Zones', enabled: true, color: '#00F0FF' },
  { id: 'corridors', name: 'Corridors', enabled: false, color: '#FFB800' },
  { id: 'restricted', name: 'No-Go Areas', enabled: true, color: '#FF3366' },
  { id: 'weather', name: 'Weather/Comms', enabled: false, color: '#8A5CFF' },
];

const FALLBACK_DECISIONS: CopDecision[] = [
  { id: 'fallback_decision_1', title: 'Engage Track T-218', status: 'pending' },
  { id: 'fallback_decision_2', title: 'Monitor T-331', status: 'pending' },
  { id: 'fallback_decision_3', title: 'Maintain UAV Corridor', status: 'approved' },
];

const FALLBACK_FEED: CopFeedItem[] = [
  { id: 'fallback_feed_1', type: 'intel_feed', message: 'SIGINT burst linked to T-218 profile.' },
  { id: 'fallback_feed_2', type: 'intel_feed', message: 'UAV-01 confirms corridor remains clear.' },
];

const FALLBACK_ALERTS: CopAlert[] = [
  {
    id: 'fallback_alert_1',
    title: 'IFF Timeout',
    message: 'Track T-331 failed interrogation attempts.',
    severity: 'high',
  },
];

const mergeById = <T extends { id: string }>(existing: T[], incoming: T[], maxItems = 50): T[] => {
  const map = new Map(existing.map((item) => [item.id, item]));
  incoming.forEach((item) => map.set(item.id, item));
  return Array.from(map.values()).slice(-maxItems);
};

const asString = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback;

const asNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const clampNumber = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const safePercentValue = (value: unknown): number =>
  clampNumber(Math.round(asNumber(value, 0)), 0, 100);

const safePercent = (value: unknown): string => `${safePercentValue(value)}%`;

const toTrackHistory = (value: unknown, fallback: TrackHistory): TrackHistory => {
  if (typeof value !== 'object' || value === null) {
    return fallback;
  }
  const record = value as Record<string, unknown>;
  return {
    splits: asNumber(record.splits, fallback.splits),
    merges: asNumber(record.merges, fallback.merges),
    deception: asString(record.deception, fallback.deception),
  };
};

const toWorkspaceTrack = (track: CopTrack, fallback: WorkspaceTrack): WorkspaceTrack => ({
  id: asString(track.id, fallback.id),
  callsign: asString(track.callsign, track.id ?? fallback.callsign ?? fallback.id),
  type: asString(track.type, fallback.type).toUpperCase(),
  conf: Math.round(asNumber(track.confidence, fallback.conf)),
  status: asString(track.status, fallback.status ?? 'unknown'),
  speed: asString(track.speed, fallback.speed ?? '--'),
  alt: asString(track.altitude, fallback.alt ?? '--'),
  identityConf: Math.round(asNumber(track.confidence, fallback.identityConf)),
  hostileProbability: safePercentValue(track.hostileProbability ?? fallback.hostileProbability ?? 0),
  friendlyProbability: safePercentValue(track.friendlyProbability ?? fallback.friendlyProbability ?? 0),
  unknownProbability: safePercentValue(track.unknownProbability ?? fallback.unknownProbability ?? 0),
  sourceReliability: asString(track.sourceReliability, fallback.sourceReliability ?? 'UNKNOWN').toUpperCase(),
  lastUpdate: asString(track.lastUpdate, fallback.lastUpdate),
  recommendedAction: asString(track.recommendedAction, fallback.recommendedAction),
  sensors:
    Array.isArray(track.sensors) && track.sensors.length > 0
      ? track.sensors.filter((sensor): sensor is string => typeof sensor === 'string' && sensor.length > 0)
      : fallback.sensors,
  trackHistory: toTrackHistory(track.trackHistory, fallback.trackHistory),
  coordinates: Array.isArray(track.coordinates) && track.coordinates.length >= 2
    ? [track.coordinates[0], track.coordinates[1]]
    : undefined,
});

const toSafeWorkspaceTrack = (track: WorkspaceTrack, fallback: WorkspaceTrack): WorkspaceTrack => ({
  id: asString(track.id, fallback.id),
  callsign: asString(track.callsign, track.id ?? fallback.callsign ?? fallback.id),
  type: asString(track.type, fallback.type).toUpperCase(),
  conf: safePercentValue(track.conf),
  status: asString(track.status, 'unknown'),
  speed: asString(track.speed, '--'),
  alt: asString(track.alt, '--'),
  identityConf: safePercentValue(track.identityConf),
  hostileProbability: safePercentValue(track.hostileProbability ?? 0),
  friendlyProbability: safePercentValue(track.friendlyProbability ?? 0),
  unknownProbability: safePercentValue(track.unknownProbability ?? 0),
  sourceReliability: asString(track.sourceReliability, fallback.sourceReliability ?? 'UNKNOWN').toUpperCase(),
  lastUpdate: asString(track.lastUpdate, fallback.lastUpdate),
  recommendedAction: asString(track.recommendedAction, fallback.recommendedAction),
  sensors: (Array.isArray(track.sensors) ? track.sensors : fallback.sensors).filter(
    (sensor): sensor is string => typeof sensor === 'string' && sensor.length > 0
  ),
  trackHistory: toTrackHistory(track.trackHistory, fallback.trackHistory),
  coordinates:
    Array.isArray(track.coordinates) && track.coordinates.length >= 2
      ? [track.coordinates[0], track.coordinates[1]]
      : fallback.coordinates,
});

const mergeMissionLayers = (incomingLayers: ReturnType<typeof normalizeCopMap>['layers']): MissionLayer[] =>
  FALLBACK_MISSION_LAYERS.map((fallbackLayer) => {
    const incomingLayer = incomingLayers.find((layer) => layer.id === fallbackLayer.id);
    if (!incomingLayer) {
      return fallbackLayer;
    }
    return {
      id: fallbackLayer.id,
      name: incomingLayer.name || fallbackLayer.name,
      enabled: incomingLayer.enabled,
      color: incomingLayer.color || fallbackLayer.color,
    };
  });

export function COPWorkspace() {
  const [activeEnvironment, setActiveEnvironment] = useState<EnvironmentType>('AIR');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const [showMissionLayer, setShowMissionLayer] = useState(false);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'5m' | '30m' | '6h'>('30m');
  const { setAiPanelOpen } = useAppStore();
  const [tracks, setTracks] = useState<WorkspaceTrack[]>(FALLBACK_TRACKS);
  const [missionLayers, setMissionLayers] = useState<MissionLayer[]>(FALLBACK_MISSION_LAYERS);
  const [decisions, setDecisions] = useState<CopDecision[]>(FALLBACK_DECISIONS);
  const [feedItems, setFeedItems] = useState<CopFeedItem[]>(FALLBACK_FEED);
  const [alerts, setAlerts] = useState<CopAlert[]>(FALLBACK_ALERTS);
  const [apiConnected, setApiConnected] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdateAt, setLastUpdateAt] = useState<string>(new Date().toISOString());
  const [dataSource, setDataSource] = useState<'backend' | 'fallback'>('fallback');
  const [mapBounds, setMapBounds] = useState<CopMapConfig['bounds'] | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);

  const typeColors: any = {
    HOSTILE: '#EF4444',
    UNKNOWN: '#EAB308',
    FRIENDLY: '#22C55E',
  };

  const environments = [
    { id: 'AIR', label: 'AIR', color: '#00B8FF' },
    { id: 'GROUND', label: 'GROUND', color: '#05DF72' },
    { id: 'MARITIME', label: 'MARITIME', color: '#00F0FF' },
    { id: 'CYBER', label: 'CYBER', color: '#8A5CFF' },
  ];

  const commandActions = [
    { id: 'engage', label: 'ENGAGE TRACK', icon: Target, color: '#FF3366' },
    { id: 'intercept', label: 'INTERCEPT', icon: Zap, color: '#FFB800' },
    { id: 'defend', label: 'DEFENSIVE POSTURE', icon: Shield, color: '#00F0FF' },
    { id: 'comms', label: 'ESTABLISH COMMS', icon: Radio, color: '#05DF72' },
  ];

  const sensorIcons: any = {
    'EO/IR': Eye,
    'Radar': Radar,
    'SIGINT': Radio,
    'AIS': Satellite,
    'HUMINT': Target,
    'Datalink': Radio,
  };

  const hydrateTracks = useCallback((incomingTracks: CopTrack[]) => {
    if (incomingTracks.length === 0) {
      return;
    }
    setTracks(
      incomingTracks.map((track, index) =>
        toWorkspaceTrack(track, FALLBACK_TRACKS[index] ?? FALLBACK_TRACKS[FALLBACK_TRACKS.length - 1])
      )
    );
  }, []);

  const applySocketEvent = useCallback(
    (eventType: string, payload: unknown) => {
      const normalizedType = eventType.toLowerCase();
      if (normalizedType === 'cop_update' && typeof payload === 'object' && payload !== null) {
        const record = payload as Record<string, unknown>;
        if (record.tracks) {
          hydrateTracks(normalizeCopTracks(record.tracks));
        }
        if (record.map || record.map_config) {
          const mapState = normalizeCopMap(record.map || record.map_config);
          setMissionLayers(mergeMissionLayers(mapState.layers));
          setMapBounds(mapState.bounds);
        }
        if (record.decisions) {
          setDecisions((previous) => mergeById(previous, normalizeCopDecisions(record.decisions), 40));
        }
        if (record.feed || record.intel_feed) {
          setFeedItems((previous) => mergeById(previous, normalizeCopFeed(record.feed || record.intel_feed), 80));
        }
        if (record.alerts) {
          setAlerts((previous) => mergeById(previous, normalizeCopAlerts(record.alerts), 80));
        }
      } else if (normalizedType === 'decision') {
        setDecisions((previous) => mergeById(previous, normalizeCopDecisions(payload), 40));
      } else if (normalizedType === 'intel_feed') {
        setFeedItems((previous) => mergeById(previous, normalizeCopFeed(payload), 80));
      } else if (normalizedType === 'alert') {
        setAlerts((previous) => mergeById(previous, normalizeCopAlerts(payload), 80));
      }
      setDataSource('backend');
      setLastUpdateAt(new Date().toISOString());
    },
    [hydrateTracks]
  );

  const loadSnapshot = useCallback(async () => {
    try {
      const state = await copClient.getState();
      setApiConnected(true);
      setDataSource('backend');
      hydrateTracks(state.tracks);
      setMapBounds(state.map.bounds);
      if (state.map.layers.length > 0) {
        setMissionLayers(mergeMissionLayers(state.map.layers));
      }
      if (state.decisions.length > 0) {
        setDecisions(state.decisions);
      }
      if (state.feed.length > 0) {
        setFeedItems(state.feed);
      }
      if (state.alerts.length > 0) {
        setAlerts(state.alerts);
      }
      setLastUpdateAt(state.lastUpdate ?? new Date().toISOString());

      const [tracksResult, decisionsResult, feedResult, alertsResult, mapResult] = await Promise.allSettled([
        copClient.getTracks(),
        copClient.getDecisions(),
        copClient.getFeed(),
        copClient.getAlerts(),
        copClient.getMap(),
      ]);

      if (tracksResult.status === 'fulfilled') {
        hydrateTracks(tracksResult.value);
      }
      if (decisionsResult.status === 'fulfilled' && decisionsResult.value.length > 0) {
        setDecisions(decisionsResult.value);
      }
      if (feedResult.status === 'fulfilled' && feedResult.value.length > 0) {
        setFeedItems(feedResult.value);
      }
      if (alertsResult.status === 'fulfilled' && alertsResult.value.length > 0) {
        setAlerts(alertsResult.value);
      }
      if (mapResult.status === 'fulfilled' && mapResult.value.layers.length > 0) {
        setMissionLayers(mergeMissionLayers(mapResult.value.layers));
        setMapBounds(mapResult.value.bounds);
      } else if (mapResult.status === 'fulfilled') {
        setMapBounds(mapResult.value.bounds);
      }
      setLastUpdateAt(new Date().toISOString());
    } catch {
      setApiConnected(false);
      setDataSource('fallback');
      setTracks(FALLBACK_TRACKS);
      setMissionLayers(FALLBACK_MISSION_LAYERS);
      setDecisions(FALLBACK_DECISIONS);
      setFeedItems(FALLBACK_FEED);
      setAlerts(FALLBACK_ALERTS);
      setMapBounds(null);
      setLastUpdateAt(new Date().toISOString());
    }
  }, [hydrateTracks]);

  const connectSocket = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    let wsUrl = '';
    try {
      wsUrl = getSaudiModCopWsUrl();
    } catch {
      setWsConnected(false);
      return;
    }

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsConnected(true);
    };

    socket.onmessage = (messageEvent) => {
      if (typeof messageEvent.data !== 'string') {
        return;
      }
      const event = parseCopSocketEvent(messageEvent.data);
      if (!event) {
        return;
      }
      applySocketEvent(event.type, event.payload);
      setLastUpdateAt(event.receivedAt);
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onclose = () => {
      wsRef.current = null;
      setWsConnected(false);
      if (!shouldReconnectRef.current) {
        return;
      }
      reconnectTimerRef.current = window.setTimeout(() => {
        connectSocket();
      }, 3000);
    };
  }, [applySocketEvent]);

  useEffect(() => {
    void loadSnapshot();
    connectSocket();
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectSocket, loadSnapshot]);

  const safeTracks = Array.isArray(tracks) ? tracks : FALLBACK_TRACKS;
  const safeMissionLayers = Array.isArray(missionLayers) ? missionLayers : FALLBACK_MISSION_LAYERS;
  const safeDecisions = Array.isArray(decisions) ? decisions : FALLBACK_DECISIONS;
  const safeFeedItems = Array.isArray(feedItems) ? feedItems : FALLBACK_FEED;
  const safeAlerts = Array.isArray(alerts) ? alerts : FALLBACK_ALERTS;

  const displayTracks = useMemo(
    () =>
      safeTracks.map((track, index) =>
        toSafeWorkspaceTrack(
          track,
          FALLBACK_TRACKS[index] ?? FALLBACK_TRACKS[FALLBACK_TRACKS.length - 1]
        )
      ),
    [safeTracks]
  );

  useEffect(() => {
    if (!expandedTrack) {
      return;
    }
    if (!displayTracks.some((track) => track.id === expandedTrack)) {
      setExpandedTrack(null);
    }
  }, [displayTracks, expandedTrack]);

  const primaryHostileTrack = useMemo(
    () => displayTracks.find((track) => track.type === 'HOSTILE') ?? displayTracks[0],
    [displayTracks]
  );
  const friendlyTracks = useMemo(
    () => displayTracks.filter((track) => track.type === 'FRIENDLY').slice(0, 4),
    [displayTracks]
  );
  const unknownTrack = useMemo(
    () => displayTracks.find((track) => track.type === 'UNKNOWN'),
    [displayTracks]
  );
  const fallbackFriendlyTrackIds = useMemo(
    () =>
      (friendlyTracks.length > 0
        ? friendlyTracks
        : FALLBACK_TRACKS.filter((track) => track.type === 'FRIENDLY').slice(0, 4)
      ).map((track) => track.id),
    [friendlyTracks]
  );
  const markerDecisions = safeDecisions.length;
  const markerInterventions = safeFeedItems.length;
  const markerTrackDivergence = Math.max(1, safeAlerts.length);

  const handleMapDoubleClick = () => {
    setIsMapExpanded(!isMapExpanded);
    if (!isMapExpanded) {
      setAiPanelOpen(false);
    }
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'HIGH': return '#05DF72';
      case 'MEDIUM': return '#FFB800';
      case 'LOW': return '#FF3366';
      default: return '#6B7C95';
    }
  };

  const getDeceptionColor = (level: string) => {
    switch (level) {
      case 'NONE': return '#05DF72';
      case 'LOW': return '#FFB800';
      case 'MEDIUM': return '#F97316';
      case 'HIGH': return '#FF3366';
      default: return '#6B7C95';
    }
  };

  return (
    <div className="p-4 h-full flex flex-col gap-4">
      {/* Environment Tabs */}
      <div className="flex gap-2">
        {environments.map((env) => (
          <button
            key={env.id}
            onClick={() => setActiveEnvironment(env.id as any)}
            className={`px-4 py-2 rounded-lg text-[15px] font-semibold uppercase tracking-wider transition-all duration-300`}
            style={activeEnvironment === env.id ? {
              background: `${env.color}20`,
              border: `1px solid ${env.color}60`,
              color: env.color,
              boxShadow: `0 0 15px ${env.color}40`
            } : {
              background: 'rgba(28, 37, 51, 0.3)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              color: '#6B7C95'
            }}
          >
            {env.label}
          </button>
        ))}

        <div className="flex-1" />

        {/* Mission Layer Toggle */}
        <button
          onClick={() => setShowMissionLayer(!showMissionLayer)}
          className="px-3 py-1 rounded-lg flex items-center gap-2 transition-all"
          style={{
            background: showMissionLayer ? 'rgba(0, 240, 255, 0.15)' : 'rgba(28, 37, 51, 0.3)',
            border: `1px solid ${showMissionLayer ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.15)'}`
          }}
        >
          <Layers className="w-4 h-4 text-cyber-cyan" />
          <span className="text-[11px] text-cyber-cyan uppercase tracking-wider font-semibold">
            MISSION LAYER
          </span>
          {showMissionLayer ? <ChevronDown className="w-3 h-3 text-cyber-cyan" /> : <ChevronRight className="w-3 h-3 text-cyber-cyan" />}
        </button>

        <div
          className="px-3 py-1 rounded-lg flex items-center gap-2"
          style={{
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
          }}
          title={`API ${apiConnected ? 'connected' : 'disconnected'} · WS ${wsConnected ? 'connected' : 'disconnected'} · Source ${dataSource} · Updated ${lastUpdateAt}`}
        >
          <div className="w-2 h-2 rounded-full bg-cyber-cyan glow-cyan animate-pulse" />
          <span className="text-[15px] text-cyber-cyan uppercase tracking-wider font-semibold">
            LIVE FEED: {activeEnvironment}
          </span>
        </div>
      </div>

      {/* Mission Layer Panel */}
      {showMissionLayer && (
        <div className="relative bg-s3m-card border border-cyber-cyan/30 rounded-lg p-3">
          <CornerBrackets color="#00F0FF" />
          <div className="grid grid-cols-5 gap-2">
            {safeMissionLayers.map((layer) => (
              <button
                key={layer.id}
                className="px-3 py-2 rounded text-[11px] uppercase tracking-wider font-semibold transition-all"
                style={{
                  background: layer.enabled ? `${layer.color}20` : 'rgba(28, 37, 51, 0.3)',
                  border: `1px solid ${layer.enabled ? `${layer.color}60` : 'rgba(107, 124, 149, 0.3)'}`,
                  color: layer.enabled ? layer.color : '#6B7C95'
                }}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Temporal Playback Controls */}
      <div className="relative bg-s3m-card border border-s3m-border-default rounded-lg p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaybackActive(!isPlaybackActive)}
              className="w-8 h-8 rounded flex items-center justify-center bg-cyber-cyan/20 hover:bg-cyber-cyan/30 border border-cyber-cyan/40 transition-colors"
            >
              {isPlaybackActive ? <Pause className="w-4 h-4 text-cyber-cyan" /> : <Play className="w-4 h-4 text-cyber-cyan" />}
            </button>
            <button
              className="w-8 h-8 rounded flex items-center justify-center bg-s3m-elevated hover:bg-s3m-card border border-s3m-border-default transition-colors"
            >
              <SkipBack className="w-4 h-4 text-s3m-text-secondary" />
            </button>
          </div>

          <div className="h-6 w-px bg-s3m-border-default" />

          <div className="flex items-center gap-2">
            <span className="text-[15px] uppercase tracking-wider text-s3m-text-tertiary">REPLAY:</span>
            {(['5m', '30m', '6h'] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className="px-2 py-1 rounded text-[15px] uppercase tracking-wider font-semibold transition-all"
                style={{
                  background: playbackSpeed === speed ? 'rgba(0, 240, 255, 0.2)' : 'rgba(28, 37, 51, 0.3)',
                  border: `1px solid ${playbackSpeed === speed ? 'rgba(0, 240, 255, 0.5)' : 'rgba(107, 124, 149, 0.3)'}`,
                  color: playbackSpeed === speed ? '#00F0FF' : '#6B7C95'
                }}
              >
                {speed}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-s3m-border-default" />

          <div className="flex-1 flex items-center gap-2">
            <span className="text-[15px] uppercase tracking-wider text-s3m-text-tertiary">MARKERS:</span>
            <div className="flex gap-2 text-[15px]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyber-green" />
                <span className="text-s3m-text-tertiary">Decisions: {markerDecisions}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyber-cyan" />
                <span className="text-s3m-text-tertiary">Interventions: {markerInterventions}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-s3m-warning" />
                <span className="text-s3m-text-tertiary">Track Divergence: {markerTrackDivergence}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Map */}
        <div
          className={`bg-[#030810] rounded-xl border border-cyber-glass-border relative overflow-hidden transition-all duration-500 ${isMapExpanded ? 'flex-[3.5]' : 'flex-[2.2]'}`}
          onDoubleClick={handleMapDoubleClick}
          style={{ cursor: 'pointer' }}
        >
          {/* Expand indicator */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.2)'
          }}>
            <Maximize2 className="w-3 h-3 text-cyber-cyan" />
            <span className="text-[15px] text-cyber-cyan uppercase tracking-wider">DOUBLE CLICK TO {isMapExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
          </div>

          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.06) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Radial glow */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.08) 0%, transparent 70%)'
            }}
          />

          {/* Range rings */}
          {[30, 50, 70].map((percent, i) => (
            <svg key={i} className="absolute inset-0 w-full h-full" style={{ opacity: 0.12 }}>
              <circle
                cx="50%"
                cy="50%"
                r={`${percent}%`}
                fill="none"
                stroke="#00F0FF"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            </svg>
          ))}

          {/* Corner HUD ticks */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => {
            const positions: any = {
              'top-left': 'top-4 left-4',
              'top-right': 'top-4 right-4',
              'bottom-left': 'bottom-4 left-4',
              'bottom-right': 'bottom-4 right-4'
            };

            return (
              <svg key={pos} className={`absolute w-5 h-5 ${positions[pos]}`} style={{ opacity: 0.4 }}>
                {pos === 'top-left' && <path d="M 20 0 L 0 0 L 0 20" stroke="#00F0FF" strokeWidth="1" fill="none" />}
                {pos === 'top-right' && <path d="M 0 0 L 20 0 L 20 20" stroke="#00F0FF" strokeWidth="1" fill="none" />}
                {pos === 'bottom-left' && <path d="M 0 0 L 0 20 L 20 20" stroke="#00F0FF" strokeWidth="1" fill="none" />}
                {pos === 'bottom-right' && <path d="M 20 0 L 20 20 L 0 20" stroke="#00F0FF" strokeWidth="1" fill="none" />}
              </svg>
            );
          })}

          <LiveCopMap
            tracks={displayTracks}
            mapBounds={mapBounds}
            dataSource={dataSource}
            selectedTrackId={expandedTrack}
            onTrackSelect={(trackId) => setExpandedTrack(trackId)}
            fallbackHostileTrackId={primaryHostileTrack?.id ?? 'T-218'}
            fallbackFriendlyTrackIds={fallbackFriendlyTrackIds}
            showFallbackUnknownTrack={Boolean(unknownTrack)}
          />
        </div>

        {/* Track Panel */}
        {!isMapExpanded && (
          <div className="flex-1 space-y-2 overflow-y-auto">
            {displayTracks.map((track) => {
              const trackType = asString(track.type, 'UNKNOWN').toUpperCase();
              const trackTypeColor = typeColors[trackType] ?? '#6B7C95';
              const trackStatus = asString(track.status, 'unknown');
              const trackHistory = toTrackHistory(track.trackHistory, { splits: 0, merges: 0, deception: 'UNKNOWN' });
              const trackSensors = Array.isArray(track.sensors) ? track.sensors : [];
              const hostileProbability = safePercentValue(track.hostileProbability ?? 0);
              const friendlyProbability = safePercentValue(track.friendlyProbability ?? 0);
              const unknownProbability = safePercentValue(track.unknownProbability ?? 0);
              const trackSpeed = asString(track.speed, '--');
              const trackAlt = asString(track.alt, '--');
              const trackCallsign = asString(track.callsign, track.id ?? 'UNKNOWN');
              const sourceReliability = asString(track.sourceReliability, 'UNKNOWN');
              return (
              <div key={track.id}>
                <CommandCard
                  className="hover:bg-cyber-glass/20 transition-colors cursor-pointer"
                  onClick={() => setExpandedTrack(expandedTrack === track.id ? null : track.id)}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{
                      backgroundColor: trackTypeColor,
                      boxShadow: `0 0 8px ${trackTypeColor}`
                    }}
                  />
                  <div className="pl-2 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-[13px] font-semibold"
                          style={{
                            color: trackTypeColor,
                            textShadow: `0 0 8px ${trackTypeColor}80`
                          }}
                        >
                          {trackCallsign || track.id}
                        </span>
                        <span
                          className="text-[15px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            color: trackTypeColor,
                            backgroundColor: `${trackTypeColor}20`,
                            border: `1px solid ${trackTypeColor}40`
                          }}
                        >
                          {trackType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ConfidenceBadge value={safePercentValue(track.conf)} size="sm" />
                        {expandedTrack === track.id ? <ChevronDown className="w-3 h-3 text-cyber-cyan" /> : <ChevronRight className="w-3 h-3 text-cyber-cyan" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusIndicator
                        status={trackStatus as any}
                        label={trackStatus.toUpperCase()}
                        size="sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-cyber-text-tertiary">Speed:</span>{' '}
                        <span className="font-mono text-cyber-text-secondary">{trackSpeed}</span>
                      </div>
                      <div>
                        <span className="text-cyber-text-tertiary">Alt:</span>{' '}
                        <span className="font-mono text-cyber-text-secondary">{trackAlt}</span>
                      </div>
                    </div>
                  </div>
                </CommandCard>

                {/* Expanded Track Details */}
                {expandedTrack === track.id && (
                  <div className="mt-2 bg-s3m-elevated border border-cyber-cyan/30 rounded-lg p-3 space-y-3">
                    {/* Identity Probability */}
                    <div>
                      <div className="text-[15px] uppercase tracking-wider text-s3m-text-tertiary mb-2">
                        IDENTITY PROBABILITY
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-s3m-card rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: safePercent(hostileProbability),
                                background: '#FF3366'
                              }}
                            />
                          </div>
                          <span className="text-[15px] font-mono text-cyber-red w-12 text-right">{hostileProbability}% H</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-s3m-card rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: safePercent(friendlyProbability),
                                background: '#05DF72'
                              }}
                            />
                          </div>
                          <span className="text-[15px] font-mono text-cyber-green w-12 text-right">{friendlyProbability}% F</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-s3m-card rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: safePercent(unknownProbability),
                                background: '#FFB800'
                              }}
                            />
                          </div>
                          <span className="text-[15px] font-mono text-s3m-warning w-12 text-right">{unknownProbability}% U</span>
                        </div>
                      </div>
                    </div>

                    {/* Source & Status */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[15px] uppercase tracking-wider text-s3m-text-tertiary mb-1">
                          SOURCE RELIABILITY
                        </div>
                        <div
                          className="text-[11px] uppercase tracking-wider font-semibold px-2 py-1 rounded inline-block"
                          style={{
                            color: getReliabilityColor(sourceReliability),
                            backgroundColor: `${getReliabilityColor(sourceReliability)}20`
                          }}
                        >
                          {sourceReliability}
                        </div>
                      </div>
                      <div>
                        <div className="text-[15px] uppercase tracking-wider text-s3m-text-tertiary mb-1">
                          LAST UPDATE
                        </div>
                        <div className="text-[11px] font-mono text-s3m-text-secondary">
                          {track.lastUpdate}
                        </div>
                      </div>
                    </div>

                    {/* Cross-Domain Correlation */}
                    <div>
                      <div className="text-[15px] uppercase tracking-wider text-s3m-text-tertiary mb-2">
                        CROSS-DOMAIN CORRELATION
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(trackSensors ?? []).map((sensor, i) => {
                          const SensorIcon = sensorIcons[sensor] || Target;
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyber-cyan/20 border border-cyber-cyan/40"
                            >
                              <SensorIcon className="w-3 h-3 text-cyber-cyan" />
                              <span className="text-[15px] text-cyber-cyan uppercase tracking-wider">{sensor}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Track History */}
                    <div>
                      <div className="text-[15px] uppercase tracking-wider text-s3m-text-tertiary mb-2">
                        TRACK ANALYSIS
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-s3m-card rounded p-2">
                          <div className="text-[11px] text-s3m-text-tertiary mb-0.5">SPLITS</div>
                          <div className="text-[15px] font-mono text-s3m-text-primary">{trackHistory?.splits ?? 0}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-2">
                          <div className="text-[11px] text-s3m-text-tertiary mb-0.5">MERGES</div>
                          <div className="text-[15px] font-mono text-s3m-text-primary">{trackHistory?.merges ?? 0}</div>
                        </div>
                        <div className="bg-s3m-card rounded p-2">
                          <div className="text-[11px] text-s3m-text-tertiary mb-0.5">DECEPTION</div>
                          <div
                            className="text-[15px] uppercase tracking-wider font-semibold"
                            style={{ color: getDeceptionColor(trackHistory?.deception ?? 'UNKNOWN') }}
                          >
                            {trackHistory?.deception ?? 'UNKNOWN'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommended Action */}
                    <div className="bg-cyber-cyan/10 border border-cyber-cyan/30 rounded p-2">
                      <div className="text-[15px] uppercase tracking-wider text-cyber-cyan mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        RECOMMENDED ACTION
                      </div>
                      <div className="text-[11px] text-s3m-text-primary leading-relaxed">
                        {asString(track.recommendedAction, 'No recommendation available')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Command Actions Bar (appears when map is expanded) */}
      {isMapExpanded && (
        <div className="glass-panel rounded-xl p-4 border-cyber-cyan/30" style={{
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
        }}>
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-4 h-4 text-cyber-cyan" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.8))' }} />
            <span className="text-[13px] text-cyber-cyan font-display font-semibold tracking-[0.12em] uppercase">
              AUTOMATED COMMAND OPTIONS
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {commandActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  className="glass-panel rounded-lg p-3 hover:scale-105 transition-all duration-300 cursor-pointer"
                  style={{
                    border: `1px solid ${action.color}40`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 20px ${action.color}60`;
                    e.currentTarget.style.borderColor = `${action.color}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.borderColor = `${action.color}40`;
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="w-5 h-5" style={{
                      color: action.color,
                      filter: `drop-shadow(0 0 6px ${action.color}80)`
                    }} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{
                      color: action.color,
                      textShadow: `0 0 8px ${action.color}60`
                    }}>
                      {action.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
