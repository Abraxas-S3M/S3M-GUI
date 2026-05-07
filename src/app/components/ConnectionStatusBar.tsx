import { Activity, Radio } from 'lucide-react';

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

export function ConnectionStatusBar() {
  const { apiStatus, wsStatus, lastApiResponseAt, lastWsMessageAt, backendEnvironment } =
    useConnectionStore();

  const hasLiveData = Boolean(lastApiResponseAt || lastWsMessageAt);
  const systemTone = hasLiveData ? '#00F0FF' : '#6B8199';

  return (
    <div className="h-7 shrink-0 bg-cyber-deep/60 border-b border-cyber-glass-border px-4 flex items-center gap-5 text-[10px] uppercase tracking-wider">
      <div className="flex items-center gap-2 text-cyber-text-secondary">
        <Activity className="h-3 w-3" />
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: API_STATUS_COLOR[apiStatus], boxShadow: `0 0 10px ${API_STATUS_COLOR[apiStatus]}` }}
        />
        <span style={{ color: systemTone }}>System Fabric</span>
      </div>
      <div className="flex items-center gap-2 text-cyber-text-secondary">
        <Radio className="h-3 w-3" />
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: WS_STATUS_COLOR[wsStatus], boxShadow: `0 0 10px ${WS_STATUS_COLOR[wsStatus]}` }}
        />
        <span style={{ color: systemTone }}>Telemetry Link</span>
      </div>
      <div className="ml-auto">
        <span className="px-2 py-0.5 rounded border border-cyber-glass-border text-cyber-cyan">
          {ENV_LABEL[backendEnvironment]}
        </span>
      </div>
    </div>
  );
}
