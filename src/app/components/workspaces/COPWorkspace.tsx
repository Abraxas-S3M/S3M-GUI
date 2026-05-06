import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Layers,
  MapPin,
  Radio,
  RefreshCw,
  ShieldAlert,
  Workflow,
} from 'lucide-react';

import {
  type CopAlert,
  copClient,
  type CopDecision,
  type CopFeedItem,
  getSaudiModCopWsUrl,
  normalizeCopAlerts,
  normalizeCopDecisions,
  normalizeCopFeatures,
  normalizeCopFeed,
  normalizeCopMap,
  normalizeCopPanelStates,
  normalizeCopTracks,
  parseCopSocketEvent,
  type CopPanelState,
  type CopState,
} from '../../../services/api/copClient';

const TRACK_COLOR: Record<string, string> = {
  HOSTILE: '#FF3366',
  UNKNOWN: '#FFB800',
  FRIENDLY: '#05DF72',
};

const DEFAULT_LAYER_COLORS: Record<string, string> = {
  units: '#05DF72',
  objectives: '#00F0FF',
  restricted: '#FF3366',
  intel: '#8A5CFF',
  alerts: '#FFB800',
};

const FALLBACK_COP_STATE: CopState = {
  theater: {
    id: 'saudi_mod',
    name: 'Saudi MOD',
    region: 'Arabian Gulf',
    center: [50.8, 25.6],
    bounds: [
      [44.5, 20.0],
      [57.5, 31.5],
    ],
  },
  map: {
    center: [50.8, 25.6],
    bounds: [
      [44.5, 20.0],
      [57.5, 31.5],
    ],
    layers: [
      { id: 'units', name: 'Tasked Units', enabled: true, color: '#05DF72' },
      { id: 'objectives', name: 'Objective Zones', enabled: true, color: '#00F0FF' },
      { id: 'restricted', name: 'No-Go Areas', enabled: true, color: '#FF3366' },
      { id: 'intel', name: 'Intel Overlay', enabled: true, color: '#8A5CFF' },
      { id: 'alerts', name: 'Alert Markers', enabled: true, color: '#FFB800' },
    ],
  },
  features: [
    { id: 'feature_task_group', type: 'unit', layer: 'units', label: 'Task Group East', coordinates: [51.2, 25.3] },
    { id: 'feature_radar_node', type: 'sensor', layer: 'intel', label: 'Radar Node 7', coordinates: [49.9, 24.8] },
    { id: 'feature_restricted', type: 'zone', layer: 'restricted', label: 'No-Fly Corridor', coordinates: [52.4, 26.3] },
    { id: 'feature_objective', type: 'objective', layer: 'objectives', label: 'Objective Delta', coordinates: [48.8, 26.1] },
  ],
  tracks: [
    {
      id: 'T-218',
      type: 'HOSTILE',
      status: 'critical',
      confidence: 89,
      speed: '420 kts',
      altitude: '15K ft',
      sourceReliability: 'HIGH',
      hostileProbability: 94,
      friendlyProbability: 2,
      unknownProbability: 4,
      lastUpdate: '12s ago',
      recommendedAction: 'Immediate visual ID required',
      sensors: ['EO/IR', 'Radar', 'SIGINT'],
      coordinates: [50.6, 26.8],
    },
    {
      id: 'T-331',
      type: 'UNKNOWN',
      status: 'caution',
      confidence: 67,
      speed: '180 kts',
      altitude: '8K ft',
      sourceReliability: 'MEDIUM',
      hostileProbability: 35,
      friendlyProbability: 22,
      unknownProbability: 43,
      lastUpdate: '45s ago',
      recommendedAction: 'Continue tracking and request additional sensors',
      sensors: ['Radar', 'AIS'],
      coordinates: [48.2, 24.9],
    },
    {
      id: 'UAV-01',
      type: 'FRIENDLY',
      status: 'operational',
      confidence: 98,
      speed: '85 kts',
      altitude: '12K ft',
      sourceReliability: 'HIGH',
      hostileProbability: 1,
      friendlyProbability: 98,
      unknownProbability: 1,
      lastUpdate: '3s ago',
      recommendedAction: 'Nominal operations',
      sensors: ['EO/IR', 'Radar', 'HUMINT', 'Datalink'],
      coordinates: [52.1, 25.0],
    },
  ],
  alerts: [
    {
      id: 'fallback_alert_1',
      title: 'Air Track Escalation',
      message: 'Track T-218 entered defended approach corridor.',
      severity: 'critical',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'fallback_alert_2',
      title: 'IFF Timeout',
      message: 'Track T-331 failed three interrogation attempts.',
      severity: 'high',
      timestamp: new Date().toISOString(),
    },
  ],
  decisions: [
    {
      id: 'fallback_decision_1',
      title: 'Engage Track T-218',
      description: 'Authorize intercept package to perform visual ID and hold.',
      status: 'pending',
      severity: 'CRITICAL',
      confidence: 74,
      risk: 82,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'fallback_decision_2',
      title: 'Reroute Convoy CVY-A',
      description: 'Shift convoy through corridor Delta due to air activity.',
      status: 'pending',
      severity: 'MEDIUM',
      confidence: 91,
      risk: 45,
      timestamp: new Date().toISOString(),
    },
  ],
  feed: [
    {
      id: 'fallback_feed_1',
      type: 'intel_feed',
      message: 'SIGINT burst linked to T-218 behavior profile.',
      priority: 'HIGH',
      confidence: 88,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'fallback_feed_2',
      type: 'intel_feed',
      message: 'UAV-01 confirms visual corridor remains clear.',
      priority: 'MEDIUM',
      confidence: 93,
      timestamp: new Date().toISOString(),
    },
  ],
  panelState: [
    { key: 'threat_level', label: 'Threat Level', value: 'HIGH', status: 'critical' },
    { key: 'pending_decisions', label: 'Pending Decisions', value: 2, status: 'caution' },
    { key: 'active_alerts', label: 'Active Alerts', value: 2, status: 'critical' },
    { key: 'feed_items', label: 'Live Feed', value: 2, status: 'operational' },
  ],
  systemStatus: {
    mission_state: 'WATCHCON-2',
    command_posture: 'ELEVATED',
    sensor_health: 'OPERATIONAL',
  },
  lastUpdate: new Date().toISOString(),
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback = '--'): string =>
  typeof value === 'string'
    ? value
    : typeof value === 'number'
      ? String(value)
      : fallback;

