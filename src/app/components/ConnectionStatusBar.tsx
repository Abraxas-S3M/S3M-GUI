import { useEffect, useMemo, useState } from 'react';
import { Activity, Clock3, Radio } from 'lucide-react';

import {
  type ApiStatus,
  type BackendEnvironment,
  type WsStatus,
  useConnectionStore,
} from '../../services/connectionStore';

const API_STATUS_COLOR: Record<ApiStatus, string> = {
  healthy: '#05DF72',
  degraded: '#FFB800',
  unavailable: '#FF3366',
  unknown: '#6B8199',
};

const WS_STATUS_COLOR: Record<WsStatus, string> = {
  connected: '#05DF72',
  connecting: '#FFB800',
  reconnecting: '#FFB800',
  disconnected: '#FF3366',
};

const ENV_LABEL: Record<BackendEnvironment, string> = {
  local: 'LOCAL',
  preview: 'PREVIEW',
  production: 'PROD',
};

const getRelativeTime = (timestamp: string | null, nowMs: number): string => {
  if (!timestamp) return 'waiting for live data';
  const deltaSec = Math.max(0, Math.floor((nowMs - new Date(timestamp).getTime()) / 1000));
  if (deltaSec < 10) return 'just now';
  if (deltaSec < 60) return `${deltaSec}s ago`;
  if (deltaSec < 3600) return `${Math.floor(deltaSec / 60)}m ago`;
  return `${Math.floor(deltaSec / 3600)}h ago`;
};

export function ConnectionStatusBar() {
  const [nowMs, setNowMs] = useState(Date.now());
  const { apiStatus, wsStatus, lastApiResponseAt, lastWsMessageAt, backendEnvironment } =
    useConnectionStore();

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  const latestUpdate = useMemo(() => {
    if (!lastApiResponseAt) return lastWsMessageAt;
    if (!lastWsMessageAt) return lastApiResponseAt;
    return new Date(lastWsMessageAt).getTime() > new Date(lastApiResponseAt).getTime()
      ? lastWsMessageAt
      : lastApiResponseAt;
  }, [lastApiResponseAt, lastWsMessageAt]);

  return (
    <div className="h-7 shrink-0 bg-cyber-deep/60 border-b border-cyber-glass-border px-4 flex items-center gap-5 text-[10px] uppercase tracking-wider">
      <div className="flex items-center gap-2 text-cyber-text-secondary">
        <Activity className="h-3 w-3" />
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: API_STATUS_COLOR[apiStatus], boxShadow: `0 0 10px ${API_STATUS_COLOR[apiStatus]}` }} />
        <span>API {apiStatus}</span>
      </div>
      <div className="flex items-center gap-2 text-cyber-text-secondary">
        <Radio className="h-3 w-3" />
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: WS_STATUS_COLOR[wsStatus], boxShadow: `0 0 10px ${WS_STATUS_COLOR[wsStatus]}` }} />
        <span>WS {wsStatus}</span>
      </div>
      <div className="flex items-center gap-2 text-cyber-text-secondary">
        <Clock3 className="h-3 w-3" />
        <span>Last update: {getRelativeTime(latestUpdate, nowMs)}</span>
      </div>
      <div className="ml-auto">
        <span className="px-2 py-0.5 rounded border border-cyber-glass-border text-cyber-cyan">
          {ENV_LABEL[backendEnvironment]}
        </span>
      </div>
    </div>
  );
}
