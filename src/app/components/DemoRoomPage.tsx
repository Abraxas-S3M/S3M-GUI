import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_S3M_API_URL || 'http://138.199.171.135:8080';
const DEMO_ROOM_WS_URL = `${API_BASE.replace(/^http/, 'ws')}/ws/demo-room`;

const TRACK_OPTIONS = [
  { value: 'saudi_mod', label: 'Saudi MOD / Arabian Gulf', color: '#22D3EE' },
  { value: 'ukraine_mod', label: 'Ukraine / Eastern Europe', color: '#60A5FA' },
  { value: 'nato', label: 'NATO / Euro-Atlantic', color: '#818CF8' },
  { value: 'indopac_mod', label: 'Indo-Pacific', color: '#A78BFA' },
  { value: 'southam_mod', label: 'South America', color: '#34D399' },
  { value: 'africa_mod', label: 'Africa/Sahel', color: '#F59E0B' },
] as const;

const PACING_OPTIONS = [
  { value: 'realtime', label: 'Realtime' },
  { value: 'fast', label: 'Fast' },
  { value: 'instant', label: 'Instant' },
] as const;

const ENGINE_KEYS = ['phi3', 'mixtral', 'allam', 'grok'] as const;
const ENGINE_LABELS: Record<EngineKey, string> = {
  phi3: 'phi3 (Φ)',
  mixtral: 'mixtral (M)',
  allam: 'allam (ع)',
  grok: 'grok (G)',
};

const ENGINE_STATE_DOT_CLASSES: Record<EngineState, string> = {
  cold: 'bg-slate-500',
  loading: 'bg-blue-400',
  ready: 'bg-emerald-400',
  processing: 'bg-amber-400',
};

const ARABIC_TEXT_REGEX = /[\u0600-\u06FF]/;

type EngineKey = (typeof ENGINE_KEYS)[number];
type EngineState = 'cold' | 'loading' | 'ready' | 'processing';
type PhaseState = 'IDLE' | 'RUNNING' | 'COMPLETE' | 'STOPPED';

interface DemoRoomEvent extends Record<string, unknown> {
  event_id?: string | number;
  event_type?: string;
  phase?: string;
  track?: string;
  timestamp?: string;
  received_at?: string;
}

type EngineStatusMap = Record<EngineKey, EngineState>;