const formatTimestamp = (value: string | undefined): string => {
  if (!value) {
    return '--';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
};

const severityColor = (severity: string | undefined): string => {
  const normalized = (severity ?? '').toLowerCase();
  if (normalized.includes('critical') || normalized.includes('high')) {
    return '#FF3366';
  }
  if (normalized.includes('medium') || normalized.includes('caution')) {
    return '#FFB800';
  }
  return '#05DF72';
};

const clampPercent = (value: number): number => Math.min(96, Math.max(4, value));

const isInsideBounds = (
  lng: number,
  lat: number,
  bounds: [[number, number], [number, number]]
): boolean => {
  const minLng = Math.min(bounds[0][0], bounds[1][0]);
  const maxLng = Math.max(bounds[0][0], bounds[1][0]);
  const minLat = Math.min(bounds[0][1], bounds[1][1]);
  const maxLat = Math.max(bounds[0][1], bounds[1][1]);
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
};

const coordinateToPercent = (
  point: [number, number] | undefined,
  bounds: [[number, number], [number, number]]
): { left: string; top: string } | null => {
  if (!point) {
    return null;
  }

  let [lng, lat] = point;
  if (!isInsideBounds(lng, lat, bounds) && isInsideBounds(lat, lng, bounds)) {
    [lng, lat] = [lat, lng];
  }

  const minLng = Math.min(bounds[0][0], bounds[1][0]);
  const maxLng = Math.max(bounds[0][0], bounds[1][0]);
  const minLat = Math.min(bounds[0][1], bounds[1][1]);
  const maxLat = Math.max(bounds[0][1], bounds[1][1]);

  const lngSpan = maxLng - minLng || 1;
  const latSpan = maxLat - minLat || 1;
  const xPercent = ((lng - minLng) / lngSpan) * 100;
  const yPercent = 100 - ((lat - minLat) / latSpan) * 100;

  return {
    left: `${clampPercent(xPercent)}%`,
    top: `${clampPercent(yPercent)}%`,
  };
};

const mergeById = <T extends { id: string }>(existing: T[], updates: T[], maxItems = 50): T[] => {
  const byId = new Map(existing.map((item) => [item.id, item]));
  updates.forEach((item) => byId.set(item.id, item));
  return Array.from(byId.values()).slice(-maxItems);
};

const mergePanelState = (existing: CopPanelState[], updates: CopPanelState[]): CopPanelState[] => {
  if (updates.length === 0) {
    return existing;
  }
  const byKey = new Map(existing.map((item) => [item.key, item]));
  updates.forEach((item) => byKey.set(item.key, item));
  return Array.from(byKey.values());
};

const toRiskPanels = (value: unknown): CopPanelState[] => {
  if (!isRecord(value)) {
    return [];
  }
  return [
    { key: 'risk_threat_level', label: 'Threat Level', value: asString(value.threat_level || value.threat, '--') },
    { key: 'risk_probability', label: 'Probability', value: asString(value.probability, '--') },
    { key: 'risk_impact', label: 'Impact', value: asString(value.impact, '--') },
    { key: 'risk_time_horizon', label: 'Time Horizon', value: asString(value.time_horizon || value.horizon, '--') },
  ];
};

export function COPWorkspace() {
  const [copState, setCopState] = useState<CopState>(FALLBACK_COP_STATE);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(FALLBACK_COP_STATE.tracks[0]?.id ?? '');
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({});
  const [apiConnected, setApiConnected] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [dataSource, setDataSource] = useState<'backend' | 'fallback'>('fallback');
  const [lastUpdateAt, setLastUpdateAt] = useState<string>(FALLBACK_COP_STATE.lastUpdate ?? new Date().toISOString());
  const [isLoading, setIsLoading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);
  const isMountedRef = useRef(true);

  const mapBounds = copState.map.bounds;

  const layerColorMap = useMemo(() => {
    const next: Record<string, string> = { ...DEFAULT_LAYER_COLORS };
    copState.map.layers.forEach((layer) => {
      if (layer.color) {
        next[layer.id] = layer.color;
      }
    });
    return next;
  }, [copState.map.layers]);

  const visibleFeatures = useMemo(
    () => copState.features.filter((feature) => layerVisibility[feature.layer] !== false),
    [copState.features, layerVisibility]
  );

  const selectedTrack = useMemo(() => {
    if (copState.tracks.length === 0) {
      return null;
    }
    return copState.tracks.find((track) => track.id === selectedTrackId) ?? copState.tracks[0];
  }, [copState.tracks, selectedTrackId]);

  const systemStatusEntries = useMemo(() => {
    if (!isRecord(copState.systemStatus)) {
      return [];
    }
    return Object.entries(copState.systemStatus).slice(0, 4);
  }, [copState.systemStatus]);

  const riskPanels = useMemo(
    () =>
      copState.panelState.filter((panel) => {
        const key = panel.key.toLowerCase();
        const label = panel.label.toLowerCase();
        return key.includes('risk') || label.includes('risk') || key.includes('threat');
      }),
    [copState.panelState]
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setLayerVisibility((previous) => {
      const next: Record<string, boolean> = {};
      copState.map.layers.forEach((layer) => {
        next[layer.id] = previous[layer.id] ?? layer.enabled;
      });
      return next;
    });
  }, [copState.map.layers]);

  useEffect(() => {
    if (copState.tracks.length === 0) {
      setSelectedTrackId('');
      return;
    }
    const stillExists = copState.tracks.some((track) => track.id === selectedTrackId);
    if (!stillExists) {
      setSelectedTrackId(copState.tracks[0].id);
    }
  }, [copState.tracks, selectedTrackId]);

  const applySocketEvent = useCallback((type: string, payload: unknown) => {
    const normalizedType = type.toLowerCase();
    setCopState((previous) => {
      if (normalizedType === 'cop_update') {
        const payloadRecord = isRecord(payload) ? payload : {};
        const map =
          payloadRecord.map || payloadRecord.map_config
            ? normalizeCopMap(payloadRecord.map || payloadRecord.map_config)
            : previous.map;
        const features = payloadRecord.features
          ? normalizeCopFeatures(payloadRecord.features)
          : previous.features;
        const tracks = payloadRecord.tracks ? normalizeCopTracks(payloadRecord.tracks) : previous.tracks;
        const panelState = payloadRecord.panel_state
          ? mergePanelState(previous.panelState, normalizeCopPanelStates(payloadRecord.panel_state))
          : previous.panelState;
        const systemStatus = isRecord(payloadRecord.system_status)
          ? payloadRecord.system_status
          : previous.systemStatus;

        return {
          ...previous,
          map,
          features,
          tracks,
          panelState,
          systemStatus,
          lastUpdate: new Date().toISOString(),
        };
      }

      if (normalizedType === 'intel_feed') {
        const feedUpdates = normalizeCopFeed(payload);
        return {
          ...previous,
          feed: mergeById(previous.feed, feedUpdates, 150),
          lastUpdate: new Date().toISOString(),
        };
      }

      if (normalizedType === 'risk_card') {
        return {
          ...previous,
          panelState: mergePanelState(previous.panelState, toRiskPanels(payload)),
          lastUpdate: new Date().toISOString(),
        };
      }

      if (normalizedType === 'alert') {
        const alertUpdates = normalizeCopAlerts(payload);
        return {
          ...previous,
          alerts: mergeById(previous.alerts, alertUpdates, 40),
          lastUpdate: new Date().toISOString(),
        };
      }

      if (normalizedType === 'decision') {
        const decisionUpdates = normalizeCopDecisions(payload);
        return {
          ...previous,
          decisions: mergeById(previous.decisions, decisionUpdates, 40),
          lastUpdate: new Date().toISOString(),
        };
      }

      if (normalizedType === 'system_status') {
        return {
          ...previous,
          systemStatus: isRecord(payload) ? payload : previous.systemStatus,
          lastUpdate: new Date().toISOString(),
        };
      }

      return previous;
    });
  }, []);

  const loadSnapshot = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await copClient.getState();
      if (!isMountedRef.current) {
        return;
      }
      setApiConnected(true);
      setDataSource('backend');
      setCopState(state);
      setLastUpdateAt(state.lastUpdate ?? new Date().toISOString());

      const [mapResult, tracksResult, alertsResult, decisionsResult, feedResult] =
        await Promise.allSettled([
          copClient.getMap(),
          copClient.getTracks(),
          copClient.getAlerts(),
          copClient.getDecisions(),
          copClient.getFeed(),
        ]);

      if (!isMountedRef.current) {
        return;
      }

      setCopState((previous) => ({
        ...previous,
        map: mapResult.status === 'fulfilled' ? mapResult.value : previous.map,
        tracks: tracksResult.status === 'fulfilled' ? tracksResult.value : previous.tracks,
        alerts: alertsResult.status === 'fulfilled' ? alertsResult.value : previous.alerts,
        decisions: decisionsResult.status === 'fulfilled' ? decisionsResult.value : previous.decisions,
        feed: feedResult.status === 'fulfilled' ? feedResult.value : previous.feed,
        lastUpdate: new Date().toISOString(),
      }));
      setLastUpdateAt(new Date().toISOString());
    } catch {
      if (!isMountedRef.current) {
        return;
      }
      setApiConnected(false);
      setDataSource('fallback');
      setCopState(FALLBACK_COP_STATE);
      setLastUpdateAt(new Date().toISOString());
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const connectSocket = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)
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
      setDataSource('backend');
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
    shouldReconnectRef.current = true;
    void (async () => {
      await loadSnapshot();
      if (isMountedRef.current) {
        connectSocket();
      }
    })();

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

  const handleLayerToggle = (layerId: string) => {
    setLayerVisibility((previous) => ({
      ...previous,
      [layerId]: !previous[layerId],
    }));
  };

  const topFeed = [...copState.feed].slice(-10).reverse();
  const topAlerts = [...copState.alerts].slice(-6).reverse();
  const decisionQueue = [...copState.decisions].slice(0, 8);

  return (
    <div className="p-4 h-full flex flex-col gap-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="rounded-lg border border-cyber-glass-border bg-s3m-card px-3 py-2 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="text-[11px] uppercase tracking-wider text-s3m-text-secondary">API</span>
          <span className={`text-[11px] font-semibold ${apiConnected ? 'text-cyber-green' : 'text-cyber-red'}`}>
            {apiConnected ? 'connected' : 'disconnected'}
          </span>
        </div>
        <div className="rounded-lg border border-cyber-glass-border bg-s3m-card px-3 py-2 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="text-[11px] uppercase tracking-wider text-s3m-text-secondary">WS</span>
          <span className={`text-[11px] font-semibold ${wsConnected ? 'text-cyber-green' : 'text-cyber-red'}`}>
            {wsConnected ? 'connected' : 'disconnected'}
          </span>
        </div>
        <div className="rounded-lg border border-cyber-glass-border bg-s3m-card px-3 py-2 flex items-center gap-2">
          <Clock3 className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="text-[11px] uppercase tracking-wider text-s3m-text-secondary">Last update</span>
          <span className="text-[11px] text-s3m-text-primary">{formatTimestamp(lastUpdateAt)}</span>
        </div>
        <div className="rounded-lg border border-cyber-glass-border bg-s3m-card px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Workflow className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="text-[11px] uppercase tracking-wider text-s3m-text-secondary">Source</span>
            <span className="text-[11px] font-semibold text-cyber-cyan">{dataSource}</span>
          </div>
          <button
            type="button"
            onClick={() => void loadSnapshot()}
            className="p-1 rounded border border-cyber-cyan/30 hover:border-cyber-cyan/60 disabled:opacity-60"
            disabled={isLoading}
            title="Refresh COP state"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyber-cyan ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {copState.panelState.slice(0, 4).map((panel) => (
          <div key={panel.key} className="rounded-lg border border-cyber-glass-border bg-s3m-card px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-s3m-text-tertiary">{panel.label}</div>
            <div className="text-[13px] font-semibold text-s3m-text-primary">{asString(panel.value)}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Layers className="w-4 h-4 text-cyber-cyan shrink-0" />
        {copState.map.layers.map((layer) => {
          const enabled = layerVisibility[layer.id] !== false;
          const color = layer.color || layerColorMap[layer.id] || '#00F0FF';
          return (
            <button
              key={layer.id}
              onClick={() => handleLayerToggle(layer.id)}
              className="px-3 py-1 rounded text-[11px] uppercase tracking-wider border transition-colors whitespace-nowrap"
              style={{
                color: enabled ? color : '#6B7C95',
                borderColor: enabled ? `${color}88` : 'rgba(107, 124, 149, 0.35)',
                background: enabled ? `${color}1A` : 'rgba(28, 37, 51, 0.25)',
              }}
            >
              {layer.name}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7 bg-[#030810] rounded-xl border border-cyber-glass-border relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />
          <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-black/40 border border-cyber-cyan/30 text-[11px] text-cyber-cyan">
            COP MAP · {asString(copState.theater?.name, 'Saudi MOD')} · center {copState.map.center[1].toFixed(2)}N /{' '}
            {copState.map.center[0].toFixed(2)}E
          </div>

          {visibleFeatures.map((feature) => {
            const position = coordinateToPercent(feature.coordinates, mapBounds);
            if (!position) {
              return null;
            }
            const color = layerColorMap[feature.layer] || '#00F0FF';
            return (
              <div
                key={feature.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={position}
                title={`${feature.label || feature.id} (${feature.layer})`}
              >
                <div className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: color, background: `${color}66` }} />
              </div>
            );
          })}

          {copState.tracks.map((track) => {
            const position = coordinateToPercent(track.coordinates, mapBounds);
            if (!position) {
              return null;
            }
            const color = TRACK_COLOR[track.type] || '#EAB308';
            const isSelected = selectedTrack?.id === track.id;
            return (
              <button
                key={track.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={position}
                onClick={() => setSelectedTrackId(track.id)}
                title={`${track.id} · ${track.type}`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border-2"
                  style={{
                    borderColor: color,
                    background: `${color}55`,
                    boxShadow: isSelected ? `0 0 18px ${color}` : `0 0 8px ${color}`,
                  }}
                />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono whitespace-nowrap" style={{ color }}>
                  {track.id}
                </div>
              </button>
            );
          })}
        </div>

        <div className="col-span-12 lg:col-span-2 min-h-0 bg-s3m-card border border-cyber-glass-border rounded-xl p-2 overflow-y-auto">
          <div className="text-[11px] uppercase tracking-wider text-s3m-text-tertiary mb-2">Tracks</div>
          <div className="space-y-2">
            {copState.tracks.map((track) => {
              const color = TRACK_COLOR[track.type] || '#EAB308';
              const isSelected = selectedTrack?.id === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className="w-full text-left rounded border p-2 transition-colors"
                  style={{
                    borderColor: isSelected ? `${color}AA` : 'rgba(107, 124, 149, 0.4)',
                    background: isSelected ? `${color}22` : 'rgba(12, 18, 30, 0.65)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold" style={{ color }}>
                      {track.id}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-s3m-text-tertiary">{track.type}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-s3m-text-secondary">{track.status}</div>
                  <div className="mt-1 text-[10px] text-cyber-cyan">Conf {Math.round(track.confidence)}%</div>
                </button>
              );
            })}
          </div>

          {selectedTrack && (
            <div className="mt-3 rounded border border-cyber-cyan/30 bg-cyber-cyan/5 p-2 text-[10px] space-y-1">
              <div className="text-[11px] uppercase tracking-wider text-cyber-cyan flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Selected {selectedTrack.id}
              </div>
              <div className="text-s3m-text-secondary">Speed: {selectedTrack.speed ?? '--'}</div>
              <div className="text-s3m-text-secondary">Altitude: {selectedTrack.altitude ?? '--'}</div>
              <div className="text-s3m-text-secondary">Last update: {selectedTrack.lastUpdate ?? '--'}</div>
              <div className="text-s3m-text-secondary">Action: {selectedTrack.recommendedAction ?? '--'}</div>
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-3 min-h-0 grid grid-rows-4 gap-2">
          <div className="row-span-1 rounded-xl border border-cyber-glass-border bg-s3m-card p-2 overflow-y-auto">
            <div className="text-[11px] uppercase tracking-wider text-s3m-text-tertiary mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-cyber-red" />
              Alert ticker
            </div>
            <div className="space-y-1">
              {topAlerts.map((alert: CopAlert) => (
                <div key={alert.id} className="rounded border p-1.5 text-[10px]" style={{ borderColor: `${severityColor(alert.severity)}77` }}>
                  <div className="font-semibold" style={{ color: severityColor(alert.severity) }}>{alert.title}</div>
                  <div className="text-s3m-text-secondary">{alert.message}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="row-span-1 rounded-xl border border-cyber-glass-border bg-s3m-card p-2 overflow-y-auto">
            <div className="text-[11px] uppercase tracking-wider text-s3m-text-tertiary mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green" />
              Decision queue
            </div>
            <div className="space-y-1">
              {decisionQueue.map((decision: CopDecision) => (
                <div key={decision.id} className="rounded border border-cyber-glass-border p-1.5 text-[10px]">
                  <div className="font-semibold text-s3m-text-primary">{decision.title}</div>
                  <div className="text-s3m-text-secondary">{decision.status}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="row-span-1 rounded-xl border border-cyber-glass-border bg-s3m-card p-2 overflow-y-auto">
            <div className="text-[11px] uppercase tracking-wider text-s3m-text-tertiary mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-s3m-warning" />
              Risk panel
            </div>
            <div className="space-y-1">
              {riskPanels.length > 0 ? (
                riskPanels.map((panel) => (
                  <div key={panel.key} className="rounded border border-cyber-glass-border p-1.5 text-[10px]">
                    <div className="text-s3m-text-tertiary">{panel.label}</div>
                    <div className="text-s3m-text-primary font-semibold">{asString(panel.value)}</div>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-s3m-text-secondary">No risk updates received.</div>
              )}
            </div>
          </div>

          <div className="row-span-1 rounded-xl border border-cyber-glass-border bg-s3m-card p-2 overflow-y-auto">
            <div className="text-[11px] uppercase tracking-wider text-s3m-text-tertiary mb-1 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-cyber-cyan" />
              Live intel feed
            </div>
            <div className="space-y-1">
              {topFeed.map((item: CopFeedItem) => (
                <div key={item.id} className="rounded border border-cyber-glass-border p-1.5 text-[10px]">
                  <div className="font-semibold text-cyber-cyan uppercase tracking-wider">{item.type}</div>
                  <div className="text-s3m-text-secondary">{item.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-cyber-glass-border bg-s3m-card px-3 py-2 text-[11px]">
        <div className="font-semibold text-cyber-cyan uppercase tracking-wider mb-1">System status</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {systemStatusEntries.length > 0 ? (
            systemStatusEntries.map(([key, value]) => (
              <div key={key} className="rounded border border-cyber-glass-border px-2 py-1">
                <div className="text-[10px] uppercase tracking-wider text-s3m-text-tertiary">{key.replace(/_/g, ' ')}</div>
                <div className="text-s3m-text-primary">{asString(value)}</div>
              </div>
            ))
          ) : (
            <div className="text-s3m-text-secondary">No system status updates yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