const INITIAL_ENGINE_STATUS: EngineStatusMap = {
  phi3: 'cold',
  mixtral: 'cold',
  allam: 'cold',
  grok: 'cold',
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeEngineState(rawValue: unknown): EngineState {
  const normalized = asString(rawValue).toLowerCase();
  if (normalized.includes('ready')) return 'ready';
  if (normalized.includes('load') || normalized.includes('init')) return 'loading';
  if (normalized.includes('process') || normalized.includes('work') || normalized.includes('run')) return 'processing';
  return 'cold';
}

function normalizeEventType(event: DemoRoomEvent): string {
  return asString(event.event_type || event.type || event.kind, 'system');
}

function formatTimestamp(event: DemoRoomEvent): string {
  const source = asString(event.timestamp || event.received_at);
  if (!source) return '--:--:--';
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return source;
  return parsed.toLocaleTimeString();
}

function getTrackColor(track: string): string {
  const trackOption = TRACK_OPTIONS.find((option) => option.value === track);
  return trackOption?.color || '#64748B';
}

function getCardBorderColor(event: DemoRoomEvent): string {
  const type = normalizeEventType(event);
  if (type === 'alert') return '#EF4444';
  if (type === 'risk_card') return '#F59E0B';
  if (type === 'assessment') return '#22C55E';
  return getTrackColor(asString(event.track, 'saudi_mod'));
}

function isArabicText(text: string): boolean {
  return ARABIC_TEXT_REGEX.test(text);
}

function ArabicTextBlock({ text }: { text: string }) {
  return (
    <div
      className="mt-2 rounded bg-slate-900/50 px-3 py-2 text-right text-sm leading-7 text-slate-200"
      dir="rtl"
      style={{
        fontFamily: '"Noto Sans Arabic", sans-serif',
        borderRight: '2px solid rgba(148, 163, 184, 0.35)',
      }}
    >
      {text}
    </div>
  );
}

function TextBlock({ text }: { text: string }) {
  if (!text) return null;
  if (isArabicText(text)) {
    return <ArabicTextBlock text={text} />;
  }
  return <p className="text-sm text-slate-200">{text}</p>;
}

function SeverityBadge({ label }: { label: string }) {
  const normalized = label.toLowerCase();
  const badgeClass = normalized.includes('high') || normalized.includes('critical')
    ? 'bg-red-500/20 text-red-300 border-red-400/40'
    : normalized.includes('med')
      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';

  return <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase ${badgeClass}`}>{label}</span>;
}

function renderCriterias(event: DemoRoomEvent) {
  const criteriaScores = event.criteria_scores ?? event.criteria ?? event.scores;
  const rows: Array<{ name: string; score: number }> = [];

  if (Array.isArray(criteriaScores)) {
    criteriaScores.forEach((item, index) => {
      const row = asRecord(item);
      if (!row) return;
      const name = asString(row.name || row.metric, `criterion_${index + 1}`);
      const score = asNumber(row.score ?? row.value);
      if (score !== null) rows.push({ name, score });
    });
  } else {
    const scoresRecord = asRecord(criteriaScores);
    if (scoresRecord) {
      Object.entries(scoresRecord).forEach(([name, value]) => {
        const score = asNumber(value);
        if (score !== null) rows.push({ name, score });
      });
    }
  }

  return rows;
}

function renderEventBody(event: DemoRoomEvent) {
  const type = normalizeEventType(event);

  switch (type) {
    case 'intel_feed': {
      const priority = asString(event.priority || event.severity, 'medium').toUpperCase();
      const confidenceRaw = asNumber(event.confidence ?? event.confidence_pct);
      const confidence = confidenceRaw === null ? 'N/A' : `${Math.round(confidenceRaw)}%`;
      const english = asString(event.english || event.en_text || event.message || event.content_en);
      const arabic = asString(event.arabic || event.ar_text || event.content_ar);

      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <SeverityBadge label={priority} />
            <span className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cyan-300">
              Confidence {confidence}
            </span>
          </div>
          {english && <TextBlock text={english} />}
          {arabic && <ArabicTextBlock text={arabic} />}
        </div>
      );
    }

    case 'cop_update': {
      const theaterInfo = asRecord(event.theater_info) || asRecord(event.theater) || {};
      const sectorsSource = event.sectors || event.sector_statuses || event.sector_status;
      const sectorRows: Array<{ name: string; status: string }> = [];

      if (Array.isArray(sectorsSource)) {
        sectorsSource.forEach((sector, index) => {
          const sectorRecord = asRecord(sector);
          if (!sectorRecord) return;
          const name = asString(sectorRecord.name || sectorRecord.sector, `Sector ${index + 1}`);
          const status = asString(sectorRecord.status || sectorRecord.state, 'unknown');
          sectorRows.push({ name, status });
        });
      } else {
        const sectorRecord = asRecord(sectorsSource);
        if (sectorRecord) {
          Object.entries(sectorRecord).forEach(([name, status]) => {
            sectorRows.push({ name, status: asString(status, 'unknown') });
          });
        }
      }

      return (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded border border-slate-700/60 bg-slate-900/50 p-2">
            <h4 className="mb-2 text-[11px] uppercase tracking-widest text-slate-400">Theater Info</h4>
            <div className="space-y-1 text-xs text-slate-200">
              {Object.entries(theaterInfo).length > 0 ? (
                Object.entries(theaterInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-2 border-b border-slate-800 pb-1">
                    <span className="uppercase text-slate-400">{key.replace(/_/g, ' ')}</span>
                    <span>{asString(value, '--')}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No theater metadata.</p>
              )}
            </div>
          </div>
          <div className="rounded border border-slate-700/60 bg-slate-900/50 p-2">
            <h4 className="mb-2 text-[11px] uppercase tracking-widest text-slate-400">Sector Status</h4>
            <div className="flex flex-wrap gap-2">
              {sectorRows.length > 0 ? (
                sectorRows.map((sector) => {
                  const statusLabel = sector.status.toLowerCase();
                  const statusClass = statusLabel.includes('critical') || statusLabel.includes('hot')
                    ? 'border-red-400/50 bg-red-500/20 text-red-200'
                    : statusLabel.includes('watch') || statusLabel.includes('degraded')
                      ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
                      : 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200';
                  return (
                    <span key={`${sector.name}-${sector.status}`} className={`rounded border px-2 py-1 text-[11px] ${statusClass}`}>
                      {sector.name}: {sector.status}
                    </span>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400">No sector status updates.</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 'risk_card': {
      const recommendations = Array.isArray(event.recommendations) ? event.recommendations : [];

      return (
        <div className="space-y-2 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded border border-amber-500/30 bg-amber-500/10 p-2">
              <p className="text-[10px] uppercase tracking-widest text-amber-200">Threat Level</p>
              <p className="text-amber-100">{asString(event.threat_level || event.threat, 'Unknown')}</p>
            </div>
            <div className="rounded border border-slate-700 bg-slate-900/60 p-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Probability</p>
              <p>{asString(event.probability, 'N/A')}</p>
            </div>
            <div className="rounded border border-slate-700 bg-slate-900/60 p-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Impact</p>
              <p>{asString(event.impact, 'N/A')}</p>
            </div>
            <div className="rounded border border-slate-700 bg-slate-900/60 p-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Time Horizon</p>
              <p>{asString(event.time_horizon || event.horizon, 'N/A')}</p>
            </div>
          </div>
          <div>
            <h4 className="mb-1 text-[11px] uppercase tracking-wider text-slate-400">Recommendations</h4>
            {recommendations.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-slate-200">
                {recommendations.map((item, index) => (
                  <li key={`rec-${index}`}>{asString(item)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">No recommendations provided.</p>
            )}
          </div>
        </div>
      );
    }

    case 'artifact': {
      const english = asString(event.english || event.content_en || event.message);
      const arabic = asString(event.arabic || event.content_ar);
      const grokScoreRaw = asNumber(event.grok_score ?? event.score);
      const grokScore = grokScoreRaw === null ? 'N/A' : grokScoreRaw.toFixed(2);

      return (
        <div className="space-y-2">
          <span className="inline-flex rounded border border-purple-400/40 bg-purple-500/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-purple-200">
            Grok score {grokScore}
          </span>
          {english && <TextBlock text={english} />}
          {arabic && <ArabicTextBlock text={arabic} />}
        </div>
      );
    }

    case 'assessment': {
      const passed = Boolean(event.passed ?? (asString(event.result).toLowerCase() === 'passed'));
      const criteriaRows = renderCriterias(event);

      return (
        <div className="space-y-2">
          <div
            className={`inline-flex rounded border px-2 py-1 text-[11px] font-semibold uppercase tracking-widest ${
              passed
                ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200'
                : 'border-red-400/50 bg-red-500/20 text-red-200'
            }`}
          >
            {passed ? 'PASSED' : 'FAILED'}
          </div>
          <div className="space-y-2">
            {criteriaRows.length > 0 ? (
              criteriaRows.map((row) => {
                const score = Math.max(0, Math.min(100, row.score));
                return (
                  <div key={row.name}>
                    <div className="mb-1 flex justify-between text-[11px] text-slate-300">
                      <span className="uppercase tracking-wider">{row.name.replace(/_/g, ' ')}</span>
                      <span>{Math.round(score)}%</span>
                    </div>
                    <div className="h-2 rounded bg-slate-800">
                      <div
                        className="h-full rounded bg-emerald-400"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400">No criteria scores provided.</p>
            )}
          </div>
        </div>
      );
    }

    case 'alert': {
      const statsRecord = asRecord(event.stats) || {};
      const produced = asNumber(statsRecord.produced ?? event.produced) ?? 0;
      const validated = asNumber(statsRecord.validated ?? event.validated) ?? 0;
      const passed = asNumber(statsRecord.passed ?? event.passed_count) ?? 0;
      const message = asString(event.message || event.text, 'Alert received');

      return (
        <div className="space-y-2">
          <TextBlock text={message} />
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded border border-slate-700 bg-slate-900/60 p-2 text-xs">
              <p className="uppercase tracking-wider text-slate-400">Produced</p>
              <p>{produced}</p>
            </div>
            <div className="rounded border border-slate-700 bg-slate-900/60 p-2 text-xs">
              <p className="uppercase tracking-wider text-slate-400">Validated</p>
              <p>{validated}</p>
            </div>
            <div className="rounded border border-slate-700 bg-slate-900/60 p-2 text-xs">
              <p className="uppercase tracking-wider text-slate-400">Passed</p>
              <p>{passed}</p>
            </div>
          </div>
        </div>
      );
    }

    case 'system': {
      const message = asString(event.message || event.text || event.detail, 'System update received');
      const classification = asString(event.classification, 'SYSTEM');
      return (
        <div className="space-y-2">
          <span className="inline-flex rounded border border-slate-500/60 bg-slate-600/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-200">
            {classification}
          </span>
          <TextBlock text={message} />
        </div>
      );
    }

    default: {
      const message = asString(event.message || event.text, '');
      if (message) return <TextBlock text={message} />;
      return (
        <pre className="overflow-x-auto rounded bg-slate-900/70 p-2 text-xs text-slate-300">
          {JSON.stringify(event, null, 2)}
        </pre>
      );
    }
  }
}

export function DemoRoomPage() {
  const [track, setTrack] = useState<(typeof TRACK_OPTIONS)[number]['value']>('saudi_mod');
  const [pacing, setPacing] = useState<(typeof PACING_OPTIONS)[number]['value']>('realtime');
  const [phase, setPhase] = useState<PhaseState>('IDLE');
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [engineStatus, setEngineStatus] = useState<EngineStatusMap>(INITIAL_ENGINE_STATUS);
  const [events, setEvents] = useState<DemoRoomEvent[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);
  const feedContainerRef = useRef<HTMLDivElement | null>(null);

  const selectedTrack = useMemo(
    () => TRACK_OPTIONS.find((option) => option.value === track) ?? TRACK_OPTIONS[0],
    [track]
  );

  const connect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const socket = new WebSocket(DEMO_ROOM_WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (messageEvent) => {
      let payload: DemoRoomEvent | null = null;
      try {
        payload = JSON.parse(messageEvent.data) as DemoRoomEvent;
      } catch {
        return;
      }

      if (!payload) return;
      const eventType = normalizeEventType(payload);

      if (eventType === 'engine_status') {
        const source = asRecord(payload.engines) || asRecord(payload.statuses) || asRecord(payload.data) || asRecord(payload) || {};
        const updates: Partial<EngineStatusMap> = {};

        ENGINE_KEYS.forEach((engineKey) => {
          if (source[engineKey] !== undefined) {
            updates[engineKey] = normalizeEngineState(source[engineKey]);
          }
        });

        const singleEngine = asString(payload.engine).toLowerCase();
        if (singleEngine in INITIAL_ENGINE_STATUS) {
          updates[singleEngine as EngineKey] = normalizeEngineState(payload.status);
        }

        if (Object.keys(updates).length > 0) {
          setEngineStatus((previous) => ({ ...previous, ...updates }));
        }
        return;
      }

      if (eventType === 'demo_complete') {
        setPhase('COMPLETE');
        setIsRunning(false);
      }

      const incomingPhase = asString(payload.phase);
      if (incomingPhase) {
        const normalizedPhase = incomingPhase.toUpperCase();
        if (['IDLE', 'RUNNING', 'COMPLETE', 'STOPPED'].includes(normalizedPhase)) {
          setPhase(normalizedPhase as PhaseState);
        }
      }

      if (typeof payload.event_id === 'string' || typeof payload.event_id === 'number') {
        const eventEntry: DemoRoomEvent = {
          ...payload,
          event_id: String(payload.event_id),
          event_type: asString(payload.event_type || eventType, eventType),
          received_at: new Date().toISOString(),
        };

        setEvents((previous) => {
          const next = [...previous, eventEntry];
          return next.slice(-250);
        });
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onclose = () => {
      setIsConnected(false);
      socketRef.current = null;
      if (!shouldReconnectRef.current) return;
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [events]);

  const sendCommand = useCallback((payload: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  const handleLaunch = () => {
    const wasSent = sendCommand({
      command: 'launch',
      track,
      scenario: 'default',
      pacing,
    });

    if (!wasSent) {
      connect();
    }

    setPhase('RUNNING');
    setIsRunning(true);
  };

  const handleStop = () => {
    sendCommand({ command: 'stop' });
    setIsRunning(false);
    if (phase !== 'COMPLETE') {
      setPhase('STOPPED');
    }
  };

  return (
    <div
      className="h-full overflow-hidden p-4 text-slate-200"
      style={{ fontFamily: '"JetBrains Mono", monospace' }}
    >
      <div className="flex h-full min-h-0 flex-col gap-4">
        <header className="rounded border border-slate-700/70 bg-slate-900/40 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-cyan-400/50 bg-cyan-500/10 text-sm font-bold text-cyan-300">
                S3M
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-300">SOVEREIGN STRATEGIC MODEL</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">{selectedTrack.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs uppercase tracking-wider">
              <span className="rounded border border-slate-600/80 bg-slate-800/60 px-2 py-1 text-slate-300">
                Theater: {selectedTrack.label}
              </span>
              <span className="inline-flex items-center gap-2 rounded border border-slate-600/80 bg-slate-800/60 px-2 py-1">
                <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-500'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              <span className="rounded border border-indigo-400/40 bg-indigo-500/20 px-2 py-1 text-indigo-200">
                Phase: {phase}
              </span>
            </div>
          </div>
        </header>

        <section className="rounded border border-slate-700/70 bg-slate-900/40 px-4 py-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-64 flex-1">
              <label htmlFor="track-selector" className="mb-1 block text-[11px] uppercase tracking-wider text-slate-400">
                Track Selector
              </label>
              <select
                id="track-selector"
                value={track}
                onChange={(event) => setTrack(event.target.value as (typeof TRACK_OPTIONS)[number]['value'])}
                className="w-full rounded border border-slate-600 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              >
                {TRACK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-52">
              <label htmlFor="pacing-selector" className="mb-1 block text-[11px] uppercase tracking-wider text-slate-400">
                Pacing
              </label>
              <select
                id="pacing-selector"
                value={pacing}
                onChange={(event) => setPacing(event.target.value as (typeof PACING_OPTIONS)[number]['value'])}
                className="w-full rounded border border-slate-600 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              >
                {PACING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleLaunch}
              className="rounded border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-200 hover:bg-emerald-500/30"
            >
              Launch
            </button>
            <button
              type="button"
              onClick={handleStop}
              disabled={!isRunning}
              className={`rounded border px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                isRunning
                  ? 'border-red-400/70 bg-red-500/20 text-red-200 hover:bg-red-500/30'
                  : 'border-slate-600 bg-slate-800/60 text-slate-400'
              }`}
            >
              Stop
            </button>
          </div>
        </section>

        <section className="rounded border border-slate-700/70 bg-slate-900/40 px-4 py-3">
          <h3 className="mb-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">Engine Status</h3>
          <div className="flex flex-wrap gap-2">
            {ENGINE_KEYS.map((engineKey) => (
              <div
                key={engineKey}
                className="inline-flex min-w-44 items-center justify-between rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-[11px] uppercase tracking-wider text-slate-200"
              >
                <span>{ENGINE_LABELS[engineKey]}</span>
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${ENGINE_STATE_DOT_CLASSES[engineStatus[engineKey]]}`} />
                  {engineStatus[engineKey]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="min-h-0 flex-1 rounded border border-slate-700/70 bg-slate-900/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Event Feed</h3>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">{events.length} events</span>
          </div>
          <div ref={feedContainerRef} className="h-full overflow-y-auto pr-1">
            <div className="space-y-3 pb-1">
              {events.length === 0 ? (
                <div className="rounded border border-slate-700/60 bg-slate-900/60 p-4 text-sm text-slate-400">
                  Awaiting demo-room events...
                </div>
              ) : (
                events.map((event, index) => {
                  const eventType = normalizeEventType(event);
                  const borderColor = getCardBorderColor(event);
                  return (
                    <article
                      key={event.event_id || `${eventType}-${index}`}
                      className="rounded border border-slate-700/70 bg-slate-950/60 p-3"
                      style={{ borderLeft: `4px solid ${borderColor}` }}
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-widest">
                        <span className="rounded border border-slate-600/70 bg-slate-900 px-2 py-0.5 text-slate-300">
                          {eventType}
                        </span>
                        <span className="text-slate-500">{formatTimestamp(event)}</span>
                      </div>
                      {renderEventBody(event)}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
